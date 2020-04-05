import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { LinkedPhoneList } from "./components/phone.js";
import { LinkedLocationList } from "./components/location.js";

import { Utilities } from "./utilities.js";
import { Tabs } from "./components/tabs.js";

export class VendorsList {

    private data: any;
    private NewVendorButton: HTMLButtonElement;

    constructor(data: any) {
        this.data = data;
        this.init();
    }

    private init(): void {
        this.setupGrids();

        this.NewVendorButton = document.querySelector("#new-vendor-button") as HTMLButtonElement;

        this.NewVendorButton.addEventListener("click", () => {
            window.location.href = "new";
        })


    }

    private setupGrids(): void {
        const tableHeight = 660;
        console.log("Vendor Grid", this.data);
        $("#vendors-grid").kendoGrid({
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
            reorderable: true,
            dataSource: {
                data: this.data,
                schema: {
                    model: {
                        id: "vendorID"
                    }
                }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.VendorGridSelectionChanged,
            columns: [
                { field: "vendorID", title: "ID", width: '10%' },
                { field: "vendorName", title: "Vendor", width: '20%' },
                { field: "businessType", title: "Bus Type" },
                { field: "workType", title: "Work Type", width: '20%' },
                { field: "status", title: "Status", width: '20%' }
            ]
        });

        Utilities.MoveKendoToolbar("#vendors-grid");
    }

    private VendorGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        console.log("Vendor List", arg.sender.select());
        window.location.href = selectedItem.vendorID;
    }
}

export class VendorDetailsItem {
    private data: any;
    private vendorContacts: any;

    private UploadDocButton: HTMLDivElement;

    private SaveButton: HTMLButtonElement;
    private CancelButton: HTMLButtonElement;
    private AddConButton: HTMLButtonElement;
    private RemConButton = new Array();

    private Phones: LinkedPhoneList;
    private Locs: LinkedLocationList;

    constructor(data: any) {
        this.data = data;
        console.log("Vendor Detail", this.data);
        this.init();
    }

    private init(): void {
        //console.log('Emails for', this.data.vendor.vendorID);
        //let email = {} as any;
        let param = {} as any;
        param.itemid = this.data.vendor.vendorID;
        param.itemtype = 'VENDOR';

        console.log('Email Param', param);

        this.Phones = new LinkedPhoneList(param);
        this.Locs = new LinkedLocationList(param);

        $('#location-grid').height(302);

        this.LoadLookups();
        this.BindData();
        this.LoadVendorContacts();
        this.SetupHeaderButtons();

        this.CancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
        this.CancelButton.addEventListener("click", () => {
            location.reload();
        });

        this.SaveButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.SaveButton.addEventListener("click", async (evt) => {
            let update = {} as any;
            update.VendorID = this.data.vendor.vendorID;
            update.VendorName = $("#vendorname").val();
            update.Domain = $("#domain").val();
            update.License = $("#license").val();
            update.BusinessType = $("#businesstype").data("kendoComboBox").value();
            let unionCheckbox = document.querySelector("#isunion") as HTMLButtonElement
            console.log("SaveButton isUnion", unionCheckbox);
            //update.IsUnion = unionCheckbox.checked;
            update.isUnion = $("#isunion:checked").val();
            update.Status = $("#status").val();
            update.isMBE = $("#ismbe:checked").val();
            update.isSBE = $("#issbe:checked").val();
            update.isVA = $("#isva:checked").val();
            update.EntCode = $("#entcode").val();   // Set actual EntCode
            update.COI = $("#coi").val();
            update.COIExp = $("#coiexp").val();
            update.W9 = $("#w9").val();
            update.WorkType = $("#worktype").data("kendoComboBox").value();
            update.ClassStatus = $("#classstatus").val();
            console.log("Update Vendor", update);

            let VVM = {} as any;
            VVM.vendor = update;
            VVM.PhoneNumbers = this.data.phoneNumbers;
            VVM.Locations = this.data.locations;
            let vendorUpdate = {} as any;

            if (update.VendorID == null || update.VendorID == 0) {
                console.log("Insert Vendor", VVM);
                vendorUpdate = await axios.post("api/vendor/InsertVendor", VVM);

            }
            else {
                try {
                    console.log("Update Vendor", update);
                    vendorUpdate = await axios.post("api/vendor/UpdateOnlyVendor", update);
                }
                catch {
                    console.log("Vendor Update Failed", vendorUpdate);
                }
            }

        });
   
    }

