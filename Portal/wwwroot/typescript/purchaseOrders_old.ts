import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { Utilities } from "./utilities.js";
import { Tabs } from "./components/tabs.js";
import { Binding } from "./binding.js";
import { Notification } from "./components/notification.js";


export class PurchaseOrdersList {

    private data: any;
    
    private NewPOButton: HTMLButtonElement;


    constructor(data: any) {
       
        this.data = data;
        this.init();
    }

    private init(): void {
       
        this.setupGrids();

        this.NewPOButton = document.querySelector("#new-purchaseOrder-button") as HTMLButtonElement;


        this.NewPOButton.addEventListener("click", () => {
                window.location.href = "new";
        });
    }

    setupGrids() {
        const tableHeight = 660;
        $("#purchase-order-grid").kendoGrid({
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
                proxyURL: "/Utilities/ExportToPDF"
            },
            reorderable: true,
            dataSource: {
                data: this.data,
                schema: {
                    model: {
                        id: "PoID"
                    }
                },
                sort: { field: "PoID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.PurchaseGridSelectionChanged,
            columns: [
                { field: "originalPO", title: "Original PO #" },
                { field: "originalPOAmount", title: "Original PO Amount", template: '#= kendo.toString(total, "c") #'},
                { field: "status", title: "Status" },
                { field: "poDate", title: "PO Date", template: '#= kendo.toString(kendo.parseDate(poDate), "MM/dd/yyyy") #' }
            ]
        });

        Utilities.MoveKendoToolbar("#purchase-order-grid");
    }


    private PurchaseGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        console.log("Purchase Orders List", arg.sender.select());
        window.location.href = selectedItem.poID;
    };
}

export class PurchaseOrdersDetailItem {

    private model: any;
    private poLineItemDataArray: any;
    private projectDataSource: any;
    private poDataSource: any;
    private quoteDataSource: any;
    private poLineItmDataSource: any;
    private vendorContactDataSource: any;
    private vendorAddressDataSource: any;
    private serviceDataSource: any;
    private termDataSource: any;
    private typeDataSource: any;
    private statusDataSource: any;
    private userDataSource: any;
    private projectAddressDataSource: any;

    private codeDropDownEditor: any;
    private itemFieldEditor: any;
    private dateDropDownEditor: any;
    private onSchSwitchEditor: any;
    private unitDropDownEditor: any;


    private GeneralViewButton: HTMLSpanElement;
    private DetailViewButton: HTMLSpanElement;
    private PublishButton: HTMLButtonElement;
    private notification: Notification;


    private newLineItem = {
        "category": null,
        "catDescription": null,
        "fundBalance": 0.0,
        "poLineID": 0,
        "poID": 0,
        "projectID": 0,
        "order": 0,
        "code": "",
        "availFunds": 0.0,
        "price": 0.0,
        "cost": 0.0,
        "vendorPartNo": null,
        "description": null,
        "unit": null,
        "quantity": 0,
        "vendDelvDate": "0001-01-01T00:00:00",
        "requiredByDate": "0001-01-01T00:00:00",
        "onSched": false,
        "perComplete": 0.0
    }

    constructor(data: any) {

        this.model = data;
        this.init();
    }

    private async init(): Promise<void> {

        this.pre_init();

        this.init_DataSources();
        this.init_Components();

        await this.render_PO();
        await this.render_POItems();
        await this.render_Notes();
        await this.RenderButtons();

        this.post_init();
    }


    private pre_init() {

        if (this.model.po.entCode == null)
            this.model.po.entCode = 'PRO1';

        this.poLineItemDataArray = kendo.observable({
            data: this.model.lineItems
        });

    }

    private post_init() {
        if (this.model.po.poID != 0)
            this.setExistingPOValues();
    }

