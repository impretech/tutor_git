import axiosES6 from "../../lib/axios/axios.esm.min.js";
const axios = axiosES6;
//import { Utilities } from "./utilities.js";
export class LinkedEmailList {
    constructor(data) {
        this.data = data;
        this.init();
    }
    init() {
        this.setupGrids();
    }
    setupGrids() {
        const tableHeight = 150;
        $("#email-grid").kendoGrid({
            dataSource: {
                //data: this.data,
                batch: true,
                transport: {
                    read: { url: "../api/Email/GetEmailsbyContactID?c=" + this.data.itemid, dataType: "json" },
                    update: { url: "../api/Email/Update", dataType: "json", type: "POST" },
                    create: { url: "../api/Email/Create", dataType: "json", type: "POST" }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        id: "emailID",
                        fields: {
                            emailID: { type: "number" },
                            label: { type: "string" },
                            emailAddress: { type: "string" },
                            isPrimary: { type: "boolean" },
                            parentID: { type: "number", defaultValue: this.data.itemid },
                            parentType: { type: "string", defaultValue: this.data.itemtype }
                        }
                    }
                }
            },
            height: tableHeight,
            sortable: false,
            scrollable: true,
            selectable: true,
            editable: true,
            filterable: false,
            persistSelection: true,
            //toolbar: ["create", "save", "cancel"],
            //change: this.PortfolioGridSelectionChanged,
            columns: [
                //{ selectable: true , field: "IsPrimary", title: "Sel"},
                { field: "emailAddress", title: "Email", width: '58%' },
                { field: "label", title: "Label", width: '20%' },
                {
                    field: "isPrimary", title: "Primary",
                    template: '<input type="checkbox" #= isPrimary ? checked="checked" : "" # disabled="disabled" ></input>'
                },
                { field: "emailID", title: "EmailID", hidden: true },
                { field: "parentID", title: "ParentID", hidden: true },
                { field: "parentType", title: "ParentType", hidden: true }
            ]
        });
        // Utilities.MoveKendoToolbar("#email-grid");
    }
}