    private LoadLookups() {
        const grouped = this.groupBy(this.data.lookups, item => item.prompt);

        $("#businesstype").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("BusinessType"),
            filter: "contains",
            suggest: true,

        });

        $("#status").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Status"),
            filter: "contains",
            suggest: true,

        });

        $("#worktype").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("WorkType"),
            filter: "contains",
            suggest: true,

        });

    }

    private groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    }

    private SetupHeaderButtons() {
        let buttons = document.querySelectorAll(".grid-item-header-buttons.phone button");
        buttons[0].addEventListener("click", () => {
            $("#phone-grid").data("kendoGrid").addRow();
        });

        buttons[1].addEventListener("click", () => {
            $("#phone-grid").data("kendoGrid").saveChanges();
        });

        buttons[2].addEventListener("click", () => {
            $("#phone-grid").data("kendoGrid").cancelChanges();
        });


        buttons = document.querySelectorAll(".grid-item-header-buttons.location button");
        buttons[0].addEventListener("click", () => {
            $("#location-grid").data("kendoGrid").addRow();
        });

        buttons[1].addEventListener("click", () => {
            $("#location-grid").data("kendoGrid").saveChanges();
        });

        buttons[2].addEventListener("click", () => {
            $("#location-grid").data("kendoGrid").cancelChanges();
        });



    }

    private BindData() {
        console.log('BindData', this.data.vendor.vendorName);
        $("#vendorid").val(this.data.vendor.vendorID);
        $("#vendorname").val(this.data.vendor.vendorName);
        $("#domain").val(this.data.vendor.domain);
        $("#license").val(this.data.vendor.license);
        $("#businesstype").data("kendoComboBox").value(this.data.vendor.businessType); 
       // $("#businesstype").val(this.data.vendor.businessType);
        $("#isunion").val(this.data.vendor.isUnion);
        $("#status").data("kendoComboBox").value(this.data.vendor.status); 
       // $("#status").val(this.data.vendor.status);
        $("#ismbe").val(this.data.vendor.isMBE);
        $("#issbe").val(this.data.vendor.isSBE);
        $("#iswbe").val(this.data.vendor.isWBE);
        $("#isva").val(this.data.vendor.isVA);
        $("#coi").val(this.data.vendor.cOI);
        $("#coiexp").val(this.data.vendor.cOIExp);
        $("#w9").val(this.data.vendor.w9);
        $("#worktype").data("kendoComboBox").value(this.data.vendor.workType); 
        //$("#worktype").val(this.data.vendor.workType);
       // $("#companyCombo").data("kendoComboBox").value(this.data.contact.vendorID); 
        $("#classstatus").val(this.data.vendor.classStatus);
        $("#classexp").val(this.data.vendor.classExp);
        $("#entcode").val(this.data.vendor.entCode);
        $("#note").val(this.data.vendor.note);

    }

    private async LoadVendorContacts() {
        console.log("Start LoadVendorContacts");
        this.vendorContacts = await axios.get("api/vendor/GetContactbyVendorID?c=" + this.data.vendor.vendorID);
        console.log("LoadVendorContacts", this.vendorContacts);
        this.BuildVendorContactCards(this.vendorContacts.data);
    }

    private BuildVendorContactCards(vcontacts: any) {
        console.log("Start BuildVendorContactCards");
        const contactsContainer = document.querySelector(".vendor-contact-container");
        contactsContainer.innerHTML = "";
        this.RemConButton = new Array(vcontacts.data.length);
       
        for (let contact of vcontacts.data) {
            let itemDiv = document.createElement("div");
            itemDiv.className = "vendor-contact";
            itemDiv.nodeValue = contact.vendorLinkID;
            console.log("Start vendor-contact", contact);

            let toolDiv = document.createElement("div");
            toolDiv.className = "tool";
            let removeidbut = 'butRemoveContact' + contact.vendorLinkID;
            toolDiv.innerHTML = "<button id='" + removeidbut + "' class='btn remove' title='Remove' >x</button>"; //<svg class='grid - item - icon'>< use xlink: href = '/images/icons.svg#times' ></use></svg>
            toolDiv.nodeValue = contact.vendorLinkID;
            itemDiv.appendChild(toolDiv);

            let nameDiv = document.createElement("div");
            nameDiv.className = "name";
            nameDiv.innerText = contact.firstName + " " + contact.lastName;
            itemDiv.appendChild(nameDiv);

            let titleDiv = document.createElement("div");
            titleDiv.className = "title";
            titleDiv.innerText = contact.title;
            itemDiv.appendChild(titleDiv);

            let compDiv = document.createElement("div");
            compDiv.className = "company";
            compDiv.innerText = contact.company;
            itemDiv.appendChild(compDiv);

            let phoneDiv = document.createElement("div");
            phoneDiv.className = "phone";
            if (contact.phoneNumber == 'Phone')
                phoneDiv.innerText = contact.phoneNumber;
            else
                phoneDiv.innerHTML = "<a href='tel:" + contact.phoneNumber + "'>" + Utilities.FormatPhoneNumber(contact.phoneNumber) + "</a>";
            itemDiv.appendChild(phoneDiv);

            let emailDiv = document.createElement("div");
            emailDiv.className = "email";
            emailDiv.innerHTML = "<a href='mailto:" + contact.emailAddress + "'>" + contact.emailAddress + "</a>";
            itemDiv.appendChild(emailDiv);

            contactsContainer.appendChild(itemDiv);
            this.setupRemoveBut(removeidbut);
        }

        let NewDiv= document.createElement("div");
        NewDiv.className = "vendor-contact";

        let titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.innerHTML = "<h3>New Vendor Contact</h3>";
        NewDiv.appendChild(titleDiv);

        let nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.innerHTML = '<input id="nameCombo" name="nameCombo" placeholder="Select Contact.."  style="width: 100%" />';
        NewDiv.appendChild(nameDiv);

        console.log("End BuildVendorContactCards New Card", NewDiv);
        contactsContainer.appendChild(NewDiv);
        this.setupNewContactCombo("PRO1");
        //this.setupNewContactButtton("PRO1");
       
    }

    private setupRemoveBut(e: any) {
        console.log("setupRemoveBut 1", e);
        let but = document.querySelector("#" + e) as HTMLButtonElement;
        console.log("setupRemoveBut 2", but);
        this.RemConButton.push(but);
      //  this.RemConButton.push( document.querySelector("#" + e ) as HTMLButtonElement);
        console.log("setupRemoveBut 3", this.RemConButton.length);
        this.RemConButton[this.RemConButton.length -1].addEventListener("click", async (evt) => {
            console.log("butRemoveContact", evt);
            var id = this.RemConButton[this.RemConButton.length - 1].id;
            var str = id.replace("butRemoveContact", "");
            var vendorlinkid = Number(str);
            console.log("butRemoveContact evt", str);
            let result = await axios.post("api/vendor/RemoveVendorContactbyID?c="+ vendorlinkid);
            if (result) {
                this.LoadVendorContacts();
            }
        });
    }

    private setupNewContactCombo(e: any) {
        console.log("Start setupNewContactCombo", e);
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
            noDataTemplate: $("#noDataTemplate").html(),
            dataBound: (e) => {
                this.AddConButton = document.getElementById("new-contact-button") as HTMLButtonElement;
                this.AddConButton.addEventListener("click", async (evt) => {
                    console.log("Start setupNewContactButtton", e);
                    let basicContact = {} as any;
                    basicContact.VendorID = this.data.vendor.vendorID;
                    basicContact.VendorName = this.data.vendor.vendorName;
                    basicContact.Writer = "L Edwards";
                    basicContact.EntCode = this.data.vendor.entCode;
                    basicContact.ShowAs = $("#nameCombo").data("kendoComboBox").input.val();
                    console.log("Mid setupNewContactButtton", basicContact);
                    if (basicContact.ShowAs != null) {
                        let vendorContact = await axios.post("api/vendor/CreateBasicVendorContact", basicContact);
                        if (vendorContact != null) {
                            this.LoadVendorContacts();
                        }
                    }
                });
            },
        });

        $("#nameCombo").data("kendoComboBox").bind("change", async (e) => {
            console.log("onSelect", e);
            var dataItem = e.sender._valueBeforeCascade;
            let basicContact = {} as any;
            basicContact.VendorID = this.data.vendor.vendorID;
            basicContact.VendorName = this.data.vendor.vendorName;
            basicContact.Writer = "L Edwards";
            basicContact.EntCode = this.data.vendor.entCode;
            basicContact.ContactID = Number(dataItem);
            console.log("onSelect 2 ", basicContact);
            let vc = await axios.post("api/vendor/NewVendorLink", basicContact);
            console.log("onSelect End ", vc);
            this.LoadVendorContacts();
        }); 

        console.log("End setupNewContactCombo", e);
    }

}

