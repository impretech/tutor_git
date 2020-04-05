import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { LinkedEmailList } from "./components/email.js";
import { LinkedPhoneList } from "./components/phone.js";
import { LinkedLocationList } from "./components/location.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";

import { Utilities } from "./utilities.js";

export class ContactsList {

    private data: any;
    private NewContactButton: HTMLButtonElement;

    constructor(data: any) {
        this.data = data;
        this.init();
    }

    private init(): void {
        this.setupGrids();

        this.NewContactButton = document.querySelector("#new-contact-button") as HTMLButtonElement;

        this.NewContactButton.addEventListener("click", () => {
            window.location.href = "new";
        })
    }

    private setupGrids(): void {
        const tableHeight = 660;
        console.log("Contact Grid", this.data);
        $("#contacts-grid").kendoGrid({
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
                        id: "contactID"
                    }
                }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.ContactGridSelectionChanged,
            columns: [
                { field: "firstName", title: "First Name", width: '20%' },
                { field: "lastName", title: "Last Name"},
                { field: "jobTitle", title: "Title", width: '20%' },
                { field: "company", title: "Company", width: '20%' }
            ]
        });

        Utilities.MoveKendoToolbar("#contacts-grid");
    }

    private ContactGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        console.log("Contact List", arg.sender.select());
        window.location.href = selectedItem.contactID;
    }
}


export class ContactDetailsItem {
    private data: any;
    private UploadDocButton: HTMLDivElement;
    private docUpload: DocUploadModal;
    private SaveButton: HTMLButtonElement;
    private CancelButton: HTMLButtonElement;

    private Emails: LinkedEmailList;
    private Phones: LinkedPhoneList;
    private Locs: LinkedLocationList;
    private AddConButton: HTMLButtonElement;

    constructor(data: any) {
        this.data = data;
        console.log("Contact Detail",this.data);
        this.init();
    }

    private init(): void {
        let param = {} as any;
        param.itemid = this.data.contact.contactID;
        param.itemtype = 'CONTACT';

        console.log('Email Param', param);
        this.Emails = new LinkedEmailList(param);
        this.Phones = new LinkedPhoneList(param);
        this.Locs = new LinkedLocationList(param);

        this.docUpload = new DocUploadModal();

        this.SaveButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.SaveButton.addEventListener("click", async (evt) => {
            let update = {} as any;
            update.ContactID = this.data.contact.contactID;
            update.FirstName = $("#firstname").val();
            update.LastName = $("#lastname").val();
            update.JobTitle = $("#jobtitle").val();
            update.VendorID = $("#companyCombo").val();
            update.Company = this.data.contact.company;
            update.Username = "";
            update.Dept = $("#dept").val();
            update.Prefix = $("#prefix").val();
            update.Suffix = $("#suffix").val();
            update.DOB = new Date();
            update.EntCode = "PRO1";   // Set actual EntCode
            update.MiddleName = "";
            update.PreferredName = $("#preferredName").val();
            update.ShowAsName = $("#showasname").val();
            update.Note = $("#note").val();
            update.URL = "";
            console.log("Update Contact", update);

            let CVM = {} as any;
            CVM.contact = update;
            CVM.Emails = this.data.emails;
            CVM.PhoneNumbers = this.data.phoneNumbers;
            CVM.Locations = this.data.locations;
            let contactUpdate = {} as any;

            if (update.ContactID == null || update.ContactID == 0) {
                console.log("Insert Contact", CVM);
                contactUpdate = await axios.post("api/contact/InsertContact", CVM);
                
            }
            else {
                try {
                    console.log("Update Contact", update);
                    contactUpdate = await axios.post("api/contact/UpdateOnlyContact", update);
                }
                catch {
                    console.log("Contact Update Failed", contactUpdate);
                }
            }

        });

        this.CancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
        this.CancelButton.addEventListener("click", () => {
            location.reload(); 
        });

        this.UploadDocButton = document.querySelector("#doc-button") as HTMLDivElement;
        this.UploadDocButton.addEventListener("click", () => {
            //this.docUpload.Show(this.data.project.projectId, this.data.project.entCode, "Project", this.data.project.projectId);
           // this.docUpload.ShowForOther("Contact", this.data.contact.contactID, 0,  "PRO1", null);
            console.log("doc-button Show", this.data.contact.contactID);
            this.docUpload.Show(0, "PRO1", "Contact", this.data.contact.contactID);
        });
     
        this.setupRoleGrid();
        this.setupCompanyCombo("PRO1");  //add actual entcode **************
        this.BindData();
    }

