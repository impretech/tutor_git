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

        let backButton = document.querySelector(".back-button") as HTMLDivElement;

        if (backButton != null) {
            backButton.addEventListener("click", async (evt) => {
                evt.preventDefault();

                window.location.href = "/PurchaseOrder/";
            });
        }
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
                { field: "poID", title: "PO #" },
                { field: "vendorName", title: "Vendor" },
                { field: "projectTitle", title: "Project" },
                { field: "quoteCOID", title: "Quote\CO" },
                { field: "originalPO", title: "Original PO #" },
                { field: "vendorPOAmount", title: "Original PO Amount", template: '#= kendo.toString(total, "c") #' },
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

    private data: any;
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
    private categoriesDataSource: any;

    private codeDropDownEditor: any;
    private itemFieldEditor: any;
    private dateDropDownEditor: any;
    private onSchSwitchEditor: any;
    private unitDropDownEditor: any;


    private GeneralViewButton: HTMLSpanElement;
    private DetailViewButton: HTMLSpanElement;
    private FundingSumaryDetailButton: HTMLSpanElement;
    private QuoteDetailButton: HTMLSpanElement;
    private PublishButton: HTMLButtonElement;
    private ActionButton: HTMLButtonElement;
    private CancelButton: HTMLButtonElement;
    private CreateExtensionButton: HTMLButtonElement;
    private notification: Notification;
    private IsDirty: Boolean;
    private originalTotal: any;
    private extensionTotal: any;
    private poTotal: any;
    private IsDirtyExtension: Boolean;
    private currentPoGroupID: any;


    private newLineItem = {
        "category": '',
        "catDescription": '',
        "fundBalance": 0,
        "poLineID": 0,
        "poID": 0,
        "projectID": 0,
        "order": 1,
        "code": '',
        "availFunds": 0,
        "price": 0,
        "cost": 0,
        "vendorPartNo": '',
        "description": '',
        "unit": 'ea',
        "quantity": 0,
        "vendDelvDate": "0001-01-01T00:00:00",
        "requiredByDate": "0001-01-01T00:00:00",
        "onSched": false,
        "perComplete": 0,
        "poGroupID": null
    }

    private newPoGroup = {
        //  "POGroupID": null,
        "poID": 0,
        "itemType": "QUOTE",
        "itemID": 0,
        "type": "INIT",
        "order": 1,
        "status": "PENDING",
        "enteredDate": "2019-01-01T00:00:00",
        "approvDate": "2019-01-01T00:00:00",
        "itemDate": "2019-01-01T00:00:00"
    }

    constructor(data: any) {

        this.model = data;
        this.data = data;
        this.IsDirty = false;
        console.log('data', data);
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

        await this.DrawDetails(this.model.lineItems);
        await this.DrawExtDetails();
        await this.Init_Sumarry();
        //this.init_newLineItem(this.model.lineItems);

        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
        }

        $("input").change(() => {
            this.IsDirty = true;
            console.log('input change');

            // Validation Check for Required fields
            if ($("#projectID").data("kendoComboBox").value() != ''
                && $("#accountNo").val() != ''
                && $("#service").val() != ''
                && $("#poDate").val() != ''
                && $("#quoteCO").val() != ''
                //&& $("#type").val() != ''
            ) {
                this.PublishButton.disabled = false;
                this.ActionButton.disabled = false;
            }
            else {
                this.PublishButton.disabled = true;
                this.ActionButton.disabled = true;
            }

            console.log($('#extQuoteCo').val())
            if ($('#extQuoteCo').val() != '' && this.model.po.status == 'Complete') {
                $("#newExt-button").prop('disabled', false);

            } else {
                $("#newExt-button").prop('disabled', true);
            }

        })
    }

    private pre_init() {

        if (this.model.po.entCode == null)
            this.model.po.entCode = 'PRO1';

        this.poLineItemDataArray = kendo.observable({
            data: this.model.lineItems
        });

    }

    private post_init() {
        if (this.model.po.poID != 0) {
            this.setExistingPOValues();
        } else {
            this.initSummaryTotal();
        }
    }

    public async init_DataSources() {

        //const detailDelete = await axios.delete("api/po/DeletePO?id=1038");
        //await axios.delete("api/po/DeletePO?id=1026");
        //console.log("detali delete", detailDelete);

        this.userDataSource = async () => {
            const user = await axios.get("api/PO/GetCurrentUser");
            return user.data;
        }

        this.projectDataSource = async (entCode: any) => {
            const projects = await axios.get("api/budget/GetProjectsList?entcode=" + entCode);
            return projects.data;
        }
        //this.categoriesDataSource = async (entCode: any) => {
        //    const categories = await axios.get("api/budget/GetCategoriesList?entcode=" + entCode);

        //    return categories.data;
        //}
        //console.log('categories', this.categoriesDataSource);
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
            console.log('PO Line Items:', poLineItemCodes);
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

        console.log('termDataSource', this.termDataSource);

        this.typeDataSource = this.model.lookups.filter(function (lookup) {
            return lookup.prompt == 'Type';
        });

        this.statusDataSource = this.model.lookups.filter(function (lookup) {
            return lookup.prompt == 'Status';
        });

        var lastPoGroup = await axios.get("api/PO/GetLastPOGroup?poid=" + this.model.po.poID);
        if (lastPoGroup.data.length != 0) {
            this.currentPoGroupID = lastPoGroup.data.poGroupID;
        } else {
            this.currentPoGroupID = null;
        }
        console.log("last po group id", lastPoGroup.data.poGroupID);
        console.log("last po group ", lastPoGroup);

    }

    public async init_Components() {


        //var codes = await this.poLineItmDataSource(this.model.po.projectID);
        //this.codeDropDownEditor = function (container, options) {

        //    $('<input required name="' + options.field + '"/>')
        //        .appendTo(container)
        //        .kendoComboBox({
        //            dataTextField: "code",
        //            dataValueField: "code",
        //            dataSource: codes,
        //            template: "#=code # - #=description #",
        //            filter: "contains",
        //            suggest: true,
        //            index: 100,
        //            autoWidth: true
        //        });
        //}

        this.dateDropDownEditor = function (container, options) {


            $('<input required name="' + options.field + '"/>')
                .appendTo(container)
                .kendoDatePicker();
        }

        this.onSchSwitchEditor = function (container, options) {
            $('<input type="checkbox" name="' + options.field + '"/>')
                .appendTo(container)
                .kendoSwitch();
        }

        this.itemFieldEditor = function (container, options) {
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

    private async init_quote(quotes) {
        $("#quoteCO").kendoDropDownList({
            dataTextField: "id",
            dataValueField: "itemID",
            dataSource: quotes,
            // valueTemplate: "#:data.id#-#:data.vendor#-#:data.amount#",
            template: '#:data.id#-#:data.vendor#-#:data.amount#',
            index: 100,
            autoWidth: true,
            change: async (e) => {

                var itemID = e.sender.value();
                const vendorContactId = this.model.po.vendorID;
                console.log(quotes);
                var quote = quotes.filter(function (quoteVal) {
                    return quoteVal.itemID == itemID;
                })[0];



                if (quote == null) {
                    $("#contractNo").val(0);
                    $("#vendor").val('');
                    $("#vendorContact").data("kendoComboBox").value('');
                    $("#vendorContact").data("kendoComboBox").setDataSource(null);
                    $("#vendorAddress").val('');
                    $("#address1").val('');
                    $("#address2").val('');
                    $("#addCity").val('');
                    $("#addState").val('');
                    $("#addZip").val('');

                    return;
                }

                console.log('quote', quote);

                $("#contractNo").val(quote.contractNo);
                $("#vendor").val(quote.vendor);

                var orgGroups = this.model.poGroups.filter(function (poGroup) {
                    return poGroup.type == "INIT";
                })[0];

                console.log('orgGroups', orgGroups);
                if (typeof orgGroups != 'undefined') {
                    orgGroups.itemType = quote.itemType;
                    orgGroups.itemID = parseInt(itemID, 10);
                }


                this.model.po.contractID = quote.contractNo;
                this.model.po.vendorID = quote.vendorID;
                this.model.po.vendorLocationID = quote.locationID;

                var vAddress = await this.vendorAddressDataSource(quote.vendorID);
                var formatted_vAddress = "";
                console.log('vAddress', vAddress)
                if (typeof vAddress.address1 !== 'undefined')
                    formatted_vAddress = formatted_vAddress + vAddress.address1;
                if (typeof vAddress.address2 !== 'undefined')
                    formatted_vAddress += ' ' + vAddress.address2;
                if (typeof vAddress.addCity !== 'undefined')
                    formatted_vAddress += '\n ' + vAddress.addCity;
                if (typeof vAddress.addState !== 'undefined')
                    formatted_vAddress += ' ' + vAddress.addState;
                if (typeof vAddress.addZip !== 'undefined')
                    formatted_vAddress += ' ' + vAddress.addZip;
                //formatted_vAddress = `${vAddress.address1} ${vAddress.address2}\n` +
                //    `${vAddress.addCity}, ${vAddress.addState}, ${vAddress.addZip}`;

                $("#vendorAddress").val(formatted_vAddress);

                var pAddress = await this.projectAddressDataSource(this.model.po.projectID);
                console.log('pAddress', pAddress);
                if (pAddress != null) {
                    var formatted_pAddress = `${pAddress.address1} ${pAddress.address2}\n` +
                        `${pAddress.addCity}, ${pAddress.addState}, ${pAddress.addZip}`;

                    //    console.log('formatted_pAddress', formatted_pAddress);
                    //$("#shipTo").val(formatted_pAddress);
                    $("#address1").val(pAddress.address1);
                    $("#address2").val(pAddress.address2);
                    $("#addCity").val(pAddress.addCity);
                    $("#addState").val(pAddress.addState);
                    $("#addZip").val(pAddress.addZip);

                    this.model.po.shipToLocationID = pAddress.locationID;
                    this.model.po.shipAddress1 = pAddress.address1;
                    this.model.po.shipAddress2 = pAddress.address2;
                    this.model.po.shipCity = pAddress.addCity;
                    this.model.po.shipState = pAddress.addState;
                    this.model.po.shipZip = pAddress.addZip;

                }
                var specialInstruction = await this.projectAddressDataSource(this.model.po.specialInstruction);
                if (specialInstruction != null) {
                    $("#specialInstruction").val(specialInstruction);
                }

                this.model.po.vendorID = quote.vendorID;
                var currentVendorContact = await this.vendorContactDataSource(this.model.po.vendorID);
                console.log('currentVendorContact', currentVendorContact);
                $("#vendorContact").data("kendoComboBox").setDataSource(currentVendorContact);


                console.log('Vcontact ', currentVendorContact);
                var contact = currentVendorContact.filter(function (contact) {
                    return contact.contactID == vendorContactId;
                })[0];
                //var vContact = await this.vendorContactDataSource(quote.vendorID);
                console.log(vendorContactId);
                this.model.po.vendorContactID = vendorContactId;
                console.log('lookup contact', contact)
                var vFullName = '';
                if (typeof contact !== 'undefined') {
                    vFullName = contact.firstName + ' ' + contact.lastName;
                }


                //  console.log('VFull name ', vFullName);
                $("#vendorContact").data("kendoComboBox").value(vFullName);

                this.model.po.quoteCO = quote.id;
                this.model.po.quoteCOID = quote.itemID;
            }
        });
    }

    private async render_PO() {

        console.log('render_PO');
        console.log('projectID', this.model.po.projectID);
        var poLineCats = await axios.get("api/PO/GetPOLineCats?id=" + this.model.po.projectID);
        console.log('poLineCats', poLineCats);
        var poProjectDataSource = await this.projectDataSource(this.model.po.entCode);
        console.log('poProjectDataSource', poProjectDataSource);
        //if(this.model.poGroups.length == 0)
        //    this.model.poGroups = this.newPoGroup;

        console.log('poGroups ', this.model.poGroups);

        $("#projectID").kendoComboBox({
            dataTextField: "title",
            dataValueField: "projectId",
            dataSource: poProjectDataSource,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                var value = e.sender.value();
                if (value != "")
                    this.model.po.projectID = parseInt(value, 10);
                else
                    this.model.po.projectID = 0;

                var accountNo = await axios.get("api/PO/GetAccountNo?proj=" + this.model.po.projectID);
                $("#accountNo").val(accountNo.data);
                this.model.po.accountNo = accountNo.data;

                var currentQuotes = await axios.get("api/PO/GetQuoteCOs?id=" + this.model.po.projectID);

                this.init_quote(currentQuotes.data);
                //$("#quoteCO").data("kendoDropDownList").setDataSource(currentQuotes.data);
                //$("#quoteCO").data("kendoDropDownList").value('');
                //$("#quoteCO").data("kendoDropDownList").trigger("change");

                $("#extQuoteCo").data("kendoDropDownList").setDataSource(currentQuotes.data);
                $("#extQuoteCo").data("kendoDropDownList").value('');
                $("#extQuoteCo").data("kendoDropDownList").trigger("change");
                $("#newExt-button").prop('disabled', true);

                var currentPoList = await this.poDataSource(this.model.po.projectID);
                //$("#vendorPO").data("kendoComboBox").setDataSource(currentPoList);
            }
        });

        $("#accountNo").on('change', (e) => {
            var val = $("#requestedBy").val();
            this.model.po.accountNo = val;
            console.log(this.model.po.requestedBy);
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
        var quotes = await this.quoteDataSource(this.model.po.projectID);
        console.log('qutoes', quotes)

        this.init_quote(quotes);
        var extGroups = this.model.poGroups.filter(function (poGroup) {
            return poGroup.type == "EXT";
        });


        var extCounter = 1;
        console.log("extGroups length", extGroups)
        if (typeof extGroups !== 'undefined')
            extCounter = extGroups.length + 1;
        var newExtCounter = extCounter + "";
        $("#extensionID").html(newExtCounter);

        $("#extQuoteCo").kendoDropDownList({
            dataTextField: "id",
            dataValueField: "id",
            dataSource: quotes,
            // valueTemplate: "#:data.id#-#:data.vendor#-#:data.amount#",
            template: '#:data.id#-#:data.vendor#-#:data.amount#',
            index: 100,
            autoWidth: true,
            change: async (e) => {

                var id = e.sender.value();


                const vendorContactId = this.model.po.vendorID;

                var quote = quotes.filter(function (quoteVal) {
                    return quoteVal.id == id;
                })[0];
                console.log(quote);
                if (typeof quote != 'undefined') {
                    this.newPoGroup.itemID = quote.itemID;
                    this.newPoGroup.itemType = quote.itemType;
                }

                //this.model.po.quoteCO = quote.id;
                //this.model.po.quoteCOID = quote.itemID;
            }
        });

        $("#exempt").on('change', (e) => {
            var val = $("#exempt").val();
            if (val != null)
                this.model.po.exempt = val;
            else
                this.model.po.exempt = "";


            console.log(this.model.po.exempt);
        });

        $("#status").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: this.statusDataSource,
            filter: "contains",
            suggest: true,
            index: 0,
            change: async (e) => {
                this.model.po.status = e.sender.value();

                var orgGroups = this.model.poGroups.filter(function (poGroup) {
                    return poGroup.type == "INIT";
                })[0];
                if (typeof orgGroups != 'undefined') {
                    orgGroups.status = e.sender.value();
                }

            }
        });

        // PO Date Field when its value change
        $("#poDate").kendoDatePicker({
            change: async (e) => {
                this.model.po.poDate = e.sender.value();

                console.log(this.model.po.poDate);
            }
        });
        //var todayDate = kendo.toString(kendo.parseDate(new Date()), 'MM/dd/yyyy');
        if (this.model.po.poDate != "0001-01-01T00:00:00")
            $("#poDate").data("kendoDatePicker").value(this.model.po.poDate);
        else {
            $("#poDate").data("kendoDatePicker").value(new Date());
            this.model.po.poDate = $("#poDate").val();
        }

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
            var perComplete = $("#perComplete").val();
            //parseInt(val, 10)
            console.log(perComplete)
            this.model.po.perComplete = perComplete;
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
                console.log('workCompleteDate', this.model.po.workCompleteDate);
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

        $("#vendorPO").change(async (e) => {
            var value = $("#vendorPO").val();
            this.model.po.vendorPO = value;
        })


        $("#vendorContact").kendoComboBox({
            dataTextField: "showAsName",
            dataValueField: "contactID",
            dataSource: await this.vendorContactDataSource(this.model.po.vendorID),
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                var value = e.sender.value();

                console.log('contactID', value);
                if (value != "")
                    this.model.po.vendorContactID = parseInt(value, 10);
                else
                    this.model.po.vendorContactID = 0;

                var orgPOAmount = $("#vendorPOAmt").val();
                var y = +orgPOAmount;

                if (orgPOAmount != "")
                    this.model.po.vendorPOAmount = y;
                else
                    this.model.po.vendorPOAmount = 0;
                //this.model.po.vendorPOAmount = $("#vendorPOAmt").val();
            }
        });
        $("#quoteCO").data('kendoDropDownList').value('');
        ///$("#vendorPO").prop("disabled", true);

        if (this.model.po.workStartDate != "0001-01-01T00:00:00")
            $("#workStartDate").data("kendoDatePicker").value(this.model.po.workStartDate);
        else {
            $("#workStartDate").data("kendoDatePicker").value(new Date());
            this.model.po.workStartDate = $("#workStartDate").val();
        }

        if (this.model.po.workCompleteDate != "0001-01-01T00:00:00")
            $("#workCompleteDate").data("kendoDatePicker").value(this.model.po.workCompleteDate);
        else {
            $("#workCompleteDate").data("kendoDatePicker").value(new Date());
            this.model.po.workCompleteDate = $("#workCompleteDate").val();
        }

        var quoteCo = this.model.po.quoteCO;
        if (quoteCo != "") {
            $("#org_QuoteCoNo").html(quoteCo);
            $("#org_TotalQuoteCoNo").html(quoteCo);
        }
        else {
            $("#org_QuoteCoNo").html("");
            $("#org_TotalQuoteCoNo").html("");
        }


        $("#org_itemDate").kendoDatePicker({
            change: async (e) => {
                console.log(e.sender.value());
            }
        });

        $("#org_approvedDate").kendoDatePicker({
            change: async (e) => {
                console.log(e.sender.value());
            }
        });

        $("#ext_itemDate").kendoDatePicker({
            change: async (e) => {
                console.log(e.sender.value());
            }
        });

        $("#ext_approvedDate").kendoDatePicker({
            change: async (e) => {
                console.log(e.sender.value());
            }
        });
        //Extension form initialize
        var statusDropdownList = $("#extQuoteCo").data("kendoDropDownList");
        //statusDropdownList.enable(false);
        if (this.model.po.status == 'Complete') {
            statusDropdownList.enable(true);
            console.log(`extCO`, statusDropdownList.value())
            if (statusDropdownList.value() != '')
                $("#newExt-button").prop('disabled', false);
            else
                $("#newExt-button").prop('disabled', true);
            $('#org_itemDate').data('kendoDatePicker').enable(false);
            $('#org_approvedDate').data('kendoDatePicker').enable(false);
            $("#addOrgDetailBtn").prop('disabled', true);

            //$('.ext-detail-data .ext_itemDate').data('kendoDatePicker').enable(true);
            //$('.ext_approvedDate').data('kendoDatePicker').enable(true);
            //$(".addExtDetailBtn").prop('disabled', false);
        } else {
            statusDropdownList.enable(false);
            $("#newExt-button").prop('disabled', true);
            $('#org_itemDate').data('kendoDatePicker').enable(true);
            $('#org_approvedDate').data('kendoDatePicker').enable(true);
            $("#addOrgDetailBtn").prop('disabled', false);

            //$('.ext_itemDate').data('kendoDatePicker').enable(false);
            //$('.ext_approvedDate').data('kendoDatePicker').enable(false);
            //$(".addExtDetailBtn").prop('disabled', true);

        }
    }

    private async DrawExtDetails() {
        $(".detail-pane .ext-detail-data").html("");

        var selectCode = "";
        var codeTootip = "";
        var lineItems = this.model.lineItems;
        var extTotalSum = 0;
        
        var entireTotal = 0;

        var codes = await this.poLineItmDataSource(this.model.po.projectID);
        var extPoGroup = this.model.poGroups.filter(function (poGroup) {
            return poGroup.type == "EXT";
        });


        extPoGroup.forEach((group, index) => {
            var extLineItems = lineItems.filter(function (lineItem) {
                return lineItem.poGroupID == extPoGroup[index].poGroupID;
            });
            var detailSubTotal = 0;



            let content =
                `<div class="extPoGroup" poGroupID="${extPoGroup[index].poGroupID}">
                     <div class="title" style="min-width:1037px; display:flex;" ">
                        <div style="width:200px; display:inline;">
                            Quote/CO#: <label class="ext_QuoteCoNo">${extPoGroup[index].itemID}</label> (Extended)
                        </div>
                        <span style="display:inline;">
                           Add Items<button class="addExtDetailBtn detail-add-btn btn-1" class="detail-add-btn btn-1">+</button>
                        </span>
                    </div>
                    <table class="itemlist" cellspacing="0" poGroupID="${extLineItems.poGroupID}">
                        <tbody>`;

            extLineItems.forEach((lineItem, lindex) => {
                if (lineItem.fundBalance < 0)
                    lineItem.fundBalance = 0;
                if (lineItem.availFunds < 0)
                    lineItem.availFunds = 0;

                selectCode = codes.filter(function (codeitem) {
                    return codeitem.code == lineItem.code;
                })[0];
                console.log(selectCode)
                if (typeof selectCode != 'undefined')
                    //console.log(selectCode['description'])
                    codeTootip = lineItem.code + " - " + selectCode['description'];
                else
                    codeTootip = "";

                content += `<tr class="detail-row" detailid="${lineItem.poLineID}">
                            <td style='min-width:35px' class='center detail-lineId'>${lineItem.order}</td>
                            <td style='width:140px'>
                                <input class="detail-cat" value='${lineItem.category}'/>
                                <span class="detail-code-body">
                                    <input class="detail-code" style="width: 140px !important;"  value='${lineItem.code}' title='${codeTootip}'/>
                                </span>
                            </td>                            
                            <td style='width:120px;flex:1;'>
                                <input class="detail-vendorno" value='${lineItem.vendorPartNo}' />
                                <input class="detail-desc" title="${lineItem.description}"  value='${lineItem.description}'/>
                            </td>
                            <td style='width:100px; text-align: right;'>
                                <div class="detail-avail-funds" >`+ Utilities.Float2Currency(lineItem.availFunds) + `</div>
                            </td>
                            <td style="width: 90px;text-align:right;">
                                    <input class="number detail-qty" style="margin-top: -3px; margin-right: 0px;" value="${lineItem.quantity}"/>
                                    <br/><input class="detail-unit" value='${lineItem.unit}' style=" margin-top: -3px; " />
                            </td>
                            <td style='width:110px'>
                                x<input class="detail-price" style="text-align:right; margin: -3px 0 0 2px; width: calc(100% - 10px) !important;" value='${lineItem.price}' />
                            </td>
                            <td style='width:90px; text-align:right;'><div class="detail-cost" >`+ Utilities.Float2Currency(lineItem.cost) + `</div></td>
                            <td style='width:90px;text-align:right;'><div  class="detail-fund-balance">`+ Utilities.Float2Currency(lineItem.fundBalance) + `</div></td>
                            <td style='width:110px'>
                                <input class="detail-ven-date" value='${lineItem.vendDelvDate}' />
                                <input class="detail-req-date" value='${lineItem.requiredByDate}' />
                            </td>
                            <td style='width:80px;text-align:center;'>
                                <input class='number detail-percomplete' style="margin-top:-2px;" value='${lineItem.perComplete}' />
                                <span class="schedSwitchBox"><input type="checkbox" class="sched-switch" /></span>
                            </td>                            
                            <td  style="text-align:center;"><span class="detail-menu"><i class="fa fa-bars"></i></span></td>
                        </tr>
                            `;

                detailSubTotal += lineItem.cost;

            })

            content += `</tbody>
                </table>`;

            //Each Po Group footer
            content += `<table class="footer" cellspacing="0" style="border:solid 1px #a09999; background-color:#c8e3c1;color:black;font-weight: bold;">
                            <thead>
                                <tr>
                                    <td style='min-width:175px;text-align:left;'>
                                        &nbsp;Date item entered:&nbsp;
                                        <label class="ext_itemEnterDate">2019-11-18</label>&nbsp;
                                    </td>
                                    <td style="width:310px;flex:1;text-align:left;" colspan="">
                                        Date of item:&emsp;&emsp;&emsp;&nbsp;
                                        <input type="text" class="ext_itemDate" value="2019-11-18" style="max-width:110px;" />
                                        <br />
                                        Date item approved:
                                        <input type="text" class="ext_approvedDate" value="2019-11-18" style="max-width:110px;" />                                   
                                    </td>
                                    <td style="width:110px;text-align:right;">
                                        Total:<br />
                                        Quote/CO#:<label id="org_TotalQuoteCoNo"></label>
                                        <label class="detail-tail-quoteco">${extPoGroup[index].itemID}</label>
                                    </td>
                                    <td style="width:90px">
                                        <span class="detail-subtotal">${kendo.toString(detailSubTotal, "c")}</span>
                                    </td>
                                    <td style="width:90px">
                                        
                                    </td>
                                    <td style="width:110px;text-align:center;">    
                                    </td>
                                    <td style="width:80px;text-align:center;" title="">                                        
                                    </td>                            
                                    <td style=""></td>
                                </tr>
                            </thead>
                        </table></div>`;

            // $("#detail-subtotal").html(Utilities.Float2Currency(detailSubTotal));
            $(".detail-pane .ext-detail-data").append(content);

            extTotalSum += detailSubTotal;
            this.extensionTotal = extTotalSum;
            console.log("Extension Total", extTotalSum);
            entireTotal = this.originalTotal + this.extensionTotal;
            console.log("Original Total", this.originalTotal);
            this.poTotal = entireTotal;

        });

        console.log("Entire Total", entireTotal);
        $("#detail-totalPO").html(Utilities.Float2Currency(entireTotal));

        $(".addExtDetailBtn").click(async (e) => {
            let row = $(e.target).closest('.extPoGroup');
            let poGroupID = row.attr("poGroupID");
            console.log("poGroupID", poGroupID);

            //return;
            //let detail = this.data.details.budDetails.find(item => {
            //    return item.budgetDetailID == poGroupID
            //})

            console.log('click extension add button');
            var item = this.newLineItem;
            item.poID = this.model.po.poID;
            item.poGroupID = poGroupID;
            var todayDate = (new Date()).toISOString();
            var lastPoGroup = await axios.get("api/PO/GetLastPOGroup?poid=" + this.model.po.poID);

            //if (lastPoGroup.data.length != 0) {
            //    this.currentPoGroupID = lastPoGroup.data.poGroupID;
            //    if (lastPoGroup.data.type != "EXT") {
            //        item.poGroupID = this.AddExtension();
            //    } else {
            //        item.poGroupID = lastPoGroup.data.item.poGroupID;
            //    }
            //} 

            console.log("final poID", item.poID);
            console.log("final PoGId ", item.poGroupID);
            item.projectID = this.model.po.projectID;
            item.requiredByDate = todayDate;
            item.vendDelvDate = todayDate;

            var orderList = [];

            //iterate through object keys
            this.model.lineItems.forEach(function (item) {
                //get the value of name
                var val = item.order
                //push the name string in the array
                orderList.push(val);
            });

            var maxOrder = 0;
            console.log(orderList);
            if (orderList.length != 0) {
                maxOrder = orderList.reduce((a, b) => { return a > b ? a : b; });
            }

            item.order = maxOrder + 1;
            console.log("before POLine", item);
            const detailInsert = await axios.post("api/po/InsertPOLine", item, this.model.po.entCode)
            console.log("after POLine", detailInsert);
            this.model.lineItems.push(detailInsert.data)
            //this.InsertDetailRow(item);
            this.DrawExtDetails(); 

        });
        this.InitExtDetails()
    }

    private async InitExtDetails() {

        var selectCode = "";
        var codeTootip = "";
        var codes = await this.poLineItmDataSource(this.model.po.projectID);


        var categoryList = codes.reduce(function (memo, e1) {
            var matches = memo.filter(function (e2) {
                return e1.category == e2.category
            })
            if (matches.length == 0)
                memo.push(e1)
            return memo;
        }, []);

        $(".ext_itemDate").kendoDatePicker({
            change: async (e) => {

                var newItemDate = e.sender.value().toISOString();
                let row = $(e.sender.element).closest('.extPoGroup');
                let detailid = row.attr("pogroupid");
                console.log(detailid);
                //  let row = $(e.sender.element).closest('tr');
                //$(e.sender.element).data("kendoDatePicker").value(new Date());
                //var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));
                //this.model.lineItems[objIndex].vendDelvDate = newVenDate;

                //var venDelDateList = [];
                //this.model.lineItems.forEach(function (item) {
                //    //get the value of name
                //    var val = item.vendDelvDate
                //    //push the name string in the array
                //    venDelDateList.push(val);
                //});

                //var maxVenDelDate = venDelDateList.reduce((a, b) => { return a > b ? a : b; });
                //$("#workCompleteDate").val(Utilities.FormatDateString(maxVenDelDate));
                //this.updateExtDetailRow(e);
            }
        });

        $(".ext_approvedDate").kendoDatePicker({
            change: async (e) => {
                var newItemDate = e.sender.value().toISOString();
                let row = $(e.sender.element).closest('.extPoGroup');
                let detailid = row.attr("pogroupid");

                console.log(detailid);
                let detail = this.model.poGroups.find(item => {
                    return item.poGroupID == detailid
                })
                detail.approvDate = newItemDate;
                console.log('before update', detail);
                const poGroupUpdate = await axios.put("api/PO/UpdatePOGroups", detail);
                console.log('after udpate', poGroupUpdate);
            }
        });

        $(".ext-detail-data .detail-code").kendoDropDownList({
            dataTextField: "code",
            dataValueField: "code",
            dataSource: codes,
            valueTemplate: "#:data.code#-#:data.description#",
            template: '#:data.code#-#:data.description#',
            index: -1,
            autoWidth: true,
            change: async (e) => {

                var curcode = e.sender.value();
                var selectCode = codes.filter(function (codeitem) {
                    return codeitem.code == curcode;
                })[0];

                let row = $(e.sender.element).closest('.detail-row');
                let detailid = row.attr("detailid");
                let detail = this.model.lineItems.find(item => {
                    return item.poLineID == detailid
                })
                codeTootip = curcode + " - " + selectCode['description'];
                row.find(".detail-code").attr('title', codeTootip);
                if (selectCode.availFunds < 0)
                    selectCode.availFunds = 0;
                row.find(".detail-avail-funds").html(Utilities.Float2Currency(selectCode.availFunds));
                this.updateExtDetailRow(e);
            }
        });

        $(".ext-detail-data .detail-cat").kendoComboBox({
            dataTextField: "category",
            dataValueField: "category",
            dataSource: categoryList,
            filter: "contains",
            suggest: true,
            index: -1,
            autoWidth: true,
            change: async (e) => {
                var curCat = e.sender.value();
                var relatedCodes = codes.filter(function (obj) {
                    return (obj.category === curCat);
                });

                let row = $(e.sender.element).closest('.detail-row');

                console.log('relatedCodes', relatedCodes)
                await this.updateExtDetailRow(e); 
                var codeBody = row.find(".detail-code").closest('.detail-code-body');
               // console.log('td span', td); return;

                codeBody.html('');
                codeBody.append(`<input class="detail-code" style="width: 140px !important;" value=''/>`);
                
                
                //codeTootip = curcode + " - " + selectCode['description'];
                //row.find(".detail-code").attr('title', codeTootip);
                
                row.find(".detail-code").kendoDropDownList({
                    dataTextField: "code",
                    dataValueField: "code",
                    dataSource: relatedCodes,
                    valueTemplate: "#:data.code#-#:data.description#",
                    template: '#:data.code#-#:data.description#',
                    index: -1,
                    autoWidth: true,
                    change: async (e) => {

                        var curcode = e.sender.value();
                        var selectCode = codes.filter(function (codeitem) {
                            return codeitem.code == curcode;
                        })[0];

                        let row = $(e.sender.element).closest('.detail-row');
                        let detailid = row.attr("detailid");
                        let detail = this.model.lineItems.find(item => {
                            return item.poLineID == detailid
                        })
                        codeTootip = curcode + " - " + selectCode['description'];
                        row.find(".detail-code").attr('title', codeTootip);
                        if (selectCode.availFunds < 0)
                            selectCode.availFunds = 0;
                        row.find(".detail-avail-funds").html(Utilities.Float2Currency(selectCode.availFunds));
                        this.updateExtDetailRow(e);
                    }
                });

               
            }
        });

        $(".ext-detail-data .detail-qty").kendoNumericTextBox({
            min: 0,
            format: "#",
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                console.log(e.sender.value());
                await this.updateExtDetailRow(e);

            }
        });

        $(".ext-detail-data .detail-price").kendoNumericTextBox({
            min: 0,
            decimals: 1,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                console.log(e.sender.value());
                console.log("origin e body", e)
                await this.updateExtDetailRow(e);

            }
        });

        $(".ext-detail-data .detail-ven-date").kendoDatePicker({
            change: async (e) => {

                var newVenDate = e.sender.value().toISOString();
                let row = $(e.sender.element).closest('tr');
                let detailid = row.attr("detailid");
                var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));
                this.model.lineItems[objIndex].vendDelvDate = newVenDate;

                var venDelDateList = [];
                this.model.lineItems.forEach(function (item) {
                    //get the value of name
                    var val = item.vendDelvDate
                    //push the name string in the array
                    venDelDateList.push(val);
                });

                var maxVenDelDate = venDelDateList.reduce((a, b) => { return a > b ? a : b; });
                $("#workCompleteDate").val(Utilities.FormatDateString(maxVenDelDate));
                this.updateExtDetailRow(e);
            }
        });

        $(".ext-detail-data .detail-req-date").kendoDatePicker({
            change: async (e) => {

                console.log('reqdate', e.sender.value());
                this.updateExtDetailRow(e);
            }
        });

        $(".ext-detail-data .detail-percomplete").kendoNumericTextBox({
            format: "# \\%",
            min: 0,
            max: 100,
            step: 1,
            change: async (e) => {

                var newPerComplete = e.sender.value();
                let row = $(e.sender.element).closest('tr');
                let detailid = row.attr("detailid");
                var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));

                this.model.lineItems[objIndex].perComplete = newPerComplete;

                var perCompleteList = [];
                //iterate through object keys
                this.model.lineItems.forEach(function (item) {
                    //get the value of name
                    var val = item.perComplete / 1;
                    //push the name string in the array
                    perCompleteList.push(val);
                });

                var avgPerComplete = perCompleteList.reduce((a, b) => a + b) / perCompleteList.length;
                var round_avgPerComplete = avgPerComplete.toFixed(0);
                $("#perComplete").val(round_avgPerComplete);
                this.updateExtDetailRow(e);
            }
        });

        $(".ext-detail-data .detail-vendorno").change(async (e) => {
            this.updateExtDetailRow(e, 1);
        })

        $(".ext-detail-data .detail-desc").change(async (e) => {
            this.updateExtDetailRow(e, 1);
        })
        //var todayDate = kendo.toString(kendo.parseDate(new Date()), 'MM/dd/yyyy');toISOString();
        //$("#poDate").data("kendoDatePicker").value(new Date());
        $(".ext-detail-data .detail-row input").change(async (e) => {

        });

        $(".ext-detail-data input").focus((e) => {
            $(e.target).closest('tr').addClass("editing");
        });

        $(".ext-detail-data  input").focusout((e) => {
            $(e.target).closest('tr').removeClass("editing");
        });

        $(".ext-detail-data  input.k-input").focus((e) => {
            console.log($(e.target).parent().parent())
            $(e.target).closest('tr').addClass("editing");
        });

        $(".ext-detail-data  input.k-input").focusout((e) => {
            $(e.target).closest('tr').removeClass("editing");
        });


        $(".ext-detail-data .detail-unit").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "ea"
                },
            ],
            filter: "contains",
            suggest: true,
            index: 100,
            change: (e) => {
                this.updateExtDetailRow(e);
            }
        });

        $(".ext-detail-data .sched-switch").kendoSwitch({
            checked: false,
            change: (e) => {

                console.log(e.checked);

            }
        });

        $(".ext-detail-data .categories input").focusout(async (e) => {
            console.log('category change');
            //this.model.po.shippingAmount = $("#poshipping").data("kendoNumericTextBox").value();
            //this.model.po.taxAmount = $("#poTax").data("kendoNumericTextBox").value();
            //this.update_Total();
        });

        $(".ext-detail-data .detail-menu").kendoMenu({
            dataSource: [
                {
                    text: ``,
                    cssClass: "detail-menu-icon",
                    expanded: false,
                    items: [
                        //{
                        //    text: "Add note",
                        //    cssClass: "detail-move"
                        //},
                        {
                            text: "Delete",
                            cssClass: "detail-delete"
                        }
                    ]
                },
            ]
        });

        $(".ext-detail-data .detail-delete").click(async (e) => {
            if (!window.confirm("Are you sure to delete the detail?"))
                return false;

            document.body.classList.toggle("wait");
            var perCompleteList = [];
            //iterate through object keys
            this.model.lineItems.forEach(function (item) {
                //get the value of name
                var val = item.perComplete / 1;
                //push the name string in the array
                perCompleteList.push(val);
            });

            let tr = $(e.target).closest('tr');
            let detail_id = tr.attr("detailid");
            const detailDelete = await axios.delete("api/PO/DeletePOLine?id=" + detail_id + "&entcode=" + this.model.po.entcode);

            let detail = this.model.lineItems.find((item) => {
                return item.poLineID == detail_id;
            })

            let poLineID = detail.poLineID;
            this.model.lineItems.map((detail, index) => {
                if (detail.poLineID == detail_id) {
                    this.model.lineItems.splice(index, 1)
                }
            })
            let offset = - detail.quantity * detail.price;

            this.DeleteDetailRow(detail, offset);
            document.body.classList.toggle("wait");
        });
        if (this.model.po.status == 'Complete') {

            $('input.ext_itemDate').data('kendoDatePicker').enable(true);
            $('input.ext_approvedDate').data('kendoDatePicker').enable(true);
            $(".addExtDetailBtn").prop('disabled', false);
        } else {
            $('input.ext_itemDate').data('kendoDatePicker').enable(false);
            $('input.ext_approvedDate').data('kendoDatePicker').enable(false);
            $(".addExtDetailBtn").prop('disabled', true);
        }
    }

    private async DrawDetails(lineItems) {

        $(".detail-pane .detail-data").html("");
        var detailSubTotal = 0;
        let content = `
                <table class="itemlist" cellspacing="0" budcatid="">
                    <tbody>`;
        var selectCode = "";
        var codeTootip = "";
        var codes = await this.poLineItmDataSource(this.model.po.projectID);
        //var poGroups = this.model.poGroups;


        var orgPoGroup = this.model.poGroups.filter(function (poGroup) {
            return poGroup.type == "INIT";
        });
        var orgLineItems;
        var lineItems = this.model.lineItems;
        console.log("orgPOGroup", orgPoGroup);
        if (orgPoGroup.length != 0) {

            orgLineItems = lineItems.filter(function (lineItem) {
                return lineItem.poGroupID == orgPoGroup[0].poGroupID;
            });

            console.log("org lineItems", orgLineItems);
            orgLineItems.forEach((item, index) => {
                if (item.fundBalance < 0)
                    item.fundBalance = 0;
                if (item.availFunds < 0)
                    item.availFunds = 0;
                //<td style='width:60px;'><span class="detail-cat-desc" title="${item.catDescription}">${item.catDescription}</span></td>
                selectCode = codes.filter(function (codeitem) {
                    return codeitem.code == item.code;
                })[0];
                console.log(selectCode)
                if (typeof selectCode != 'undefined')
                    //console.log(selectCode['description'])
                    codeTootip = item.code + " - " + selectCode['description'];
                else
                    codeTootip = "";

                content += `<tr class="detail-row" detailid="${item.poLineID}">
                            <td style='min-width:35px' class='center detail-lineId'>${item.order}</td>
                            <td style='width:140px'>
                                <input class="detail-cat" value='${item.category}'/>
                                <span class="detail-code-body">
                                    <input class="detail-code" style="width: 140px !important;"  value='${item.code}' title='${codeTootip}'/>
                                </span>
                            </td>                            
                            <td style='width:120px;flex:1;'>
                                <input class="detail-vendorno" value='${item.vendorPartNo}' />
                                <input class="detail-desc" title="${item.description}"  value='${item.description}'/>
                            </td>
                            <td style='width:100px; text-align: right;'>
                                <div class="detail-avail-funds" >`+ Utilities.Float2Currency(item.availFunds) + `</div>
                            </td>
                            <td style="width: 90px;text-align:right;">
                                    <input class="number detail-qty" style="margin-top: -3px; " value="${item.quantity}"/>
                                    <input class="detail-unit" value='${item.unit}' />
                            </td>
                            <td style='width:110px'>
                                x<input class="detail-price" style="text-align:right; margin: -3px 0 0 2px; width: calc(100% - 10px) !important; " value='${item.price}' />
                            </td>
                            <td style='width:90px; text-align:right;'><div class="detail-cost" >`+ Utilities.Float2Currency(item.cost) + `</div></td>
                            <td style='width:90px;text-align:right;'><div  class="detail-fund-balance">`+ Utilities.Float2Currency(item.fundBalance) + `</div></td>
                            <td style='width:110px'>
                                <input class="detail-ven-date" value='${item.vendDelvDate}' />
                                <input class="detail-req-date" value='${item.requiredByDate}' />
                            </td>
                            <td style='width:80px;text-align:center;'>
                                <input class='number detail-percomplete' style="margin-top:-2px;" value='${item.perComplete}' />
                                <span class="schedSwitchBox"><input type="checkbox" class="sched-switch" /></span>
                            </td>
                            
                            <td  style="text-align:center;"><span class="detail-menu"><i class="fa fa-bars"></i></span></td>
                        </tr>`;

                detailSubTotal += item.cost;

            });

        }




        content += `</tbody>
                </table>`;
        this.originalTotal = detailSubTotal;
        console.log("original Total draw ----- ", detailSubTotal);
        $("#detail-subtotal").html(Utilities.Float2Currency(detailSubTotal));
        $(".detail-pane .detail-data").append(content);


        var categoryList = codes.reduce(function (memo, e1) {
            var matches = memo.filter(function (e2) {
                return e1.category == e2.category
            })
            if (matches.length == 0)
                memo.push(e1)
            return memo;
        }, []);

        $(".detail-code").kendoDropDownList({
            dataTextField: "code",
            dataValueField: "code",
            dataSource: codes,
            valueTemplate: "#:data.code#-#:data.description#",
            template: '#:data.code#-#:data.description#',
            index: -1,
            autoWidth: true,
            change: async (e) => {

                var curcode = e.sender.value();
                var selectCode = codes.filter(function (codeitem) {
                    return codeitem.code == curcode;
                })[0];

                let row = $(e.sender.element).closest('.detail-row');
                let detailid = row.attr("detailid");
                let detail = this.model.lineItems.find(item => {
                    return item.poLineID == detailid
                })
                codeTootip = curcode + " - " + selectCode['description'];
                row.find(".detail-code").attr('title', codeTootip);
                if (selectCode.availFunds < 0)
                    selectCode.availFunds = 0;
                row.find(".detail-avail-funds").html(Utilities.Float2Currency(selectCode.availFunds));
                this.updateDetailRow(e);
            }
        });

        $(".detail-cat").kendoComboBox({
            dataTextField: "category",
            dataValueField: "category",
            dataSource: categoryList,
            filter: "contains",
            suggest: true,
            index: -1,
            autoWidth: true,
            change: async (e) => {
                var curCat = e.sender.value();
                var relatedCodes = codes.filter(function (obj) {
                    return (obj.category === curCat);
                });

                let row = $(e.sender.element).closest('.detail-row');

                console.log('relatedCodes', relatedCodes)
                var td = row.find(".detail-code").closest('.detail-code-body');
                td.html('');
                td.append(`<input class="detail-code" style="width: 140px !important;" value=''/>`);

                //codeTootip = curcode + " - " + selectCode['description'];
                //row.find(".detail-code").attr('title', codeTootip);
                row.find(".detail-code").kendoDropDownList({
                    dataTextField: "code",
                    dataValueField: "code",
                    dataSource: relatedCodes,
                    valueTemplate: "#:data.code#-#:data.description#",
                    template: '#:data.code#-#:data.description#',
                    index: -1,
                    autoWidth: true,
                    change: async (e) => {

                        var curcode = e.sender.value();
                        var selectCode = codes.filter(function (codeitem) {
                            return codeitem.code == curcode;
                        })[0];

                        let row = $(e.sender.element).closest('.detail-row');
                        let detailid = row.attr("detailid");
                        let detail = this.model.lineItems.find(item => {
                            return item.poLineID == detailid
                        })
                        codeTootip = curcode + " - " + selectCode['description'];
                        row.find(".detail-code").attr('title', codeTootip);
                        if (selectCode.availFunds < 0)
                            selectCode.availFunds = 0;
                        row.find(".detail-avail-funds").html(Utilities.Float2Currency(selectCode.availFunds));
                        this.updateDetailRow(e);
                    }
                });

                this.updateDetailRow(e);
            }
        });

        $(".detail-qty").kendoNumericTextBox({
            min: 0,
            format: "#",
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                console.log(e.sender.value());
                await this.updateDetailRow(e);

            }
        });

        $(".detail-price").kendoNumericTextBox({
            min: 0,
            decimals: 1,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                console.log(e.sender.value());
                console.log("origin e body", e)
                await this.updateDetailRow(e);

            }
        });

        $(".detail-ven-date").kendoDatePicker({
            change: async (e) => {

                var newVenDate = e.sender.value().toISOString();
                let row = $(e.sender.element).closest('tr');
                let detailid = row.attr("detailid");
                var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));
                this.model.lineItems[objIndex].vendDelvDate = newVenDate;

                var venDelDateList = [];
                this.model.lineItems.forEach(function (item) {
                    //get the value of name
                    var val = item.vendDelvDate
                    //push the name string in the array
                    venDelDateList.push(val);
                });

                var maxVenDelDate = venDelDateList.reduce((a, b) => { return a > b ? a : b; });
                $("#workCompleteDate").val(Utilities.FormatDateString(maxVenDelDate));
                this.updateDetailRow(e);
            }
        });

        $(".detail-req-date").kendoDatePicker({
            change: async (e) => {

                console.log('reqdate', e.sender.value());
                this.updateDetailRow(e);
            }
        });

        $(".detail-percomplete").kendoNumericTextBox({
            format: "# \\%",
            min: 0,
            max: 100,
            step: 1,
            change: async (e) => {

                var newPerComplete = e.sender.value();
                let row = $(e.sender.element).closest('tr');
                let detailid = row.attr("detailid");
                var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));

                this.model.lineItems[objIndex].perComplete = newPerComplete;

                var perCompleteList = [];
                //iterate through object keys
                this.model.lineItems.forEach(function (item) {
                    //get the value of name
                    var val = item.perComplete / 1;
                    //push the name string in the array
                    perCompleteList.push(val);
                });

                var avgPerComplete = perCompleteList.reduce((a, b) => a + b) / perCompleteList.length;
                var round_avgPerComplete = avgPerComplete.toFixed(0);
                $("#perComplete").val(round_avgPerComplete);
                this.updateDetailRow(e);
            }
        });

        $(".detail-vendorno").change(async (e) => {
            this.updateDetailRow(e, 1);
        })

        $(".detail-desc").change(async (e) => {
            this.updateDetailRow(e, 1);
        })
        //var todayDate = kendo.toString(kendo.parseDate(new Date()), 'MM/dd/yyyy');toISOString();
        //$("#poDate").data("kendoDatePicker").value(new Date());
        $(".detail-row input").change(async (e) => {

        });

        $(".detail-data input").focus((e) => {
            $(e.target).closest('tr').addClass("editing");
        });

        $(".detail-data input").focusout((e) => {
            $(e.target).closest('tr').removeClass("editing");
        });

        $(".detail-data input.k-input").focus((e) => {
            console.log($(e.target).parent().parent())
            $(e.target).closest('tr').addClass("editing");
        });

        $(".detail-data input.k-input").focusout((e) => {
            $(e.target).closest('tr').removeClass("editing");
        });


        $(".detail-unit").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "ea"
                },
            ],
            filter: "contains",
            suggest: true,
            index: 100,
            change: (e) => {
                this.updateDetailRow(e);
            }
        });

        $(".sched-switch").kendoSwitch({
            checked: false,
            change: (e) => {

                console.log(e.checked);

            }
        });

        $(".categories input").focusout(async (e) => {
            console.log('category change');
            //this.model.po.shippingAmount = $("#poshipping").data("kendoNumericTextBox").value();
            //this.model.po.taxAmount = $("#poTax").data("kendoNumericTextBox").value();
            //this.update_Total();
        });

        $(".detail-menu").kendoMenu({
            dataSource: [
                {
                    text: ``,
                    cssClass: "detail-menu-icon",
                    expanded: false,
                    items: [
                        //{
                        //    text: "Add note",
                        //    cssClass: "detail-move"
                        //},
                        {
                            text: "Delete",
                            cssClass: "detail-delete"
                        }
                    ]
                },
            ]
        });

        $(".detail-delete").click(async (e) => {
            if (!window.confirm("Are you sure to delete the detail?"))
                return false;

            document.body.classList.toggle("wait");
            var perCompleteList = [];
            //iterate through object keys
            this.model.lineItems.forEach(function (item) {
                //get the value of name
                var val = item.perComplete / 1;
                //push the name string in the array
                perCompleteList.push(val);
            });

            let tr = $(e.target).closest('tr');
            let detail_id = tr.attr("detailid");
            const detailDelete = await axios.delete("api/PO/DeletePOLine?id=" + detail_id + "&entcode=" + this.model.po.entcode);

            let detail = this.model.lineItems.find((item) => {
                return item.poLineID == detail_id;
            })

            let poLineID = detail.poLineID;
            this.model.lineItems.map((detail, index) => {
                if (detail.poLineID == detail_id) {
                    this.model.lineItems.splice(index, 1)
                }
            })
            let offset = - detail.quantity * detail.price;

            this.DeleteDetailRow(detail, offset);
            document.body.classList.toggle("wait");
        });

    }
    private async updateExtDetailRow(e, type = 0) {
        console.log('Ext detail event', e)
        document.body.classList.toggle("wait");

        let selectedDom;
        let row;
        let poDiv;

        if (type == 0) {
            row = $(e.sender.element).closest('tr');
            poDiv = $(e.sender.element).closest('.extPoGroup');
        }
        else {
            row = $(e.target).closest('tr');
            poDiv = $(e.target).closest('.extPoGroup');
        }
        
        console.log('row', row);
       // return;
        let detailid = row.attr("detailid");
        console.log('detailid', detailid);
        let detail = this.model.lineItems.find(item => {
            return item.poLineID == detailid;
        })

        
        
        console.log('selected detail lineItem', detail);
        

        let origin_cost = detail.quantity * detail.price;
        detail.category = row.find("input.detail-cat:nth-child(2)").data('kendoComboBox').value();

        detail.vendorPartNo = row.find(".detail-vendorno").val();
        detail.description = row.find(".detail-desc").val();
        detail.code = row.find("input.detail-code").data("kendoDropDownList").value();
        detail.quantity = row.find("input.detail-qty:nth-child(2)").data('kendoNumericTextBox').value();
        detail.quantity = detail.quantity / 1;
        detail.price = Utilities.Currency2Float(row.find("input.detail-price:nth-child(2)").data('kendoNumericTextBox').value());
        detail.availFunds = Utilities.Currency2Float(row.find(".detail-avail-funds").html());
        console.log(detail.price);
        detail.cost = detail.quantity / 1 * detail.price;

        detail.vendDelvDate = row.find("input.detail-ven-date").val();
        detail.requiredByDate = row.find("input.detail-req-date").val();
        detail.perComplete = row.find("input.detail-percomplete:nth-child(2)").val();



        let new_cost = detail.cost;
        let diff_price = new_cost - origin_cost;

        console.log("old ", origin_cost);
        console.log("new ", new_cost);

        row.find(".detail-cost").html(Utilities.Float2Currency(detail.cost));
        //row.find(".detail-cost").val(detail.cost);

        console.log(row.find(".detail-cost").val());
        detail.unit = row.find("input.detail-unit:nth-child(2)").data('kendoComboBox').value()

        var fundBalance = detail.availFunds - new_cost;
        if (fundBalance < 0) {
            alert('Wrong Fund Balance. Please calculate again.');
            fundBalance = 0;
            detail.price = 0;
            detail.quantity = 0;
            detail.cost = 0;
            row.find("input.detail-qty:nth-child(2)").data('kendoNumericTextBox').value(0);
            row.find("input.detail-price:nth-child(2)").data('kendoNumericTextBox').value(0);
            row.find(".detail-cost").html(Utilities.Float2Currency(0));
            diff_price = 0 - origin_cost;
        }
        row.find(".detail-fund-balance").html(Utilities.Float2Currency(fundBalance))

        let gID = poDiv.attr("pogroupid");

        console.log("extension old total", this.extensionTotal);
        let old_subTotal = Utilities.Currency2Float(poDiv.find("table.footer .detail-subtotal").html());
        let new_subTotal = old_subTotal + diff_price;
        poDiv.find("table.footer .detail-subtotal").html(Utilities.Float2Currency(new_subTotal));
        //this.originalTotal = new_subTotal;
        this.extensionTotal = this.extensionTotal + diff_price;
        
        console.log("old_subTotal ", this.poTotal);
        this.poTotal = this.originalTotal + this.extensionTotal;
        console.log("new subTotal ", this.poTotal);

        $("#detail-totalPO").html(Utilities.Float2Currency(this.poTotal));
        this.update_Total();

        console.log('before update', detail);
        const poUpdateItem = await axios.put("api/PO/UpdatePOLine", detail);
        console.log('po updated', poUpdateItem);

        document.body.classList.toggle("wait");

    }

    private async updateDetailRow(e, type = 0) {
        console.log('org detail event', e)
        document.body.classList.toggle("wait");

        let row;
        if (type == 0)
            row = $(e.sender.element).closest('tr');
        else
            row = $(e.target).closest('tr');


        let detailid = row.attr("detailid");
        let detail = this.model.lineItems.find(item => {
            return item.poLineID == detailid;
        })

        console.log('row', row);
        console.log('selected detail lineItem', detail);

        let origin_cost = detail.quantity * detail.price;
        detail.category = row.find("input.detail-cat:nth-child(2)").data('kendoComboBox').value();

        detail.vendorPartNo = row.find(".detail-vendorno").val();
        detail.description = row.find(".detail-desc").val();
        detail.code = row.find("input.detail-code").data("kendoDropDownList").value();
        detail.quantity = row.find("input.detail-qty:nth-child(2)").data('kendoNumericTextBox').value();
        detail.quantity = detail.quantity / 1;
        detail.price = Utilities.Currency2Float(row.find("input.detail-price:nth-child(2)").data('kendoNumericTextBox').value());
        detail.availFunds = Utilities.Currency2Float(row.find(".detail-avail-funds").html());
        console.log(detail.price);
        detail.cost = detail.quantity / 1 * detail.price;

        detail.vendDelvDate = row.find("input.detail-ven-date").val();
        detail.requiredByDate = row.find("input.detail-req-date").val();
        detail.perComplete = row.find("input.detail-percomplete:nth-child(2)").val();



        let new_cost = detail.cost;
        let diff_price = new_cost - origin_cost;

        console.log("old ", origin_cost);
        console.log("new ", new_cost);

        row.find(".detail-cost").html(Utilities.Float2Currency(detail.cost));
        //row.find(".detail-cost").val(detail.cost);

        console.log(row.find(".detail-cost").val());
        detail.unit = row.find("input.detail-unit:nth-child(2)").data('kendoComboBox').value()

        var fundBalance = detail.availFunds - new_cost;
        if (fundBalance < 0) {
            alert('Wrong Fund Balance. Please calculate again.');
            fundBalance = 0;
            detail.price = 0;
            detail.quantity = 0;
            detail.cost = 0;
            row.find("input.detail-qty:nth-child(2)").data('kendoNumericTextBox').value(0);
            row.find("input.detail-price:nth-child(2)").data('kendoNumericTextBox').value(0);
            row.find(".detail-cost").html(Utilities.Float2Currency(0));
            diff_price = 0 - origin_cost;
        }
        row.find(".detail-fund-balance").html(Utilities.Float2Currency(fundBalance))

        let old_subTotal = this.originalTotal;
        let new_subTotal = old_subTotal + diff_price;
        $("#detail-subtotal").html(Utilities.Float2Currency(new_subTotal));
        this.originalTotal = new_subTotal;
        console.log("old_subTotal ", old_subTotal);
        console.log("new subTotal ", new_subTotal);
        console.log("extension total ", this.extensionTotal);

        this.poTotal = this.originalTotal + this.extensionTotal;

        $("#detail-totalPO").html(Utilities.Float2Currency(this.poTotal));
        this.update_Total();

        console.log('before update', detail);
        const poUpdateItem = await axios.put("api/PO/UpdatePOLine", detail);
        console.log('po updated', poUpdateItem);

        document.body.classList.toggle("wait");
    }

    private DeleteDetailRow(lineItemDetail, offset) {
        $(".detail-pane .detail-data .detail-row").each((i, obj) => {
            let detailid = $(obj).attr('detailid') //depositDetailID

            if (detailid == lineItemDetail.poLineID) {
                let table = $(obj).closest("table")
                let row = $(obj)
                let old_total = Utilities.Currency2Float($("#detail-subtotal").html());
                let new_total = old_total + offset;

                $("#detail-subtotal").html(Utilities.Float2Currency(new_total));
                row.html("");
                this.update_Total();
            }

        });

    }

    private async InsertDetailRow(budDetail) {

        $(".detail-pane .detail-data").html("");
        var detailSubTotal = 0;
        var selectCode = "";
        var codeTootip = "";
        let content = `
                <table class="itemlist" cellspacing="0" budcatid="">
                    <tbody>`;
        var lineItems = this.model.lineItems;
        var codes = await this.poLineItmDataSource(this.model.po.projectID);
        lineItems.forEach((item, index) => {
            if (item.fundBalance < 0)
                item.fundBalance = 0;
            if (item.availFunds < 0)
                item.availFunds = 0;
            console.log(selectCode)
            if (typeof selectCode != 'undefined')
                //console.log(selectCode['description'])
                codeTootip = item.code + " - " + selectCode['description'];
            else
                codeTootip = "";
            content += `<tr class="detail-row" detailid="${item.poLineID}">
                            <td style='min-width:35px' class='center detail-lineId'>${item.order}</td>
                            <td style='width:140px'>
                                <input class="detail-cat" value='${item.category}'/>
                                <span class="detail-code-body">
                                    <input class="detail-code" style="width: 140px !important;"  value='${item.code}' title='${codeTootip}'/>
                                </span>
                            </td>                            
                            <td style='width:120px;flex:1;'>
                                <input class="detail-vendorno" value='${item.vendorPartNo}' />
                                <input class="detail-desc" title="${item.description}"  value='${item.description}'/>
                            </td>
                            <td style='width:100px; text-align: right;'>
                                <div class="detail-avail-funds" >`+ Utilities.Float2Currency(item.availFunds) + `</div>
                            </td>
                            <td style="width: 90px;text-align:right;">
                                    <input class="number detail-qty" style=" margin-top: -3px;" value="${item.quantity}"/>
                                    <input class="detail-unit" value='${item.unit}' /></td>
                            <td style='width:110px'>
                                x<input class="detail-price" style="text-align:right; width: calc(100% - 10px) !important; margin: -3px 0 0 2px; " value='${item.price}' />
                            </td>
                            <td style='width:90px; text-align:right;'><div class="detail-cost" >`+ Utilities.Float2Currency(item.cost) + `</div></td>
                            <td style='width:90px;text-align:right;'><div  class="detail-fund-balance">`+ Utilities.Float2Currency(item.fundBalance) + `</div></td>
                            <td style='width:110px'>
                                <input class="detail-ven-date" value='${item.vendDelvDate}' />
                                <input class="detail-req-date" value='${item.requiredByDate}' />
                            </td>
                            <td style='width:80px;text-align:center;'>
                                <input class='number detail-percomplete' style="margin-top:-2px;" value='${item.perComplete}' />
                                <span class="schedSwitchBox"><input type="checkbox" class="sched-switch" /></span>
                            </td>
                            <td  style="text-align:center;"><span class="detail-menu"><i class="fa fa-bars"></i></span></td>
                        </tr>`;

            detailSubTotal += item.cost;

        });

        content += `</tbody>
                </table>`;

        $("#detail-subtotal").html(Utilities.Float2Currency(detailSubTotal));
        $(".detail-pane .detail-data").append(content);
        this.originalTotal = detailSubTotal;

        //var codes = await this.poLineItmDataSource(this.model.po.projectID);
        var categoryList = codes.reduce(function (memo, e1) {
            var matches = memo.filter(function (e2) {
                return e1.category == e2.category
            })
            if (matches.length == 0)
                memo.push(e1)
            return memo;
        }, []);

        $(".detail-code").kendoDropDownList({
            dataTextField: "code",
            dataValueField: "code",
            dataSource: codes,
            valueTemplate: "#:data.code#-#:data.description#",
            template: '#:data.code#-#:data.description#',
            index: -1,
            autoWidth: true,
            change: async (e) => {

                var curcode = e.sender.value();
                var selectCode = codes.filter(function (codeitem) {
                    return codeitem.code == curcode;
                })[0];

                let row = $(e.sender.element).closest('.detail-row');
                let detailid = row.attr("detailid");
                let detail = this.model.lineItems.find(item => {
                    return item.poLineID == detailid
                })
                codeTootip = curcode + " - " + selectCode['description'];
                row.find(".detail-code").attr('title', codeTootip);
                if (selectCode.availFunds < 0)
                    selectCode.availFunds = 0;
                row.find(".detail-avail-funds").html(Utilities.Float2Currency(selectCode.availFunds));
                this.updateDetailRow(e);
            }
        });

        $(".detail-cat").kendoComboBox({
            dataTextField: "category",
            dataValueField: "category",
            dataSource: categoryList,
            filter: "contains",
            suggest: true,
            index: -1,
            autoWidth: true,
            change: async (e) => {
                var curCat = e.sender.value();
                var relatedCodes = codes.filter(function (obj) {
                    return (obj.category === curCat);
                });

                let row = $(e.sender.element).closest('.detail-row');

                console.log('relatedCodes', relatedCodes)
                var td = row.find(".detail-code").closest('td');
                td.html('');
                td.append(`<input class="detail-code" style="width: 140px !important;" value=''/>`);

                //codeTootip = curcode + " - " + selectCode['description'];
                //row.find(".detail-code").attr('title', codeTootip);
                row.find(".detail-code").kendoDropDownList({
                    dataTextField: "code",
                    dataValueField: "code",
                    dataSource: relatedCodes,
                    valueTemplate: "#:data.code#-#:data.description#",
                    template: '#:data.code#-#:data.description#',
                    index: -1,
                    autoWidth: true,
                    change: async (e) => {

                        var curcode = e.sender.value();
                        var selectCode = codes.filter(function (codeitem) {
                            return codeitem.code == curcode;
                        })[0];

                        let row = $(e.sender.element).closest('.detail-row');
                        let detailid = row.attr("detailid");
                        let detail = this.model.lineItems.find(item => {
                            return item.poLineID == detailid
                        })
                        codeTootip = curcode + " - " + selectCode['description'];
                        row.find(".detail-code").attr('title', codeTootip);
                        if (selectCode.availFunds < 0)
                            selectCode.availFunds = 0;
                        row.find(".detail-avail-funds").html(Utilities.Float2Currency(selectCode.availFunds));
                        this.updateDetailRow(e);
                    }
                });

                this.updateDetailRow(e);
            }
        });

        $(".detail-qty").kendoNumericTextBox({
            min: 0,
            format: "#",
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                console.log(e.sender.value());
                await this.updateDetailRow(e);

            }
        });

        $(".detail-price").kendoNumericTextBox({
            min: 0,
            decimals: 1,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                console.log(e.sender.value());
                console.log("origin e body", e)
                await this.updateDetailRow(e);

            }
        });

        $(".detail-ven-date").kendoDatePicker({
            change: async (e) => {

                var newVenDate = e.sender.value().toISOString();
                let row = $(e.sender.element).closest('tr');
                let detailid = row.attr("detailid");
                var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));
                this.model.lineItems[objIndex].vendDelvDate = newVenDate;

                var venDelDateList = [];
                this.model.lineItems.forEach(function (item) {
                    //get the value of name
                    var val = item.vendDelvDate
                    //push the name string in the array
                    venDelDateList.push(val);
                });

                var maxVenDelDate = venDelDateList.reduce((a, b) => { return a > b ? a : b; });
                $("#workCompleteDate").val(Utilities.FormatDateString(maxVenDelDate));
                this.updateDetailRow(e);
            }
        });

        $(".detail-req-date").kendoDatePicker({
            change: async (e) => {

                console.log('reqdate', e.sender.value());
                this.updateDetailRow(e);
            }
        });

        $(".detail-percomplete").kendoNumericTextBox({
            format: "# \\%",
            min: 0,
            max: 100,
            step: 1,
            change: async (e) => {

                var newPerComplete = e.sender.value();
                let row = $(e.sender.element).closest('tr');
                let detailid = row.attr("detailid");
                var objIndex = this.model.lineItems.findIndex((obj => obj.poLineID == detailid));

                this.model.lineItems[objIndex].perComplete = newPerComplete;

                var perCompleteList = [];
                //iterate through object keys
                this.model.lineItems.forEach(function (item) {
                    //get the value of name
                    var val = item.perComplete / 1;
                    //push the name string in the array
                    perCompleteList.push(val);
                });

                var avgPerComplete = perCompleteList.reduce((a, b) => a + b) / perCompleteList.length;
                var round_avgPerComplete = avgPerComplete.toFixed(0);
                $("#perComplete").val(round_avgPerComplete);
                this.updateDetailRow(e);
            }
        });

        $(".detail-vendorno").change(async (e) => {
            this.updateDetailRow(e, 1);
        })

        $(".detail-desc").change(async (e) => {
            this.updateDetailRow(e, 1);
        })
        //var todayDate = kendo.toString(kendo.parseDate(new Date()), 'MM/dd/yyyy');toISOString();
        //$("#poDate").data("kendoDatePicker").value(new Date());
        $(".detail-row input").change(async (e) => {

        });

        $(".detail-data input").focus((e) => {
            $(e.target).closest('tr').addClass("editing");
        });

        $(".detail-data input").focusout((e) => {
            $(e.target).closest('tr').removeClass("editing");
        });

        $(".detail-data input.k-input").focus((e) => {
            console.log($(e.target).parent().parent())
            $(e.target).closest('tr').addClass("editing");
        });

        $(".detail-data input.k-input").focusout((e) => {
            $(e.target).closest('tr').removeClass("editing");
        });


        $(".detail-unit").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "ea"
                },
            ],
            filter: "contains",
            suggest: true,
            index: 100,
            change: (e) => {
                this.updateDetailRow(e);
            }
        });

        $(".sched-switch").kendoSwitch({
            checked: false,
            change: (e) => {

                console.log(e.checked);

            }
        });

        $(".categories input").focusout(async (e) => {
            console.log('category change');
            //this.model.po.shippingAmount = $("#poshipping").data("kendoNumericTextBox").value();
            //this.model.po.taxAmount = $("#poTax").data("kendoNumericTextBox").value();
            //this.update_Total();
        });

        $(".detail-menu").kendoMenu({
            dataSource: [
                {
                    text: ``,
                    cssClass: "detail-menu-icon",
                    expanded: false,
                    items: [
                        //{
                        //    text: "Add note",
                        //    cssClass: "detail-move"
                        //},
                        {
                            text: "Delete",
                            cssClass: "detail-delete"
                        }
                    ]
                },
            ]
        });

        $(".detail-delete").click(async (e) => {
            if (!window.confirm("Are you sure to delete the detail?"))
                return false;

            document.body.classList.toggle("wait");
            var perCompleteList = [];
            //iterate through object keys
            this.model.lineItems.forEach(function (item) {
                //get the value of name
                var val = item.perComplete / 1;
                //push the name string in the array
                perCompleteList.push(val);
            });

            let tr = $(e.target).closest('tr');
            let detail_id = tr.attr("detailid");
            const detailDelete = await axios.delete("api/PO/DeletePOLine?id=" + detail_id + "&entcode=" + this.model.po.entcode);

            let detail = this.model.lineItems.find((item) => {
                return item.poLineID == detail_id;
            })

            let poLineID = detail.poLineID;
            this.model.lineItems.map((detail, index) => {
                if (detail.poLineID == detail_id) {
                    this.model.lineItems.splice(index, 1)
                }
            })
            let offset = - detail.quantity * detail.price;

            this.DeleteDetailRow(detail, offset);
            document.body.classList.toggle("wait");
        });
        //////////////////////////////

    }
    private async Init_Sumarry() {
        var codes = await this.poLineItmDataSource(this.model.po.projectID);
        //var extPoGroup = this.model.poGroups.filter(function (poGroup) {
        //    return poGroup.type == "EXT";
        //});
        console.log("Init Summary ", codes);
        var summaryCode = "";
        codes.forEach((item, key) => {
            summaryCode += `<div class="row">
                                <div class="two-ten">
                                    <span class="">${item.code}</span>
                                </div>
                                <div class="three-ten">
                                    <span class="" >${item.description}</span>
                                </div>
                                <div class="two-ten" style="text-align:right;">
                                    <span class="">$${item.availFunds}</span>
                                </div>
                            </div>`
        });

        $("#codeList").html(summaryCode);

        var lastPoGroup = this.model.poGroups.slice(-1).pop();
        if (lastPoGroup == 'undefined') {
            console.log('null');
            return;
        }
            
        console.log(lastPoGroup);
        var quotes = await this.quoteDataSource(this.model.po.projectID);
        console.log('qutoes', quotes)        
        
        var detailQuote = quotes.filter((quote) => {
            return quote.itemID == lastPoGroup.itemID;
        })[0];
        console.log('detail quotes', detailQuote);

        $("#detailType").html(detailQuote.itemType);
        $("#detailId").html(detailQuote.itemID);
        $("#detailVendor").html(detailQuote.vendor);
        $("#detailVendorId").html(detailQuote.vendorID);
        $("#detailAmount").html(detailQuote.amount);
        $("#detailDescription").val(detailQuote.description);

    }

    private async update_Total() {

        var detailTotal = Utilities.Currency2Float($("#detail-totalPO").html());
        var subTotal = detailTotal;
        var curType = "Extension"; //$("#type").val();
        //var shipping = $("#poshipping").data("kendoNumericTextBox").value();
        //var tax = $("#poTax").data("kendoNumericTextBox").value();
        var poTotalExt = 0;
        if (curType == "Extension")
            var poTotalExt = subTotal;//+ shipping + tax;
        var orgPo;
        if (curType != "Extension")
            orgPo = $("#vendorPOAmt").val();//$("#vendorPOAmt").data('kendoNumericTextBox').value();
        else
            orgPo = 0;
        console.log(orgPo)
        var TotalPo = poTotalExt + Utilities.Currency2Float(orgPo);
        var invTotalPo = Utilities.Currency2Float($("#amtToDate").html());
        var balance = TotalPo + invTotalPo;

        //$("#poOriginalPO").html(Utilities.Float2Currency(orgPo));
        $("#subtotal").html(Utilities.Float2Currency(detailTotal));
        //$("#poTotalExt").html(Utilities.Float2Currency(poTotalExt));
        //$("#pototalPO").html(Utilities.Float2Currency(TotalPo));
        $("#invTotalPO").html(Utilities.Float2Currency(TotalPo));
        $("#balance").html(Utilities.Float2Currency(balance));
    }

    private async render_POItems() {
        var poLineItemDataModel = kendo.data.Model.define({
            id: "poID",
            fields: {
                code: { type: "string" },
                category: { type: "string", editable: false },
                availFunds: { type: "string", },
                vendorPartNo: { type: "string" },
                description: { type: "string" },
                quantity: { type: "string" },
                price: { type: "string" },
                cost: { type: "number", editable: false },
                fundBalance: { type: "number", editable: false },
                vendDelvDate: { type: "date" },
                perComplete: { type: "string" },
                onSched: { type: "boolean" }
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
            // toolbar: ["create"],
            //toolbar: [{
            //    template: Handlebars.compile($('#template').html())({}),
            //}],
            toolbar: [
                { template: kendo.template($("#template").html()) }],
            //toolbar: [
            //    { name: "create", text: ""}
            //],
            columns: [
                { field: "id", title: "ID #" },
                { field: "category", title: "Category" },
                {
                    field: "detailCode",
                    title: "Detail<br>Code",
                    editor: this.codeDropDownEditor
                },
                { field: "detailDescription", title: "Detail<br>Description" },
                { field: "availFunds", title: "Available<br>Funds", template: '#= kendo.toString(availFunds, "0.00")#' },
                { field: "vendorPartNo", title: "Vendor<br>Part #" },
                { field: "description", title: "Description" },
                { field: "unit", title: "Unit", editor: this.unitDropDownEditor },
                { field: "quantity", title: "Quantity" },
                { field: "price", title: "Unit<br>Price", template: '#= kendo.toString(price, "$0.00")#' },
                { field: "cost", title: "Cost", template: '#= kendo.toString(price * quantity, "$0.00")#' },
                {
                    field: "fundBalance",
                    title: "Fund<br>Balance",
                    template: '#= kendo.toString((availFunds - cost), "$0.00")#'
                },
                {
                    field: "vendDelvDate",
                    title: "Vendor Del<br>Date",
                    editor: this.dateDropDownEditor,
                    format: "{0:MM/dd/yyyy}"
                },
                {
                    field: "requiredDate",
                    title: "Date<br>Required",
                    editor: this.dateDropDownEditor,
                    format: "{0:MM/dd/yyyy}"
                },
                { field: "perComplete", title: "%<br>Complete" },
                { field: "onSched", title: "On<br>Sched", editor: this.onSchSwitchEditor },
                { command: ["edit", "destroy"], title: "&nbsp;" }
            ],
            editable: "true",
            selectable: true,
            scrollable: false
        });


        //$("#poGrid").find(".k-grid-toolbar").insertAfter($("#poGrid .k-grid-header"));

        this.poLineItemDataArray.bind("change", (e) => {

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

    private async AddExtension() {
        this.CreateExtensionButton.disabled = true;
        document.body.classList.toggle("wait");

        var extQuote = $("#extQuoteCo").data('kendoDropDownList').value();
        console.log(extQuote);
        var now = new Date();
        this.newPoGroup.approvDate = (new Date()).toISOString();
        this.newPoGroup.enteredDate = (new Date()).toISOString();

        this.newPoGroup.poID = this.model.po.poID;
        this.newPoGroup.type = "EXT";
        if (extQuote.startsWith("Q-"))
            this.newPoGroup.itemType = "QUOTE";
        else
            this.newPoGroup.itemType = "CO";

        this.newPoGroup.order = 1;

        this.newPoGroup.status = "PENDING";

        console.log("before ext poGroups ", this.newPoGroup);
        const poGroupInsert = await axios.put("api/PO/InsertPOGroup", this.newPoGroup);
        //this.model.poGroups = poGroupInsert.data;
        this.model.poGroups.push(poGroupInsert.data);
        this.DrawExtDetails();
        console.log("after ext poGroups", poGroupInsert);
        var counter = this.model.poGroups.length + 1;
        $("#extensionID").html(counter);
        document.body.classList.toggle("wait");
        this.notification.ShowNotification("Save Success!", "Extension Inserted Successfully", "success");
        var curCounter = $("#extensionID").html();
        console.log(curCounter);
        return poGroupInsert.data.poGroupID;
    }

    private async Save() {

        this.PublishButton.disabled = true;
        document.body.classList.toggle("wait");
        var poGrp = new Object;

        //Save PO
        if (this.model.po.poID == 0) {
            console.log('after_model', this.model.po)
            const poInsert = await axios.post("api/PO/InsertPO", this.model.po);
            console.log('po inserted', poInsert);
            this.newPoGroup.poID = poInsert.data.poID;

            //this.model.poGroups.ItemType = poInsert.data.poID;
            this.newPoGroup.type = "INIT";
            var now = new Date();
            this.newPoGroup.approvDate = (new Date()).toISOString();
            this.newPoGroup.enteredDate = (new Date()).toISOString();
            if (poInsert.data.quoteCO.startsWith("Q-"))
                this.newPoGroup.itemType = "QUOTE";
            else
                this.newPoGroup.itemType = "CO";
            this.newPoGroup.itemID = poInsert.data.quoteCOID;

            this.newPoGroup.order = 1;

            this.newPoGroup.status = "Pending";
            var status = $("#status").data('kendoComboBox').value();
            if (status != "Pending")
                this.newPoGroup.status = "Complete";

            this.IsDirty = false;
            console.log("new PoID", poInsert.data.poID)
            var lastPoGroups = await axios.get("api/PO/GetLastPOGroup?poid=" + poInsert.data.poID);
            console.log('lastPoGroups ', lastPoGroups);
            //if (lastPoGroups == null)
            //    this.newPoGroup.POGroupID = 1; //lastPOGID.data.Order + 1;
            //else
            //    this.newPoGroup.POGroupID = 1; //lastPOGID.data.Order + 1;

            console.log("before poGroups ", this.newPoGroup);
            const poGroupInsert = await axios.put("api/PO/InsertPOGroup", this.newPoGroup);
            this.model.poGroups.push(poGroupInsert.data);
            console.log("after poGroups", poGroupInsert);
            this.notification.ShowNotification("Save Success!", "PO Inserted Successfully", "success");
        } else {
            console.log('update_model', this.model.po)
            this.model.po.workCompleteDate = $("#workCompleteDate").val();
            this.model.po.perComplete = $("#perComplete").val();
            this.model.po.perComplete = parseInt(this.model.po.perComplete);
            const poUpdate = await axios.put("api/PO/UpdatePO", this.model.po);
            console.log('po updated', poUpdate);
            this.IsDirty = false;

            var poGroups = this.model.poGroups;
            var orgGroups = this.model.poGroups.filter(function (poGroup) {
                return poGroup.type == "INIT";
            })[0];

            console.log('orgPoGroups', orgGroups);
            console.log("before update poGroups ", this.model.poGroups);
            const poGroupUpdate = await axios.put("api/PO/UpdatePOGroups", this.model.poGroups);
            console.log("after updated poGroups", poGroupUpdate);

            this.notification.ShowNotification("Save Success!", "PO Updated Successfully", "success");
        }
        var tempData = this.poLineItemDataArray.data;


        //if (this.poLineItemDataArray.data.length > 0) {

        //    //Save PO Items
        //    //Sync ViewModel with Model
        //    //Add all New Line Items
        //    for (var i = 0; i < this.poLineItemDataArray.data.length; i++) {

        //        if (this.poLineItemDataArray.data[i].id == "") {
        //            var item = this.newLineItem;
        //            item.poID = this.model.po.poID;
        //            item.projectID = this.model.po.projectID;


        //            for (var key in this.poLineItemDataArray.data[i]) {

        //                if (key != null && this.poLineItemDataArray.data[i][key]) {

        //                    if (this.poLineItemDataArray.data[i].hasOwnProperty(key) && item.hasOwnProperty(key)) {

        //                        console.log(key);
        //                        console.log(item[key]);
        //                        console.log(this.poLineItemDataArray.data[i][key]);

        //                        //item[key] = this.poLineItemDataArray.data[i][key];

        //                    }
        //                }
        //            }

        //            this.model.lineItems.push(item);
        //        }
        //    }

        //    //Sync all Line Item Fields
        //    console.log('Before Update');
        //    console.log(this.model.lineItems);


        //    for (var i = 0; i < this.model.lineItems.length; i++) {

        //        if (this.model.lineItems[i].poLineID > 0 && this.poLineItemDataArray.data[i].poLineID > 0 &&
        //            this.model.lineItems[i].poLineID && this.poLineItemDataArray.data[i].poLineID) {
        //            for (var key in this.newLineItem) {
        //                if (this.poLineItemDataArray.data[i].hasOwnProperty(key) && this.model.lineItems[i].hasOwnProperty(key)
        //                    && this.model.lineItems[i][key] != this.poLineItemDataArray.data[i][key]) {

        //                    console.log(i + ':' + key);

        //                    this.model.lineItems[i][key] = this.poLineItemDataArray.data[i][key];
        //                }
        //            }
        //        }
        //    }

        //    console.log('After Update');
        //    console.log(this.model.lineItems);


        //    for (var i = 0; i < this.model.lineItems.length; i++) {

        //        if (this.model.lineItems[i].poLineID == 0) {
        //            const poInsertItem = await axios.post("api/PO/InsertPOLine", this.model.lineItems[i], this.model.po.entCode);
        //            console.log('po inserted', poInsertItem);
        //        } else {
        //            const poUpdateItem = await axios.put("api/PO/UpdatePOLine", this.model.lineItems[i]);
        //            console.log('po updated', poUpdateItem);
        //        }
        //    }

        //}

        //Save PO


        //Extension form initialize
        var statusDropdownList = $("#extQuoteCo").data("kendoDropDownList");
        //statusDropdownList.enable(false);
        if (this.model.po.status == 'Complete') {
            statusDropdownList.enable(true);
            if (statusDropdownList.value() != "")
                $("#newExt-button").prop('disabled', false);
            $('#org_itemDate').data('kendoDatePicker').enable(false);
            $('#org_approvedDate').data('kendoDatePicker').enable(false);
            $("#addOrgDetailBtn").prop('disabled', true);

            $('input.ext_itemDate').data('kendoDatePicker').enable(true);
            $('input.ext_approvedDate').data('kendoDatePicker').enable(true);
            $(".addExtDetailBtn").prop('disabled', false);

        } else {
            statusDropdownList.enable(false);
            $("#newExt-button").prop('disabled', true);
            $('#org_itemDate').data('kendoDatePicker').enable(true);
            $('#org_approvedDate').data('kendoDatePicker').enable(true);
            $("#addOrgDetailBtn").prop('disabled', false);

            $('input.ext_itemDate').data('kendoDatePicker').enable(false);
            $('input.ext_approvedDate').data('kendoDatePicker').enable(false);
            $(".addExtDetailBtn").prop('disabled', true);

        }
        $("#org_QuoteCoNo").html(this.model.po.quoteCO);
        $("#org_TotalQuoteCoNo").html(this.model.po.quoteCO);
        document.body.classList.toggle("wait");
        this.PublishButton.classList.remove('running');
        // this.PublishButton.disabled = false;
    }

    private async initial_Save() {

        this.PublishButton.disabled = true;
        document.body.classList.toggle("wait");

        //Save PO
        console.log('after_model', this.model.po)
        this.model.po.vendorContactID = 0;
        const poInserted = await axios.post("api/PO/InsertPO", this.model.po);
        console.log('po inserted', poInserted);
        this.model.po.poID = poInserted.data.poID;
        this.model.po.projectID = poInserted.data.projectID;
        this.model.po.quoteCO = poInserted.data.quoteCO;
        this.model.po.service = poInserted.data.service;
        this.model.po.type = poInserted.data.type;
        this.model.po.vendorID = poInserted.data.vendorID;

        this.IsDirty = false;
        this.notification.ShowNotification("Save Success!", "PO Inserted Successfully", "success");

        var tempData = this.poLineItemDataArray.data;

        document.body.classList.toggle("wait");
        this.PublishButton.classList.remove('running');
        // this.PublishButton.disabled = false;
    }

    private async init_PoGroupSave() {
        console.log("init poGroup Save");


        var now = new Date();
        this.newPoGroup.approvDate = (new Date()).toISOString();
        this.newPoGroup.enteredDate = (new Date()).toISOString();

        this.newPoGroup.poID = this.model.po.poID;
        var orgQuote = this.model.po.quoteCO;
        this.newPoGroup.itemID = this.model.po.quoteCOID;
        this.newPoGroup.type = "INIT";

        if (orgQuote.startsWith("Q-"))
            this.newPoGroup.itemType = "QUOTE";
        else
            this.newPoGroup.itemType = "CO";

        this.newPoGroup.order = 1;

        this.newPoGroup.status = "PENDING";

        console.log("before init poGroups ", this.newPoGroup);
        const poGroupInsert = await axios.put("api/PO/InsertPOGroup", this.newPoGroup);
        console.log("after init poGroups", poGroupInsert);
        this.model.poGroups.push(poGroupInsert.data);
        return poGroupInsert.data.poGroupID;

    }

    private CurrencyFields() {

        $("#vendorPOAmt").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
            change: async (e) => {

                this.update_Total();
            }
        });


        //$("#subtotal").kendoNumericTextBox({
        //    format: "c2",
        //    min: 0,
        //    spinners: false,
        //});

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
       
        this.FundingSumaryDetailButton = document.querySelector("#funding-detail-btn") as HTMLButtonElement;
        this.FundingSumaryDetailButton.addEventListener("click", () => {
            $("#funding-detail-btn").parent().addClass("active");
            $("#quote-detail-btn").parent().removeClass("active");
            $("#quoteDetail").hide();
            $("#fundingDetail").show();
        });

        this.QuoteDetailButton = document.querySelector("#quote-detail-btn") as HTMLButtonElement;
        this.QuoteDetailButton.addEventListener("click", () => {
            $("#funding-detail-btn").parent().removeClass("active");
            $("#quote-detail-btn").parent().addClass("active");
            $("#quoteDetail").show();
            $("#fundingDetail").hide();
        });
        this.PublishButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.PublishButton.addEventListener("click", async (evt) => {
            this.Save();
        });
        this.ActionButton = document.querySelector("#action-button") as HTMLButtonElement;
        this.ActionButton.addEventListener("click", async (evt) => {

        });
        this.CancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
        this.CancelButton.addEventListener("click", () => {
            window.location.href = "/PurchaseOrder/";
        });

        this.CreateExtensionButton = document.querySelector("#newExt-button") as HTMLButtonElement;
        this.CreateExtensionButton.addEventListener("click", async (evt) => {
            this.AddExtension();
        });

        this.PublishButton.disabled = true;
        this.ActionButton.disabled = true;
        this.CreateExtensionButton.disabled = true;

        $("#addOrgDetailBtn").click(async (e) => {
            console.log('click add button');
            var item = this.newLineItem;
            item.poID = this.model.po.poID;
            var todayDate = (new Date()).toISOString();
            var newPoGId = 0;

            if (item.poID == 0) {
                if ($("#projectID").data("kendoComboBox").value() != ''
                    && $("#accountNo").val() != ''
                    && $("#service").val() != ''
                    && $("#poDate").val() != ''
                    && $("#quoteCO").val() != ''
                    //&& $("#type").val() != ''
                ) {
                    await this.initial_Save();

                    item.poID = this.model.po.poID;


                } else {
                    alert("All mandatory fields should be chosen first.");
                    return;
                }

            }


            var orgPoGroup = this.model.poGroups.filter(function (poGroup) {
                return poGroup.type == "INIT";
            });

            if (orgPoGroup.length != 0)
                item.poGroupID = orgPoGroup[0].poGroupID
            else
                item.poGroupID = null;

            if (item.poGroupID == null) {
                newPoGId = await this.init_PoGroupSave();
                item.poGroupID = newPoGId;
            }


            console.log("final poID", item.poID);
            console.log("newPoGId ", newPoGId);
            item.projectID = this.model.po.projectID;
            item.requiredByDate = todayDate;
            item.vendDelvDate = todayDate;


            var orderList = [];

            //iterate through object keys
            this.model.lineItems.forEach(function (item) {
                //get the value of name
                var val = item.order
                //push the name string in the array
                orderList.push(val);
            });

            var maxOrder = 0;
            console.log(orderList);
            if (orderList.length != 0) {
                maxOrder = orderList.reduce((a, b) => { return a > b ? a : b; });
            }

            item.order = maxOrder + 1;
            console.log("before POLine", item);
            const detailInsert = await axios.post("api/po/InsertPOLine", item, this.model.po.entCode)
            console.log("after POLine", detailInsert);
            this.model.lineItems.push(detailInsert.data)
            this.InsertDetailRow(item);
        });




        // this.PublishButton.disabled = true;
    }

    private async init_newLineItem(lineItem) {

        var codes = await this.poLineItmDataSource(this.model.po.projectID);
        var categoryList = codes.reduce(function (memo, e1) {
            var matches = memo.filter(function (e2) {
                return e1.category == e2.category
            })
            if (matches.length == 0)
                memo.push(e1)
            return memo;
        }, []);


        $("#add-detail-detail-code").kendoComboBox({
            dataTextField: "code",
            dataValueField: "code",
            dataSource: codes,
            template: "#=code # - #=description #",
            filter: "contains",
            suggest: true,
            index: 0,
            autoWidth: true,
            change: async (e) => {

                var curcode = e.sender.value();
                var selectCode = codes.filter(function (codeitem) {
                    return codeitem.code == curcode;
                })[0];
                if (selectCode.availFunds < 0)
                    selectCode.availFunds = 0;

                $("#add-detail-detail-desc").val(selectCode.description);
                $("#add-detail-fund").data("kendoNumericTextBox").value(Utilities.Float2Currency(selectCode.availFunds));

            }
        });

        $("#add-detail-cat").kendoComboBox({
            dataTextField: "category",
            dataValueField: "category",
            dataSource: categoryList,
            filter: "contains",
            suggest: true,
            index: 100,
            autoWidth: true,
            change: async (e) => {

                var curCat = e.sender.value();
                var relatedCodes = codes.filter(function (obj) {
                    return (obj.category === curCat);
                });

                $("#add-detail-detail-code").kendoComboBox({
                    dataTextField: "code",
                    dataValueField: "code",
                    dataSource: relatedCodes,
                    template: "#=code # - #=description #",
                    filter: "contains",
                    suggest: true,
                    index: 0,
                    autoWidth: true,
                    change: async (e) => {

                        var curcode = e.sender.value();
                        var selectCode = codes.filter(function (codeitem) {
                            return codeitem.code == curcode;
                        })[0];
                        if (selectCode.availFunds < 0)
                            selectCode.availFunds = 0;

                        $("#add-detail-detail-desc").val(selectCode.description);
                        $("#add-detail-fund").data("kendoNumericTextBox").value(Utilities.Float2Currency(selectCode.availFunds));

                    }
                });

            }
        });

        $("#add-detail-fund").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });

        $("#add-detail-unit").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "ea"
                },
            ],
            filter: "contains",
            suggest: true,
            index: 100
        });

        $("#add-detail-unitprice").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
        });

        $("#detail-window input").change(() => {
            var newQty = $("#add-detail-qty").val() as number;
            var newPrice = $("#add-detail-unitprice").data("kendoNumericTextBox").value();
            var newCost = newQty * newPrice;
            $("#add-detail-cost").html(Utilities.Float2Currency(newCost));
        });

        $("#add-detail-del-date").kendoDatePicker({
            change: async (e) => {
                console.log(e.sender.value());
            }
        });

        $("#add-detail-date-required").kendoDatePicker({
            change: async (e) => {
                console.log(e.sender.value());
            }
        });

        $("#add-detail-complete").kendoNumericTextBox({
            format: "# \\%",
            min: 0,
            max: 100,
            step: 1
        });

        $("#add-detail-sched").kendoSwitch({
            checked: false,
            change: (e) => {

                console.log(e.checked);

            }
        });



        $("#add-detail-detail-code").data("kendoComboBox").value('');
        $("#add-detail-unit").data("kendoComboBox").value('ea');
        $("#add-detail-qty").val(0);
        $("#add-detail-unitprice").data("kendoNumericTextBox").value(0);
        $("#add-detail-cost").html(Utilities.Float2Currency(0));
        $("#add-detail-del-date").data('kendoDatePicker').value(new Date());
        $("#add-detail-date-required").data('kendoDatePicker').value(new Date());
        $("#add-detail-complete").data('kendoNumericTextBox').value(0);
    }

    private setExistingPOValues() {

        var po = this.model.po;

        console.log(po);

        if (po.projectID != 0) {
            $("#projectID").data("kendoComboBox").value(po.projectID);
            $("#accountNo").val(po.accountNo);
            $("#vendorPO").val(po.vendorPO);
        }

        if (po.poID != 0) {
            $("#poID").val(po.poID);
        }


        if (po.quoteCOID != 0) {
            $("#quoteCO").data('kendoDropDownList').value(po.quoteCOID);

            $("#quoteCO").data("kendoDropDownList").trigger("change");
        }

        $("#poDate").val(Utilities.FormatDateString(po.poDate));

        //Requested By Field
        $("#requestedBy").val(po.requestedBy);

        //exempt
        if (po.exempt != null)
            $("#exempt").val(po.exempt);
        else
            $("#exempt").val("");
        //Po Type
        //$("#type").data("kendoComboBox").value(po.type);

        //Original PO
        if (po.type !== "Extension") {
            $("#vendorPO").val("");
            $("input[name='vendorPO_input']").prop("disabled", true);
            //$("#vendorPOAmt").data("kendoNumericTextBox").value(Utilities.FormatDateString('0'));
            // $("#vendorPOAmt").prop("disabled", true);
        } else {
            $("#vendorPO").val(po.vendorPO);
            $("input[name='vendorPO_input']").prop("disabled", false);
            $("#vendorPOAmt").data("kendoNumericTextBox").value(Utilities.FormatDateString(po.vendorPOAmount));
            //    $("#vendorPOAmt").prop("disabled", false);
        }


        //Requsition # Field
        $("#reqNo").val(po.reqNo);


        $("#workStartDate").val(Utilities.FormatDateString(po.workStartDate));
        $("#workCompleteDate").val(Utilities.FormatDateString(po.workCompleteDate));

        $("#terms").data("kendoComboBox").value(po.terms);
        $("#service").data("kendoComboBox").value(po.service);

        $("#status").data("kendoComboBox").value(po.status);

        $("#perComplete").val(po.perComplete);




        //Side Pane
        //$("#poshipping").data("kendoNumericTextBox").value(this.model.po.shippingAmount);
        //$("#poTax").data("kendoNumericTextBox").value(this.model.po.taxAmount);
        $("#pototalPO").html(this.model.po.total);
        $("#invTotalPO").html(Utilities.Float2Currency(this.model.po.total));
        $("#amtToDate").html(Utilities.Float2Currency(this.model.amtInvToDate));

        var subTotal = this.model.lineItems.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.cost;
        }, 0);

        $("#subtotal").html(Utilities.Float2Currency(subTotal));
        console.log(`subTotal`, subTotal);

        var totalEx = subTotal + this.model.po.shippingAmount + this.model.po.taxAmount;
        console.log(totalEx)
        //$("#poTotalExt").html(Utilities.Float2Currency(totalEx));

        var originalPo = this.model.po.vendorPOAmount;
        $('#poOriginalPO').html(Utilities.Float2Currency(originalPo));

        var totalPO = totalEx + originalPo;
        $("#pototalPO").html(Utilities.Float2Currency(totalPO));
        $("#invTotalPO").html(Utilities.Float2Currency(totalPO));

        var balance = totalPO + this.model.amtInvToDate / 1;
        $("#balance").html(Utilities.Float2Currency(balance));


    }

    private initSummaryTotal() {

        $("#subtotal").html(Utilities.Float2Currency(0));
        //$("#poshipping").data('kendoNumericTextBox').value(0);
        //$("#poTax").data('kendoNumericTextBox').value(0);
        //$("#poTotalExt").html(Utilities.Float2Currency(0));
        //$("#amtToDate").html(Utilities.Float2Currency(0));
        //$('#poOriginalPO').html(Utilities.Float2Currency(0));
        $("#pototalPO").html(Utilities.Float2Currency(0));
        $("#invTotalPO").html(Utilities.Float2Currency(0));
        $("#balance").html(Utilities.Float2Currency(0));
    }

}


