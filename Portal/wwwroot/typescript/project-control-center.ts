import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { Accordion } from "./components/accordian.js";
import { Tabs } from "./components/tabs.js";
import { Utilities } from "./utilities.js";
import { SlidingPanel } from "./components/sliding-panel.js";
import { AlertsCustomPanel } from "./components/alerts-custom-panel.js";
import { ProjectBudgetBar } from "./components/project-budget-bar.js";
import { ProjectScheduleBar } from "./components/project-schedule-bar.js";
import { google } from "google-maps";

declare var MarkerClusterer: any;
let message = {};
var markers = [];
var markerCluster;
var heatMapData = [];
var locations = [];

var getprojectIDEmail = "";

export class ProjectControlCenter {

    private LastSelectedTab: string;
    private AlertsPanel: AlertsCustomPanel;
    private QuickChartsSlider: SlidingPanel;
    private BudgetBar: ProjectBudgetBar;
    private ScheduleBar: ProjectScheduleBar;

    public getprojectID: string;

    constructor() {
        this.init();
    }

    private init(): void {

        const accordion = new Accordion(".accordian-title");
        accordion.showOne();

        const tableTabs = document.querySelector(".container--tabs")
        const tab1 = new Tabs(tableTabs);
        tab1.onTabSelected(event => {
            $("#" + event.SelectedTab + "-grid").data('kendoGrid').refresh();

            if (event.SelectedTab !== 'portfolio' && this.LastSelectedTab === 'portfolio') {
                this.LoadHealthChartData("");
            }

            if (event.SelectedTab !== 'alerts') {
                document.querySelector(".alerts-panel-container").classList.remove("visible");
            }

            this.LastSelectedTab = event.SelectedTab;
        });

        this.setupGrids();
        this.setupCharts();
        this.showmap();
        this.LoadHealthChartData("");

        this.QuickChartsSlider = new SlidingPanel("#quick-charts");
        this.AlertsPanel = new AlertsCustomPanel("#alerts-detail-panel");

        this.resizeGrids();

        this.BudgetBar = new ProjectBudgetBar('.pbb-container > .project-budget-bar');
        this.ScheduleBar = new ProjectScheduleBar('.psb-container > .project-schedule-bar');


        let resizeTimer;
        $(window).on('resize', (e) => {

            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.resizeGrids();
            }, 250);

        });

        //************************** API Testing **************************************************
        this.TestNewAPIs();
        //*****************************************************************************************

    }

    private async TestNewAPIs() {
        let dep = {} as any;
        dep.ApprovDate = "2019-11-11";
        dep.EnteredDate = "2018-11-01";
        dep.ItemID = 0;
        dep.ItemType = "QUOTE";
        dep.Order = 1;
        dep.POGroupID = 0;
        dep.PoID = 1078;
        dep.Status = "PENDING";
        dep.Type = "INIT";



        // const poInsert = await axios.post("api/PO/InsertPO", dep);
        //let dep = {} as any;
        //dep.depositID = 0;
        //dep.projectID = 3211;
        //dep.budgetID = 1001;
        //dep.depositDate = "7/17/2019";
        //dep.description = "Orig Project Budget";
        //dep.depositType = "Budget";
        //dep.useType = "Estimate Error";
        //dep.fundingType = "Capitol";
        //dep.fundingSource = "TBD";
        //dep.status = "Published";
        //dep.addendum = 1;
        //dep.reason = "TBD";
        //dep.entCode = "PRO1";
        //dep.total = 36800;

        // const temp = await axios.post("api/budget/CreateDefaultBudget?projectid=1000&entcode=PRO1&gsf=1801");
        // const temp = await axios.post("api/project/DefaultBudgets?entcode=PRO1");
        // const temp = await axios.get("api/Gantt/UpdateAllSchedPMs"); //InsertDefaultSched?projid=3208&start=11-15-2019");
        //const temp = await axios.get("api/Invoice/GetInvoicebyID?id=1002");
        //const temp = await axios.get("api/Message/getMessageNotifyCountbyUser?email=ledwards@prosysusa.com");
        // const temp = await axios.get("api/Project/GetProjectSummaryDummyData");
        // const temp = await axios.post("api/Project/DefaultSchedule?type=Security&projid=3218&start=9-01-2020");
        //const temp = await axios.post("api/budget/CreateDefaultBudget?projectid=3237&entcode=PRO1&gsf=2500");
        //const temp = await axios.get("api/Locations/GeoLocationAll");
        // const temp = await axios.get("api/PCC/GetActiveMapLocations?ent=PRO1");
    }

    private resizeGrids(): void {
        let alertGrid = $("#alerts-grid").data("kendoGrid");

        let width = $(window).width();

        if (width <= 1599) {
            alertGrid.hideColumn("resp");
            alertGrid.hideColumn("score");
            alertGrid.refresh();

        } else {
            alertGrid.showColumn("resp");
            alertGrid.showColumn("score");
            alertGrid.refresh();
        }

    }

    private setupCharts(): void {
        const chartHeight = 160;
        const chartWidth = 200;

        


        $("#projectHealthChart").kendoChart({
            legend: {
                visible: false
            },
            title: {
                position: "top",
                text: "Projects By Health"
            }, 
            theme: "sass",
            chartArea: {
                height: chartHeight,
                width: chartWidth,
                margin: { top: 0, bottom: 0, left: 0, right: 0 }
            },
            categoryAxis: {
                visible: false
            },
            seriesDefaults: {  
                type: "donut",
                overlay: { "gradient": "none" },
                padding: 0,
                holeSize: 40
            },
            seriesColors: ["#FFBF48", "#CF5F67", "#3392A7", "#8633A7", "#87D674"],
            series: [{
                name: "Status",
                field: "value",
                categoryField: "category"
            }],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #%"
            }
        });


        $("#projectStatusChart").kendoChart({
            legend: {
                visible: false
            },
            title: {
                position: "top",
                text: "Projects By Status"
            }, 
            theme: "sass",
            chartArea: {
                height: chartHeight,
                width: chartWidth,
                margin: { top: 0, bottom: 0, left: 0, right: 0 }
            },
            categoryAxis: {
                visible: false
            },
            seriesDefaults: {
                type: "donut",
                overlay: { "gradient": "none" },
                padding: 0,
                holeSize: 40
            },
            dataSource: {
                transport: {
                    read: {
                        url: "api/pcc/getProjectByStatusChartData",
                        dataType: "json",
                        data: { projects: null }
                    }
                }
            },
            series: [{
                name: "Status",
                field: "value",
                categoryField: "category"
            }],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #%"
            }
        });


        $("#projectPhaseChart").kendoChart({
            legend: {
                visible: false
            },
            title: {
                position: "top",
                text: "Projects By Phase"
            }, 
            theme: "sass",
            chartArea: {
                height: chartHeight,
                width: chartWidth,
                margin: { top: 0, bottom: 0, left: 0, right: 0 }
            },
            categoryAxis: {
                visible: false
            },
            seriesDefaults: {
                type: "donut",
                overlay: { "gradient": "none" },
                padding: 0,
                holeSize: 40
            },
            dataSource: {
                transport: {
                    read: {
                        url: "api/pcc/getProjectbyPhaseChartData",
                        dataType: "json",
                        data: { projects: null }
                    }
                }
            },
            series: [{
                name: "Phase",
                field: "value",
                categoryField: "category"
            }],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #%"
            }
        });



        $("#projectUnassignChart").kendoChart({
            legend: {
                visible: false
            },
            theme: "sass",
            title: {
                position: "top",
                text: "Projects By Unassigned"
            }, 
            chartArea: {
                height: chartHeight,
                width: chartWidth,
                margin: { top: 0, bottom: 0, left: 0, right: 0 }
            },
            categoryAxis: {
                visible: false
            },
            seriesDefaults: {
                type: "donut",
                overlay: { "gradient": "none" },
                padding: 0,
                holeSize: 40
            },
            dataSource: {
                transport: {
                    read: {
                        url: "api/pcc/getProjectByStatusChartData",
                        dataType: "json",
                        data: { projects: null }
                    }
                }
            },
            series: [{
                name: "Status",
                field: "value",
                categoryField: "category"
            }],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #%"
            }
        });

        $("#projectProjectOnTimeChart").kendoChart({
            legend: {
                visible: false
            },
            theme: "sass",
            title: {
                position: "top",
                text: "Projects On Time"
            }, 
            chartArea: {
                height: chartHeight,
                width: chartWidth,
                margin: { top: 0, bottom: 0, left: 0, right: 0 }
            },
            categoryAxis: {
                visible: false
            },
            seriesDefaults: {
                type: "donut",
                overlay: { "gradient": "none" },
                padding: 0,
                holeSize: 40
            },
            dataSource: {
                transport: {
                    read: {
                        url: "api/pcc/getProjectByStatusChartData",
                        dataType: "json",
                        data: { projects: null }
                    }
                }
            },
            series: [{
                name: "Status",
                field: "value",
                categoryField: "category"
            }],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #%"
            }
        });

        
        var tmp = new Date();
        $('#datetimepicker').kendoDatePicker(
            {
                value: tmp,
                max: kendo.date.addDays(tmp, 90),
                min: tmp,
                format: 'MM/dd/yyyy'
            });

    }

    public setupGrids(): void {
        const tableHeight = 280;

        $("#alerts-grid").kendoGrid({
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
                transport: {
                    read: {
                        url: "api/pcc/getAlertsData",
                        type: "POST",
                        dataType: "json"
                    }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        id: "projectId",
                        fields: {
                            score: { type: "number" },
                            date: { type: "date" }
                        }
                    }
                }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            //change: this.AlertsGridSelectionChanged,
            columns: [
                {
                    title: "Project",
                    columns: [
                        { field: "title", title: "Title" },
                        { field: "resp", title: "Resp" }
                    ]
                },
                {
                    title: "Status",
                    columns: [
                        {
                            field: "health", title: "Health", width: 65, filterable: false, attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#= health #" + "'></span>"
                        },
                        { field: "category", title: "Phase" }
                    ]
                },
                {
                    title: "Alerts",
                    columns: [
                        { field: "alertBudget", title: "Budget", width: 95, filterable: false },
                        { field: "alertBuyout", title: "Buyout", width: 95, filterable: false },
                        { field: "alertMilestone", title: "Milestone", width: 95, filterable: false },
                        { field: "alertDocuments", title: "Documents", width: 95, filterable: false },
                        { field: "score", title: "Score", width: 60, filterable: false }
                    ]
                }
            ]
        }).on("click", "tbody td", (e) => {
            var cell = $(e.currentTarget);
            var cellIndex = cell[0].cellIndex;
            var grid = $("#alerts-grid").data("kendoGrid");
            var dataItem;
            if (cellIndex >= 4 && cellIndex <= 7) {
                var column = grid.columns[2].columns[cellIndex - 4];
                dataItem = grid.dataItem(cell.closest("tr")) as any;
                this.LoadAlertsPanel(dataItem.id as number, column.title);
            }
            else {
                dataItem = grid.dataItem(cell.closest("tr")) as any;
                this.LoadAlertsPanel(dataItem.id as number);
            }

        });
        Utilities.MoveKendoToolbar("#alerts-grid");


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
                transport: {
                    read: {
                        url: "api/pcc/getPortfolioData",
                        type: "POST",
                        dataType: "json"
                    }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        id: "projectId"
                    }
                }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: "multiple",
            filterable: true,
            persistSelection: true,
            change: this.PortfolioGridSelectionChanged,
            columns: [
                { selectable: true, width: 40 },
                { field: "title", title: "Title", width: '20%' },
                { field: "description", title: "Description" },
                { field: "phase", title: "Phase", width: '20%' },
                { field: "status", title: "Status", width: '20%' }
            ]
        });

        Utilities.MoveKendoToolbar("#activemap-grid");
        $("#activemap-grid").kendoGrid({
            selectable: "row",
            height:380,
            dataSource: {
                transport: {
                    read: { url: "api/pcc/GetActiveMapLocations", type: "GET", dataType: "json" }
                },
                schema: { data: "", total: "total", model: { fields: { id: "projectID" } } }
            },
            columns: [
                { field: "title", title: "Project", width: '20px' },
                { field: "", title: "Location", width: '20px', template: "#= addCity + '  ' + addState #"}, 
                { field: "statuscode", title: "Status", width: "10px", attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=statuscode#" + "'></span>" },
                { field: "pm", title: "PM", width: '20px' }
            ]
        }).on("click", "tbody td", (e) => {  

            $("#chartsection").css("display", "none");
            $(".project-items-container").css("display", "block");
            var grid = $("#activemap-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr")) as any;
            var projectID = dataItem.id as string;
            var protitle = dataItem.title as string;  
           
            $("#TitleSummary").text("  Project Summery: " + protitle); 
            this.getprojectID = projectID;  //----- Set value for globel variable-------------------- 
            getprojectIDEmail = projectID;  //----- Set value for globel variable for email--------------------

             this.LoadDocumentGrid(projectID);
             this.LoadFinancialGrid(projectID);
            this.LoadScheduleGrid(projectID); 
            
            var row = $(e.currentTarget).closest("tr");
            var rowIdx = $("tr", grid.tbody).index(row);


       

            $("#toMsg").kendoComboBox({
                index: 1,
                dataTextField: "firstName",
                dataValueField: "emailAddress",
                template: "<table><tr><td width='0px'>${ firstName}</td><td>${ lastName }</td></tr></table>",
                filter: "contains",
                dataSource: {
                    transport: {
                        read: { url: "api/project/getProjectTeam?projid=" + this.getprojectID, dataType: "json", type: "GET" },
                    }
                }
            }); 


            $("#ddlMultiCC").kendoComboBox({
                dataTextField: "firstName",
                dataValueField: "emailAddress",
                filter: "contains",
                template: "<input type='checkbox' style='margin-top: 4px;margin- right: 12px;'  class='clsSkillInner' value='#=emailAddress #' name='skill' />" + " " + "${ firstName }${ lastName}",
                dataSource: {
                    transport: {
                        read: { url: "api/project/getProjectTeam?projid=" + this.getprojectID, dataType: "json", type: "GET" },
                    }
                }
            });
            
            

            google.maps.event.trigger(markers[rowIdx], 'click');  
             
        });
         


        Utilities.MoveKendoToolbar("#portfolio-grid");

        $("#recentactivity-grid").kendoGrid({
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
                transport: {
                    read: {
                        url: "api/pcc/getRecentActivityData",
                        type: "POST",
                        dataType: "json"
                    }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        fields: {
                            score: { type: "number" },
                            date: { type: "date" },
                        }
                    }
                }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            columns: [
                { field: "date", title: "Date", width: 100, format: "{0: MM/dd/yyyy}" },
                { field: "user", title: "User", width: '20%' },
                { field: "change", title: "Change" },
            ]
        });
        Utilities.MoveKendoToolbar("#recentactivity-grid");


        $("#recentnotes-grid").kendoGrid({
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
                transport: {
                    read: {
                        url: "api/note/getNotesAllRecent",
                        dataType: "json",
                        data: { "entCode": "PRO1" }
                    }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        fields: {
                            created: { type: "date" },
                        }
                    }
                }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            columns: [
                { field: "created", title: "Date", width: 100, format: "{0: MM/dd/yyyy}" },
                { field: "writer", title: "User", width: '20%' },
                { field: "progressNote", title: "Note" },
            ]
        });
        Utilities.MoveKendoToolbar("#recentnotes-grid");


        

        $("#closesummery").click(function (e) {  
            $("#allActiveMapFilter").click();
            $("#chartsection").css("display", "block");
            $(".project-items-container").css("display", "none");
        });


        $("#checklayer").change(function () {
            if ($(this).prop('checked')) { 
                $("#dvlayer").css("display", "block");
            } else {
                $("#dvlayer").css("display", "none");
                $("#allActiveMapFilter").click();
            }
        }); 
        

        $("#closepop").click(function () {
            var dialog = $("#dialog").data("kendoDialog");
            dialog.close(); 
        });
        $("#sendMsg").click(function () { 
            $("#dialog").css("display", "block"); 

            var dialog = $('#dialog'); 
            dialog.kendoDialog({
                width: "600px"
            });  

            var dialogpn = $("#dialog").data("kendoDialog");
            dialogpn.open(); 
        });  
       

        $('#selmessage').on('change', function () { 
            if ($(this).val() == "Action") {
                $(".dvGetAction").removeClass("disabledbutton");
                $(".dvGetAction").addClass("enablebutton");
            }
            else { 
                $(".dvGetAction").removeClass("enablebutton");
                $(".dvGetAction").addClass("disabledbutton");
            }
        });

       
        $("#sendemail").on("click", function () {  

            $(this).css("font-size", "15px");
            $(this).html("Please Wait...."); 
                
            var datepicker = $("#datetimepicker").data("kendoDatePicker");  

            var url = "../api/message/insertmessage"; 
            var type = $("#newmessage").val();
            var item = "Project";
            var itemType = "RFI";
            var message = { ProjectID: getprojectIDEmail, EmailFrom: "", EmailTo: $("#toMsg").data('kendoComboBox').value(), EmailBody: $("#newmessage").val(), Type: type, ItemType: itemType, ItemNo: getprojectIDEmail, DateRec: datepicker.value(), DueDate: datepicker.value()};
            console.log(message);
             
            $.ajax({
                url: url,
                data: JSON.stringify(message),
                type: "POST",
                contentType: "application/json; charset=utf-8",
            }).done(function () {
                window.location.reload();
            });

            return false;
        });



        $(".filter").click(function (e) {

            markers = [];
            heatMapData = [];

            $("#activemap-grid").data("kendoGrid").clearSelection();
            var search = "";
            locations = [];
            var contentString = ""; 
            
            if ($(this).attr("name") == "") {
                search = "api/pcc/GetActiveMapLocations";
            }
            else {
                search = "api/pcc/GetActiveMapLocations?status=" + $(this).attr("name");
            }

            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: { url: search, type: "GET", dataType: "json" }
                }
            });
            dataSource.fetch(function () {

                for (var i = 0; i < dataSource.view().length; i++) {
                    contentString = '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h3 id="firstHeading" class="firstHeading">' + dataSource.view()[i]['title'] + '</h3>' +
                        '<div id="bodyContent">' +
                        '<h3 class="firstHeading">Office</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['address1'] + '  ' + dataSource.view()[i]['addCity'] + '</p>' +
                        '<h3>Phase</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['phase'] + '</p>' +
                        '<h3>Status</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['status'] + '</p>' +
                        '<h3>Project Manger:</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['pm'] + '</p>' +
                        '<h3>Description:</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['description'] + '</p>' +
                        '</div>' +
                        '</div>';

                    locations.push([dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude'], dataSource.view()[i]['title'], dataSource.view()[i]['address1'], dataSource.view()[i]['phase'], dataSource.view()[i]['status'], dataSource.view()[i]['pm'], contentString]);
                    heatMapData.push(new google.maps.LatLng(dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude']));
                }

                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 5,
                    center: new google.maps.LatLng(locations[0][0], locations[0][1]),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });


            //    var heatmap = new google.maps.visualization.HeatmapLayer({
                 //  data: heatMapData
              //  });
              //  heatmap.set('radius', 100);
               // heatmap.setMap(map);

                var infowindow = new google.maps.InfoWindow();

                for (i = 0; i < locations.length; i++) {
                    markers.push(createMarker(new google.maps.LatLng(locations[i][0], locations[i][1]), locations[i][7]));
                }

                function createMarker(latlng, html) {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        infowindow.setContent(html);
                        infowindow.open(map, marker);
                    });

                    return marker;
                }
                //var markerCluster = new MarkerClusterer(map, markers,
                //  { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });  
            });


            $("#activemap-grid").kendoGrid({
                dataSource: {
                    transport: { read: { url: search, type: "GET", dataType: "json" } },
                    schema: { data: "", total: "total", model: { fields: {} } }
                },
                columns: [

                    { field: "title", title: "Project", width: '20px' },
                    { field: "", title: "Location", width: '20px', template: "#= addCity + '  ' + addState #" },
                    { field: "statuscode", title: "Status", width: "10px", attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=statuscode#" + "'></span>" },
                    { field: "pm", title: "PM", width: '20px' }
                ]

            }).on("click", "tbody td", (e) => { 
            });
        });

        $("#searchMapFilter").change(function (e) { 

            $("#activemap-grid").data("kendoGrid").clearSelection();
            markers = [];
            heatMapData = [];
             locations = [];
            var contentString = "";
            var search = "api/pcc/GetActiveMapLocations?search=" + $(this).val();
            

            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: { url: search, type: "GET", dataType: "json" }
                }
            });
            dataSource.fetch(function () {

                for (var i = 0; i < dataSource.view().length; i++) {
                    contentString = '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h3 id="firstHeading" class="firstHeading">' + dataSource.view()[i]['title'] + '</h3>' +
                        '<div id="bodyContent">' +
                        '<h3 class="firstHeading">Office</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['address1'] + '  ' + dataSource.view()[i]['addCity'] + '</p>' +
                        '<h3>Phase</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['phase'] + '</p>' +
                        '<h3>Status</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['status'] + '</p>' +
                        '<h3>Project Manger:</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['pm'] + '</p>' +
                        '<h3>Description:</h3>' +
                        '<p class="spnbck"> ' + dataSource.view()[i]['description'] + '</p>' +
                        '</div>' +
                        '</div>';

                    locations.push([dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude'], dataSource.view()[i]['title'], dataSource.view()[i]['address1'], dataSource.view()[i]['phase'], dataSource.view()[i]['status'], dataSource.view()[i]['pm'], contentString]);
                    heatMapData.push(new google.maps.LatLng(dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude']));

                }

                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 5,
                    center: new google.maps.LatLng(locations[0][0], locations[0][1]),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                var infowindow = new google.maps.InfoWindow();

             //   var heatmap = new google.maps.visualization.HeatmapLayer({
                  //  data: heatMapData
              //  });
                //heatmap.set('radius', 100);
               // heatmap.setMap(map);

                for (i = 0; i < locations.length; i++) {
                    markers.push(createMarker(new google.maps.LatLng(locations[i][0], locations[i][1]), locations[i][7]));
                }

                function createMarker(latlng, html) {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        infowindow.setContent(html);
                        infowindow.open(map, marker);
                    });

                    return marker;
                }
                // var markerCluster = new MarkerClusterer(map, markers,
                //   { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }); 


            });

            $("#activemap-grid").kendoGrid({
                dataSource: {
                    transport: { read: { url: search, type: "GET", dataType: "json" } },
                    schema: { data: "", total: "total", model: { fields: {} } }
                },
                columns: [

                    { field: "title", title: "Project", width: '20px' },
                    { field: "", title: "Location", width: '20px', template: "#= addCity + '  ' + addState #" },
                    { field: "statuscode", title: "Status", width: "10px", attributes: { class: "text-center" }, template: "<span class='alert-table-icon " + "#=statuscode#" + "'></span>" },
                    { field: "pm", title: "PM", width: '20px' } 
                ]

            }).on("click", "tbody td", (e) => { 
            }); 
        });
    }



    private LoadDocumentGrid(id): void {
        let itemType: string;

        var documentSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetDocumentSummary?projid=" + id + "&entcode=PRO1", dataType: "json" },
            }
        });
        documentSource.read();
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


            $("#actionDetailsGrid").hide();
            $("#purchaseOrderDetailsGrid").hide();
            $("#fieldReportsDetailsGrid").hide();
            $("#scheduleDetailsGrid").hide();
            $("#documentDetailsGrid").show();



            $("#financialDetailsGrid").hide();
            $("#financial-summary-grid").data("kendoGrid").clearSelection();



            var grid = $("#document-summary-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr")) as any;

            itemType = dataItem.item as string;

            $("#documentDetailTitle").text('Details: Element - ' + itemType)

            this.LoaddocumentDetailGrid(itemType);
        });
    }
    private LoaddocumentDetailGrid(itemType): void {


        var documentDetailSource = new kendo.data.DataSource();

        documentDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetSummaryDetail?itemtype=" + itemType, dataType: "json" },
            }
        });
        documentDetailSource.read();

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

        });
    }

    private LoadFinancialGrid(id): void {
        let itemType: string;

        var financialSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetFinancialSummary?projid=" + id + "&entcode=PRO1", dataType: "json" },
            }
        });

        financialSource.read();
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

            $("#purchasePanel").css("display", "none");
            $("#actionPanel").css("display", "none");
            $("#message_tabstripMain .tapstrip-buttons").html('');
            $("#documentDetailsGrid").hide();

            $("#financialDetailsGrid").show();



            //  $("#financialDetailsGrid").hide();
            //  $("#financial-summary-grid").data("kendoGrid").clearSelection();

            //  $("#scheduleDetailsGrid").hide();
            // $("#schedule-summary-grid").data("kendoGrid").clearSelection();

            //  $("#budgetDetailsGrid").hide();
            //  $("#budget-details-grid").data("kendoGrid").clearSelection();

            //    var grid = $("#document-summary-grid").data("kendoGrid");
            //    var dataItem = grid.dataItem($(e.currentTarget).closest("tr")) as any;





            // this.LoadFinancialDetailsGrid(itemType, id);


            var grid = $("#financial-summary-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr")) as any;
            itemType = dataItem.item as string;
            $("#financialDetailTitle").text('Details: Financial - ' + itemType);
            this.LoadFinancialDetailsGrid(itemType, this.getprojectID);

        });
    }

    private LoadFinancialDetailsGrid(itemType, id): void {

        var financialDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetFinancialDetails?type=" + itemType + "&projid=" + id, dataType: "json" },
            },
            aggregate: [
                { field: "amount", aggregate: "sum" }
            ]
        });
        financialDetailSource.read();

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

        });
    }

    private LoadScheduleGrid(id): void {
        let milestone: string;
        let taskID: number;
        var scheduleDetailSource = new kendo.data.DataSource();

        var scheduleSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetScheduleSummary?projid=" + id + "&entcode=PRO1", dataType: "json" },
            }
        });
        scheduleSource.read();
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



            var grid = $("#schedule-summary-grid").data("kendoGrid");
            var dataItem = grid.dataItem($(e.currentTarget).closest("tr")) as any;

            milestone = dataItem.milestone as string;
            $("#scheduleDetailTitle").text('Details: Schedule - ' + milestone)

            taskID = dataItem.taskID as number;


            this.LoadScheduleDeatilsGrid(taskID);

        });
    }

    private LoadScheduleDeatilsGrid(id): void {
        var scheduleDetailSource = new kendo.data.DataSource();

        scheduleDetailSource = new kendo.data.DataSource({
            transport: {
                read: { url: "/api/Project/GetScheduleDetails?taskid=" + id, dataType: "json" },
            }
        });
        scheduleDetailSource.read();
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

        });
    }


    public showmap() { 
         locations = [];
        var contentString = "";

        heatMapData = [];

        var dataSource = new kendo.data.DataSource({
            transport: {
                read: { url: "api/pcc/GetActiveMapLocations", type: "GET", dataType: "json" }
            }
        });
        dataSource.fetch(function () { 

            for (var i = 0; i < dataSource.view().length; i++) { 
                contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h3 id="firstHeading" class="firstHeading">' + dataSource.view()[i]['title'] + '</h3>' +
                    '<div id="bodyContent">' +
                    '<h3 class="firstHeading">Office</h3>' +
                    '<p class="spnbck"> ' + dataSource.view()[i]['address1'] + '  ' + dataSource.view()[i]['addCity'] + '</p>' +
                    '<h3>Phase</h3>' +
                    '<p class="spnbck"> ' + dataSource.view()[i]['phase'] + '</p>' +
                    '<h3>Status</h3>' +
                    '<p class="spnbck"> ' + dataSource.view()[i]['status'] + '</p>' +
                    '<h3>Project Manger:</h3>' +
                    '<p class="spnbck"> ' + dataSource.view()[i]['pm'] + '</p>' +
                    '<h3>Description:</h3>' +
                    '<p class="spnbck"> ' + dataSource.view()[i]['description'] + '</p>' +
                    '</div>' +
                    '</div>';
                locations.push([dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude'], dataSource.view()[i]['title'], dataSource.view()[i]['address1'], dataSource.view()[i]['phase'], dataSource.view()[i]['status'], dataSource.view()[i]['pm'], contentString]);

                heatMapData.push(new google.maps.LatLng(dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude']));
            }

                
          var  map = new google.maps.Map(document.getElementById('map'), {
                zoom: 5,
              center: new google.maps.LatLng(locations[0][0], locations[0][1]),
                mapTypeId: google.maps.MapTypeId.ROADMAP
          });


          //  var heatmap = new google.maps.visualization.HeatmapLayer({
            //    data: heatMapData
           // });
         //   heatmap.set('radius', 100);
           // heatmap.setMap(map);

         var   infowindow = new google.maps.InfoWindow();

            for (i = 0; i < locations.length; i++) {
                markers.push(createMarker(new google.maps.LatLng(locations[i][0], locations[i][1]), locations[i][7]));
            }

            function createMarker(latlng, html) {
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(html);
                    infowindow.open(map, marker);
                });

                return marker;
            }

          //  markerCluster = new MarkerClusterer(map, markers, {
             //   gridSize: 5,
              //  imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        //    });
           // var markerCluster = new MarkerClusterer(map, markers,
             //   { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
            
            
        });
    } 


    private AlertsGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        this.LoadAlertsPanel(selectedItem.projectId as number);
    }

    private PortfolioGridSelectionChanged = (arg: kendo.ui.GridChangeEvent) => {
        let keys = arg.sender.selectedKeyNames();

        this.LoadHealthChartData(arg.sender.selectedKeyNames().join(","));

        if (keys.length === 1) {
            this.LoadAlertsPanel(parseInt(keys[0]) as number);
        }
        else {
            document.querySelector(".alerts-panel-container").classList.remove("visible");
        }
    }

    private async LoadHealthChartData(ids: string) {
        const healthData = await axios.get("api/pcc/getProjectHealthChartData?projects=" + ids);
        let chart = $('#projectHealthChart').data('kendoChart');
        chart.options.series[0].data = healthData.data.items;
        chart.redraw();
        let score = $('#projectHealthChart + .score');
 
        
        $(".inner-content").text(healthData.data.score +"%");
         
        score.removeClass();
        if (healthData.data.score >= 76) {
            score.addClass(["score", "green"]);
        }
        else if (healthData.data.score >= 51) {
            score.addClass(["score", "yellow"]);
        }
        else {
            score.addClass(["score", "red"]);
        }
        score.hide().html(healthData.data.score).fadeIn(1000);
        document.querySelector('#projectHealthChart').parentElement.dataset.title = healthData.data.title;
        //  this.QuickChartsSlider.refreshTitles();

         

        $("#layer-type").kendoComboBox({
            index: 1,
            dataTextField: "title",
            dataValueField: "heatMapLayerID",
            filter: "contains",  
            dataSource: {
                transport: {
                    read: { url: "api/pcc/GetLayers?ent=PRO1", dataType: "json", type: "GET" },
                }
            },
            change: function (e) {  

                var dataSource = new kendo.data.DataSource({
                    transport: {
                        read: { url: "api/pcc/GetLayerData", type: "GET", dataType: "json" }
                    }
                });
                dataSource.fetch(function () {
                    heatMapData = [];
                    markers = [];
                    for (var i = 0; i < dataSource.view().length; i++) {
                        heatMapData.push(new google.maps.LatLng(dataSource.view()[i]['latitude'], dataSource.view()[i]['longitude']));
                    }

                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 5,
                        center: new google.maps.LatLng(locations[0][0], locations[0][1]),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });


                    var heatmap = new google.maps.visualization.HeatmapLayer({
                        data: heatMapData
                    });
                    heatmap.set('radius', 100);
                    heatmap.setMap(map);

                    var infowindow = new google.maps.InfoWindow();

                    for (i = 0; i < locations.length; i++) {
                        markers.push(createMarker(new google.maps.LatLng(locations[i][0], locations[i][1]), locations[i][7]));
                    }

                    function createMarker(latlng, html) {
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map
                        });

                        google.maps.event.addListener(marker, 'click', function () {
                            infowindow.setContent(html);
                            infowindow.open(map, marker);
                        });

                        return marker;
                    }

                }); 
            }
        }); 

    }


    

    private async LoadAlertsPanel(projectId: number, columnName?: string): Promise<void> {
        document.querySelector(".alerts-panel-container").classList.remove("visible");
        let panel = $(".control-center-bottom");
        //panel.height("400px");

        kendo.ui.progress(panel, true);

        const projectResponse = axios.get("api/project/getProjectDataByProjectId?projectId=" + projectId);
        const alertsResponse = axios.get("api/alerts/getAlertsByProjectId?projectId=" + projectId);

        const [project, alerts] = await Promise.all([projectResponse, alertsResponse]);

        this.PopulateAlertsPanelDetail(project.data, alerts.data, panel, columnName);
    }

    private PopulateAlertsPanelDetail(project: any, alerts: any, panel: JQuery<HTMLElement>, forceCategory?: string): void {
        let detailPane = document.querySelector("#alerts-project-information");

        detailPane.querySelector(".title").innerHTML = project.project.title;
        detailPane.querySelector(".pm").innerHTML = project.project.requestor;
        detailPane.querySelector(".project-number").innerHTML = project.project.projectNo;
        detailPane.querySelector(".client").innerHTML = project.project.client;
        detailPane.querySelector(".score").innerHTML = project.score;
        detailPane.querySelector(".phase").innerHTML = project.project.phase;
        detailPane.querySelector(".status").innerHTML = project.project.status;
        detailPane.querySelector(".type").innerHTML = project.project.typeConstruction;
        detailPane.querySelector(".gsf").innerHTML = project.project.gsf;

        detailPane.querySelector(".startDate").innerHTML = Utilities.FormatDateString(project.schedData.start);
        detailPane.querySelector(".endDate").innerHTML = Utilities.FormatDateString(project.schedData.end);
        detailPane.querySelector(".percentComplete").innerHTML = project.schedData.complPerc;

        detailPane.querySelector(".budget").innerHTML = Utilities.FormatMoney(project.budgetData.budgeted);
        detailPane.querySelector(".committed").innerHTML = Utilities.FormatMoney(project.budgetData.committed);
        detailPane.querySelector(".paid").innerHTML = Utilities.FormatMoney(project.budgetData.paid);

        let desc = detailPane.querySelector(".description textarea") as HTMLTextAreaElement;
        desc.value = project.project.description;

        let note = detailPane.querySelector(".notes textarea") as HTMLTextAreaElement;
        if (project.lastNote) {
            note.value = project.lastNote.progressNote;
        }
        else {
            note.value = "";
        }

        console.log(project.finBarData);
        this.BudgetBar.Load(project.finBarData);
        this.ScheduleBar.Load(project.schedBarData);

        this.AlertsPanel.Load(alerts);

        if (forceCategory) {
            this.AlertsPanel.ForceCategory(forceCategory);
        }

        kendo.ui.progress(panel, false);
        document.querySelector(".alerts-panel-container").classList.add("visible");
    }

}



$('#dvattchment').click(function () { 
    $('#myFile').trigger('click'); 
});
$("#myFile").change(function () {
    $("#spnuplod").text('File Added.');
});
