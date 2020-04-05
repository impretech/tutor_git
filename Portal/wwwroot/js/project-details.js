import axiosES6 from "../lib/axios/axios.esm.min.js";
const axios = axiosES6;
import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
import { LinkedLocationList } from "./components/location.js";
import { Tabs } from "./components/tabs.js";
import { ProjectBudgetBar } from "./components/project-budget-bar.js";
import { Notification } from "./components/notification.js";
export class ProjectDetailsList {
    constructor(data) {
        this.documents = [];
        this.PortfolioGridSelectionChanged = (arg) => {
            let selectedItem = arg.sender.dataItem(arg.sender.select());
            window.location.href = selectedItem.projectId;
            //this.LoadAlertsPanel(selectedItem.projectId as number);
        };
        this.data = data;
        this.init();
    }
    init() {
        this.setupGrids();
        this.NewProjectButton = document.querySelector("#new-project-button");
        this.NewProjectButton.addEventListener("click", () => {
            window.location.href = "new";
        });
    }
    setupGrids() {
        const tableHeight = 660;
        $("#portfolio-grid").kendoGrid({
            toolbar: ["pdf", "excel"],
            excel: {
                fileName: "Excel Export.xlsx",
                proxyURL: "/Utilities/ExportToExcel",
                filterable: true
            },
            pdf: {
                allPages: true,
                avoidLinks: true,
                paperSize: "A4",
                margin: { top: "2cm", left: "1cm", right: "1cm", bottom: "1cm" },
                landscape: true,
                repeatHeaders: true,
                scale: 0.8,
                fileName: "PDF Export.pdf",
                proxyURL: "/Utilities/ExportToPDF",
            },
            dataSource: {
                data: this.data,
                schema: {
                    model: {
                        id: "projectId"
                    }
                },
                sort: { field: "projectId", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.PortfolioGridSelectionChanged,
            columnMenu: true,
            columns: [
                { field: "projectId", title: "ID", width: '10%' },
                { field: "title", title: "Title", width: '15%' },
                { field: "description", title: "Description" },
                { field: "phase", title: "Phase", width: '10%' },
                { field: "status", title: "Status", width: '15%' },
                { field: "projectNo", title: "Project No", width: '15%', hidden: true }
            ]
        });
        Utilities.MoveKendoToolbar("#portfolio-grid");
    }
}
export class ProjectDetailsItem {
    constructor(data) {
        this.RemConButton = new Array();
        this.IsDirty = false;
        this.documents = [];
        this.GridSelectionChanged = (arg) => {
            var closestGridElement = arg.sender.element.closest('[data-role="grid"]');
            var id = closestGridElement.attr('id');
            let selectedItem = arg.sender.dataItem(arg.sender.select());
            if (selectedItem != null) {
                this.ClearAllOtherGridSelections(id);
                this.LoadPreviewPanel(id, selectedItem);
            }
        };
        this.data = data;
        this.init();
        $("#location-grid").find(".k-grid-content").removeAttr('style').attr('style', 'height:100%');
        $("#location-grid").find(".k-grid-content").css("overflow", "visible");
        $("#location-grid").find(".k-grid-content").css("max-height", "100%");
        let responseAddButton = document.querySelector(".refreshButton");
        responseAddButton.addEventListener("click", async (evt) => {
            $("#detailPanel").hide();
            $("#performancePanel").hide();
            $("#documentDetailsGrid").hide();
            $("#purchaseOrderDetailsGrid").hide();
            $("#actionDetailsGrid").hide();
            $("#financialDetailsGrid").hide();
            $("#budgetDetailsGrid").hide();
            $("#scheduleDetailsGrid").hide();
            var projectId = this.data.project.projectId;
            var item = 'Project';
            var itemNo = 0;
            this.getMessagesByItem(item, itemNo, projectId);
            this.LoadDocumentGrid();
            this.LoadFinancialGrid();
            this.LoadScheduleGrid();
            this.LoadScheduleChart();
        });
        setInterval(() => {
            var projectId = this.data.project.projectId;
            var item = 'Project';
            var itemNo = 0;
            this.getMessagesByItem(item, itemNo, projectId);
            console.log('triggered');
        }, 120000);
        this.GetProjectItems();
        let arrowUpButtom = document.querySelector("#arrowUp");
        arrowUpButtom.addEventListener("click", (evt) => {
            $(".project-info-container").slideUp(300);
            $("#arrowUp").hide();
            $("#arrowDown").show();
        });
        let arrowDownButtom = document.querySelector("#arrowDown");
        arrowDownButtom.addEventListener("click", (evt) => {
            $(".project-info-container").slideDown(300);
            $("#arrowDown").hide();
            $("#arrowUp").show();
        });
        $("#to-value-one").kendoComboBox({
            dataTextField: "name",
            dataValueField: "param",
            dataSource: this.data.messagingData.projectTeamEmails,
            filter: "contains",
            suggest: true,
        });
        $(".status-value").kendoComboBox({
            dataTextField: "name",
            dataValueField: "name",
            dataSource: this.data.messagingData.statuses,
            filter: "contains",
            suggest: true,
        });
        $("#to-value").kendoComboBox({
            dataTextField: "name",
            dataValueField: "param",
            dataSource: this.data.messagingData.projectTeamEmails,
            filter: "contains",
            suggest: true,
        });
        $(".status-value-one").kendoComboBox({
            dataTextField: "name",
            dataValueField: "name",
            dataSource: this.data.messagingData.statuses,
            filter: "contains",
            suggest: true,
        });
        $("#action-value-one").kendoComboBox({
            dataTextField: "name",
            dataValueField: "name",
            dataSource: this.data.messagingData.actions,
            filter: "contains",
            suggest: true,
        });
        $(".listView").kendoListView({
            dataSource: this.data.messagingData.projectTeamEmails,
            template: kendo.template($("#myTemplate").html())
        });
        //sendMessage
        let msg = document.querySelector(".sendMsgAdditionalPanel");
        msg.addEventListener("click", async (evt) => {
            //document.body.classList.toggle("wait");
            this.isValid = true;
            $("#to-value").removeClass("error");
            $("#msg").removeClass("error");
            let message = {};
            message.projectId = this.data.project.projectId;
            message.itemType = "Project";
            message.status = "Pending";
            message.itemNo = this.data.project.projectId;
            message.emailTo = $("#to-value").val();
            if (message.emailTo == null) {
                $("#to_value").addClass("error");
                this.isValid = false;
            }
            message.emailBody = $("#msg").val();
            message.emailBody = message.emailBody.replace(/(?:\r\n|\r|\n)/g, '<br />');
            if (message.emailBody == '') {
                $("#msg").addClass("error");
                this.isValid = false;
            }
            var multiselect = $(".multiList");
            console.log(multiselect);
            var selectedData = '';
            multiselect.each(function (index, element) {
                if ($(element).find(".click").is(':checked')) {
                    if (selectedData != '') {
                        selectedData += ",";
                    }
                    selectedData += $(element).find(".click").val();
                }
            });
            console.log(selectedData);
            /*$.each(multiselect, function (i, v) {
                var chck = $(this).find(".click");
                if (selectedData != '') {
                    selectedData += ",";
                }
                selectedData += v;
            });*/
            message.dateRec = new Date().toLocaleString();
            message.dueDate = new Date().toLocaleDateString();
            message.emailCc = selectedData == undefined ? null : selectedData;
            message.list = this.documents;
            console.log(message);
            if (this.isValid) {
                $(".msg").val('');
                $("#to-value").data("kendoComboBox").refresh();
                $("#to-value").data("kendoComboBox").value("");
                $(".status-value-one").val('');
                //$(".status-value").val('');
                $("#to-value-one").data("kendoComboBox").refresh();
                $("#to-value-one").data("kendoComboBox").value("");
                $(".action-value-one").val('');
                $("#due-value").val('');
                $(".click").prop("checked", false);
                //$(".status-value-one").prop('selectedIndex', 0);
                //$("#action-value-one").prop('selectedIndex', 0);
                //$(".to-value").prop('selectedIndex', 0);
                //$(".status-value").prop('selectedIndex', 0);
                //$(".to-value-one").prop('selectedIndex', 0);
                $("#purchasePanel").css("display", "none");
                $("#actionPanel").css("display", "none");
                $("#message_tabstripMain .tapstrip-buttons").html('');
                const msgIns = await axios.post("api/message/insertmessage", message);
                /* $("#message_tabstripMain-" + item.id).parent().parent().css("display", "none");
                 $("#message_tabstripMain-" + item.id + " .tapstrip-buttons").html();*/
                console.log(msgIns);
                this.documents = [];
            }
            // document.body.classList.toggle("wait");
        });
        const clsBtn = document.querySelector(".closeAdditionalPanel");
        clsBtn.addEventListener("click", function () {
            $(".msg").val('');
            $("#to-value").data("kendoComboBox").refresh();
            $(".status-value-one").val('');
            //$(".status-value").val('');
            $("#to-value-one").val('');
            $(".action-value-one").val('');
            $("#due-value").val('');
            $(".click").prop("checked", false);
            //$(".status-value-one").prop('selectedIndex', 0);
            //$("#action-value-one").prop('selectedIndex', 0);
            //$(".to-value").prop('selectedIndex', 0);
            //$(".status-value").prop('selectedIndex', 0);
            //$(".to-value-one").prop('selectedIndex', 0);
            $("#purchasePanel").css("display", "none");
            $("#actionPanel").css("display", "none");
            $("#message_tabstripMain .tapstrip-buttons").html('');
        });
    }
    async getMessagesByItem(item, itemNo, projectId) {
        const responses = await axios.get("api/message/getMessagesByItemAll?item=" + item + "&itemNo=" + itemNo + "&projectId=" + projectId);
        $("#importantDiv").html(responses.data);
    }
    init() {
        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
        };
        console.log('detail data', this.data);
        this.docUpload = new DocUploadModal();
        this.setupSchedule();
        this.SaveButton = document.querySelector("#save-button");
        this.SaveButton.addEventListener("click", async (evt) => {
            this.Save();
            $(".location-milestone--tabs").removeClass("disabled");
        });
        this.CancelButton = document.querySelector("#cancel-button");
        this.CancelButton.addEventListener("click", () => {
            location.reload();
        });
        this.UploadDocButton = document.querySelector("#doc-button");
        this.UploadDocButton.addEventListener("click", () => {
            //this.docUpload.Show(this.data.project.projectId, this.data.project.entCode, "Project", this.data.project.projectId);
            this.docUpload.ShowForOther("Project", 0, this.data.project.projectId, "PRO1", null);
        });
        const tabs = document.querySelector(".container--tabs");
        const tab1 = new Tabs(tabs);
        tab1.onTabSelected(event => {
        });
        const locationMilestoneTabs = document.querySelector(".location-milestone--tabs");
        const tab2 = new Tabs(locationMilestoneTabs);
        tab2.onTabSelected(event => {
        });
        const projectNotesButton = document.querySelector("#project-notes-button");
        projectNotesButton.addEventListener("click", () => {
            let docked = $("#right-pane").hasClass("docked");
            /*if (docked) {
                $(".project-notes").css("right", "227px");
            }
            else {
                $(".project-notes").css("right", "28px");
            }*/
            if ($("#detailPanel").css("display") === "block") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
            if ($("#performancePanel").css("display") === "block") {
                $("#performancePanel").animate({ width: 'toggle' }, 300);
            }
            if ($(".project-notes").css("display") === "none") {
                $(".project-notes").animate({ width: 'toggle' }, 300);
            }
        });
        const hideNotesButton = document.querySelector("#hideNotes");
        hideNotesButton.addEventListener("click", () => {
            if ($(".project-notes").css("display") === "flex" || $(".project-notes").css("display") === "block") {
                $(".project-notes").animate({ width: 'toggle' }, 300);
            }
        });
        const addNoteButton = document.querySelector("#add-note-button");
        addNoteButton.addEventListener("click", async (evt) => {
            addNoteButton.disabled = true;
            evt.preventDefault();
            let noteText = $('#new-note').val();
            let note = {};
            note.ProjectID = this.data.project.projectId;
            note.writer = "L. Edwards";
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = 0;
            note.itemType = "";
            let noteDiv = this.CreateNote(note);
            let prevNotes = document.querySelector(".previous-notes");
            prevNotes.insertBefore(noteDiv, prevNotes.childNodes[0]);
            $('#new-note').val("");
            const noteUpdate = await axios.post("api/note/addNote", note);
            addNoteButton.disabled = false;
        });
        this.LoadTeamMembers();
        this.LoadDocumentsGrid();
        $("#date-received").kendoDatePicker();
        this.LoadLookups();
        this.BindData();
        this.BuildNotes();
        this.SetupHeaderButtons();
        console.log("init", this.data.project);
        let param = {};
        param.itemid = this.data.project.projectId;
        param.itemtype = 'Project';
        console.log("Location param", param);
        this.Locs = new LinkedLocationList(param);
        //const noteUpdate =  axios.get("api/message/getMessageByID?messid=1055");
        this.BuildMilestones();
        const refreshLocMil = document.querySelector("#refresh-location-milestone");
        refreshLocMil.addEventListener("click", () => {
            this.Locs = new LinkedLocationList(param);
            this.BuildMilestones();
        });
        if (this.data.project.projectId == 0) {
            $(".location-milestone--tabs").addClass("disabled");
        }
        window.addEventListener('attachupdate', (e) => {
            console.log("attachupdate", e);
            let detail = e.detail;
            if (detail.type == "Message") {
                this.documents.push(detail.docID);
                if ($("#message_tabstripMain .tapstrip-buttons").find("#" + detail.docID).length == 0) {
                    $("#message_tabstripMain .tapstrip-buttons").parent().parent().css("display", "block");
                    $("#message_tabstripMain .tapstrip-buttons").append(`
                    <li title="${detail.docID}-${detail.fileName}" style="bottom:-10px;margin-bottom:10px;"  id="${detail.docID}"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${detail.docID}</span></li>
                `);
                    $("#message_tabstripMain").kendoTabStrip({
                        animation: {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    });
                    let onSelectKendo1 = async (e) => {
                        document.body.classList.toggle("wait");
                        this.getDocUrl(e.item.id);
                        e.preventDefault();
                    };
                    $("#message_tabstripMain").data("kendoTabStrip").bind("select", onSelectKendo1);
                }
            }
        });
    }
    async BuildMilestones() {
        let milestoneDatasource = new kendo.data.DataSource();
        $("#project-duration-label").kendoTooltip({
            position: "top"
        });
        $("#project-start").kendoDatePicker();
        $("#project-start").closest("span.k-picker-wrap").width(119);
        $("#project-start").closest("span.k-picker-wrap").css("margin", "0 auto");
        $("#project-end").kendoDatePicker();
        $("#project-end").closest("span.k-picker-wrap").width(119);
        $("#project-end").closest("span.k-picker-wrap").css("margin", "0 auto");
        $("#project-value").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false
        });
        $("#project-value").closest("span.k-numeric-wrap").width(127);
        $("#project-value").closest("span.k-numeric-wrap").css("margin", "0 auto");
        $("#milestone-grid").kendoGrid({
            dataSource: milestoneDatasource,
            autoBind: false,
            scrollable: false,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "projectMilestoneID", hidden: true },
                { field: "projectID", hidden: true },
                { field: "milestoneID", hidden: true },
                { field: "milestone", title: "Milestone", width: '20%', attributes: { class: "text-center" } },
                { field: "startDate", title: "Start", width: '20%', template: "<input type='text' name='start-date' value='#= kendo.toString(kendo.parseDate(startDate), 'MM/dd/yyyy') #' style='text-align:center' />", attributes: { class: "text-center" } },
                { field: "endDate", title: "Complete", width: '20%', template: "<input type='text' name='end-date' value='#= kendo.toString(kendo.parseDate(endDate), 'MM/dd/yyyy') #' style='text-align:center' />", attributes: { class: "text-center" } },
                { field: "durationWKs", title: "Duration", headerTemplate: "<span id='duration-title' title='Weeks'>Duration</span>", width: '20%', template: "<input type='text' value='#= durationWKs #' class='k-textbox' style='width:64px;text-align:center' disabled />", attributes: { class: "text-center" }, footerTemplate: "<button class='btn' id='milestones-save' style='background-color:\\#3392a7;width:80px' disabled>Save</button>", footerAttributes: { "class": "text-center" } },
                { field: "wt", title: "WT %", width: '20%', template: "<input type='text' value='#=kendo.format('{0}\\%', wt)#' class='k-textbox' style='width:80px;text-align:center' />", attributes: { class: "text-center" }, footerTemplate: "<button class='btn' id='milestones-cancel' style='background-color:\\#ccc;width:80px'>Cancel</button>", footerAttributes: { "class": "text-center" } },
            ],
            dataBound: function () {
                $("input[name = 'start-date']").each(function () {
                    $(this).kendoDatePicker({
                        format: "MM/dd/yyyy"
                    });
                    $(this).closest("span.k-picker-wrap").width(119);
                });
                $("input[name = 'end-date']").each(function () {
                    $(this).kendoDatePicker({
                        format: "MM/dd/yyyy"
                    });
                    $(this).closest("span.k-picker-wrap").width(119);
                });
            }
        });
        $("#duration-title").kendoTooltip({
            position: "top"
        });
        if (this.data.project.projectId !== 0) {
            let milestones = await axios.get("/api/Project/GetProjectMilestones?projid=" + this.data.project.projectId);
            if (milestones.data.length === 0) {
                milestones = await axios.get("/api/Project/GetMilstoneDefaults?type=" + this.data.project.typeConstruction + "&projid=" + this.data.project.projectId);
            }
            milestoneDatasource.data(milestones.data);
            let hasSchedule = await axios.get("/api/Project/IsScheduleCreated?projid=" + this.data.project.projectId);
            if (hasSchedule) {
                $("#milestones-save").prop("disabled", false);
            }
            let duration = 0;
            milestones.data.forEach(m => {
                duration = duration + m.durationWKs;
            });
            $("#project-duration").val(duration);
            $("#project-start").val(Utilities.FormatDateString(this.data.project.startDate));
            let endDate = new Date(this.data.project.startDate);
            endDate.setDate(endDate.getDate() + duration * 7);
            $("#project-end").val(Utilities.FormatDateString(endDate.toString()));
            var projectValue = $("#project-value").data("kendoNumericTextBox");
            projectValue.value(this.data.project.value);
            $('#project-pm-on-site').prop('checked', this.data.project.pMonSite);
        }
        let saveButton = document.querySelector("#milestones-save");
        saveButton.addEventListener("click", async () => {
            let milestones = $("#milestone-grid").data("kendoGrid").dataSource.data();
            let updateMilestones = await axios.put("/api/Project/UpdateProjectMilestones", milestones);
            let createSchedule = await axios.post("/api/Project/DefaultSchedule?type=" + this.data.project.typeConstruction + "&projid=" + this.data.project.projectId);
            if (updateMilestones.status === 200 && createSchedule.status == 200) {
                let notification = new Notification();
                notification.ShowNotification("Save Success!", "Milestones Saved Successfully", "success");
            }
        });
        let cancelButton = document.querySelector("#milestones-cancel");
        cancelButton.addEventListener("click", async () => {
            location.reload();
        });
        milestoneDatasource.fetch(function () {
            if (milestoneDatasource.total() > 0) {
                $("#milestoneexcalmination").css("display", "none");
            }
            else {
                $("#milestoneexcalmination").css("display", "block");
            }
        });
    }
    setupSchedule() {
        gantt.config.date_format = "%Y-%m-%d %H:%i";
        gantt.init("project-schedule");
        ganttModules.menu.setup();
        gantt.load("/api/gantt/getGanttbyProject?proj=" + this.data.project.projectId, "json");
        var dp = new gantt.dataProcessor("/api/gantt");
        dp.init(gantt);
        dp.setTransactionMode("REST");
    }
    hideShowTable(a, force = false) {
        let typeName = a.getAttribute("href");
        if (a.classList.contains("open")) {
            a.classList.remove("open");
        }
        else { //open and show 
            a.classList.add("open");
        }
    }
    LoadLookups() {
        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
        $("#phase").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Phase"),
            filter: "contains",
            suggest: true,
            index: 3
        });
        $("#status").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Status"),
            filter: "contains",
            suggest: true,
            index: 3
        });
        $("#area-type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("AreaType"),
            filter: "contains",
            suggest: true,
            index: 3
        });
        $("#construction-type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("ConstructionType"),
            filter: "contains",
            suggest: true,
            index: 3
        });
    }
    groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            }
            else {
                collection.push(item);
            }
        });
        return map;
    }
    SetupHeaderButtons() {
        /*let buttons = document.querySelectorAll(".grid-item-header-buttons.location button");
        buttons[0].addEventListener("click", () => {
            $("#location-grid").data("kendoGrid").addRow();
        });

        buttons[1].addEventListener("click", () => {
            $("#location-grid").data("kendoGrid").saveChanges();
        });

        buttons[2].addEventListener("click", () => {
            $("#location-grid").data("kendoGrid").cancelChanges();
        });*/
    }
    async BindData() {
        $("#project-manager").kendoComboBox({
            dataTextField: "name",
            dataValueField: "pmId",
            dataSource: this.data.projectManagers,
            filter: "contains",
            suggest: true,
        });
        if (this.data.project.title === 'New') {
            $("#title").val('New Project');
            $("#project-manager").val("");
        }
        else {
            $("#title").val(this.data.project.title);
            $("#gsf").val(this.data.project.gsf);
            if (this.data.project.pmId !== 0) {
                $("#project-manager").data("kendoComboBox").value(this.data.project.pmId);
            }
            if (this.data.project.holder !== 0) {
                let holderName = await axios.get("api/project/GetHolderName?contactid=" + this.data.project.holder + "&type=full");
                $("#holderName").text("Current Action Holder: " + holderName.data);
            }
            if (this.data.project.pmId !== 0) {
                let pmName = await axios.get("api/project/GetPMName?pmid=" + this.data.project.pmId + "&type=full");
                $("#pmName").text("Project Manager: " + pmName.data);
            }
        }
        $("#project-number").val(this.data.project.projectNo);
        $("#site").val(this.data.project.site);
        $("#customer-number").val(this.data.project.client);
        $("#capital-number").val(this.data.project.capitalNo);
        $("#date-received").val(Utilities.FormatDateString(this.data.project.dateReceived));
        $("#description").val(this.data.project.description);
        $("#requestor").val(this.data.project.requestor);
        $("#phase").data("kendoComboBox").value(this.data.project.phase);
        $("#status").data("kendoComboBox").value(this.data.project.status);
        $("#area-type").data("kendoComboBox").value(this.data.project.typeArea);
        $("#construction-type").data("kendoComboBox").value(this.data.project.typeConstruction);
    }
    async Save() {
        this.SaveButton.disabled = true;
        document.body.classList.toggle("wait");
        let project = {};
        project.projectId = this.data.project.projectId;
        project.projectNo = $("#project-number").val();
        project.title = $("#title").val();
        project.site = $("#site").val();
        project.client = $("#customer-number").val();
        project.capitalNo = $("#capital-number").val();
        project.dateReceived = $("#date-received").val();
        project.description = $("#description").val();
        project.gsf = $("#gsf").val();
        project.requestor = $("#requestor").val();
        project.pmId = $("#project-manager").data("kendoComboBox").value();
        project.phase = $("#phase").data("kendoComboBox").value();
        project.status = $("#status").data("kendoComboBox").value();
        project.typeArea = $("#area-type").data("kendoComboBox").value();
        project.typeConstruction = $("#construction-type").data("kendoComboBox").value();
        project.holder = this.data.project.holder;
        project.startDate = $("#project-start").val();
        project.duration = $("#project-duration").val();
        project.value = $("#project-value").data("kendoNumericTextBox").value();
        project.pMonSite = $('#project-pm-on-site').is(":checked");
        let notification = new Notification();
        try {
            console.log("Save new ProjectID", project.projectId);
            if (project.projectId == 0) {
                project.value = 0;
                //project.startDate = new Date();
                //project.startDate.getDate();
                project.duration = 0;
                console.log("Save new Project", project);
                var addProject = await axios.post("api/project/postProject", project);
                this.data.project.projectId = addProject.data.projectId;
                this.data.project.entCode = addProject.data.entCode;
                console.log("Save New Status", addProject);
                notification.ShowNotification("Save Success!", "Project Added Successfully", "success");
                this.GetProjectItems();
            }
            else {
                var updateProject = await axios.put("api/project/updateProject", project);
                notification.ShowNotification("Save Success!", "Project Updated Successfully", "success");
                let pmName = $("#project-manager").data("kendoComboBox").text();
                $("#pmName").text("Project Manager: " + pmName);
            }
        }
        catch (error) {
            notification.ShowNotification("Save Failed", error, "error");
        }
        document.body.classList.toggle("wait");
        this.SaveButton.disabled = false;
    }
    BuildNotes() {
        const notes = document.querySelector(".previous-notes");
        notes.innerHTML = "";
        this.data.notes.forEach((item, key) => {
            let note = this.CreateNote(item);
            notes.appendChild(note);
        });
    }
    CreateNote(note) {
        let itemDiv = document.createElement("div");
        itemDiv.className = "note-item";
        let titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.innerText = note.writer + " " + Utilities.FormatDateString(note.created);
        let noteDiv = document.createElement("div");
        noteDiv.className = "note";
        noteDiv.innerText = note.progressNote;
        itemDiv.appendChild(titleDiv);
        itemDiv.appendChild(noteDiv);
        return itemDiv;
    }
    async LoadTeamMembers() {
        console.log("LoadTeamMember for Project", this.data.project.projectId);
        const teamMembers = await axios.get("api/project/getProjectTeam?projid=" + this.data.project.projectId);
        console.log("LoadTeamMember Return", teamMembers);
        this.BuildTeamMemberCards(teamMembers.data);
    }
    BuildTeamMemberCards(teamData) {
        const teamContainer = document.querySelector(".team-member-container");
        teamContainer.innerHTML = "";
        this.RemConButton = new Array(teamData.length);
        for (let member of teamData) {
            let itemDiv = document.createElement("div");
            itemDiv.className = "team-member";
            let toolDiv = document.createElement("div");
            toolDiv.className = "tool";
            let removeidbut = 'butRemoveContact' + member.projectTeamID;
            toolDiv.innerHTML = "<button id='" + removeidbut + "' class='btn remove' title='Remove' >X</button>"; //<svg class='grid - item - icon'>< use xlink: href = '/images/icons.svg#times' ></use></svg>
            toolDiv.nodeValue = member.projectTeamID;
            itemDiv.appendChild(toolDiv);
            let nameDiv = document.createElement("div");
            nameDiv.className = "name";
            nameDiv.innerText = member.firstName + " " + member.lastName;
            itemDiv.appendChild(nameDiv);
            let roleDiv = document.createElement("div");
            roleDiv.className = "role";
            roleDiv.innerText = member.role;
            itemDiv.appendChild(roleDiv);
            let companyDiv = document.createElement("div");
            companyDiv.className = "company";
            companyDiv.innerText = member.company;
            itemDiv.appendChild(companyDiv);
            let titleDiv = document.createElement("div");
            titleDiv.className = "title";
            titleDiv.innerText = member.title;
            itemDiv.appendChild(titleDiv);
            let phoneDiv = document.createElement("div");
            phoneDiv.className = "phone";
            phoneDiv.innerHTML = "<a href='tel:" + member.phoneNumber + "'>" + Utilities.FormatPhoneNumber(member.phoneNumber) + "</a>";
            itemDiv.appendChild(phoneDiv);
            let emailDiv = document.createElement("div");
            emailDiv.className = "email";
            emailDiv.innerHTML = "<a href='mailto:" + member.emailAddress + "'>" + member.emailAddress + "</a>";
            itemDiv.appendChild(emailDiv);
            teamContainer.appendChild(itemDiv);
            this.setupRemoveBut(removeidbut);
        }
        let NewDiv = document.createElement("div");
        NewDiv.className = "team-member";
        let titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.innerHTML = "<h3>New Team Contact</h3>";
        NewDiv.appendChild(titleDiv);
        let nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.innerHTML = '<input id="nameCombo" name="nameCombo" placeholder="Select Contact.."  style="width: 100%" />';
        NewDiv.appendChild(nameDiv);
        let roleDiv = document.createElement("div");
        roleDiv.className = "name";
        roleDiv.innerHTML = '<input id="roleCombo" name="roleCombo" placeholder="Select Role.."  style="width: 100%" />';
        NewDiv.appendChild(roleDiv);
        let addDiv = document.createElement("div");
        addDiv.className = "name";
        addDiv.innerHTML = '<button id="addMemberBut" name="addMemberBut" style="width: 100%;margin-top:20px" />Add</button>';
        NewDiv.appendChild(addDiv);
        console.log("End BuildTeamMemberCards New Card", NewDiv);
        teamContainer.appendChild(NewDiv);
        this.setupNewContactCombo("PRO1");
    }
    setupRemoveBut(e) {
        let but = document.querySelector("#" + e);
        this.RemConButton.push(but);
        //  this.RemConButton.push( document.querySelector("#" + e ) as HTMLButtonElement);
        this.RemConButton[this.RemConButton.length - 1].addEventListener("click", async (evt) => {
            console.log("butRemoveContact", evt);
            var id = this.RemConButton[this.RemConButton.length - 1].id;
            var str = id.replace("butRemoveContact", "");
            var vendorlinkid = Number(str);
            console.log("butRemoveContact evt", str);
            let result = await axios.post("api/project/RemoveTeamContactbyID?c=" + vendorlinkid);
            if (result) {
                this.LoadTeamMembers();
            }
        });
    }
    setupNewContactCombo(e) {
        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
        $("#nameCombo").kendoComboBox({
            placeholder: "Select Contact...",
            dataTextField: "showAsName",
            dataValueField: "contactID",
            template: '<span><p>#: showAsName # (#: company #)</p></span>',
            autoBind: false,
            minLength: 3,
            filter: "contains",
            dataSource: {
                serverFiltering: false,
                transport: {
                    read: { url: "../api/vendor/GetContactsLookup?e=" + e, dataType: "json", type: "GET" },
                },
                suggest: true,
            },
            //change: function (e) {
            //    //var text = this.text();
            //    //var value = this.value();
            //    //console.log("Change NewContactCombo Value", value);
            //    //this.selectedContact = this.dataItem(this.select());
            //    //console.log("Change NewContactCombo", this.selectedContact);
            //},
            noDataTemplate: $("#noDataTemplate").html(),
            dataBound: (e) => {
                this.AddConButton = document.getElementById("new-contact-button");
                this.AddConButton.addEventListener("click", async (evt) => {
                    console.log("Start setupNewContactButtton", e);
                    let basicContact = {};
                    basicContact.Writer = "L Edwards";
                    basicContact.EntCode = this.data.project.entCode;
                    basicContact.ShowAs = $("#nameCombo").data("kendoComboBox").input.val();
                    console.log("Mid setupNewContactButtton", basicContact);
                    if (basicContact.ShowAs != null) {
                        let cvm = await axios.post("api/project/CreateBasicVendorContact", basicContact);
                        let contact = cvm.data;
                        //console.log("CreateBasicVendorContact Contact", contact);
                        if (contact != null) {
                            var dataSource = e.sender;
                            var data = dataSource.dataSource.data();
                            //console.log("CreateBasicVendorContact index 0", data[0]);
                            data.splice(0, 0, contact);
                            //console.log("CreateBasicVendorContact index 0", data[0]);
                            dataSource.dataSource.at(0);
                            $("#nameCombo").data("kendoComboBox").select(0);
                            $("#nameCombo").data("kendoComboBox").close();
                        }
                    }
                });
            },
        });
        $("#roleCombo").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Role"),
            filter: "contains",
            suggest: true
        });
        this.AddMemberButton = document.getElementById("addMemberBut");
        this.AddMemberButton.addEventListener("click", async (evt) => {
            console.log("addMemberBut Clicked");
            let role = $("#roleCombo").val();
            let contact = $("#nameCombo").data("kendoComboBox").dataItem();
            //let contactid = Number(Contactid);
            console.log("addMemberBut ContactID", contact);
            console.log("addMemberBut role", role);
            if (contact.contactID > 0 && role != null) {
                let team = {};
                team.contactID = contact.contactID;
                team.role = role;
                team.projectID = this.data.project.projectId;
                team.entCode = this.data.project.entCode;
                console.log("AddTeamMember", team);
                let newmember = await axios.post("api/project/AddToProjectTeam", team);
                if (newmember != null) {
                    this.LoadTeamMembers();
                }
            }
        });
        $("#nameCombo").data("kendoComboBox").bind("change", async (e) => {
            console.log("onSelect", e);
            var dataItem = e.sender._valueBeforeCascade;
        });
    }
    LoadDocumentsGrid() {
        $("#documents-grid").kendoGrid({
            dataSource: {
                transport: {
                    read: {
                        url: "/api/document/getDocsByProject?projid=" + this.data.project.projectId + "&count=20",
                        dataType: "json"
                    }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        id: "docID"
                    }
                }
            },
            height: 280,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            columns: [
                { field: "title", title: "Name" },
                { field: "type", title: "Type", width: '20%' },
                { field: "itemType", title: "Item Type", width: '20%' },
                { field: "itemNo", title: "Item No", width: '20%' }
            ]
        }).on("click", "tbody td", (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#documents-grid").data("kendoGrid");
            document.body.classList.toggle("wait");
            var dataItem = grid.dataItem(cell.closest("tr"));
            this.getDocUrl(dataItem.docID);
        });
    }
    async GetProjectItems() {
        this.LoadDocumentGrid();
        this.LoadFinancialGrid();
        this.LoadScheduleGrid();
        this.LoadScheduleChart();
        this.LoadBudgetBar();
        if (this.data.project.projectId !== 0) {
            let performanceButton = document.querySelector("#performanceButton");
            performanceButton.addEventListener("click", (evt) => {
                $("#document-details-grid").data("kendoGrid").clearSelection();
                $("#financial-details-grid").data("kendoGrid").clearSelection();
                $("#schedule-details-grid").data("kendoGrid").clearSelection();
                $("#budget-details-grid").data("kendoGrid").clearSelection();
                $("#detailPanel").hide();
                $("#performancePanel").animate({ width: 'toggle' }, 300);
            });
            let closePerformance = document.querySelector("#closePerformance");
            closePerformance.addEventListener("click", (evt) => {
                $("#performancePanel").animate({ width: 'toggle' }, 300);
            });
            let closeDetail = document.querySelector("#closeDetail");
            closeDetail.addEventListener("click", (evt) => {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            });
        }
    }
    LoadDocumentGrid() {
        let itemType;
        var documentDetailSource = new kendo.data.DataSource();
        var documentSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetDocumentSummary?projid=" + this.data.project.projectId + "&entcode=" + this.data.project.entCode, dataType: "json" },
            }
        });
        let category;
        var actionDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetActionDetailData?projid=" + this.data.project.projectId, dataType: "json" },
            }
        });
        var purchaseOrdersDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetPOSumDetails?projid=" + this.data.project.projectId, dataType: "json" },
            }
        });
        var fieldReportsDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetFieldReportsDetails?projid=" + this.data.project.projectId, dataType: "json" },
            }
        });
        if (this.data.project.projectId !== 0) {
            documentSource.read();
        }
        $("#document-summary-grid").kendoGrid({
            dataSource: documentSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "item", title: "Item", width: "25%" },
                { field: "pending", title: "Pending", width: "20%", attributes: { class: "text-center" } },
                { field: "critical", title: "Critical", width: "20%", attributes: { class: "text-center" } },
                { field: "status", title: "Status", width: "15%", attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
                { field: "complete", title: "Complete", width: "20%", attributes: { class: "text-center" } }
            ]
        }).on("click", "tbody td", async (e) => {
            $("#purchasePanel").css("display", "none");
            $("#actionPanel").css("display", "none");
            $("#message_tabstripMain .tapstrip-buttons").html('');
            $("#documentDetailsGrid").show();
            $("#financialDetailsGrid").hide();
            $("#financial-summary-grid").data("kendoGrid").clearSelection();
            $("#scheduleDetailsGrid").hide();
            $("#schedule-summary-grid").data("kendoGrid").clearSelection();
            $("#budgetDetailsGrid").hide();
            $("#budget-details-grid").data("kendoGrid").clearSelection();
            var grid = $("#document-summary-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr"));
            itemType = dataItem.item;
            if (itemType === 'Actions') {
                $("#documentDetailsGrid").hide();
                $("#purchaseOrderDetailsGrid").hide();
                $("#fieldReportsDetailsGrid").hide();
                $("#actionDetailsGrid").show();
                $("#actionDetailTitle").text('Details: Element - Action');
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetActionDetailData?projid=" + this.data.project.projectId, dataType: "json" },
                    }
                });
                var detailGrid = $("#action-details-grid").data("kendoGrid");
                detailGrid.setDataSource(actionDetailSource);
                detailGrid.dataSource.read();
            }
            else if (itemType === 'Purchase Orders') {
                $("#documentDetailsGrid").hide();
                $("#actionDetailsGrid").hide();
                $("#fieldReportsDetailsGrid").hide();
                $("#purchaseOrderDetailsGrid").show();
                $("#purchaseOrderDetailTitle").text('Details: Element - Purchase Orders');
                purchaseOrdersDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetPOSumDetails?projid=" + this.data.project.projectId, dataType: "json" },
                    }
                });
                var detailGrid = $("#purchaseOrder-details-grid").data("kendoGrid");
                detailGrid.setDataSource(purchaseOrdersDetailSource);
                detailGrid.dataSource.read();
            }
            else if (itemType === 'Field Reports') {
                $("#documentDetailsGrid").hide();
                $("#actionDetailsGrid").hide();
                $("#purchaseOrderDetailsGrid").hide();
                $("#fieldReportsDetailsGrid").show();
                $("#fieldReportsDetailTitle").text('Details: Element - Field Reports');
                fieldReportsDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFieldReportsDetails?projid=" + this.data.project.projectId, dataType: "json" },
                    }
                });
                var detailGrid = $("#fieldReports-details-grid").data("kendoGrid");
                console.log(fieldReportsDetailSource);
                detailGrid.setDataSource(fieldReportsDetailSource);
                detailGrid.dataSource.read();
            }
            else {
                $("#actionDetailsGrid").hide();
                $("#purchaseOrderDetailsGrid").hide();
                $("#fieldReportsDetailsGrid").hide();
                $("#documentDetailsGrid").show();
                $("#documentDetailTitle").text('Details: Element - ' + itemType);
                documentDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType, dataType: "json" },
                    }
                });
                var detailGrid = $("#document-details-grid").data("kendoGrid");
                detailGrid.setDataSource(documentDetailSource);
                detailGrid.dataSource.read();
            }
            $("#detailPanel").hide();
        });
        $("#document-details-grid").kendoGrid({
            dataSource: documentDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "order", title: "Order", width: '10%', attributes: { class: "text-right" } },
                { field: "itemNo", title: "Item Number", width: '15%', attributes: { class: "text-right" } },
                { field: "vendor", title: "Vendor", width: '15%', attributes: { class: "text-left" } },
                { field: "summary", title: "Summary", width: '20%', attributes: { class: "text-left" } },
                { field: "recievedDate", title: "Recieved Date", width: '10%', template: '#= kendo.toString(kendo.parseDate(recievedDate), "MM/dd/yyyy") #', attributes: { class: "text-left" } },
                { field: "dueDate", title: "Due Date", width: '10%', template: '#= kendo.toString(kendo.parseDate(dueDate), "MM/dd/yyyy") #', attributes: { class: "text-left" } },
                { field: "amount", title: "Amount", width: '10%', attributes: { class: "text-right" } },
                { field: "alertType", title: "Alert Type", width: '10%', attributes: { class: "text-left" } },
                { field: "status", title: "Status", width: '10%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
            ]
        }).on("click", "tbody td", async (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#document-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            itemType = dataItem.itemType;
            var itemNumber = dataItem.itemNo;
            $("#detailTitle").text(itemType + ": " + itemNumber);
            if ($("#detailPanel").css("display") === "none") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
        });
        let projectId = this.data.project.projectId;
        $("#greenDocumentFilter").click(function (e) {
            if (projectId !== 0) {
                documentDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType + "&status=green", dataType: "json" },
                    }
                });
                var docDetailsGrid = $("#document-details-grid").data("kendoGrid");
                docDetailsGrid.setDataSource(documentDetailSource);
                docDetailsGrid.dataSource.read();
            }
        });
        $("#yellowDocumentFilter").click(function (e) {
            if (projectId !== 0) {
                documentDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType + "&status=yellow", dataType: "json" },
                    }
                });
                var docDetailsGrid = $("#document-details-grid").data("kendoGrid");
                docDetailsGrid.setDataSource(documentDetailSource);
                docDetailsGrid.dataSource.read();
            }
        });
        $("#redDocumentFilter").click(function (e) {
            if (projectId !== 0) {
                documentDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType + "&status=red", dataType: "json" },
                    }
                });
                var docDetailsGrid = $("#document-details-grid").data("kendoGrid");
                docDetailsGrid.setDataSource(documentDetailSource);
                docDetailsGrid.dataSource.read();
            }
        });
        $("#allDocumentFilter").click(function (e) {
            if (projectId !== 0) {
                documentDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType, dataType: "json" },
                    }
                });
                var docDetailsGrid = $("#document-details-grid").data("kendoGrid");
                docDetailsGrid.setDataSource(documentDetailSource);
                docDetailsGrid.dataSource.read();
            }
        });
        $("#searchDocumentFilter").change(function (e) {
            if (itemType && projectId !== 0) {
                documentDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType + "&search=" + $(this).val(), dataType: "json" },
                    }
                });
                var docDetailsGrid = $("#document-details-grid").data("kendoGrid");
                docDetailsGrid.setDataSource(documentDetailSource);
                docDetailsGrid.dataSource.read();
            }
        });
        $("#action-details-grid").kendoGrid({
            dataSource: actionDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "order", title: "Order", width: '5%', attributes: { class: "text-center" } },
                { field: "itemType", title: "Item Type", width: '10%', attributes: { class: "text-center" } },
                { field: "itemID", title: "ItemID", width: '10%', attributes: { class: "text-center" } },
                { field: "action", title: "Action", width: '15%', attributes: { class: "text-center" } },
                { field: "from", title: "From", width: '15%', attributes: { class: "text-center" } },
                { field: "to", title: "To", width: '15%', attributes: { class: "text-center" } },
                { field: "instructions", title: "Instructions", width: '20%' },
                { field: "dateSent", title: "Date Sent", width: '10%', template: '#= kendo.toString(kendo.parseDate(dueDate), "MM/dd/yyyy") #', attributes: { class: "text-center" } },
                { field: "dueDate", title: "Due Date", width: '10%', template: '#= kendo.toString(kendo.parseDate(dueDate), "MM/dd/yyyy") #', attributes: { class: "text-center" } },
                { field: "alertType", title: "Type Alert", width: '10%', attributes: { class: "text-center" } },
                { field: "status", title: "Status", width: '10%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
                { field: "messageID", title: "Menu", width: '10%', template: '<i class="fa fa-bars" style="font-size:24px;"></i>', attributes: { class: "text-center" } },
            ]
        }).on("click", "tbody td", async (e) => {
            $("#purchasePanel").css("display", "none");
            $("#actionPanel").css("display", "none");
            $("#to-value").kendoComboBox({
                dataTextField: "name",
                dataValueField: "param",
                dataSource: this.data.messagingData.projectTeamEmails,
                filter: "contains",
                suggest: true,
            });
            //$("#status-value").kendoComboBox({
            //    dataTextField: "name",
            //    dataValueField: "name",
            //    dataSource: this.data.messagingData.statuses,
            //    filter: "contains",
            //    suggest: true,
            //});
            this.pomosnaLista = $("#listView").kendoListView({
                selectable: true,
                dataSource: this.data.messagingData.projectTeamEmails,
                template: kendo.template($("#myTemplate").html())
            });
            var cell = $(e.currentTarget);
            var grid = $("#action-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            var from = dataItem.from;
            var message = dataItem.messageID;
            itemType = "Action";
            var itemID = dataItem.itemID;
            var pm = 'None';
            var second = '';
            var first = '';
            var tracking = '';
            const projectResponse = await axios.get("api/project/GetAlertHistory?itemtype=" + itemType + "&itemno=" + message);
            if (projectResponse.data.length === 0) {
                first = pm;
                second = pm;
            }
            else if (projectResponse.data.length === 1) {
                first = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ID:</div><div style='width:50%;'>" + projectResponse.data[0].itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Type:</div><div style='width:50%;'>" + projectResponse.data[0].type + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Description:</div><div style='width:50%;'>" + projectResponse.data[0].description + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Impact:</div><div style='width:50%'>" + projectResponse.data[0].impact + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Recommendation:</div><div style='width:50%'>" + projectResponse.data[0].recommendation + "</div></div>";
                second = pm;
            }
            else {
                projectResponse.data.forEach((item, key) => {
                    if (first === '') {
                        first = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Type:</div><div style='width:50%;'>" + item.type + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Description:</div><div style='width:50%;'>" + item.description + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Impact:</div><div style='width:50%'>" + item.impact + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Recommendation:</div><div style='width:50%'>" + item.recommendation + "</div></div>";
                    }
                    else {
                        second = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Type:</div><div style='width:50%;'>" + item.type + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Description:</div><div style='width:50%;'>" + item.description + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Impact:</div><div style='width:50%'>" + item.impact + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Recommendation:</div><div style='width:50%'>" + item.recommendation + "</div></div>";
                        second = second + "</hr>";
                    }
                });
            }
            /*  const trackingResponse = await axios.get("api/project/GetTrackingData?POLineID=" + message);
              if (trackingResponse.data.length === 0) {
                  tracking = pm;
              }
              else {
                  trackingResponse.data.forEach((item, key) => {
                      tracking = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Tracking Number:</div><div style='width:50%;'>" + item.trackingNo + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Item Type:</div><div style='width:50%;'>" + item.itemType + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ItemID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Ship Vendor:</div><div style='width:50%'>" + item.shipVendor + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Quantity:</div><div style='width:50%'>" + item.qty + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Status:</div><div style='width:50%'>" + item.status + "</div></div>";
                      tracking = tracking + "</hr>";
                  });
              }*/
            var str = "<div style='width:100%'><div style='width:100%'>Project: " + this.data.project.title + "  Project ID: " + this.data.project.projectId + " </div></div><div style='width:100%;display:flex;'><div style='width:50%;'><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>From:</div><div style='width:50%'>" + from + "</div></div></div><div style='width:50%;padding-left:10px;'><div style='max-width:100%;background-color:red;color:#fff;text-align:center;padding-top:5px;'>Alert</div>" + first + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'><div style='max-width:100%;background-color:#FFBF48;color:#fff;text-align:center;padding-top:5px;'>Action History</div>" + tracking + "</div><div style='width:50%;padding-left:10px;'><div style='max-width:100%;background-color:red;color:#fff;text-align:center;padding-top:5px;'>Alert History</div>" + second + "</div></div>";
            $("#detailTitle").text("Actions: " + itemID);
            $("#detailContent").html(str);
            const mss = document.querySelector("#sendMsg");
            mss.addEventListener("click", () => {
                $("#actionPanel").css("display", "block");
            });
            this.UploadDocButton = document.querySelector(".doc-buttonPanel");
            this.UploadDocButton.addEventListener("click", () => {
                console.log(this.UploadDocButton);
                this.docUpload.ShowForOther("Project", 0, this.data.project.projectId, "PRO1", this.UploadDocButton);
                //  this.docUpload.Show(this.data.project.projectId, this.data.project.entCode, "Project", this.UploadDocButton);
            });
            if ($("#detailPanel").css("display") === "none") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
        });
        $("#greenActionFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetActionDetailData?projid=" + projectId + "&status=green", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#action-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#yellowActionFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetActionDetailData?projid=" + projectId + "&status=yellow", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#action-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#redActionFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetActionDetailData?projid=" + projectId + "&status=red", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#action-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#allActionFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetActionDetailData?projid=" + projectId, dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#action-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#searchActionFilter").change(function (e) {
            if (itemType && projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetActionDetailData?projid=" + projectId + "&search=" + $(this).val(), dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#action-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#purchaseOrder-details-grid").kendoGrid({
            dataSource: purchaseOrdersDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "order", title: "Order", width: '5%', attributes: { class: "text-center" } },
                { field: "itemID", title: "ItemID", width: '5%', attributes: { class: "text-center" } },
                { field: "itemPartNo", title: "Item Part #", width: '10%', attributes: { class: "text-center" } },
                { field: "qty", title: "Qty", width: '5%', attributes: { class: "text-center" } },
                { field: "description", title: "Item Description", width: '10%', attributes: { class: "text-center" } },
                { field: "vendor", title: "Vendor", width: '10%', attributes: { class: "text-center" } },
                { field: "poNo", title: "PO No", width: '10%', attributes: { class: "text-center" } },
                { field: "amount", title: "Amount", format: "{0:c}", width: '10%', attributes: { class: "text-center" } },
                { field: "orderDate", title: "Order Date", width: '10%', template: '#= kendo.toString(kendo.parseDate(orderDate), "MM/dd/yyyy") #', attributes: { class: "text-center" } },
                { field: "dueDate", title: "Due Date", width: '10%', template: '#= kendo.toString(kendo.parseDate(dueDate), "MM/dd/yyyy") #', attributes: { class: "text-center" } },
                { field: "poLineItemID", title: "Tracking", width: '10%', template: '<i class="fa fa-truck fa-flip-horizontal" style="font-size:30px;"></i>', attributes: { class: "text-center" } },
                { field: "alertType", title: "Type Alert", width: '10%', attributes: { class: "text-center" } },
                { field: "status", title: "Status", width: '10%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
                { field: "", title: "Menu", width: '10%', template: '<i class="fa fa-bars" style="font-size:24px;"></i>', attributes: { class: "text-center" } },
            ]
        }).on("click", "tbody td", async (e) => {
            $("#purchasePanel").css("display", "none");
            $("#actionPanel").css("display", "none");
            var cell = $(e.currentTarget);
            var grid = $("#purchaseOrder-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            itemType = "POLineItem";
            var qty = dataItem.qty;
            var des = dataItem.description;
            var ordDate = kendo.toString(kendo.parseDate(dataItem.orderDate), "MM/dd/yyyy");
            var dueDate = kendo.toString(kendo.parseDate(dataItem.dueDate), "MM/dd/yyyy");
            var vendor = dataItem.vendor;
            var itemID = dataItem.itemID;
            var pono = dataItem.poLineItemID;
            var pn = dataItem.poNo;
            var pm = 'None';
            var second = '';
            var first = '';
            var tracking = '';
            const projectResponse = await axios.get("api/project/GetAlertHistory?itemtype=" + itemType + "&itemno=" + pono);
            if (projectResponse.data.length === 0) {
                first = pm;
                second = pm;
            }
            else if (projectResponse.data.length === 1) {
                first = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ID:</div><div style='width:50%;'>" + projectResponse.data[0].itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Type:</div><div style='width:50%;'>" + projectResponse.data[0].type + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Description:</div><div style='width:50%;'>" + projectResponse.data[0].description + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Impact:</div><div style='width:50%'>" + projectResponse.data[0].impact + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Recommendation:</div><div style='width:50%'>" + projectResponse.data[0].recommendation + "</div></div>";
                second = pm;
            }
            else {
                projectResponse.data.forEach((item, key) => {
                    if (first === '') {
                        first = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Type:</div><div style='width:50%;'>" + item.type + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Description:</div><div style='width:50%;'>" + item.description + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Impact:</div><div style='width:50%'>" + item.impact + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Recommendation:</div><div style='width:50%'>" + item.recommendation + "</div></div>";
                    }
                    else {
                        second = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Type:</div><div style='width:50%;'>" + item.type + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Description:</div><div style='width:50%;'>" + item.description + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Impact:</div><div style='width:50%'>" + item.impact + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Recommendation:</div><div style='width:50%'>" + item.recommendation + "</div></div>";
                        second = second + "</hr>";
                    }
                });
            }
            const trackingResponse = await axios.get("api/project/GetTrackingData?POLineID=" + pono);
            if (trackingResponse.data.length === 0) {
                tracking = pm;
            }
            else {
                trackingResponse.data.forEach((item, key) => {
                    tracking = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Tracking Number:</div><div style='width:50%;'>" + item.trackingNo + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Item Type:</div><div style='width:50%;'>" + item.itemType + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ItemID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Ship Vendor:</div><div style='width:50%'>" + item.shipVendor + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Quantity:</div><div style='width:50%'>" + item.qty + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Status:</div><div style='width:50%'>" + item.status + "</div></div>";
                    tracking = tracking + "</hr>";
                });
            }
            var str = "<div style='width:100%;display:flex;'><div style='width:50%'>Project: " + this.data.project.title + "  Project ID: " + this.data.project.projectId + "</div><div style='width:50%;padding-left:10px;'>Client PO #: " + pn + " </div></div><div style='width:100%;display:flex;'><div style='width:50%;'><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Qty - Line item:</div><div style='width:50%'>" + qty + " - " + des + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Vendor:</div><div style='width:50%'>" + vendor + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Delivery (Weeks):</div><div style='width:50%'></div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Date Required:</div><div style='width:50%'>" + dueDate + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Order By:</div><div style='width:50%'></div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Date Ordered:</div><div style='width:50%'>" + ordDate + "</div></div></div><div style='width:50%;padding-left:10px;'><div style='max-width:100%;background-color:red;color:#fff;text-align:center;padding-top:5px;'>Alert</div>" + first + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'><div style='max-width:100%;background-color:#FFBF48;color:#fff;text-align:center;padding-top:5px;'>Shipping & Tracking</div>" + tracking + "</div><div style='width:50%;padding-left:10px;'><div style='max-width:100%;background-color:red;color:#fff;text-align:center;padding-top:5px;'>Alert History</div>" + second + "</div></div>";
            $("#detailTitle").text("Purchase order: " + itemID);
            $("#detailContent").html(str);
            if ($("#detailPanel").css("display") === "none") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
            const mss = document.querySelector("#sendMsg");
            mss.addEventListener("click", () => {
                $("#actionPanel").css("display", "block");
            });
            this.UploadDocButton = document.querySelector(".doc-buttonPanel");
            this.UploadDocButton.addEventListener("click", () => {
                this.docUpload.ShowForOther("Project", 0, this.data.project.projectId, "PRO1", this.UploadDocButton);
                //this.docUpload.Show(this.data.project.projectId, this.data.project.entCode, "Project", this.data.project.projectId);
            });
        });
        $("#greenpurchaseOrderFilter").click(function (e) {
            if (projectId !== 0) {
                purchaseOrdersDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetPOSumDetails?projid=" + projectId + "&status=green", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#purchaseOrder-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(purchaseOrdersDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#yellowpurchaseOrderFilter").click(function (e) {
            if (projectId !== 0) {
                purchaseOrdersDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetPOSumDetails?projid=" + projectId + "&status=yellow", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#purchaseOrder-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(purchaseOrdersDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#redpurchaseOrderFilter").click(function (e) {
            if (projectId !== 0) {
                purchaseOrdersDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetPOSumDetails?projid=" + projectId + "&status=red", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#purchaseOrder-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(purchaseOrdersDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#allpurchaseOrderFilter").click(function (e) {
            if (projectId !== 0) {
                purchaseOrdersDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetPOSumDetails?projid=" + projectId, dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#purchaseOrder-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(purchaseOrdersDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#searchpurchaseOrderFilter").change(function (e) {
            if (itemType && projectId !== 0) {
                purchaseOrdersDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetPOSumDetails?projid=" + projectId + "&search=" + $(this).val(), dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#purchaseOrder-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(purchaseOrdersDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#fieldReports-details-grid").kendoGrid({
            dataSource: fieldReportsDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "fr.fReportID", hidden: true },
                { field: "fr.reportDate", title: "Report Date", width: '5%', template: '#= kendo.toString(kendo.parseDate(fr.reportDate), "MM/dd/yyyy") #', attributes: { class: "text-center" } },
                { field: "fr.weather", title: "Weather", width: '10%', attributes: { class: "text-center" } },
                { field: "fr.temp", title: "Temp", width: '10%', attributes: { class: "text-center" } },
                { field: "fr.writer", title: "Writer", width: '15%', attributes: { class: "text-center" } },
                { field: "fr.description", title: "Description", width: '15%', attributes: { class: "text-center" } },
                { field: "images", hidden: true }
            ]
        }).on("click", "tbody td", async (e) => {
            $("#purchasePanel").css("display", "none");
            $("#actionPanel").css("display", "none");
            $("#listView").kendoListView({
                dataSource: this.data.messagingData.projectTeamEmails,
                template: kendo.template($("#myTemplate").html())
            });
            var cell = $(e.currentTarget);
            var grid = $("#fieldReports-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            var images_gird = dataItem.images;
            itemType = "Action";
            var itemID = dataItem.fr.fReportID;
            var images = '';
            var it = 0;
            var cl = '';
            for (let item of images_gird) {
                cl = it == 0 ? 'active' : '';
                let docUrl = await axios.get("api/document/GetFile?id=" + item.docID);
                images = images + '<div class="carousel-item ' + cl + '" ><img class="d-block w-100" style="width:100% !important;height:50%; display:block !important;" src = ' + docUrl.data + '></div>';
                it += 1;
            }
            /*  const trackingResponse = await axios.get("api/project/GetTrackingData?POLineID=" + message);
              if (trackingResponse.data.length === 0) {
                  tracking = pm;
              }
              else {
                  trackingResponse.data.forEach((item, key) => {
                      tracking = "<div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Tracking Number:</div><div style='width:50%;'>" + item.trackingNo + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Item Type:</div><div style='width:50%;'>" + item.itemType + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>ItemID:</div><div style='width:50%;'>" + item.itemID + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Ship Vendor:</div><div style='width:50%'>" + item.shipVendor + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Quantity:</div><div style='width:50%'>" + item.qty + "</div></div><div style='width:100%;display:flex;padding-top:5px;'><div style='width:50%'>Status:</div><div style='width:50%'>" + item.status + "</div></div>";
                      tracking = tracking + "</hr>";
                  });
              }*/
            var str = "<div style='width:100%'><div style='width:100%'>Project: " + this.data.project.title + "  Project ID: " + this.data.project.projectId + " </div></div>";
            str += "<div id='carouselExampleControls' class='carousel slide' data-ride='carousel'><div class='carousel-inner'>" + images + "</div><a class='carousel-control-prev' href ='#carouselExampleControls' role='button' data-slide='prev' ><span class='carousel-control-prev-icon' aria-hidden='true' ></span> <span class='sr-only' > Previous </span></a><a class='carousel-control-next' href = '#carouselExampleControls' role='button' data-slide='next' ><span class='carousel-control-next-icon' aria-hidden='true' > </span><span class='sr-only' > Next < /span></a></div>";
            $("#detailTitle").text("Field Reports: " + itemID);
            $("#detailContent").html(str);
            const mss = document.querySelector("#sendMsg");
            mss.addEventListener("click", () => {
                $("#actionPanel").css("display", "block");
            });
            this.UploadDocButton = document.querySelector(".doc-buttonPanel");
            this.UploadDocButton.addEventListener("click", () => {
                this.docUpload.ShowForOther("Project", 0, this.data.project.projectId, "PRO1", this.UploadDocButton);
                //  this.docUpload.Show(this.data.project.projectId, this.data.project.entCode, "Project", this.UploadDocButton);
            });
            if ($("#detailPanel").css("display") === "none") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
        });
        $("#greenfieldReportsFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFieldReportsDetails?projid=" + projectId + "&status=green", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#fieldReports-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#yellowfieldReportsFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFieldReportsDetails?projid=" + projectId + "&status=yellow", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#fieldReports-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#redfieldReportsFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFieldReportsDetails?projid=" + projectId + "&status=red", dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#fieldReports-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#allfieldReportsFilter").click(function (e) {
            if (projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFieldReportsDetails?projid=" + projectId, dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#fieldReports-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#searchfieldReportsFilter").change(function (e) {
            if (itemType && projectId !== 0) {
                actionDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFieldReportsDetails?projid=" + projectId + "&search=" + $(this).val(), dataType: "json" },
                    }
                });
                var budgetDetailsGrid = $("#fieldReports-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(actionDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
    }
    LoadFinancialGrid() {
        let itemType;
        var financialDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + this.data.project.projectId, dataType: "json" },
            },
            aggregate: [
                { field: "amount", aggregate: "sum" }
            ]
        });
        var financialSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetFinancialSummary?projid=" + this.data.project.projectId + "&entcode=" + this.data.project.entCode, dataType: "json" },
            }
        });
        let category;
        var budgetDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetBudgetDetailData?projid=" + this.data.project.projectId, dataType: "json" },
            },
            aggregate: [
                { field: "depositTot", aggregate: "sum" },
                { field: "budgetTot", aggregate: "sum" },
                { field: "availFunds", aggregate: "sum" }
            ]
        });
        if (this.data.project.projectId !== 0) {
            financialSource.read();
        }
        $("#financial-summary-grid").kendoGrid({
            dataSource: financialSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "item", title: "Item", width: '30%' },
                { field: "amount", title: "Amount", width: '30%', format: "{0:c}", attributes: { class: "text-center" } },
                { field: "usage", title: "Usage", width: '20%', attributes: { class: "text-center" }, template: '#=kendo.format("{0}\\%", usage)#' },
                { field: "status", title: "Status", width: '20%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
            ],
        }).on("click", "tbody td", async (e) => {
            $("#documentDetailsGrid").hide();
            $("#actionDetailsGrid").hide();
            $("#purchaseOrderDetailsGrid").hide();
            $("#document-summary-grid").data("kendoGrid").clearSelection();
            $("#scheduleDetailsGrid").hide();
            $("#schedule-summary-grid").data("kendoGrid").clearSelection();
            var grid = $("#financial-summary-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr"));
            itemType = dataItem.item;
            if (itemType === 'Budget') {
                $("#financialDetailsGrid").hide();
                $("#budgetDetailsGrid").show();
                $("#budgetDetailTitle").text('Details: Financial - Budget');
                budgetDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetBudgetDetailData?projid=" + this.data.project.projectId, dataType: "json" },
                    },
                    aggregate: [
                        { field: "depositTot", aggregate: "sum" },
                        { field: "budgetTot", aggregate: "sum" },
                        { field: "availFunds", aggregate: "sum" }
                    ]
                });
                var detailGrid = $("#budget-details-grid").data("kendoGrid");
                detailGrid.setDataSource(budgetDetailSource);
                detailGrid.dataSource.read();
            }
            else {
                $("#budgetDetailsGrid").hide();
                $("#financialDetailsGrid").show();
                $("#financialDetailTitle").text('Details: Financial - ' + itemType);
                financialDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + this.data.project.projectId, dataType: "json" },
                    },
                    aggregate: [
                        { field: "amount", aggregate: "sum" }
                    ]
                });
                var detailGrid = $("#financial-details-grid").data("kendoGrid");
                detailGrid.setDataSource(financialDetailSource);
                detailGrid.dataSource.read();
            }
            $("#detailPanel").hide();
        });
        $("#financial-details-grid").kendoGrid({
            dataSource: financialDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "order", hidden: true },
                { field: "code", title: "Code", width: '10%', attributes: { class: "text-center" }, },
                { field: "poco", title: "PO/CO", width: '10%', attributes: { class: "text-center" } },
                { field: "pocoId", title: "PO/CO #", width: '10%', attributes: { class: "text-center" } },
                { field: "item", title: "Item", width: '20%', attributes: { class: "text-center" }, footerTemplate: "Total", footerAttributes: { "class": "text-center" } },
                { field: "amount", title: "Amount", width: '20%', format: "{0:c}", attributes: { class: "text-center" }, footerTemplate: "#= kendo.toString(sum, 'c') #", footerAttributes: { "class": "text-center" } },
                { field: "vendor", title: "Vendor", width: '10%', attributes: { class: "text-center" } },
                { field: "status", title: "Status", width: '10%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
            ]
        }).on("click", "tbody td", async (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#financial-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            itemType = dataItem.itemType;
            var itemNumber = dataItem.itemNo;
            $("#detailTitle").text(itemType + ": " + itemNumber);
            if ($("#detailPanel").css("display") === "none") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
        });
        $("#greenFinancialFilter").click(function (e) {
            if (projectId !== 0) {
                financialDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + projectId + "&status=green", dataType: "json" },
                    },
                    aggregate: [
                        { field: "amount", aggregate: "sum" }
                    ]
                });
                var financialDetailsGrid = $("#financial-details-grid").data("kendoGrid");
                financialDetailsGrid.setDataSource(financialDetailSource);
                financialDetailsGrid.dataSource.read();
            }
        });
        $("#yellowFinancialFilter").click(function (e) {
            if (projectId !== 0) {
                financialDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + projectId + "&status=yellow", dataType: "json" },
                    }
                });
                var financialDetailsGrid = $("#financial-details-grid").data("kendoGrid");
                financialDetailsGrid.setDataSource(financialDetailSource);
                financialDetailsGrid.dataSource.read();
            }
        });
        $("#redFinancialFilter").click(function (e) {
            if (projectId !== 0) {
                financialDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + projectId + "&status=red", dataType: "json" },
                    }
                });
                var financialDetailsGrid = $("#financial-details-grid").data("kendoGrid");
                financialDetailsGrid.setDataSource(financialDetailSource);
                financialDetailsGrid.dataSource.read();
            }
        });
        $("#allFinancialFilter").click(function (e) {
            if (projectId !== 0) {
                financialDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + projectId, dataType: "json" },
                    }
                });
                var financialDetailsGrid = $("#financial-details-grid").data("kendoGrid");
                financialDetailsGrid.setDataSource(financialDetailSource);
                financialDetailsGrid.dataSource.read();
            }
        });
        $("#searchFinancialFilter").change(function (e) {
            if (itemType && projectId !== 0) {
                financialDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + projectId + "&search=" + $(this).val(), dataType: "json" },
                    }
                });
                var financialDetailsGrid = $("#financial-details-grid").data("kendoGrid");
                financialDetailsGrid.setDataSource(financialDetailSource);
                financialDetailsGrid.dataSource.read();
            }
        });
        $("#budget-details-grid").kendoGrid({
            dataSource: budgetDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "budgetDetailID", hidden: true },
                { field: "projectID", hidden: true },
                { field: "code", title: "Code", width: '10%', attributes: { class: "text-center" }, },
                { field: "category", title: "Category", width: '15%', attributes: { class: "text-center" } },
                { field: "description", title: "Description", width: '20%', attributes: { class: "text-center" }, footerTemplate: "Total", footerAttributes: { "class": "text-center" } },
                { field: "depositTot", title: "Deposit Total", width: '15%', format: "{0:c}", attributes: { class: "text-center" }, footerTemplate: "#= kendo.toString(sum, 'c') #", footerAttributes: { "class": "text-center" } },
                { field: "budgetTot", title: "Budget Total", width: '15%', format: "{0:c}", attributes: { class: "text-center" }, footerTemplate: "#= kendo.toString(sum, 'c') #", footerAttributes: { "class": "text-center" } },
                { field: "availFunds", title: "Available Funds", width: '15%', format: "{0:c}", attributes: { class: "text-center" }, footerTemplate: "#= kendo.toString(sum, 'c') #", footerAttributes: { "class": "text-center" } },
                { field: "status", title: "Status", width: '10%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
            ]
        }).on("click", "tbody td", async (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#budget-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            category = dataItem.category;
            $("#detailTitle").text(category);
            if ($("#detailPanel").css("display") === "none") {
                $("#detailPanel").animate({ width: 'toggle' }, 300);
            }
        });
        let projectId = this.data.project.projectId;
        $("#greenBudgetFilter").click(function (e) {
            if (projectId !== 0) {
                budgetDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetBudgetDetailData?projid=" + projectId + "&status=green", dataType: "json" },
                    },
                    aggregate: [
                        { field: "depositTot", aggregate: "sum" },
                        { field: "budgetTot", aggregate: "sum" },
                        { field: "availFunds", aggregate: "sum" }
                    ]
                });
                var budgetDetailsGrid = $("#budget-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(budgetDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#yellowBudgetFilter").click(function (e) {
            if (projectId !== 0) {
                budgetDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetBudgetDetailData?projid=" + projectId + "&status=yellow", dataType: "json" },
                    },
                    aggregate: [
                        { field: "depositTot", aggregate: "sum" },
                        { field: "budgetTot", aggregate: "sum" },
                        { field: "availFunds", aggregate: "sum" }
                    ]
                });
                var budgetDetailsGrid = $("#budget-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(budgetDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#redBudgetFilter").click(function (e) {
            if (projectId !== 0) {
                budgetDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetBudgetDetailData?projid=" + projectId + "&status=red", dataType: "json" },
                    },
                    aggregate: [
                        { field: "depositTot", aggregate: "sum" },
                        { field: "budgetTot", aggregate: "sum" },
                        { field: "availFunds", aggregate: "sum" }
                    ]
                });
                var budgetDetailsGrid = $("#budget-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(budgetDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#allBudgetFilter").click(function (e) {
            if (projectId !== 0) {
                budgetDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetBudgetDetailData?projid=" + projectId, dataType: "json" },
                    },
                    aggregate: [
                        { field: "depositTot", aggregate: "sum" },
                        { field: "budgetTot", aggregate: "sum" },
                        { field: "availFunds", aggregate: "sum" }
                    ]
                });
                var budgetDetailsGrid = $("#budget-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(budgetDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
        $("#searchBudgetFilter").change(function (e) {
            if (itemType && projectId !== 0) {
                budgetDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetBudgetDetailData?projid=" + projectId + "&search=" + $(this).val(), dataType: "json" },
                    },
                    aggregate: [
                        { field: "depositTot", aggregate: "sum" },
                        { field: "budgetTot", aggregate: "sum" },
                        { field: "availFunds", aggregate: "sum" }
                    ]
                });
                var budgetDetailsGrid = $("#budget-details-grid").data("kendoGrid");
                budgetDetailsGrid.setDataSource(budgetDetailSource);
                budgetDetailsGrid.dataSource.read();
            }
        });
    }
    LoadScheduleGrid() {
        let milestone;
        let taskID;
        var scheduleDetailSource = new kendo.data.DataSource();
        var scheduleSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetScheduleSummary?projid=" + this.data.project.projectId + "&entcode=" + this.data.project.entCode, dataType: "json" },
            }
        });
        if (this.data.project.projectId !== 0) {
            scheduleSource.read();
        }
        $("#schedule-summary-grid").kendoGrid({
            dataSource: scheduleSource,
            sortable: true,
            autoBind: false,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "taskID", title: "Task ID", hidden: true },
                { field: "milestone", title: "Milestone", width: '19%' },
                { field: "start", title: "Start", width: '18%', template: '#= kendo.toString(kendo.parseDate(start), "M/d/yyyy") #', attributes: { class: "text-center" } },
                { field: "end", title: "End", width: '18%', template: '#= kendo.toString(kendo.parseDate(end), "M/d/yyyy") #', attributes: { class: "text-center" } },
                { field: "target", title: "Target", width: '15%', template: '#=kendo.format("{0}\\%", target)#', attributes: { class: "text-center" } },
                { field: "actual", title: "Actual", width: '15%', template: '#=kendo.format("{0}\\%", actual)#', attributes: { class: "text-center" } },
                { field: "status", title: "Status", width: '15%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
            ]
        }).on("click", "tbody td", async (e) => {
            $("#scheduleDetailsGrid").show();
            $("#documentDetailsGrid").hide();
            $("#actionDetailsGrid").hide();
            $("#purchaseOrderDetailsGrid").hide();
            $("#document-summary-grid").data("kendoGrid").clearSelection();
            $("#financialDetailsGrid").hide();
            $("#financial-summary-grid").data("kendoGrid").clearSelection();
            $("#budgetDetailsGrid").hide();
            $("#budget-details-grid").data("kendoGrid").clearSelection();
            var grid = $("#schedule-summary-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr"));
            milestone = dataItem.milestone;
            taskID = dataItem.taskID;
            $("#scheduleDetailTitle").text('Details: Schedule - ' + milestone);
            scheduleDetailSource = new kendo.data.DataSource({
                transport: {
                    read: { url: "/api/Project/GetScheduleDetails?taskid=" + taskID, dataType: "json" },
                }
            });
            var detailGrid = $("#schedule-details-grid").data("kendoGrid");
            detailGrid.setDataSource(scheduleDetailSource);
            detailGrid.dataSource.read();
            $("#detailPanel").hide();
        });
        $("#schedule-details-grid").kendoGrid({
            dataSource: scheduleDetailSource,
            autoBind: false,
            sortable: true,
            scrollable: false,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "taskID", hidden: true },
                { field: "order", hidden: true },
                { field: "task", title: "Task", width: '20%', attributes: { class: "text-center" } },
                { field: "start", title: "Start", width: '20%', template: '#= kendo.toString(kendo.parseDate(start), "M/d/yyyy") #', attributes: { class: "text-center" } },
                { field: "end", title: "End", width: '20%', template: '#= kendo.toString(kendo.parseDate(end), "M/d/yyyy") #', attributes: { class: "text-center" } },
                { field: "status", title: "Status", width: '10%', attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=status#" + "'></span>" },
            ]
        }).on("click", "tbody td", async (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#schedule-details-grid").data("kendoGrid");
            var dataItem = grid.dataItem(cell.closest("tr"));
            var task = dataItem.task;
            $("#detailTitle").text(task);
        });
        let projectId = this.data.project.projectId;
        $("#greenScheduleFilter").click(function (e) {
            if (projectId !== 0) {
                scheduleDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetScheduleDetails?taskid=" + taskID + "&status=green", dataType: "json" },
                    }
                });
                var scheduleDetailsGrid = $("#schedule-details-grid").data("kendoGrid");
                scheduleDetailsGrid.setDataSource(scheduleDetailSource);
                scheduleDetailsGrid.dataSource.read();
            }
        });
        $("#yellowScheduleFilter").click(function (e) {
            if (projectId !== 0) {
                scheduleDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetScheduleDetails?taskid=" + taskID + "&status=yellow", dataType: "json" },
                    }
                });
                var scheduleDetailsGrid = $("#schedule-details-grid").data("kendoGrid");
                scheduleDetailsGrid.setDataSource(scheduleDetailSource);
                scheduleDetailsGrid.dataSource.read();
            }
        });
        $("#redScheduleFilter").click(function (e) {
            if (projectId !== 0) {
                scheduleDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetScheduleDetails?taskid=" + taskID + "&status=red", dataType: "json" },
                    }
                });
                var scheduleDetailsGrid = $("#schedule-details-grid").data("kendoGrid");
                scheduleDetailsGrid.setDataSource(scheduleDetailSource);
                scheduleDetailsGrid.dataSource.read();
            }
        });
        $("#allScheduleFilter").click(function () {
            if (projectId !== 0) {
                scheduleDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetScheduleDetails?taskid=" + taskID, dataType: "json" },
                    }
                });
                var scheduleDetailsGrid = $("#schedule-details-grid").data("kendoGrid");
                scheduleDetailsGrid.setDataSource(scheduleDetailSource);
                scheduleDetailsGrid.dataSource.read();
            }
        });
        $("#searchScheduleFilter").change(function () {
            if (milestone && taskID && projectId !== 0) {
                scheduleDetailSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "/api/Project/GetScheduleDetails?taskid=" + taskID + "&search=" + $(this).val(), dataType: "json" },
                    }
                });
                var scheduleDetailsGrid = $("#schedule-details-grid").data("kendoGrid");
                scheduleDetailsGrid.setDataSource(scheduleDetailSource);
                scheduleDetailsGrid.dataSource.read();
            }
        });
    }
    LoadBudgetBar() {
        let budgetBar = new ProjectBudgetBar('.project-budget-bar');
        let finBarData = {
            budgetTot: 2234456.2,
            depositTot: 1942020,
            invoicePaidTot: 760263.29,
            invoiceTot: 980761.24,
            poCommittedTot: 1120450,
            poPendingTot: 340581,
        };
        budgetBar.Load(finBarData);
    }
    LoadScheduleChart() {
        let categories = [];
        let target = [];
        let actual = [];
        let scheduleData = [];
        if (this.data.project.projectId !== 0) {
            var scheduleTable = $("#schedule-summary-grid").data("kendoGrid").dataSource;
            scheduleData = scheduleTable.data();
            scheduleData.forEach(s => {
                categories.push(s.milestone);
                target.push(s.target);
                actual.push(s.actual);
            });
            var series = [{
                    name: "Target",
                    data: target,
                    color: "#2771F7",
                    markers: { type: "square" }
                }, {
                    name: "Actual",
                    data: actual,
                    color: "#ff6500",
                    markers: { type: "square" }
                }];
            $("#milestone-chart").kendoChart({
                chartArea: {
                    width: 400,
                    height: 300
                },
                title: {
                    text: "'Target', 'Actual' by Milestone"
                },
                legend: {
                    position: "bottom"
                },
                seriesDefaults: {
                    type: "bar",
                    stack: true
                },
                series: series,
                valueAxis: {
                    labels: {
                        format: "{0}%"
                    },
                    line: {
                        visible: false
                    },
                },
                categoryAxis: {
                    categories: categories,
                    majorGridLines: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    format: "{0}%"
                }
            });
        }
    }
    async LoadPreviewPanel(grid, selectedItem) {
        document.querySelector(".project-preview").innerHTML = "";
        let panel = $(".project-preview");
        kendo.ui.progress(panel, true);
        let lookup = {};
        lookup.ItemType = grid.replace("-grid", "");
        lookup.ItemID = selectedItem.id;
        lookup.ProjectItems = this.data.projectItems;
        console.log("LoadPreviewPanel PR", lookup);
        //const projectResponse = await axios.get("api/project/getProjectItemDetails?itemType=" + grid.replace("-grid", "") + "&id=" + selectedItem.id, this.data.projectItems);
        const projectResponse = await axios.post("api/project/getProjectItemDetails", lookup);
        this.PopulatePreviewPanel(projectResponse.data, grid, panel);
    }
    PopulatePreviewPanel(project, grid, panel) {
        let title = grid.replace("-grid", "");
        title = title.charAt(0).toUpperCase() + title.slice(1);
        let previewPanel = document.querySelector(".project-preview");
        let titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.innerText = title + " Preview";
        let itemsDiv = document.createElement("div");
        itemsDiv.className = "items";
        for (let item of project) {
            let rowDiv = document.createElement("div");
            if (item.displayType === "Spacer") {
                rowDiv.className = "spacer";
            }
            else if (item.displayType === "TextArea") {
                rowDiv.className = "row";
                let propDiv = document.createElement("div");
                propDiv.className = "property";
                propDiv.innerText = item.property;
                let valDiv = document.createElement("div");
                valDiv.className = "value";
                valDiv.style.backgroundColor = 'white';
                valDiv.style.color = 'black';
                valDiv.innerText = item.value;
                rowDiv.appendChild(propDiv);
                rowDiv.appendChild(valDiv);
            }
            else {
                rowDiv.className = "row";
                let propDiv = document.createElement("div");
                propDiv.className = "property";
                propDiv.innerText = item.property;
                let valDiv = document.createElement("div");
                valDiv.className = "value";
                valDiv.innerText = item.value;
                rowDiv.appendChild(propDiv);
                rowDiv.appendChild(valDiv);
            }
            itemsDiv.appendChild(rowDiv);
        }
        previewPanel.appendChild(titleDiv);
        previewPanel.appendChild(itemsDiv);
        kendo.ui.progress(panel, false);
    }
    ClearAllOtherGridSelections(id) {
        let grids = [
            "estimate-grid",
            "budget-grid",
            "deposit-grid",
            "contract-grid",
            "proposal-grid",
            "co-grid",
            "invoice-grid",
            "subs-grid",
            "pos-grid"
        ];
        var filtered = grids.filter(function (value, index, arr) {
            return value != id;
        });
        for (let g of filtered) {
            let grid = $("#" + g + "").data("kendoGrid");
            grid.clearSelection();
        }
    }
    async getDocUrl(docId) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        window.open(docUrl.data);
        document.body.classList.toggle("wait");
    }
    async getDocByUrl(docId) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        return docUrl.data;
    }
}
