import axiosES6 from "../../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

export class LinkedPhoneList {
    private data: any;
    constructor(data: any) {
        this.data = data;
        this.init();
    }

    private init(): void {

        //var d1 = document.getElementById('phone-component');


        //let htmlToAdd = '< div class="grid-item-header" >' +
        //    '<h3>Phone Numbers < /h3>' +
        //    '< div class="grid-item-header-buttons phone" >' +
        //    '<button class="btn toolbar add" title = "Add New Record" >' +
        //    '<svg class="grid-item-icon green" >' +
        //    '<use xlink: href = "/images/icons.svg#plus" > </use>' +
        //    '< /svg>' +
        //    '< /button>' +
        //    '< button class="btn toolbar save" title = "Save Changes" >' +
        //    '<svg class="grid-item-icon yellow" >' +
        //    '<use xlink: href = "/images/icons.svg#save" > </use>' +
        //    '< /svg>' +
        //    '< /button>' +
        //    '< button class="btn toolbar cancel" title = "Cancel Changes" >' +
        //    '<svg class="grid-item-icon" >' +
        //    '<use xlink: href = "/images/icons.svg#times" > </use>' +
        //    '< /svg>' +
        //    '< /button>' +
        //    '< /div>' +
        //    '< /div>' +
        //    '< div class="grid-item-content" >' +
        //    '<div id="phone-grid" > </div>' +
        //    '</div>';

        //d1.insertAdjacentHTML('afterend', htmlToAdd);

        this.setupGrids();

    }

    private setupGrids(): void {
        const tableHeight = 250;
        $("#phone-grid").kendoGrid({
            dataSource: {

                batch: true,
                transport: {
                    read: { url: "../api/Phones/GetPhonesbyType?type=" + this.data.itemtype + "&c=" + this.data.itemid, dataType: "json" },
                    update: { url: "../api/Phones/Update", dataType: "json", type: "POST" },
                    create: { url: "../api/Phones/Create", dataType: "json", type: "POST" }
                },
                schema: {
                    data: "data",
                    total: "total",
                    model: {
                        id: "phoneID",
                        fields: {
                            phoneID: { type: "number" },
                            label: { type: "string" },
                            phoneNumber: { type: "string" },
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
            columns: [
                { field: "phoneNumber", title: "Phone", width: '58%'},
                { field: "label", title: "Label", width: '20%' },
                {
                    field: "isPrimary", title: "Primary",
                    template: '<input type="checkbox" #= isPrimary ? checked="checked" : "" # disabled="disabled" ></input>'
                },
                { field: "phoneID", title: "PhoneID", hidden: true },
                { field: "parentID", title: "ParentID", hidden: true },
                { field: "parentType", title: "ParentType", hidden: true }
            ]
        });
    }
}