    private setupCompanyCombo(e : any) {
        $("#companyCombo").kendoComboBox({
            placeholder: "Select Vendor...",
            dataTextField: "vendorName",
            dataValueField: "vendorID",
            template: '<span><p>#: vendorName # (#: businessType #)</p></span>',
            autoBind: false,
            minLength: 3,
            filter: "contains",
            dataSource: {
                serverFiltering: false,
                transport: {
                    read: { url: "../api/contact/GetVendorsByEnt?e=" + e, dataType: "json", type: "GET" },
                },
                suggest: true,
            },
            noDataTemplate: $("#noDataTemplate").html(),
            change: (e) => {
                console.log("CompanyCombo Change",e.sender.text());
                this.data.contact.company = e.sender.text();
            },
            dataBound: (e) => {
                this.AddConButton = document.getElementById("new-vendor-button") as HTMLButtonElement;
                this.AddConButton.addEventListener("click", async (evt) => {
                    let entcode = this.data.contact.entCode;
                    let ven = $("#companyCombo").data("kendoComboBox").input.val();
                    console.log("Add Company AddConNutton", ven);
                    let vendor = await axios.post("api/contact/CreateNewVendor?c=" + ven + "&e=" + entcode);
                    console.log("Add Company AddConNutton", vendor);
                    if (vendor != null) {
                        var dataSource = e.sender;
                        var data = dataSource.dataSource.data();
                        console.log("Add AddConNutton", data);
                        data.splice(0, 0, vendor);
                        dataSource.dataSource.at(0);
                        $("#companyCombo").data("kendoComboBox").select(0);
                        $("#companyCombo").data("kendoComboBox").close();
                    }
                });
            },
        });
    }

    private setupRoleGrid(): void {
   
        console.log("Role Grid", this.data.contactRoles);
        $("#roles-grid").kendoGrid({
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
                data: this.data.contactRoles,
                schema: {
                    model: {
                        id: "projectTeamID"
                    }
                }
            },
            //height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            //change: this.ContactGridSelectionChanged,
            columns: [
                { field: "role", title: "Role", width: '15%' },
                { field: "title", title: "Project Title" },
                { field: "projectNo", title: "Project No", width: '15%' },
                { field: "phase", title: "Phase", width: '20%' },
                { field: "status", title: "Status", width: '20%' }
            ]
        });

        Utilities.MoveKendoToolbar("#roles-grid");
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


        buttons = document.querySelectorAll(".grid-item-header-buttons.email button");
        buttons[0].addEventListener("click", () => {
            $("#email-grid").data("kendoGrid").addRow();
        });

        buttons[1].addEventListener("click", () => {
            $("#email-grid").data("kendoGrid").saveChanges();
        });

        buttons[2].addEventListener("click", () => {
            $("#email-grid").data("kendoGrid").cancelChanges();
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
        $("#contactid").val(this.data.contact.contactID);
        $("#prefix").val(this.data.contact.prefix);
        $("#firstname").val(this.data.contact.firstName);
        $("#lastname").val(this.data.contact.lastName);
        $("#suffix").val(this.data.contact.suffix);
        console.log("Binding Company VendorID: ", this.data.contact);
        $("#companyCombo").data("kendoComboBox").value(this.data.contact.vendorID);   //.val(this.data.contact.company);
        $("#jobtitle").val(this.data.contact.jobTitle);
        $("#dept").val(this.data.contact.dept);
        $("#preferredname").val(this.data.contact.preferredName);
        $("#showasname").val(this.data.contact.showAsName);
        $("#note").val(this.data.contact.note);

        console.log("Emails", this.data.emails)
    }

}
