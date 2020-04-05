import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
import { Tabs } from "./components/tabs.js";


export class SchedList {

    private data: any;
    private NewSchedButton: HTMLButtonElement;

    constructor(data: any) {
        this.data = data;
        this.init();
    }

    private init(): void {
        this.setupGrids();
        this.TestDocCards();
        //this.NewSchedButton = document.querySelector("#new-sched-button") as HTMLButtonElement;

        //this.NewSchedButton.disabled = true;

        //this.NewSchedButton.addEventListener("click", () => {
        //    window.location.href = "new";
        //})


    }

    private setupGrids(): void {
        const tableHeight = 660;
        console.log("Scheds", this.data);
        $("#sched-grid").kendoGrid({
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
                        id: "schedID"
                    }
                },
                sort: { field: "schedID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.SchedGridSelectionChanged,
            columns: [
                { field: "projectID", title: "Project #", width: '10%' },
                { field: "projectTitle", title: "Project" },
                { field: "createdBy", title: "PM", width: '10%' },
                { field: "salesPerson", title: "Sales", width: '20%' },
                { field: "requestedStart", title: "Requested Start", width: '10%', template: '#= kendo.toString(kendo.parseDate(requestedStart), "MM/dd/yyyy") #' },
                { field: "schedID", title: "ID", width: '10%' }
            ]
        });

        Utilities.MoveKendoToolbar("#sched-grid");
    }

    private SchedGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());

        window.location.href = selectedItem.schedID;
        //this.LoadAlertsPanel(selectedItem.projectId as number);
    }

    private async TestDocCards(): Promise<void> {
        let doclookup = {} as any;
        doclookup.itemType = "RFI";
        doclookup.itemId = 1001;
        doclookup.entCode = "PRO1";
        const docCards = await axios.post("api/document/GetDocCardsByLookup", doclookup);
        console.log(docCards);
    }
}

export class SchedDetailItem {
    private data: any;
    private user: any;

    constructor(data: any) {
        this.data = data;
        this.init();
    }

    private async init(): Promise<void> {
        console.log("Schedule Init", this.data);

        this.GetCurrentUser();
        this.setupSchedule();
    }

    private async GetCurrentUser(): Promise<void> {

        let userData = await axios.get("api/budget/GetCurrentUser")
        this.user = userData.data;
        console.log(this.user)
    }

    private setupSchedule(): void {

        gantt.config.date_format = "%Y-%m-%d %H:%i";
        gantt.init("gantt_schedule");
        ganttModules.menu.setup();
        gantt.load("/api/gantt/getGanttbyProject?proj=" + this.data.projectID, "json");

        var dp = new gantt.dataProcessor("/api/gantt");
        dp.init(gantt);
        dp.setTransactionMode("REST");

    }
}