    public async init_DataSources() {
        

        this.userDataSource = async () => {
            const user = await axios.get("api/PO/GetCurrentUser");
            return user.data;
        }

        this.projectDataSource = async (entCode:any) => {
            const projects = await axios.get("api/budget/GetProjectsList?entcode=" + entCode);
            return projects.data;
        }

        this.poDataSource = async (projectID: any) => {
            const poList = await axios.get("api/PO/GetPOsbyProject?projid=" + projectID);
            return poList.data;
        }

        this.quoteDataSource = async (projectID: any) => {
            const quotes = await axios.get("api/PO/GetQuoteCOs?id=" + projectID);
            return quotes.data;
        }

        this.poLineItmDataSource = async (projectID: any) => {
            const poLineItemCodes = await axios.get("api/PO/GetPOLineCats?id=" + projectID);
            return poLineItemCodes.data;
        }

        this.vendorContactDataSource = async (vendorID: any) => {
            const vendorContacts = await axios.get("api/PO/GetVendorContacts?vendorId=" + vendorID);
            return vendorContacts.data;
        }

        this.vendorAddressDataSource = async (vendorID: any) => {
            var vendorAddress = await axios.get("api/PO/GetVendorAddress?vendorid=" + vendorID);
            return vendorAddress.data;
        }

        this.projectAddressDataSource = async (projectID: any) => {
            var projectAddress = await axios.get("api/PO/GetProjectAddress?projectid=" + projectID);
            return projectAddress.data;
        }

        this.serviceDataSource = this.model.lookups.filter(function (lookup) {
            return lookup.prompt == 'Service';
        });

        this.termDataSource = this.model.lookups.filter(function (lookup) {
            return lookup.prompt == 'Terms';
        });

        this.typeDataSource = this.model.lookups.filter(function (lookup) {
            return lookup.prompt == 'Type';
        });

        this.statusDataSource = this.model.lookups.filter(function (lookup) {
            return lookup.prompt == 'Status';
        });
    }

    public async init_Components() {


        var codes = await this.poLineItmDataSource(this.model.po.projectID);
        this.codeDropDownEditor = function (container, options) {

            $('<input required name="' + options.field + '"/>')
                .appendTo(container)
                .kendoComboBox({
                        dataTextField: "code",
                        dataValueField: "code",
                        dataSource: codes,
                        template: "#=code # - #=description #",
                        filter: "contains",
                        suggest: true,
                        index: 100,
                        autoWidth:true
                });
        }

        this.dateDropDownEditor = function (container, options) {


            $('<input required name="' + options.field + '"/>')
                .appendTo(container)
                .kendoDatePicker();
        }

        this.onSchSwitchEditor = function(container, options) {
            $('<input type="checkbox" name="' + options.field + '"/>')
                .appendTo(container)
                .kendoSwitch();
        }

        this.itemFieldEditor = function(container, options) {
            $('<input required name="' + options.field + '"/>')
                .appendTo(container)
        }



        this.unitDropDownEditor = function (container, options) {
            $('<input required name="' + options.field + '"/>')
                .appendTo(container)
                .kendoComboBox({
                    dataTextField: "text",
                    dataValueField: "id",
                    dataSource: [
                        { id: "ea", text: "Each" }
                    ],
                    filter: "contains",
                    suggest: true,
                    index: 0
                });
        }


        this.CurrencyFields();
        this.notification = new Notification();
    }

