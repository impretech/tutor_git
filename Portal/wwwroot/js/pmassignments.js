import axiosES6 from "../lib/axios/axios.esm.min.js";
const axios = axiosES6;
/// <reference path="../typescript/@types/kendo/index.d.ts" />
/// <reference path="../typescript/@types/jquery/JQuery.d.ts" />
import { Notification } from "./components/notification.js";
export class PMAssignments {
    constructor(data) {
        this.init = async () => {
            // console.log("Assignments Init", this.data);
            //this.GetCurrentUser();
            //this.setupScheduler();
            this.loadSkills();
            this.loadLocations();
            const projectDB = document.getElementById("project-list");
            const pmRecBtn = document.getElementById("pm-recm-btn");
            const assignPmBtn = document.getElementById("assign-pm");
            const removePmBtn = document.getElementById("remove-pm");
            projectDB.addEventListener("change", e => this.projectChange(e));
            pmRecBtn.addEventListener("click", e => this.pmRecommBtn(e));
            assignPmBtn.addEventListener("click", e => this.assignPmBtn(e));
            removePmBtn.addEventListener("click", e => this.removePmBtn(e));
            this.getIncompleteProjects();
        };
        this.loadLocations = () => {
            axios
                .get(`/api/project/locations`)
                .then(res => {
                this.appendLocations(res.data);
            })
                .catch(error => {
                console.log(error);
            });
        };
        this.appendLocations = locations => {
            let html = "";
            if (locations) {
                locations.forEach(loc => {
                    html += `<div class="row mt-5px">
                    <div class="col-2"><input type="checkbox" class="locations" value='${loc.id}' checked/></div>
                    <div class="col-8">${loc.name}</div>
                 </div> `;
                });
            }
            document
                .getElementById("locations-checkboxes")
                .insertAdjacentHTML("beforeend", html);
        };
        this.loadSkills = () => {
            axios
                .get(`/api/project/skills`)
                .then(res => {
                this.appendSkills(res.data);
            })
                .catch(error => {
                console.log(error);
            });
        };
        this.appendSkills = skills => {
            let html = "";
            if (skills) {
                skills.forEach(skill => {
                    html += `<div class="row mt-5px">
                    <div class="col-2"><input type="checkbox" class="skills" value='${skill.id}' /></div>
                    <div class="col-8">${skill.name}</div>
                 </div> `;
                });
            }
            document
                .getElementById("skills-checkboxes")
                .insertAdjacentHTML("beforeend", html);
        };
        this.selectPM = e => {
            const pm = document.getElementById(e.target.id);
            const currentPm = document.getElementById("current-pm");
            currentPm.value = "";
            currentPm.value = pm.innerText;
            this.toAssignPmId = e.target.id.replace("pm-", "");
            var grpahId = e.target.id.replace("pm-", "graph-");
            var pmId = parseInt(e.target.id.replace('pm-', ''));
            const pmObj = this.pmList.find(p => p.pmId == pmId);
            var chart = $("#" + grpahId).data("kendoChart");
            chart.destroy();
            var showBothSeries = chart.options.series.length == 1;
            this.createChart(pmObj, showBothSeries);
        };
        this.loadPMs = pId => {
            const locations = document.getElementsByClassName("locations");
            const skills = document.getElementsByClassName("skills");
            var locList = "";
            var skillList = "";
            for (const loc of locations) {
                const l = loc;
                if (l.checked)
                    locList = locList + l.value + ",";
            }
            for (const skill of skills) {
                const s = skill;
                if (s.checked)
                    skillList = skillList + s.value + ",";
            }
            axios
                .get(`/api/project/pm-suggestions?projectId=${pId}&skillFilters=${skillList}&locationFilter=${locList}`)
                .then(res => {
                this.pmList = res.data;
                this.createProjectChart(this.selectedProject);
                debugger;
                for (var i = 0; i < res.data.length; i++) {
                    for (var j = 0; j < res.data[i].assignedProjectTasks.length; j++) {
                        res.data[i].assignedProjectTasks[j].dtDate = new Date(res.data[i].assignedProjectTasks[j].date);
                    }
                }
                this.appendPMs(res.data, pId);
            })
                .catch(error => {
                console.log(error);
            });
        };
        this.appendPMs = (pmList, pId) => {
            document.getElementById("pm-list-div").innerHTML = "";
            pmList.forEach((pm, index) => {
                var isCurrentPm = pm.assignedProjectTasks.find(t => t.projectId == pId) != null;
                let html = "";
                if (isCurrentPm) {
                    html = `
<div class="col-2 borderd-grey cell-pad h-150px" style=" ${index % 2 === 0 ? "background:#f5f5f5" : ""}">${pm.name}<br/><img src='/images/pm.png' alt='pm' style="width:35px;" /></div>
<div class="col-10 borderd-grey h-150px" style=" ${index % 2 === 0 ? "background:#ebf8fa" : ""}"><div class="graph-div" id="graph-${pm.pmId}" style="width:100%;padding:0px;margin:0px;"></div></div>
`;
                }
                else {
                    html = `
<div class="col-2 borderd-grey cell-pad h-150px" style=" ${index % 2 === 0 ? "background:#f5f5f5" : ""}"><a href="javascript:void(0)" id="pm-${pm.pmId}" class="pmNewAssign" style="cursor:pointer;" >${pm.name}</a></div>
<div class="col-10 borderd-grey h-150px" style=" ${index % 2 === 0 ? "background:#ebf8fa" : ""}"><div class="graph-div" id="graph-${pm.pmId}" style="width:100%;padding:0px;margin:0px;"></div></div>
`;
                }
                // If this pm is the current projects PM
                document.getElementById("pm-list-div").insertAdjacentHTML("beforeend", html);
                if (!isCurrentPm) {
                    document.getElementById(`pm-${pm.pmId}`).addEventListener("click", this.selectPM);
                }
                this.createChart(pm, false);
            });
        };
        this.removePm = () => {
            document.getElementById("pm-list-div").innerHTML = "";
        };
        this.createChart = (pm, overlap) => {
            var chartSeries = [];
            let categories = pm.assignedProjectTasks.map(task => task.dateLabel);
            ;
            chartSeries.push({
                labels: {
                    visible: false
                },
                name: pm.name,
                data: pm.assignedProjectTasks,
                field: 'wt',
                tooltip: { visible: true, template: "#= value #%" }
            });
            if (overlap) {
                chartSeries = [];
                categories = pm.mergedProjectTasks.map(task => task.dateLabel);
                let projectTasks = [];
                let i = 0;
                for (; i < categories.length && i < this.selectedProject.tasks.length; i++) {
                    if (categories[i] != this.selectedProject.tasks[0].dateLabel) {
                        projectTasks.push(0);
                    }
                    else {
                        break;
                    }
                }
                // Add any missing points in the full chart series with the previous value for the project tasks
                let taskIndex = 0;
                while (taskIndex < this.selectedProject.tasks.length) {
                    if (categories[i] == this.selectedProject.tasks[taskIndex].dateLabel) {
                        projectTasks.push(this.selectedProject.tasks[taskIndex].wt);
                        taskIndex++;
                    }
                    else {
                        projectTasks.push(this.selectedProject.tasks[taskIndex - 1].wt);
                    }
                    i++;
                }
                chartSeries.push({
                    labels: {
                        visible: false
                    },
                    name: "Project Task",
                    data: projectTasks,
                    tooltip: { visible: true, template: "#= value #%" }
                });
                debugger;
                var pmTasksWts = []; //pm.assignedProjectTasks.map(task => task.wt);
                // Add the values with the 0 untill we reach the date for the first task of the PM tasks
                i = 0;
                for (; i < categories.length && i < pm.assignedProjectTasks.length; i++) {
                    if (categories[i] != pm.assignedProjectTasks[0].dateLabel) {
                        pmTasksWts.push(0);
                    }
                    else {
                        break;
                    }
                }
                // Add any missing points in the full chart series with the previous value for the PM task
                taskIndex = 0;
                while (taskIndex < pm.assignedProjectTasks.length) {
                    if (categories[i] == pm.assignedProjectTasks[taskIndex].dateLabel) {
                        pmTasksWts.push(pm.assignedProjectTasks[taskIndex].wt);
                        taskIndex++;
                    }
                    else {
                        pmTasksWts.push(pm.assignedProjectTasks[taskIndex - 1].wt);
                    }
                    i++;
                }
                let pmTaskSeries = {
                    name: "PM Tasks",
                    labels: {
                        visible: false
                    },
                    data: pmTasksWts,
                    tooltip: { visible: true, template: "#= value #%" }
                };
                chartSeries.unshift(pmTaskSeries);
            }
            $("#graph-" + pm.pmId).kendoChart({
                valueAxis: {
                    labels: {
                        visible: true
                    },
                    majorGridLines: {
                        visible: false
                    },
                    max: 250,
                    min: 0,
                },
                categoryAxis: {
                    categories: categories,
                    labels: {
                        rotation: 90
                    }
                },
                legend: {
                    visible: false
                },
                chartArea: {
                    // width: 1000,
                    height: 200
                },
                plotArea: {
                    padding: { right: 10 },
                    margin: { right: 10 }
                },
                seriesDefaults: {
                    type: "area",
                    stack: {
                        type: "normal"
                    }
                },
                series: chartSeries,
                tooltip: {
                    visible: true,
                    format: "{0}",
                    template: "#= series.name #: #= value #%"
                }
            });
            var chart = $("#graph-" + pm.pmId).data("kendoChart");
            chart.options.series[0].color = "blue";
            if (chart.options.series.length > 1) {
                chart.options.series[1].color = "#3392A7";
            }
            chart.redraw();
        };
        this.createProjectChart = proj => {
            var chartSeries = [];
            var tasksWT = proj.tasks.map(task => task.wt);
            var dates = proj.tasks.map(task => task.dateLabel);
            var projectTasks = proj.tasks;
            debugger;
            chartSeries.push({
                labels: {
                    visible: false
                },
                name: proj.Title,
                data: tasksWT,
                color: "#3392A7"
            });
            $("#graph-0").kendoChart({
                dataSource: {
                    data: projectTasks
                },
                valueAxis: {
                    labels: {
                        visible: true
                    },
                    majorGridLines: {
                        visible: false
                    },
                    max: 200,
                    min: 0,
                },
                categoryAxis: {
                    categories: dates,
                    labels: {
                        rotation: 90
                    },
                    justified: true
                },
                legend: {
                    visible: false
                },
                chartArea: {
                    // width: 1000,
                    height: 200
                },
                plotArea: {
                    padding: { right: 10 },
                    margin: { right: 10 }
                },
                seriesDefaults: {
                    type: "area",
                    stack: true
                },
                series: [{
                        field: "wt",
                        name: "Wt",
                        color: "#3392A7",
                        tooltip: { visible: true, template: "#= dataItem.title #: #= value #%" }
                    }],
                yAxis: {
                    max: 230
                },
                tooltip: {
                    visible: true,
                    format: "{0}%",
                    template: "#= dataitem.title #: #= value #%"
                }
            });
        };
        // this.data = data;
        this.inCompleteProjects = [];
        this.projectVal = "";
        this.init();
        this.toAssignPmId = "";
        this.selectedPId = "";
        this.selectedPmId = "";
        this.selectedProject = [];
        this.pmList = [];
    }
    assignPmBtn(e) {
        if (this.toAssignPmId !== "") {
            axios
                .post(`/api/project/AssignPM?projId=${this.selectedPId}&PMId=${this.toAssignPmId}`, null)
                .then(res => {
                let notification = new Notification();
                notification.ShowNotification("Save Success!", "PM assigned successfully.", "success");
                var currentPm = document.getElementById("current-pm");
                var assignedPm = document.getElementById("assigned-pm");
                assignedPm.value = currentPm.value;
                this.selectedPmId = this.toAssignPmId;
                this.loadPMs(this.selectedPId);
            })
                .catch(error => {
                console.log(error);
            });
        }
    }
    removePmBtn(e) {
        debugger;
        let pmSelected = null;
        if (this.toAssignPmId !== "") {
            let currentPm = document.getElementById("current-pm");
            currentPm.value = "";
            // -redraw the chart if its rendered using both of them
            const pmObj = this.pmList.find(p => p.pmId == this.toAssignPmId);
            var graphId = "graph-" + this.toAssignPmId;
            var chart = $("#" + graphId).data("kendoChart");
            chart.destroy();
            this.createChart(pmObj, false);
            pmSelected = this.toAssignPmId;
            this.toAssignPmId = "";
        }
        if (this.selectedPmId == pmSelected) // If the PM in the current PM box is actual PM of the project, then we send the request to the server to remove it
         {
            axios
                .post(`/api/project/UnAssignPm?projId=${this.selectedPId}&PMId=${this.selectedPmId}`, null)
                .then(res => {
                if (res.data) {
                    const assignedPM = document.getElementById("assigned-pm");
                    const currentPM = document.getElementById("current-pm");
                    assignedPM.value = "";
                    currentPM.value = "";
                    this.selectedPmId = "";
                    let notification = new Notification();
                    notification.ShowNotification("Save Success!", "PM removed successfully.", "success");
                    this.loadPMs(this.selectedPId);
                }
                console.log(res.data);
            })
                .catch(error => {
                console.log(error);
            });
        }
    }
    projectChange(e) {
        const { value } = e.target;
        const doc = document;
        const dateFrom = doc.getElementById("dateFrom");
        const dateTo = doc.getElementById("dateTo");
        const dFrom = doc.getElementById("d-from");
        const dTo = doc.getElementById("d-to");
        const assignedPm = doc.getElementById("assigned-pm");
        const currentPm = doc.getElementById("current-pm");
        const projectType = doc.getElementById("project-type");
        const extValue = doc.getElementById("ext-value");
        const title = doc.getElementById("p-title");
        this.projectVal = value;
        if (value !== "") {
            const project = this.inCompleteProjects.find(x => String(x.projectId) === value);
            this.selectedProject = project;
            dateFrom.value = project.startDate; //.slice(0, 10);
            dFrom.innerText = project.startDate; //.slice(0, 10);
            dateTo.value = project.endDate; //.slice(0, 10);
            dTo.innerText = project.endDate; //.slice(0, 10);
            assignedPm.value = project.pmName;
            projectType.value = project.type;
            extValue.value = project.totalExtValue;
            title.innerText = project.title;
            currentPm.value = project.pmName;
            this.selectedPmId = project.pmId;
            this.selectedPId = project.projectId;
        }
        else {
            this.selectedProject = [];
            dateFrom.value = "Date From";
            dFrom.innerText = "";
            dateTo.value = "Date To";
            dTo.innerText = "";
            assignedPm.value = "";
            projectType.value = "";
            extValue.value = "";
            title.innerText = "";
            currentPm.value = "";
            this.toAssignPmId = "";
            this.selectedPId = "";
            this.removePm();
            doc.getElementById("scheduler_here").style.display = "none";
        }
    }
    pmRecommBtn(e) {
        if (this.projectVal !== "") {
            document.getElementById("scheduler_here").style.display = "block";
            this.loadPMs(this.selectedPId);
        }
        else {
            const notification = new Notification();
            notification.ShowNotification("PM Recommendation", "Select a project to see recommendations.", "error");
            document.getElementById("scheduler_here").style.display = "none";
        }
    }
    getIncompleteProjects() {
        axios
            .get("/api/project/incomplete-projects")
            .then(res => {
            if (res.status === 200) {
                const projectDB = document.getElementById("project-list");
                if (projectDB.options.length > 0)
                    projectDB.options[0].remove();
                let option = document.createElement("option");
                option.text = "Please select...";
                option.value = "";
                projectDB.append(option);
                this.inCompleteProjects = res.data;
                for (var i = 0; i < res.data.length; i++) {
                    for (var j = 0; j < res.data[i].tasks.length; j++) {
                        res.data[i].tasks[j].dtDate = new Date(res.data[i].tasks[j].date);
                    }
                }
                res.data.forEach(project => {
                    option = document.createElement("option");
                    option.text = project.title;
                    option.value = project.projectId;
                    projectDB.append(option);
                });
            }
        })
            .catch(error => {
            console.log(error);
        });
    }
}
