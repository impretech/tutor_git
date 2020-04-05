import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
import { Tabs } from "./components/tabs.js";

import { ProjectBudgetBar } from "./components/project-budget-bar.js";
import { Notification } from "./components/notification.js";


export class DepositsList {

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

        

        console.log("Budget Grid", this.data);

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
                        id: "depositID"
                    }
                },
                sort: { field: "depositID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.BudgetGridSelectionChanged,
            columns: [
                { field: "projectTitle", title: "Project", width: '15%' },
                { field: "description", title: "Description" },
                { field: "depositDate", title: "Created", width: '20%', template: '#= kendo.toString(kendo.parseDate(depositDate), "MM/dd/yyyy") #' },
                { field: "status", title: "Status", width: '10%' }, 
                {
                    field: "total", title: "Total", width: '15%', attributes: {
                        "class": "currency",
                    }, template: '#= kendo.toString(total, "c") #' }
            ]
        });

        Utilities.MoveKendoToolbar("#contacts-grid");
    }

    private BudgetGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        console.log("Deposit List", arg.sender.select());
        window.location.href = selectedItem.depositID;
    }
}


export class DepositDetailsItem {
    private data: any;
    private orig: any;
    private user: any;

    private UploadDocButton: HTMLDivElement;
    private docUpload: DocUploadModal;

    private DepositButton: HTMLButtonElement;
    private DraftButton: HTMLButtonElement;
    private CancelButton: HTMLButtonElement;

    private GeneralViewButton: HTMLSpanElement;
    private DetailViewButton: HTMLSpanElement;


    private projects: any;
    private contacts: any;
    private budgets: any;
    private IsDirty: Boolean;

    private BudgetBar: ProjectBudgetBar;
    private notification: Notification;


    constructor(data: any) {
        this.data = data;
        if (this.data.dep.depositID == 0) {
            this.data.dep.depositDate = kendo.toString(new Date(), 'MM/dd/yyyy');
        }
        this.orig = Utilities.deep(this.data)
        this.init();
        this.IsDirty = false;
    }

    private async init(): Promise<void> {
        this.docUpload = new DocUploadModal();
        console.log("bud Init", this.data);

        this.setupCharts();
        this.GetCurrentUser();

        this.BudgetBar = new ProjectBudgetBar('.project-budget-bar');
        this.notification = new Notification();

        let finBarData = {
            budgetTot: 2234456.2,
            depositTot: 1942020,
            invoicePaidTot: 760263.29,
            invoiceTot: 980761.24,
            poCommittedTot: 1120450,
            poPendingTot: 340581,
        };
        this.BudgetBar.Load(finBarData);

        

        
        this.DepositButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.DepositButton.addEventListener("click", async (evt) => {
            this.Deposit();
        });

        this.DraftButton = document.querySelector("#draft-button") as HTMLButtonElement;
        this.DraftButton.addEventListener("click", async (evt) => {
            this.Draft();
        });

        this.CancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
        this.CancelButton.addEventListener("click", () => {
            window.location.href = "/deposits/";
        });

        this.UploadDocButton = document.querySelector(".doc-button") as HTMLDivElement;
        this.UploadDocButton.addEventListener("click", () => {
            this.docUpload.Show(this.data.dep.projectID, this.data.dep.entCode, "bud", this.data.dep.budgetID);
        });

        const tabs = document.querySelector(".container--tabs")
        const tab1 = new Tabs(tabs);

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

        let backButton = document.querySelector(".back-button") as HTMLDivElement;

        if (backButton != null) {
            backButton.addEventListener("click", async (evt) => {
                evt.preventDefault();

                window.location.href = "/deposits/";
            });
        }


        const addNoteButton = document.querySelector("#add-note-button") as HTMLButtonElement;
        addNoteButton.addEventListener("click", async (evt) => {
            addNoteButton.disabled = true;
            evt.preventDefault();

            let noteText = $('#new-note').val();

            let note = {} as any;
            note.ProjectID = parseInt(this.data.dep.projectID);
            note.writer = this.user.userName;
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = this.data.dep.depositID;
            note.itemType = "Deposit";

            let noteDiv = this.CreateNote(note);
            console.log("AddNote", note);
            let prevNotes = document.querySelector(".previous-notes");
            prevNotes.insertBefore(noteDiv, prevNotes.childNodes[0]);
            $('#new-note').val("");

            const noteUpdate = await axios.post("api/note/addNote", note);

            addNoteButton.disabled = false;
        });

        $("#date").kendoDatePicker();

 
        $("#switch").kendoSwitch({
            checked: true,
            change: function (e) {
                if (!e.checked) {
                    $("#myCarousel").hide();
                    $("#emailGridBox").show();
                }
                else {
                    $("#myCarousel").show();
                    $("#emailGridBox").hide();
                }
            }
        });

       

        
        $(".project-notes-handle").click(() => {
            $(".project-notes").toggleClass("hide")
            $(".expand-symbol").toggle()
            $(".collapse-symbol").toggle()
        })

        if (this.data.dep.depositID === 0) {
            this.DepositButton.disabled = true;
            this.DraftButton.disabled = true;
        }

        await this.LoadContactsAndProjectsAndDeposits();
        this.LoadLookups();
        
        this.BindData();
        this.LoadCategories();
        this.LoadDetails();

       

       
        this.LoadAddContactKendoWindow();

        this.GetEmails();
        this.BuildNotes();

       
        $(".expand-all-btn").click((e) => {
            this.detailsExpandAll();
        });

        $(".collapse-all-btn").click((e) => {
            this.detailsCollapseAll();
        });

        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
         }