    private async render_PO() {


        $("#projectID").kendoComboBox({
            dataTextField: "title",
            dataValueField: "projectId",
            dataSource: await this.projectDataSource(this.model.po.entCode),
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {

                this.model.po.projectID = e.sender.value();

                var accountNo = await axios.get("api/PO/GetAccountNo?proj=" + this.model.po.projectID);
                $("#accountNo").val(accountNo.data);

                var currentQuotes = await axios.get("api/PO/GetQuoteCOs?id=" + this.model.po.projectID);
                $("#quoteCO").data("kendoComboBox").setDataSource(currentQuotes.data);


                var currentPoList = await this.poDataSource(this.model.po.projectID);
                $("#originalPO").data("kendoComboBox").setDataSource(currentPoList);
            }
        });

        //Service Field
        $("#service").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: this.serviceDataSource,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                this.model.po.service = e.sender.value();
            }
        });


        $("#quoteCO").kendoComboBox({
            dataTextField: "id",
            dataValueField: "itemID",
            dataSource: await this.quoteDataSource(this.model.po.projectID),
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {

                var itemID = e.sender.value();

                const quotes = await this.quoteDataSource(this.model.po.projectID);

                var quote = quotes.filter(function (quoteVal) {
                    return quoteVal.itemID == itemID;
                })[0];

                if (quote == null)
                    return;

                $("#contractNo").val(quote.contractNo);
                $("#vendor").val(quote.vendor);

                var vAddress = await this.vendorAddressDataSource(quote.vendorID);

                var formatted_vAddress = `${vAddress.address1} ${vAddress.address2}\n` +
                    `${vAddress.addCity}, ${vAddress.addState}, ${vAddress.addZip}`;

                $("#vendorAddress").val(formatted_vAddress);

                var pAddress = await this.projectAddressDataSource(this.model.po.projectID);

                if (pAddress != null) {
                    var formatted_pAddress = `${pAddress.address1} ${pAddress.address2}\n` +
                        `${pAddress.addCity}, ${pAddress.addState}, ${pAddress.addZip}`;

                    $("#shipTo").val(formatted_pAddress);
                }

                this.model.po.vendorID = quote.vendorID;
                var currentVendorContact = await this.vendorContactDataSource(this.model.po.vendorID);
                $("#vendorContact").data("kendoComboBox").setDataSource(currentVendorContact);


                this.model.po.quoteCO = quote.id;
                this.model.po.quoteCOID = quote.itemID;
            }
        });

        //Type Field
        $("#type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: this.typeDataSource,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                this.model.po.type = e.sender.value();
            }
        });

        $("#status").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: this.statusDataSource,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                this.model.po.status = e.sender.value();
            }
        });

        // PO Date Field
        $("#poDate").kendoDatePicker({
            change: async (e) => {
                this.model.po.poDate = e.sender.value();

                console.log(this.model.po.poDate);
            }
        });

        $("#requestedBy").on('change', (e) => {
            var val = $("#requestedBy").val();
            this.model.po.requestedBy = val;

            console.log(this.model.po.requestedBy);
        });


        $("#reqNo").on('change', (e) => {
            var val = $("#reqNo").val();
            this.model.po.reqNo = val;

            console.log(this.model.po.reqNo);
        });

        $("#contractNo").on('change', (e) => {
            var val = $("#contractNo").val();
            this.model.po.contractNo = val;
        });


        $("#perComplete").on('change', (e) => {
            var val = $("#perComplete").val();
            this.model.po.perComplete = val;
        });

        $("#workStartDate").kendoDatePicker({
            change: async (e) => {
                this.model.po.workStartDate = e.sender.value();

                console.log(this.model.po.workStartDate);
            }
        });
        $("#workCompleteDate").kendoDatePicker({
            change: async (e) => {
                this.model.po.workCompleteDate = e.sender.value();

                console.log(this.model.po.workCompleteDate);
            }
        });

        $("#terms").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: this.termDataSource,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                this.model.po.terms = e.sender.value();
            }
        });


        $("#originalPO").kendoComboBox({
            dataTextField: "originalPO",
            dataValueField: "originalPO",
            dataSource: this.poDataSource(this.model.po.projectID),
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {


                var value = e.sender.value();
                var poList = await this.poDataSource(this.model.po.projectID);

                var originalPO = poList.filter(function (poVal) {
                    return poVal.originalPO == value;
                })[0];

                $("#originalPOAmt").data("kendoNumericTextBox").value(Utilities.Float2Currency(originalPO.originalPOAmount));
                $("#poOriginalPO").data("kendoNumericTextBox").value(Utilities.Float2Currency(originalPO.originalPOAmount));


                this.model.po.originalPO = value;
            }
        });

        $("#vendorContact").kendoComboBox({
            dataTextField: "showAsName",
            dataValueField: "contactID",
            dataSource: await this.vendorContactDataSource(this.model.po.vendorID),
            filter: "contains",
            suggest: true,
            index: 100
        });
    }

    private async render_POItems() {

        var poLineItemDataModel = kendo.data.Model.define({
            id: "poID",
            fields: {
                code: { type: "string" },
                category: { type: "string" , editable: false},
                availFunds: { type: "string", },
                vendorPartNo: { type: "string" },
                description: { type: "string" },
                quantity: { type: "string" },
                price: { type: "string" },
                cost: { type: "number", editable: false},
                fundBalance: { type: "number", editable: false},
                vendDelvDate: { type: "date" },
                perComplete: { type: "string" },
                onSched: { type: "boolean"}
            }
        });


        var poLineItemDataSource = new kendo.data.DataSource({
            data: this.poLineItemDataArray,
            schema: {
                model: poLineItemDataModel,
                data: "data"
            }
        });

        $("#poGrid").kendoGrid({
            dataSource: poLineItemDataSource,
            toolbar: ["create"],
            columns: [
                {
                    field: "code",
                    title: "Code",
                    editor: this.codeDropDownEditor
                },
                { field: "category", title: "Item" },
                { field: "availFunds", title: "Available Funds", template: '#= kendo.toString(availFunds, "0.00")#' },
                { field: "vendorPartNo", title: "Vendor Part #" },
                { field: "description", title: "Description" },
                { field: "unit", title: "Unit", editor: this.unitDropDownEditor },
                { field: "quantity", title: "Qty" },
                { field: "price", title: "Unit Price", template: '#= kendo.toString(price, "$0.00")#' },
                { field: "cost", title: "Cost", template: '#= kendo.toString(price * quantity, "$0.00")#' },
                {
                    field: "fundBalance",
                    title: "Fund Balance",
                    template: '#= kendo.toString((availFunds - cost), "$0.00")#'
                },
                {
                    field: "vendDelvDate",
                    title: "Delivery Date",
                    editor: this.dateDropDownEditor,
                    format: "{0:MM/dd/yyyy}"
                },
                { field: "perComplete", title: "%" },
                { field: "onSched", title: "On Sched", editor: this.onSchSwitchEditor },
                { command: ["edit", "destroy"], title: "&nbsp;" }
            ],
            editable: "inline",
            selectable: true,
            scrollable: false
        });


        //$("#poGrid").find(".k-grid-toolbar").insertAfter($("#poGrid .k-grid-header"));

        this.poLineItemDataArray.bind("change", (e) => {
            console.log(e.action, e.field, e.items);
        });

    }

    public async render_Notes() {

        $(".project-notes-handle").click(() => {
            $(".project-notes").toggleClass("hide");
            $(".expand-symbol").toggle();
            $(".collapse-symbol").toggle();
        });

        const addNoteButton = document.querySelector("#add-note-button") as HTMLButtonElement;
        addNoteButton.addEventListener("click", async (evt) => {
            addNoteButton.disabled = true;
            evt.preventDefault();

            let noteText = $('#new-note').val();

            let note = {} as any;
            note.ProjectID = parseInt(this.model.po.projectID);
            note.writer = this.userDataSource.userName;
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = this.model.po.poID;
            note.itemType = "PO";

            let noteDiv = this.CreateNote(note);
            console.log("AddNote", note);
            let prevNotes = document.querySelector(".previous-notes");
            prevNotes.insertBefore(noteDiv, prevNotes.childNodes[0]);
            $('#new-note').val("");

            const noteUpdate = await axios.post("api/note/addNote", note);

            addNoteButton.disabled = false;
        });

        const notes = document.querySelector(".previous-notes");
        notes.innerHTML = "";

        this.model.notes.forEach((item, key) => {
            let note = this.CreateNote(item);
            notes.appendChild(note);
        });
    }

    private async Save() {

        this.PublishButton.disabled = true;
        document.body.classList.toggle("wait");


        //Save PO
        if (this.model.po.poID == 0) {

            const poInsert = await axios.post("api/PO/InsertPO", this.model.po);
            console.log('po inserted', poInsert);

        } else {

            const poUpdate = await axios.put("api/PO/UpdatePO", this.model.po);
            console.log('po updated', poUpdate);
        }


        if (this.poLineItemDataArray.data.length > 0) {

            //Save PO Items
            //Sync ViewModel with Model
            //Add all New Line Items
            for (var i = 0; i < this.poLineItemDataArray.data.length; i++) {

                if (this.poLineItemDataArray.data[i].id == "") {
                    var item = this.newLineItem;
                    item.poID = this.model.po.poID;
                    item.projectID = this.model.po.projectID;


                    for (var key in this.poLineItemDataArray.data[i]) {

                        if (key != null && this.poLineItemDataArray.data[i][key]) {

                            if (this.poLineItemDataArray.data[i].hasOwnProperty(key) && item.hasOwnProperty(key)) {

                                    console.log(key);
                                    console.log(item[key]);
                                    console.log(this.poLineItemDataArray.data[i][key]);

                                    //item[key] = this.poLineItemDataArray.data[i][key];
                                
                            }
                        }
                    }

                    this.model.lineItems.push(item);
                }
            }

            //Sync all Line Item Fields
            console.log('Before Update');
            console.log(this.model.lineItems);


            for (var i = 0; i < this.model.lineItems.length; i++) {

                if (this.model.lineItems[i].poLineID > 0 && this.poLineItemDataArray.data[i].poLineID > 0 &&
                    this.model.lineItems[i].poLineID && this.poLineItemDataArray.data[i].poLineID) {
                    for (var key in this.newLineItem) {
                        if (this.poLineItemDataArray.data[i].hasOwnProperty(key) && this.model.lineItems[i].hasOwnProperty(key)
                            && this.model.lineItems[i][key] != this.poLineItemDataArray.data[i][key]) {

                            console.log(i + ':' + key);

                            this.model.lineItems[i][key] = this.poLineItemDataArray.data[i][key];
                        }
                    }
                }
            }

            console.log('After Update');
            console.log(this.model.lineItems);


            for (var i = 0; i < this.model.lineItems.length; i++) {

                if (this.model.lineItems[i].poLineID == 0) {
                    const poInsertItem = await axios.post("api/PO/InsertPOLine", this.model.lineItems[i], this.model.po.entCode);
                    console.log('po inserted', poInsertItem);
                } else {
                    const poUpdateItem = await axios.put("api/PO/UpdatePOLine", this.model.lineItems[i]);
                    console.log('po updated', poUpdateItem);
                }
            }

        }

        //Save PO

        this.notification.ShowNotification("Save Success!", "PO Inserted Successfully", "success");

        document.body.classList.toggle("wait");
        this.PublishButton.classList.remove('running');
        this.PublishButton.disabled = false;
    }

    private CurrencyFields() {

        $("#originalPOAmt").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });


        $("#subtotal").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });

        $("#poshipping").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });

        $("#poTax").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });


        $("#poTotalEx").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });

        $("#poOriginalPO").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false
        });

        $("#totalPO").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });

        $("#amtToDate").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });


        $("#balance").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });


        $(".poLineItemAF").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });



    }

    private CreateNote(note: any): HTMLDivElement {
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

    private RenderButtons() {

        //Init Tables
        this.GeneralViewButton = document.querySelector("#general-view-btn") as HTMLButtonElement;
        this.GeneralViewButton.addEventListener("click", () => {
            $("#general-view-btn").parent().addClass("active");
            $("#detail-view-btn").parent().removeClass("active");
            $(".detail-pane").hide();
        });

        this.DetailViewButton = document.querySelector("#detail-view-btn") as HTMLButtonElement;
        this.DetailViewButton.addEventListener("click", () => {
            $("#general-view-btn").parent().removeClass("active");
            $("#detail-view-btn").parent().addClass("active");
            $(".detail-pane").show().slideDown();
        });

        this.PublishButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.PublishButton.addEventListener("click", async (evt) => {
            this.Save();
        });
    }

    private setExistingPOValues() {

        var po = this.model.po;

        console.log(po);

        if (po.projectID != 0) {
            $("#projectID").data("kendoComboBox").value(po.projectID);
            $("#projectID").data("kendoComboBox").trigger("change");
            $("#quoteCO").data("kendoComboBox").trigger("change");
            $("#originalPO").data("kendoComboBox").value(po.originalPO);
            $("#originalPO").data("kendoComboBox").trigger("change");
        }
           

        if (po.quoteCOID != 0) {
            $("#quoteCO").data("kendoComboBox").value(po.quoteCOID);
            $("#quoteCO").data("kendoComboBox").trigger("change");
        }

        $("#poDate").val(Utilities.FormatDateString(po.poDate));

        //Requested By Field
        $("#requestedBy").val(po.requestedBy);

        //Requsition # Field
        $("#reqNo").val(po.reqNo);

        //Original PO
        $("#originalPO").val(po.originalPO);

        $("#workStartDate").data("kendoDatePicker").value(Utilities.FormatDateString(po.workStartDate));
        $("#workCompleteDate").data("kendoDatePicker").value(Utilities.FormatDateString(po.workCompleteDate));

        $("#terms").data("kendoComboBox").value(po.terms);
        $("#service").data("kendoComboBox").value(po.service);
        $("#type").data("kendoComboBox").value(po.type);
        $("#status").data("kendoComboBox").value(po.status);


     

        $("#originalPOAmt").data("kendoNumericTextBox").value(po.originalPOAmount);



        $("#perComplete").val(po.perComplete);

        $("#vendorContact").data("kendoComboBox").value(this.model.po.vendorContactID);


        //Side Pane
        $("#poshipping").data("kendoNumericTextBox").value(this.model.po.shippingAmount);
        $("#poTax").data("kendoNumericTextBox").value(this.model.po.taxAmount);
        $("#totalPO").data("kendoNumericTextBox").value(this.model.po.total);
        $("#amtToDate").data("kendoNumericTextBox").value(this.model.amtInvToDate);

        var subTotal = this.model.lineItems.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.cost;
        }, 0);

        $("#subtotal").data("kendoNumericTextBox").value(Utilities.Float2Currency(subTotal));


        var totalEx = subTotal + this.model.po.shippingAmount + this.model.po.taxAmount;
        $("#poTotalEx").data("kendoNumericTextBox").value(Utilities.Float2Currency(totalEx));


        var totalPO = totalEx + this.model.po.originalPOAmount;
        $("#totalPO").data("kendoNumericTextBox").value(Utilities.Float2Currency(totalPO));


        var balance = totalPO + this.model.amtInvToDate;
        $("#balance").data("kendoNumericTextBox").value(Utilities.Float2Currency(balance));
    }
}