        console.log($("#project").data("kendoComboBox").value())
        $("input").change(() => {
            this.IsDirty = true;
            // Validation Check for Required fields
            if ($("#project").data("kendoComboBox").value() != ''
                && $("#description").val() != ''
                && $("#transaction-type").data("kendoComboBox").value() != ''
                && $("#use-type").val()) {
                this.DepositButton.disabled = false;
                this.DraftButton.disabled = false;
            }
            else {
                this.DepositButton.disabled = true;
                this.DraftButton.disabled = true;
            }
        })
    }

    private async GetCurrentUser(): Promise<void> {

        let userData = await axios.get("api/budget/GetCurrentUser")
        this.user = userData.data;
        console.log(this.user)
    }

    private LoadAddContactKendoWindow(): void {

        $("#add-contact").kendoComboBox({
            dataTextField: "username",
            dataValueField: "contactID",
            dataSource: this.contacts,
            filter: "contains",
            suggest: true,
            index: 0
        });

        let contKendoWindow = $("#cont-add-window").kendoWindow({
            title: "Add Contributor",
            resizable: true,
            modal: true,
            width: '300px'
        });
        contKendoWindow
            .find(".save-button")
            .click(() => {
                console.log('contributor add');
                contKendoWindow.data("kendoWindow").close();

                let contactid = contKendoWindow.find("#add-contact").val();
                
                const contInsert = axios.post("api/deposit/insertContributor?contactid=" + contactid + "&depositid=" + this.data.dep.depositID).then(() => {
                    this.ReloadContributors();
                });

            })
            .end();

        contKendoWindow
            .find(".cancel-button")
            .click(() => { contKendoWindow.data("kendoWindow").close(); })
            .end();

        let contributorAddButton = document.querySelector("#cont-add-btn") as HTMLLinkElement;
        contributorAddButton.addEventListener("click", () => {
            $("#cont-add-window").data("kendoWindow")
                .center().open();
        });

        
    }

    private setupCharts(): void {
        const chartHeight = 160;
        const chartWidth = 200;
        $("#budget-chart").kendoChart({
            legend: {
                visible: false
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
                holeSize: 50
            },
            seriesColors: ["#FFBF48", "#CF5F67", "#3392A7", "#8633A7", "#87D674", "#6876D4", "#30E6D4", "#90143A"],
            series: [{
                name: "Status",
                field: "value",
                categoryField: "category"
            }],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #%"
            },
            panes: [
                { name: "top-pane", background: "rgb(252, 252, 252)" },
                { name: "bottom-pane", background: "rgb(252, 252, 252)" }
            ]
        });


    }

    private LoadChartData(categories) {
        let chartArray = [];
        let costTotal = 0;

        categories.forEach(item => {
            costTotal += item.cost;
        });
        
        chartArray = categories.map(item => {
            return {
                category: item.category,
                value: (item.cost / costTotal * 100).toFixed(2)
            };
        });
        
        let chart = $('#budget-chart').data('kendoChart');

        chart.options.series[0].data = chartArray;
        chart.redraw();
    }

    private setupProjectItems() {
        let projectItems = document.querySelector(".project-components") as HTMLDivElement;
        let typesLinks = projectItems.querySelectorAll("a");

        typesLinks.forEach((item, key) => {
            item.classList.remove("open");
            item.addEventListener("click", (evt) => {
                evt.preventDefault();

                this.hideShowTable(item);
            });
        });
    }

    private hideShowTable(a: HTMLAnchorElement, force: boolean = false) {

        let typeName = a.getAttribute("href");

        if (a.classList.contains("open")) {
            a.classList.remove("open");
        }
        else {  //open and show 
            a.classList.add("open");
        }
    }

    private async LoadContactsAndProjectsAndDeposits() {
        if (this.data.dep.budgetID == 0)
            this.data.dep.entCode = "PRO1";
        const contacts = await axios.get("api/deposit/GetContactsList?entcode=" + this.data.dep.entCode);
        this.contacts = contacts.data;
        const projects = await axios.get("api/deposit/GetProjectsList?entcode=" + this.data.dep.entCode);
        this.projects = projects.data;

        const budgets = await axios.get("api/deposit/GetBudgetsList?id=" + this.data.dep.projectID + "&entcode=" + this.data.dep.entCode);
        this.budgets = budgets.data;

        
    }

    private LoadLookups() {
        if (this.data.dep.depositID == 0)
            this.data.dep.entCode = "PRO1";


        $("#project").kendoComboBox({
            dataTextField: "title",
            dataValueField: "projectId",
            dataSource: this.projects,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                var projectid = e.sender.value();

                const budgets = await axios.get("api/deposit/GetBudgetsList?id=" + projectid + "&entcode=" + this.data.dep.entCode);
                this.budgets = budgets.data;

                console.log('reload budgets', this.budgets);

                if (this.budgets.length > 0) {
                    let budget = this.budgets[0]
                    console.log(budget)
                    
                    $("#budget-id").val(budget.budgetID);
                    $("#budget-title").val(kendo.toString(budget.total, "c"));
                    $("#funding-source").val(budget.accountNo);

                    // pull categories
                    this.ReloadCategories(budget.budgetID);

                    
                }
                else {
                    $("#budget-id").val(0);
                    $("#budget-title").val("");
                    $("#funding-source").val('');
                    $(".categories").html("");
                    $(".detail-pane .detail-data").html("");
                }

            },
        });
        if (this.data.dep.projectID > 0)
            $("#project").data("kendoComboBox").value(this.data.dep.projectID);


        let budget = this.budgets.find(item => {
            return item.budgetID == this.data.dep.budgetID;
        })
        if (budget != null) {
            $("#budget-id").val(budget.budgetID)
            $("#budget-title").val(kendo.toString(budget.total, "c"))
        }

        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
       


        $("#transaction-type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("TransactionType"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        $("#use-type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("UseType"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        $("#funding-type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("FundingType"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        
  
       
    }

    private LoadCategories() {
        kendo.culture("en-US");

        let categories = this.data.details.categories;

        if (categories === null || categories.length === 0)
            categories = [];

        this.DrawCategoriesAndChart(categories);
    }

    private detailsExpandAll() {
        $(".detail-pane .detail-data table").removeClass("collapse");
        
        $(".detail-pane .detail-data").find("thead .category-expand-btn").hide();
        $(".detail-pane .detail-data").find("thead .category-collapse-btn").show();

        $(".expand-all-btn").hide();
        $(".collapse-all-btn").show();
    }

    private detailsCollapseAll() {
        $(".detail-pane .detail-data table").addClass("collapse");


        $(".detail-pane .detail-data").find("thead .category-expand-btn").show();
        $(".detail-pane .detail-data").find("thead .category-collapse-btn").hide();

        $(".expand-all-btn").show();
        $(".collapse-all-btn").hide();
    }

    private detailsExpandCat(budcatid) {
        let table = $(".detail-pane .detail-data").find(`table[budcatid='${budcatid}']`)

        table.find("thead .category-expand-btn").hide();
        table.find("thead .category-collapse-btn").show();
        table.removeClass("collapse");
        
    }
    private LoadDetails() {
        kendo.culture("en-US");

        const categories = this.data.details.categories;
        const details = this.data.details.depDetails;
        
        if (categories === null || categories.length === 0 || details === null || details.length === 0)
            return;

        this.DrawDetailsTable(categories, details);
        
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

    private BindData() {
        if (this.data.dep.status == "Deposited") {
            this.DepositButton.disabled = true;
            this.DraftButton.disabled = true;
        }
        $("#date").val(Utilities.FormatDateString(this.data.dep.depositDate));

        $("#ad").val(this.data.dep.addendum);
        $("#description").val(this.data.dep.description);
        $("#transaction-type").data("kendoComboBox").value(this.data.dep.depositType);
        $("#use-type").data("kendoComboBox").value(this.data.dep.useType);
        $("#funding-type").val(this.data.dep.fundingType);
        $("#status").val(this.data.dep.status);

        
        $("#funding-source").val(this.data.dep.fundingSource);

        var conArray = this.data.contributors.map(item => {
            return {
                id: item.contactID,
                item: item.showAsName
            }
        });
        var dataSource = new kendo.data.DataSource({
            data: conArray,
            pageSize: 100
        });

        $("#contributors").kendoListView({
            template: kendo.template("<div> ${item}</div>"),
            dataSource: dataSource
        });


        
    }

    private async Save() {
        this.DepositButton.disabled = true;
        this.DraftButton.disabled = true;
        document.body.classList.toggle("wait");
        

        this.data.dep.projectID = parseInt($("#project").data("kendoComboBox").value());
        this.data.dep.budgetID = $("#budget-id").val();

        this.data.dep.depositDate = $("#date").val();


        this.data.dep.description = $("#description").val();
        this.data.dep.depositType = $("#transaction-type").data("kendoComboBox").value();
        this.data.dep.useType = $("#use-type").val();
        this.data.dep.fundingType = $("#funding-type").data("kendoComboBox").value();
        this.data.dep.fundingSource = $("#funding-source").val();

        this.data.dep.reason = "TBD";
        this.data.dep.entCode = this.data.dep.entCode;

        if (this.data.dep.projectID == 0 ||
            this.data.dep.description == "" ||
            this.data.dep.depositType == "" ||
            this.data.dep.useType == "") {
            this.notification.ShowNotification("Validation Error!", "You should fill in the required fields", "error")
            
            document.body.classList.toggle("wait");
            this.DepositButton.disabled = false;
            this.DraftButton.disabled = false;
            this.DepositButton.classList.remove('running');
            this.DraftButton.classList.remove('running');
            return false;
        }

        let total_deposit = 0;
        this.data.details.categories.forEach(item => {
            total_deposit += item.deposit;
        });
        this.data.dep.total = total_deposit;

        console.log('deposit save', this.data.dep);
        if (this.data.dep.depositID == 0) {
            try {
                const depInsert = await axios.post("api/deposit/InsertDeposit", this.data.dep);
                console.log('new depositID', depInsert.data.depositID)
                this.data.dep.depositID = depInsert.data.depositID
                console.log('insert categories', this.data.details.categories);

                let results = this.data.details.categories.map(async (cat) => {
                    cat.depositID = this.data.dep.depositID;
                    let insertCat = await axios.post("api/deposit/InsertDepCategory", cat);
                    console.log('insertCat', insertCat)
                    cat.depCatID = insertCat.data.depCatID
                })

                await Promise.all(results)

                console.log('insert details', this.data.details.depDetails);
                this.data.details.depDetails.forEach(async (detail) => {
                    let cat = this.data.details.categories.find((cat_item) => {
                        return cat_item.budCatID == detail.budCatID;
                    })

                    detail.depositID = this.data.dep.depositID
                    detail.depCatID = cat.depCatID
                    await axios.post("api/deposit/InsertDepDetail", detail);
                })

                //            setTimeout(function () { window.location.href = "/deposits/" + depInsert.data.depositID }, 2000);
                $(".page-header h3").html("Financial - Deposit - " + this.data.dep.depositID)
                this.notification.ShowNotification("Save Success!", "Deposit Inserted Successfully", "success")
                this.orig = Utilities.deep(this.data)
                this.IsDirty = false;
                history.pushState({
                    id: 'homepage'
                }, 'Deposit Details - Syvenn', '/deposits/' + this.data.dep.depositID);

                $("#ad").val(this.data.dep.addendum);
                $("#status").val(this.data.dep.status);

            }
            catch (error) {
                this.notification.ShowNotification("Save Failed", error, "error")
            }
        }
        else {
            try {
                this.orig.dep.depositDate = Utilities.FormatDateString(this.orig.dep.depositDate)
                this.orig.dep.reason = "TBD"

                /*if (this.orig.dep.projectID == dep.projectID &&
                    this.orig.dep.budgetID == dep.budgetID &&
                    this.orig.dep.depositDate == dep.depositDate &&
                    this.orig.dep.description == dep.description &&
                    this.orig.dep.depositType == dep.depositType &&
                    this.orig.dep.useType == dep.useType &&
                    this.orig.dep.fundingType == dep.fundingType &&
                    this.orig.dep.fundingSource == dep.fundingSource &&
                    this.orig.dep.status == dep.status &&
                    this.orig.dep.total == dep.total) {
                    document.body.classList.toggle("wait");
                    this.DepositButton.disabled = false;
                    return false;
                }*/

                const depUpdate = await axios.put("api/deposit/UpdateDeposit", this.data.dep);
                this.orig = Utilities.deep(this.data)
                this.IsDirty = false;
                if (this.data.dep.budgetID != this.orig.dep.budgetID) {

                    await axios.delete("api/deposit/DeleteDepositCatAndDet?id=" + this.data.dep.depositID);

                    console.log('insert new categories', this.data.details.categories);

                    let results = this.data.details.categories.map(async (cat) => {
                        let insertCat = await axios.post("api/deposit/InsertDepCategory", cat);
                        console.log('insertCat', insertCat)
                        cat.depCatID = insertCat.data.depCatID
                    })

                    await Promise.all(results)

                    console.log('insert new details', this.data.details.depDetails);
                    this.data.details.depDetails.forEach(async (detail) => {

                        let cat = this.data.details.categories.find((cat_item) => {
                            return cat_item.budCatID == detail.budCatID;
                        })

                        detail.depCatID = cat.depCatID
                        await axios.post("api/deposit/InsertDepDetail", detail);
                    })
                }
                else {
                    console.log('update categories', this.data.details.categories);
                    this.data.details.categories.forEach(async (item) => {
                        await axios.put("api/deposit/UpdateDepCat", item);
                    })

                    console.log('update details', this.data.details.depDetails);
                    this.data.details.depDetails.forEach(async (dep) => {
                        await axios.put("api/deposit/UpdateDepDetail", dep);
                    })
                }
                
                $("#ad").val(this.data.dep.addendum);
                $("#status").val(this.data.dep.status);
                
                //            setTimeout(function () { location.reload(true); }, 2000);
                this.notification.ShowNotification("Save Success!", "Deposit Updated Successfully", "success")
            }
            catch (error) {
                this.notification.ShowNotification("Save Failed", error, "error")
            }
        }


        document.body.classList.toggle("wait");
        if (this.data.dep.status != "Deposited") {
            this.DepositButton.disabled = false;
            this.DraftButton.disabled = false;
        }
        this.DepositButton.classList.remove('running');
        this.DraftButton.classList.remove('running');
    }

    private async Deposit() {
        this.data.dep.status = "Deposited";
        let adVal = $("#ad").val();
        this.data.dep.addendum = parseInt(adVal.toString()) + 1;
        this.DepositButton.classList.add('running');
        this.Save()
    }

    private async Draft() {
        this.data.dep.status = "Draft";
        let adVal = $("#ad").val();
        this.data.dep.addendum = parseInt(adVal.toString());
        this.DraftButton.classList.add('running');
        this.Save()
    }

    private BuildNotes() {
        const notes = document.querySelector(".previous-notes");
        notes.innerHTML = "";

        this.data.notes.forEach((item, key) => {
            let note = this.CreateNote(item);
            notes.appendChild(note);
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

  
    private async GetEmails() {
        if (this.data.dep.budgetID == 0)
            return;
        const emails = await axios.get("api/budget/GetAttachDocs?entcode=" + this.data.dep.entCode + "&id=" + this.data.dep.budgetID);
        console.log('emails', emails);
        this.MakeCarousel(emails.data);
        this.LoadEmailsGrid(emails.data);
    }

    private MakeCarousel(data) {
        if (data.length == 0)
            return;

        const itemContainer = $('#myCarousel .carousel-inner');
        const indicatorContainer = $('#myCarousel .carousel-indicators');

        let carouselItemDiv;
        let rowDiv;
        data.forEach((item, index) => {
            if (index % 4 == 0) {
                if (index > 0) {
                    carouselItemDiv.appendChild(rowDiv);
                    itemContainer.append(carouselItemDiv);
                    carouselItemDiv = document.createElement("div");
                    carouselItemDiv.className = "item carousel-item";
                }
                else {
                    carouselItemDiv = document.createElement("div");
                    carouselItemDiv.className = "item carousel-item active";
                }

                rowDiv = document.createElement("div");
                rowDiv.className = "row";
            }
            let itemDiv = this.CreateCard(item);
            rowDiv.appendChild(itemDiv);
        });

        carouselItemDiv.appendChild(rowDiv);

        itemContainer.append(carouselItemDiv);
        let index = 0;
        for (let i = 0; i < data.length; i += 4) {
            let indicatorLi = document.createElement("li");
            indicatorLi.setAttribute('data-target', '#myCarousel');
            indicatorLi.setAttribute('data-slide-to', index.toString());
            if (i == 0)
                indicatorLi.className = "active";

            indicatorContainer.append(indicatorLi);
            index++;
        }

        $('#myCarousel').bind('slide.bs.carousel', function (e) { });
    }

    private LoadEmailsGrid(data) {

        $("#emails-grid").kendoGrid({
            dataSource: {
                data: data,
                schema: {
                    model: {
                        id: "docID"
                    }
                },
                sort: { field: "docID", dir: "desc" }
            },
            height: 260,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            columns: [
                { field: "docID", title: "ID", width: '5%' },
                { field: "type", title: "Type", width: '20%' },
                { field: "createdBy", title: "Created By", width: '20%' },
                { field: "name", title: "Name", width: '20%' },
            ]
        }).on("click", "tbody td", (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#emails-grid").data("kendoGrid");

            document.body.classList.toggle("wait");

            var dataItem = grid.dataItem(cell.closest("tr")) as any;
            console.log('click', dataItem);
            this.getDocUrl(dataItem.docID as number);
        });
    }

    private async getDocUrl(docId: any) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        console.log('docUrl', docUrl.data);
        window.open(docUrl.data);
        document.body.classList.toggle("wait");
    }

    private CreateCard(item: any): HTMLDivElement {
        let columnDiv = document.createElement("div");
        columnDiv.className = "col-md-3";

        let itemDiv = document.createElement("div");
        itemDiv.className = "email-box";

        /*  
         * 
         * <div class="email-header" >
            <span>DocID: 1000(DocID) < /span>
            < span > From: ledwards@prosysusa.com(CreatedBy)</span>
            < span > Name: This is an email about a submittal(Name) < /span>
        *  < /div>
        *
        */
        let headerDiv = document.createElement("div");
        headerDiv.className = "email-header";

        let DocIdSpan = document.createElement("span");
        DocIdSpan.innerText = item.docID;
        headerDiv.appendChild(DocIdSpan);

        let fromSpan = document.createElement("span");
        fromSpan.innerText = item.createdBy;
        headerDiv.appendChild(fromSpan);

        let nameSpan = document.createElement("span");
        nameSpan.innerText = item.name;
        headerDiv.appendChild(nameSpan);

        /*
         * 
         * < div class="email-content" >
               <img src="/images/room.jpg" />
            </div>
        *
        */
        let contentDiv = document.createElement("div");
        contentDiv.className = "email-content";

        let contentImage = document.createElement("img");
        contentImage.src = 'data:image/png;base64,' + item.image;
        contentDiv.appendChild(contentImage);


        /*
         * 
         * < div class="email-footer" >
                <span>Attachments: 1001, 1002, 1003 < /span>
         *  < /div>
        *
        */
        let footerDiv = document.createElement("div");
        footerDiv.className = "email-footer";

        let attachSpan = document.createElement("span");
        attachSpan.innerText = 'Attachments: ';


        if (item.attachments != null && item.attachments.length > 0) {
            item.attachments.forEach((a, i) => {
                if (i >= 0)
                    attachSpan.innerText += " , ";
                attachSpan.innerText += a;
            })

        }
        footerDiv.appendChild(attachSpan);



        itemDiv.appendChild(headerDiv);
        itemDiv.appendChild(contentDiv);
        itemDiv.appendChild(footerDiv);



        // add click event listener
        itemDiv.onclick = async () => {
            console.log('card type', item.type);
            document.body.classList.toggle("wait");
            let responseText;

            if (item.type == 'Email') {


                let message = await axios.get("api/Message/getMessageByID?messid=" + item.itemNo);
                console.log('message', message);
                let closeButton = document.createElement("button");
                closeButton.className = "btn teal"
                closeButton.setAttribute("style", "float:right; margin-left: 1em; margin-top: 7px; margin-right: 1em;");
                closeButton.innerText = "Close"
                closeButton.onclick = async () => {
                    $("#emailBox").hide();
                };

                let expandButton = document.createElement("button");
                expandButton.className = "btn teal"
                expandButton.setAttribute("style", "float:right; margin-right: 7px; margin-top: 7px;");
                expandButton.disabled = true;
                expandButton.innerText = "Expand"


                let addButton = document.createElement("button");
                addButton.className = "btn yellow email-response-add-button"
                addButton.setAttribute("style", "margin-left: 7px;");
                addButton.innerText = "Add"
                addButton.onclick = async () => {
                    $("#emailBox").hide();
                };

                let combo = document.createElement("input");
                combo.className = "email-response-type";
                combo.id = "email-response-type";
                combo.setAttribute("style", "margin-left: 1em;");


                let toolbarDiv = document.createElement("div");
                toolbarDiv.className = "email-toolbar";
                toolbarDiv.innerText = "Add a response of type : ";
                toolbarDiv.appendChild(combo);
                toolbarDiv.append(addButton);

                let headerDiv = document.createElement("div");
                headerDiv.className = "email-header";
                headerDiv.setAttribute("style", "padding-top: 7px;");

                let ToSpan = document.createElement("div");
                ToSpan.innerText = "To: " + message.data.emailTo;
                headerDiv.appendChild(ToSpan);

                let fromSpan = document.createElement("div");
                fromSpan.innerText = "From: " + message.data.emailFrom;
                headerDiv.appendChild(fromSpan);

                let subSpan = document.createElement("div");
                subSpan.innerText = "Subject: " + message.data.emailSubject;
                headerDiv.appendChild(subSpan);

                let dateSpan = document.createElement("div");
                dateSpan.innerText = "Sent: " + message.data.dateRec;
                headerDiv.appendChild(dateSpan);

                $("#emailBody").html(message.data.emailBody);

                $("#emailBody").bind("mouseup", () => {
                    responseText = window.getSelection();
                });

                $("#emailBox .top-area").html("");
                $("#emailBox .top-area").append(closeButton);
                $("#emailBox .top-area").append(expandButton);


                $("#emailBox .top-area").append(toolbarDiv);
                $("#emailBox .top-area").append(headerDiv);

                $(".email-response-type").kendoComboBox({
                    dataTextField: "type",
                    dataValueField: "type",
                    dataSource: [{ type: 'Response' }, { type: 'Answer' }],
                    filter: "contains",
                    suggest: true,
                    index: 0,
                    change: (e) => {
                    },
                }); 

                $("#emailBox").show();
            }
            else {
                // this.getDocUrl(item.docID);
                // let win = window.open("", '_blank');
                let docUrl = await axios.get("api/document/GetFile?id=" + item.docID);

                let closeButton = document.createElement("button");
                closeButton.className = "btn teal"
                closeButton.setAttribute("style", "float:right; margin-top: 7px; margin-right: 7px;");
                closeButton.innerText = "Close"
                closeButton.onclick = function () {
                    $("#emailBox").hide();
                };

                let expandButton = document.createElement("button");
                expandButton.className = "btn teal"
                expandButton.setAttribute("style", "float:right; margin-right: 7px; margin-top: 7px;");
                expandButton.innerText = "Expand"
                expandButton.onclick = function () {
                    window.open(docUrl.data);
                };


                let addButton = document.createElement("button");
                addButton.className = "btn yellow email-response-add-button"
                addButton.setAttribute("style", "margin-left: 7px;");
                addButton.innerText = "Add"
                addButton.onclick = async () => {
                    $("#emailBox").hide();
                };

                let combo = document.createElement("input");
                combo.className = "email-response-type";
                combo.id = "email-response-type";
                combo.setAttribute("style", "margin-left: 1em;");


                let toolbarDiv = document.createElement("div");
                toolbarDiv.className = "email-toolbar";
                toolbarDiv.innerText = "Add a response of type : ";
                toolbarDiv.appendChild(combo);
                toolbarDiv.append(addButton);



                let headerDiv = document.createElement("div");
                headerDiv.className = "email-header";



                $("#emailBody").html(`<embed src="${docUrl.data}" width="100%" height="300px"/>`);

                $("#emailBody").bind("mouseup", () => {
                    responseText = window.getSelection();
                });

                $("#emailBox .top-area").html("");
                $("#emailBox .top-area").append(closeButton);
                $("#emailBox .top-area").append(expandButton);

                $("#emailBox .top-area").append(toolbarDiv);
                $("#emailBox .top-area").append(headerDiv);

                $(".email-response-type").kendoComboBox({
                    dataTextField: "type",
                    dataValueField: "type",
                    dataSource: [{ type: 'Response' }, { type: 'Answer' }],
                    filter: "contains",
                    suggest: true,
                    index: 0,
                    change: (e) => {
                    },
                });

                $("#emailBox").show();

            }
            document.body.classList.toggle("wait");
        };

        columnDiv.appendChild(itemDiv);
        return columnDiv;
    }

    private async ReloadContributors() {
        
        let response = await axios.get("api/deposit/GetContributorsbyDepID?depid=" + this.data.dep.depositID);
        let contributors = response.data;
        console.log(contributors);
        var conArray = contributors.map(item => {
            return {
                id: item.contactID,
                item: item.showAsName
            }
        });
        var dataSource = new kendo.data.DataSource({
            data: conArray,
            pageSize: 100
        });

        $("#contributors").kendoListView({
            template: kendo.template("<div> ${item}</div>"),
            dataSource: dataSource
        });


    }

    private async ReloadCategories(budid) {
        let response = await axios.get("api/deposit/GetCatByBudget?budgetid=" + budid + "&depositid=" + this.data.dep.depositID);
        let categories = response.data;
        if (categories === null || categories.length === 0) {
            categories = [];
        }
        console.log('ReloadCategories', categories);
        this.data.details.categories = categories;
        kendo.culture("en-US");

        this.DrawCategoriesAndChart(categories);
        // Reload Budget Details
        this.ReloadDetails(budid);

    }

    // Reload Budget Details
    private async ReloadDetails(budid) {
        let response = await axios.get("api/deposit/GetDepBudDetails?budgetid=" + budid + "&depositid=" + this.data.dep.depositID);
        let details = response.data;
        console.log("Reload Details", details);


        kendo.culture("en-US");

        if (details === null || details.length === 0) {
            details = [];
        }

        this.data.details.depDetails = details;

        this.orig.details = Utilities.deep(this.data.details)

        this.DrawDetailsTable(this.data.details.categories, details);
        
    }

    // Draw Categires
    private DrawCategoriesAndChart(categories) {
        
        $(".categories").html("");
        let total_budget = 0;
        let total_curFunding = 0;
        let total_aval = 0;
        let total_curDeposit = 0;
        let total_newFunding = 0;
        let new_funding_total_str = ''
        let flag: boolean = false;
        categories.forEach((item, index) => {
            if (item.deposit > 0)
                flag = true;
            total_budget += item.cost;
            total_curFunding += item.currentFunding;
            total_aval += item.availableBudget;
            total_curDeposit += item.deposit;
            total_newFunding += (item.currentFunding + item.deposit);

            let new_funding_str = ''
            if (item.deposit != 0) {
                new_funding_str = kendo.toString(item.currentFunding + item.deposit, "c")
            }
            $(".categories").append(`
                <div class="row" budcatid="${item.budCatID}">
                    <div class="form-element five-ten">
                        <span class=" category-link">
                            ${index + 1} . ${item.category}
                        </span>
                    </div>
                    <div class="form-element three-ten currency">
                        <span>${ kendo.toString(item.cost, "c")}</span>
                    </div>
                    <div class="form-element three-ten currency">
                        <span>${ kendo.toString(item.currentFunding, "c")}</span>
                    </div>
                    <div class="form-element three-ten currency">
                        <span class="available">${ kendo.toString(item.availableBudget, "c")}</span>
                    </div>
                    <div class="form-element two-ten budgetSwitchBox">
                         <input type="checkbox" class="budget-switch" />
                    </div>
                    <div class="form-element three-ten currency current-deposit">
                        <input class="deposit" value="${ item.deposit }"/>
                    </div>
                    <div class="form-element three-ten currency">
                        <span class="new-funding">${ new_funding_str }</span>
                    </div>
                </div>

            `);

        });


        

        if (flag !== false)
            new_funding_total_str = Utilities.Float2Currency(total_newFunding)

        
        $("#total-budget").html(Utilities.Float2Currency(total_budget));
        $("#total-cur-funding").html(kendo.toString(total_curFunding, "c"));
        $("#total-available").html(kendo.toString(total_aval, "c"));
        $("#total-cur-deposit").html(kendo.toString(total_curDeposit, "c"));
        $("#total-new-funding").html(new_funding_total_str);



        $(".category-link").click((e) => {

            let budcatid = $(e.target).parent().parent().attr("budcatid");
            $("#general-view-btn").parent().removeClass("active");
            $("#detail-view-btn").parent().addClass("active");
            $(".detail-pane").show().slideDown();

            this.detailsCollapseAll();

            this.detailsExpandCat(budcatid);

        });

        $(".categories .budget-switch").kendoMobileSwitch({
            checked: false,
            offLabel: '$->',
            onLabel: '$->',
            change: (e) => {
                if (e.checked == true) {
                    let row = $(e.sender.element).closest('.row');

                    let new_deposit = Utilities.Currency2Float(row.find(".available").html());

//                    row.find("input.deposit:nth-child(2)").data("kendoNumericTextBox").value(new_deposit)
                    row.find(".deposit").val(new_deposit);
                    row.find("input.deposit").focus();
                    row.find("input.deposit").blur();
                }
                else {
                    let row = $(e.sender.element).closest('.row');

                    let budcatID = row.attr('budcatid')
                    console.log('origin details', this.orig.details)
                    let detail = this.orig.details.categories.find(item => {
                        return item.budCatID == budcatID;
                    })

//                    row.find("input.deposit:nth-child(2)").data("kendoNumericTextBox").value(detail.deposit)
                    row.find(".deposit").val(detail.deposit);
                    row.find("input.deposit").focus();
                    row.find("input.deposit").blur();
                    
                }
            }
        });

        $(".categories .deposit").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');
                
                let budcatid = row.attr("budcatid")
                let cat = categories.find(item => {
                    return item.budCatID == budcatid
                })

                let c = cat.availableBudget;

                let new_d = e.sender.value();
                if (e.sender.value() > c) {
                    console.log('should not update');
                    e.sender.value(c);
                    new_d = c;
                }

                let old_deposit = cat.deposit;
                let new_deposit = new_d;
                cat.deposit = new_deposit;

                let updateCat = {
                    DepCatID: cat.depCatID,
                    BudCatID: cat.budCatID,
                    DepositID: cat.depositID,
                    Deposit: cat.deposit,
                    CurrentFunding: cat.currentFunding,
                    AvailableBudget: cat.availableBudget
                };

                let new_funding_str = ''
                if (new_deposit > 0) {
                    new_funding_str = Utilities.Float2Currency(cat.currentFunding + cat.deposit)
                }
                row.find('.new-funding').html(new_funding_str)



                let old_deposit_total = Utilities.Currency2Float($("#total-cur-deposit").html());
                let new_deposit_total = old_deposit_total + new_deposit - old_deposit;
                $("#total-cur-deposit").html(kendo.toString(new_deposit_total, "c"));

                let new_funding_total_str: string = ''
                let new_funding_total = 0;
                let flag: boolean = false;
                this.data.details.categories.map((item) => {
                    if (item.deposit > 0) {
                        flag = true;
                    }
                    new_funding_total += item.deposit + item.currentFunding;
                })
                if (flag !== false)
                    new_funding_total_str = Utilities.Float2Currency(new_funding_total)

                console.log('flag change', flag, new_funding_total, new_funding_total_str)

                $("#total-new-funding").html(new_funding_total_str);

                let deposit_offset = new_deposit - old_deposit
                //console.log('offset', deposit_offset)

                let d_sum = 0;
                let budDetails = this.data.details.depDetails.filter(detail => {
                    return (detail.budCatID == cat.budCatID) 
                })


                console.log('bud details', budDetails)

                let i = 0
                if (budDetails.length == 0) {
                    // in case category has no details
                    return;
                }

                while (deposit_offset > 0) {
                    
                    let left = budDetails[i].budget - budDetails[i].currentFunding - budDetails[i].deposit
                    budDetails[i].depositID = this.data.dep.depositID;
                    console.log(left)

                    let old_deposit = budDetails[i].deposit

                    if (left >= deposit_offset) {
                        budDetails[i].deposit += deposit_offset;
                        deposit_offset = 0
                        this.RedrawDetailRow(budDetails[i], old_deposit)

                        console.log('cat update sync UpdateDepDetail', budDetails[i]);
                    }
                    else {
                        budDetails[i].deposit += left
                        deposit_offset -= left;
                        this.RedrawDetailRow(budDetails[i], old_deposit)

                        console.log('cat update sync UpdateDepDetail', budDetails[i]);
                        i++
                    }
                }

                deposit_offset = -deposit_offset
                while (deposit_offset > 0) {

                    budDetails[i].depositID = this.data.dep.depositID
                    
                    let old_deposit = budDetails[i].deposit
                    if (budDetails[i].deposit >= deposit_offset) {
                        budDetails[i].deposit -= deposit_offset
                        deposit_offset = 0
                        this.RedrawDetailRow(budDetails[i], old_deposit)

                        console.log('UpdateDepDetail', budDetails[i]);
                    }
                    else {
                        deposit_offset -= budDetails[i].deposit
                        budDetails[i].deposit = 0
                        this.RedrawDetailRow(budDetails[i], old_deposit)

                        console.log('UpdateDepDetail', budDetails[i]);
                        i++
                    }
                }


            }
        });

        this.LoadChartData(categories);

    }

    private RedrawDetailRow(budDetail, old_deposit) {
        $(".detail-pane .detail-data .detail-row").each(function (i, obj) {
            let detailid = $(obj).attr('detailid') //depositDetailID
            
            if (detailid == budDetail.budgetDetailID) {
                let table = $(obj).closest("table")
                let row = $(obj)
                let new_deposit = budDetail.deposit
                row.find("input.deposit:nth-child(2)").data("kendoNumericTextBox").value(budDetail.deposit)

                row.find(".detail-e").html( Utilities.Float2Currency(budDetail.budget - budDetail.currentFunding - budDetail.deposit) );

                row.find(".detail-f").html( Utilities.Float2Currency(budDetail.currentFunding + budDetail.deposit) );

               
                row.find(".detail-h").html( Utilities.Float2Currency(budDetail.ltdPurchasing) );

                let old_total_d = Utilities.Currency2Float(table.find(".total-d").html());
                let new_total_d = old_total_d + new_deposit - old_deposit;
                table.find(".total-d").html(kendo.toString(new_total_d, "c"));

                let old_total_e = Utilities.Currency2Float(table.find(".total-e").html());
                let new_total_e = old_total_e - new_deposit + old_deposit;
                table.find(".total-e").html(kendo.toString(new_total_e, "c"));


                let old_total_f = Utilities.Currency2Float(table.find(".total-f").html());
                let new_total_f = old_total_f + new_deposit - old_deposit;
                table.find(".total-f").html(kendo.toString(new_total_f, "c"));

                let old_total_h = Utilities.Currency2Float(table.find(".total-h").html());
                let new_total_h = old_total_h + new_deposit - old_deposit;
                table.find(".total-h").html(kendo.toString(new_total_h, "c"));

                let old_grand_d = Utilities.Currency2Float($("#grand-d").html());
                let new_grand_d = old_grand_d + new_deposit - old_deposit;
                $("#grand-d").html(kendo.toString(new_grand_d, "c"));

                let old_grand_e = Utilities.Currency2Float($("#grand-e").html());
                let new_grand_e = old_grand_e - new_deposit + old_deposit;
                $("#grand-e").html(kendo.toString(new_grand_e, "c"));

                let old_grand_f = Utilities.Currency2Float($("#grand-f").html());
                let new_grand_f = old_grand_f + new_deposit - old_deposit;
                $("#grand-f").html(kendo.toString(new_grand_f, "c"));

                let old_grand_h = Utilities.Currency2Float($("#grand-h").html());
                let new_grand_h = old_grand_h + new_deposit - old_deposit;
                $("#grand-h").html(kendo.toString(new_grand_h, "c"));
            }
        });

    }

    // Draw Budget Details
    private DrawDetailsTable(categories, details) {
        $(".detail-pane .detail-data").html("");

        let grand_budget_total = 0;
        let grand_cur_funding_total = 0;
        let grand_c_total = 0;
        let grand_deposit_total = 0;
        let grand_e_total = 0;
        let grand_new_funding_total = 0;
        let grand_ltd_total = 0;
        let grand_balance_total = 0;

        categories.forEach((category, index) => {

            let c_details = details.filter(detail => {
                return detail.budCatID == category.budCatID;
            })

            let category_total = 0;
            c_details.forEach(detail => {
                let detail_total = detail.unit * detail.rate;
                category_total += detail_total;
            });

            
            let budget_total = 0;
            let cur_funding_total = 0;
            let c_total = 0;
            let deposit_total = 0;
            let e_total = 0;
            let new_funding_total = 0;
            let ltd_total = 0;
            let balance_total = 0;

            c_details.forEach((detail, dindex) => {
                budget_total += detail.budget;
                cur_funding_total += detail.currentFunding;
                c_total += detail.budget - detail.currentFunding;

                deposit_total += detail.deposit;
                e_total += detail.budget - detail.currentFunding - detail.deposit;
                new_funding_total += detail.currentFunding + detail.deposit;
                ltd_total += detail.ltdPurchasing;
                balance_total += detail.currentFunding + detail.deposit - detail.ltdPurchasing;
            })

            grand_budget_total += budget_total;
            grand_cur_funding_total += cur_funding_total;
            grand_c_total += c_total;
            grand_deposit_total += deposit_total;
            grand_e_total += e_total;
            grand_new_funding_total += new_funding_total;
            grand_ltd_total += ltd_total;
            grand_balance_total += balance_total;


            let content = `

                <table class="subheading" cellspacing="0" budcatid="${category.budCatID}">
                    <thead>
                        <tr>
                            <td colspan="2" style="min-width: 250px; flex: 4.05;" budcatid="${category.budCatID}" class="title">
                                <span class="category-expand-btn fa fa-angle-double-right count-icon" style="font-size: 14px; font-weight: 800; color: #050ce0; display:none;"></span>
                                <span class="category-collapse-btn fa fa-angle-double-down count-icon" style="font-size: 14px; font-weight: 800; color: #050ce0;"></span>
                                <span style="font-weight: bold;">${index + 1} . ${category.category}</span>
                            </td>
                            <td class="currency" style="text-align: right;"> ${kendo.toString(budget_total, "c")}</td>
                            <td class="currency" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(cur_funding_total, "c")}</td>
                            <td class="currency" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(c_total, "c")}</td>
                            <td class="budgetSwitchBox" ></td>
                            <td class="currency total-d" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(deposit_total, "c")}</td>
                            <td class="currency total-e" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(e_total, "c")}</td>
                            <td class="currency total-f" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(new_funding_total, "c")}</td>
                            <td class="currency"style="text-align: right;">${kendo.toString(ltd_total, "c")}</td>
                            <td class="currency total-h" style="text-align: right;">${kendo.toString(balance_total, "c")}</td>
                            <td></td>

                        </tr>
                    </thead>
                    <tbody>`;

            c_details.forEach((detail, dindex) => {
                let detail_c = detail.budget - detail.currentFunding;

                let new_funding_str = ''
                if (detail.deposit > 0) {
                    new_funding_str = Utilities.Float2Currency(detail.currentFunding + detail.deposit)
                }
                console.log(new_funding_str)
                

                content += `<tr detailid="${detail.budgetDetailID}" class="detail-row">
                                <td>
                                    ${ kendo.toString(detail.code, "c")}
                                </td>
                                <td style="width: 150px;flex: 3;">
                                    ${ kendo.toString(detail.item, "c")}
                                </td>
                                <td>
                                    ${ kendo.toString(detail.budget, "c")}
                                </td>
                                <td style="width: 90px;flex: 1.5; text-align: right;">
                                    ${ kendo.toString(detail.currentFunding, "c")}
                                </td>
                                <td style="width: 90px;flex: 1.5; text-align: right;" class="available">
                                    ${ kendo.toString(detail.budget - detail.currentFunding, "c")}
                                </td>
                                <td class="budgetSwitchBox" style="text-align: right;">
                                    <input type="checkbox" class="budget-switch" />
                                </td>
                                <td class="currency current-deposit" style="width: 90px;flex: 1.5; text-align: right;">
                                    <input class="deposit" value="${detail.deposit}"/>
                                    
                                </td>
                                <td class="detail-e" style="width: 90px;flex: 1.5; text-align: right;">
                                    ${ kendo.toString(detail_c - detail.deposit, "c")}
                                </td>
                                <td class="detail-f" style="width: 90px;flex: 1.5; text-align: right;">
                                    ${ Utilities.Float2Currency(detail.currentFunding + detail.deposit) }
                                </td>
                                <td>
                                    ${ kendo.toString(detail.ltdPurchasing, "c")}
                                </td>
                                <td class="detail-h">
                                    ${ kendo.toString(detail.currentFunding + detail.deposit - detail.ltdPurchasing, "c")}
                                </td>
                                <td style="text-align: right;">
                                    <i class="fa fa-list-alt"></i>
                                </td>
                            </tr>
                            `;
            });

            content += `<tr class="total-row" style="background:#c8e3c1">
                            <td colspan="2" style="min-width: 250px;flex: 4.05; text-align: right;">
                                Total - ${category.category} (Category #${index + 1})
                            </td>
                            <td style="text-align: right;"> ${kendo.toString(budget_total, "c")}</td>
                            <td style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(cur_funding_total, "c")}</td>
                            <td style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(c_total, "c")}</td>
                            <td style="text-align: right;" class="budgetSwitchBox" ></td>
                            <td class="total-d current-deposit" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(deposit_total, "c")}</td>
                            <td class="total-e" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(e_total, "c")}</td>
                            <td class="total-f" style="width: 90px;flex: 1.5; text-align: right;">${kendo.toString(new_funding_total, "c")}</td>
                            <td>${kendo.toString(ltd_total, "c")}</td>
                            <td class="total-h">${kendo.toString(balance_total, "c")}</td>
                            <td style="text-align: right;"></td>
                        </tr>
                    </tbody>
                </table>
            `;

            
            $(".detail-pane .detail-data").append(content);

            
            $("#grand-a").html(kendo.toString(grand_budget_total, "c"));
            $("#grand-b").html(kendo.toString(grand_cur_funding_total, "c"));
            $("#grand-c").html(kendo.toString(grand_c_total, "c"));
            $("#grand-d").html(kendo.toString(grand_deposit_total, "c"));
            $("#grand-e").html(kendo.toString(grand_e_total, "c"));
            $("#grand-f").html(kendo.toString(grand_new_funding_total, "c"));
            $("#grand-g").html(kendo.toString(grand_ltd_total, "c"));
            $("#grand-h").html(kendo.toString(grand_balance_total, "c"));

        });

        $(".detail-pane .deposit").kendoNumericTextBox({
            format: "c2",
            min: 0,
            change: async (e) => {
                let parent_td = $(e.sender.element).closest('td');

                let c = Utilities.Currency2Float(parent_td.prev().prev().html());
                
                let new_d = e.sender.value();
                if (e.sender.value() > c) {
                    console.log('should not be greater than the BAL/VAR');
                    e.sender.value(c);
                    new_d = c;
                }

                ////// change variables //////

                let row = $(e.sender.element).closest('.detail-row');
                let table = row.parent().parent();

                
                let detail = details.find(item => {
                    return item.budgetDetailID == row.attr("detailid")
                })

                let old_deposit = detail.deposit;
                let new_deposit = new_d;
                detail.deposit = new_deposit;


                //row.find("input.deposit").data('kendoNumericTextBox').value(new_deposit);
                
                let old_detail_e = Utilities.Currency2Float(row.find(".detail-e").html());
                let new_detail_e = old_detail_e - new_deposit + old_deposit;
                row.find(".detail-e").html(kendo.toString(new_detail_e, "c"));

                let old_detail_f = Utilities.Currency2Float(row.find(".detail-f").html());
                let new_detail_f = old_detail_f + new_deposit - old_deposit;
                row.find(".detail-f").html(kendo.toString(new_detail_f, "c"));

                let old_detail_h = Utilities.Currency2Float(row.find(".detail-h").html());
                let new_detail_h = old_detail_h + new_deposit - old_deposit;
                row.find(".detail-h").html(kendo.toString(new_detail_h, "c"));

                let old_total_d = Utilities.Currency2Float(table.find(".total-d").html());
                let new_total_d = old_total_d + new_deposit - old_deposit;
                table.find(".total-d").html(kendo.toString(new_total_d, "c"));


                /* Sync Category Deposit */

                

                let cat = this.data.details.categories.find(d => {
                    return d.budCatID == detail.budCatID
                })
                cat.deposit = new_total_d


                $('.categories .row').each(function (i, obj) {
                    let budcatid = $(obj).attr('budcatid')
                    if (budcatid == detail.budCatID) {
                        $(obj).find("input.deposit:nth-child(2)").data("kendoNumericTextBox").value(cat.deposit)

                        let new_funding_str = ''
                        if (cat.deposit != 0)
                            new_funding_str = Utilities.Float2Currency(cat.currentFunding + cat.deposit)
                        $(obj).find('.new-funding').html( new_funding_str );
                        
                    }

                });

               

                

                /* End Sync Category Deposit */
                let old_total_e = Utilities.Currency2Float(table.find(".total-e").html());
                let new_total_e = old_total_e - new_deposit + old_deposit;
                table.find(".total-e").html(kendo.toString(new_total_e, "c"));
                

                let old_total_f = Utilities.Currency2Float(table.find(".total-f").html());
                let new_total_f = old_total_f + new_deposit - old_deposit;
                table.find(".total-f").html(kendo.toString(new_total_f, "c"));

                let old_total_h = Utilities.Currency2Float(table.find(".total-h").html());
                let new_total_h = old_total_h + new_deposit - old_deposit;
                table.find(".total-h").html(kendo.toString(new_total_h, "c"));

                let old_grand_d = Utilities.Currency2Float($("#grand-d").html());
                let new_grand_d = old_grand_d + new_deposit - old_deposit;
                $("#grand-d").html(kendo.toString(new_grand_d, "c"));

                $("#total-cur-deposit").html(Utilities.Float2Currency(new_grand_d))

                let old_grand_e = Utilities.Currency2Float($("#grand-e").html());
                let new_grand_e = old_grand_e - new_deposit + old_deposit;
                $("#grand-e").html(kendo.toString(new_grand_e, "c"));

                let old_grand_f = Utilities.Currency2Float($("#grand-f").html());
                let new_grand_f = old_grand_f + new_deposit - old_deposit;
                $("#grand-f").html(kendo.toString(new_grand_f, "c"));

                let new_funding_total_str: string = ''
                let new_funding_total = 0;
                let flag: boolean = false;
                this.data.details.categories.map((item) => {
                    if (item.deposit > 0) {
                        flag = true;
                    }
                    new_funding_total += item.deposit + item.currentFunding;
                })
                if (flag !== false)
                    new_funding_total_str = Utilities.Float2Currency(new_funding_total)

                console.log('flag change', flag, new_funding_total, new_funding_total_str)

                $("#total-new-funding").html(new_funding_total_str);


                let old_grand_h = Utilities.Currency2Float($("#grand-h").html());
                let new_grand_h = old_grand_h + new_deposit - old_deposit;
                $("#grand-h").html(kendo.toString(new_grand_h, "c"));

            },
            max: parseInt($(this).parent().prev().prev().html()),
            spinners: false
        });

        $(".detail-data input").focus((e) => {
            $(e.target).closest('.detail-row').addClass("editing");
        });

        $(".detail-data input").focusout((e) => {
            $(e.target).closest('.detail-row').removeClass("editing");
        });


        $(".category-expand-btn").click((e) => {

            let table = $(e.target).closest('table');
            table.removeClass("collapse");
            table.find("tbody").show();
            table.find(".category-expand-btn").hide();
            table.find(".category-collapse-btn").show();
        });

        $(".category-collapse-btn").click((e) => {
            let table = $(e.target).closest('table');
            table.addClass("collapse");
            table.find(".category-expand-btn").show();
            table.find(".category-collapse-btn").hide();
        });

        $(".detail-pane .budget-switch").kendoMobileSwitch({
            checked: false,
            offLabel: '$->',
            onLabel: '$->',
            change: (e) => {
                if (e.checked == true) {

                    let row = $(e.sender.element).closest('.detail-row')


                    let new_deposit = Utilities.Currency2Float(row.find(".available").html());

//                    row.find("input.deposit:nth-child(2)").data("kendoNumericTextBox").value(new_deposit)
                    row.find(".deposit").val(new_deposit);
                    row.find("input.deposit").focus();
                    row.find("input.deposit").blur();

                }
                else {
                    let row = $(e.sender.element).closest('.detail-row')
                    
                    let detailid = row.attr('detailid')
                    let detail = this.orig.details.depDetails.find(item => {
                        return item.budgetDetailID == detailid;
                    })
                    
//                    row.find("input.deposit:nth-child(2)").data("kendoNumericTextBox").value(detail.deposit)
                    row.find(".deposit").val(detail.deposit);
                    row.find("input.deposit").focus();
                    row.find("input.deposit").blur();
                    
                }
            }
        });
    }
}
