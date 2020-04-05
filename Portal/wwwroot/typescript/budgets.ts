import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
import { Tabs } from "./components/tabs.js";

import { ProjectBudgetBar } from "./components/project-budget-bar.js";
import { Notification } from "./components/notification.js";

export class BudgetsList {

    private data: any;
    private NewContactButton: HTMLButtonElement;

    constructor(data: any) {
        this.data = data;
        this.init();
    }

    private init(): void {
        this.setupGrids();

        //this.NewContactButton = document.querySelector("#new-contact-button") as HTMLButtonElement;

        //this.NewContactButton.addEventListener("click", () => {
        //    window.location.href = "new";
        //})
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
                        id: "budgetID"
                    }
                },
                sort: { field: "budgetID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.BudgetGridSelectionChanged,
            columns: [
                //{ field: "budgetID", title: "BudgetID", width: '20%' },
                //{ field: "projectID", title: "ProjectID" },
                { field: "projectTitle", title: "Project" },
                { field: "dateEntered", title: "Created", width: '20%', template: '#= kendo.toString(kendo.parseDate(dateEntered), "MM/dd/yyyy") #' },
                { field: "status", title: "Status", width: '20%' },
                {
                    field: "total", title: "Total", width: '20%', attributes: {
                        "class": "currency",
                    }, template: '#= kendo.toString(total, "c") #' }
            ]
        });

        Utilities.MoveKendoToolbar("#contacts-grid");
    }

    private BudgetGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        console.log("Budget List", arg.sender.select());
        window.location.href = selectedItem.budgetID;
    }
}


export class BudgetDetailsItem {
    private data: any;
    private orig: any;
    private user: any;

    private UploadDocButton: HTMLDivElement;
    private docUpload: DocUploadModal;

    private PublishButton: HTMLButtonElement;
    private DraftButton: HTMLButtonElement;
    private CancelButton: HTMLButtonElement;

    private GeneralViewButton: HTMLSpanElement;
    private DetailViewButton: HTMLSpanElement;

    private DateOpenButton: HTMLSpanElement;
    private DatePblButton: HTMLSpanElement;

    private AvlCommitButton: HTMLSpanElement;
    private AvlPndButton: HTMLSpanElement;

    private projects: any;
    private contacts: any;
    private IsDirty: Boolean;

    private notification: Notification;

    private BudgetBar: ProjectBudgetBar;


    constructor(data: any) {
        this.data = data;
        if (this.data.bud.budgetID == 0) {
            this.data.bud.dateEntered = kendo.toString(new Date(), 'MM/dd/yyyy');
            this.data.bud.datePublished = kendo.toString(new Date(), 'MM/dd/yyyy');
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
 
        this.PublishButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.PublishButton.addEventListener("click", async (evt) => {
            this.Publish();
        });

        this.DraftButton = document.querySelector("#draft-button") as HTMLButtonElement;
        this.DraftButton.addEventListener("click", async (evt) => {
            this.Draft();
        });

        this.CancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
        this.CancelButton.addEventListener("click", () => {
            window.location.href = "/budgets/";
        });

        this.UploadDocButton = document.querySelector(".doc-button") as HTMLDivElement;
        this.UploadDocButton.addEventListener("click", () => {
            this.docUpload.Show(this.data.bud.projectID, this.data.bud.entCode, "bud", this.data.bud.budgetID);
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

                window.location.href = "/budgets/";
            });
        }

        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
        }

        this.AvlCommitButton = document.querySelector("#avl-commit-btn") as HTMLButtonElement;
        this.AvlCommitButton.addEventListener("click", () => {
            $("#avl-pnd").hide();
            $("#avl-pnd").parent().parent().hide();
            $("#avl-pnd-sf").hide();
            $("#avl-commit").hide();
            $("#avl-commit").parent().parent().show();
            $("#avl-commit-sf").show();

            $("#avl-commit-btn").addClass("selected");
            $("#avl-pnd-btn").removeClass("selected");
        });

        this.AvlPndButton = document.querySelector("#avl-pnd-btn") as HTMLButtonElement;
        this.AvlPndButton .addEventListener("click", () => {
            $("#avl-pnd").hide();
            $("#avl-pnd").parent().parent().show();
            $("#avl-pnd-sf").show();
            $("#avl-commit").hide();
            $("#avl-commit").parent().parent().hide();
            $("#avl-commit-sf").hide();

            $("#avl-commit-btn").removeClass("selected");
            $("#avl-pnd-btn").addClass("selected");
        });

        $("#deposits").val(this.data.currentTotals.deposits);
        $("#commits").val(this.data.currentTotals.commitments);
        $("#pending").val(this.data.currentTotals.pending);

        let avl_commit = this.data.currentTotals.deposits - this.data.currentTotals.commitments;
        let avl_pnd = this.data.currentTotals.deposits - (this.data.currentTotals.commitments + this.data.currentTotals.pending);

        $("#avl-commit").val(avl_commit);
        $("#avl-pnd").val(avl_pnd);

        if (this.data.bud.gsf > 0) {
            $("#deposits-sf").html((this.data.currentTotals.deposits / this.data.bud.gsf).toFixed(2));
            $("#commits-sf").html((this.data.currentTotals.commitments / this.data.bud.gsf).toFixed(2));
            $("#pending-sf").html((this.data.currentTotals.pending / this.data.bud.gsf).toFixed(2));
            $("#avl-commit-sf").html(kendo.toString(avl_commit / this.data.bud.gsf, "0.00"));
            $("#avl-pnd-sf").html(kendo.toString(avl_pnd / this.data.bud.gsf, "0.00"));
        }
        

        
        $(".summary .budget").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row')
                console.log(row);
                let val = e.sender.value() / this.data.bud.gsf
                row.find('.currency').html(val.toFixed(2));

            }
        });

        $("#avl-pnd").hide();
        $("#avl-pnd").parent().parent().hide();

        $(".project-notes-handle").click(() => {
            $(".project-notes").toggleClass("hide")
            $(".expand-symbol").toggle()
            $(".collapse-symbol").toggle()
        })

        const addNoteButton = document.querySelector("#add-note-button") as HTMLButtonElement;
        addNoteButton.addEventListener("click", async (evt) => {
            addNoteButton.disabled = true;
            evt.preventDefault();

            let noteText = $('#new-note').val();

            let note = {} as any;
            note.ProjectID = parseInt(this.data.bud.projectID);
            note.writer = this.user.userName;
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = this.data.bud.budgetID;
            note.itemType = "Budget";

            let noteDiv = this.CreateNote(note);
            console.log("AddNote", note);
            let prevNotes = document.querySelector(".previous-notes");
            prevNotes.insertBefore(noteDiv, prevNotes.childNodes[0]);
            $('#new-note').val("");

            const noteUpdate = await axios.post("api/note/addNote", note);

            addNoteButton.disabled = false;
        });

        
        

        $("#date-open").kendoDatePicker();
        $("#date-published").kendoDatePicker();
        $("#due-date").kendoDatePicker();
        $("#projectdate").kendoDatePicker();

        this.DateOpenButton = document.querySelector("#date-open-btn") as HTMLButtonElement;
        this.DateOpenButton.addEventListener("click", () => {
            $("#date-open").parent().parent().show();
            $("#date-open").show();
            $("#date-published").parent().parent().hide();
            $("#date-published").hide();

            $("#date-open-btn").addClass("selected");
            $("#date-pub-btn").removeClass("selected");

        });

        this.DatePblButton = document.querySelector("#date-pub-btn") as HTMLButtonElement;
        this.DatePblButton.addEventListener("click", () => {
            $("#date-open").parent().parent().hide();
            $("#date-open").hide();
            $("#date-published").parent().parent().show();
            $("#date-published").show();

            $("#date-open-btn").removeClass("selected");
            $("#date-pub-btn").addClass("selected");
        });

        $("#date-published").parent().parent().hide();
        $("#date-published").hide();

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


        let kendoWindow = $("#window").kendoWindow({
            title: "Add Category",
            resizable: true,
            modal: true,
            width: '1000px'
        });
        kendoWindow
            .find("#res-save-button")
            .click(async () => {
                console.log('save');
                kendoWindow.data("kendoWindow").close();

               
                let category = {} as any;
                category.catOrder = kendoWindow.find("#add-catOrder").val();
                category.category = kendoWindow.find("#add-category").val();
                category.cost = kendoWindow.find("#add-cost").val();
                category.weight = kendoWindow.find("#add-weight").val();
                category.budgetID = this.data.bud.budgetID;
                
                const catInsert = await axios.post("api/budget/InsertBudCategory", category)
                console.log('catInsert', catInsert)
                this.data.details.categories.push(catInsert.data)

                this.DrawCategories(this.data.details.categories)
                this.DrawDetails(this.data.details.categories, this.data.details.budDetails)
                

            })
            .end();

        kendoWindow
            .find("#res-cancel-button")
            .click(() => { kendoWindow.data("kendoWindow").close(); })
            .end();

        /*let categoryAddButton = document.querySelector("#category-add-button") as HTMLLinkElement;
        categoryAddButton.addEventListener("click", () => {
            $("#window").data("kendoWindow")
                .center().open();
        });*/

        
        if (this.data.bud.budgetID === 0) {
            this.PublishButton.disabled = true;
            this.DraftButton.disabled = true;
        }

        


        await this.LoadContactsAndProjects();
        this.LoadLookups();

        this.BindData();
        this.LoadCategories();
        this.LoadDetails();
        this.LoadKendoWindow();

        this.GetEmails();
        this.BuildNotes();

       
        $(".expand-all-btn").click((e) => {
            this.detailsExpandAll();
        });

        $(".collapse-all-btn").click((e) => {
            this.detailsCollapseAll();
        });

        $("input").change(() => {
            this.IsDirty = true;
            // Validation Check for Required fields
            if ($("#project").data("kendoComboBox").value() != ''
                && $("#budget-type").data("kendoComboBox").value() != '') {
                this.PublishButton.disabled = false;
                this.DraftButton.disabled = false;
            }
            else {
                this.PublishButton.disabled = true;
                this.DraftButton.disabled = true;
            }
        })

        
    }


    private async GetCurrentUser(): Promise<void> {
        
        let userData = await axios.get("api/budget/GetCurrentUser")
        this.user = userData.data;
        console.log(this.user)
    }

    private LoadKendoWindow(): void {

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

                let contributor = {} as any;
                contributor.contactid = contKendoWindow.find("#add-contact").val();
                contributor.budgetid = this.data.bud.budgetID;


                const contInsert = axios.post("api/budget/insertContributor?contactid=" + contributor.contactid + "&budgetid=" + contributor.budgetid).then(() => {
                    //GetContributorsbyBudID
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
        if (this.data.bud.budgetID == 0) {
            contributorAddButton.disabled = true;
        }

        


        

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
0
        if (a.classList.contains("open")) {
            a.classList.remove("open");
        }
        else {  //open and show 
            a.classList.add("open");
        }
    }

    private async LoadContactsAndProjects() {
        if (this.data.bud.budgetID == 0)
            this.data.bud.entCode = "PRO1";
        const contacts = await axios.get("api/budget/GetContactsList?entcode=" + this.data.bud.entCode);
        this.contacts = contacts.data;
        const projects = await axios.get("api/budget/GetProjectsList?entcode=" + this.data.bud.entCode);
        this.projects = projects.data;

//        console.log('contacts', this.contacts);
//        console.log('projects', this.projects);
    }

    private LoadLookups() {
        if (this.data.bud.budgetID == 0)
            this.data.bud.entCode = "PRO1";


        $("#project").kendoComboBox({
            dataTextField: "title",
            dataValueField: "projectId",
            dataSource: this.projects,
            filter: "contains",
            suggest: true,
            index: 100
        });
        if (this.data.bud.projectID != 0)
            $("#project").data("kendoComboBox").value(this.data.bud.projectID);



        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
       
        $("#classification").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Classification"),
            filter: "contains",
            suggest: true,
            index: 3
        });

        $("#budget-type").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Type"),
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

       
    }

    private LoadCategories() {
        kendo.culture("en-US");

        let categories = this.data.details.categories;

        if (categories === null || categories.length === 0)
            categories = []
   
        this.DrawCategories(categories);

        
    }

    private DrawCategories(categories) {
        $(".categories").html("");

        const gsf = this.data.bud.gsf;
        let total_budget = 0;
        categories.forEach((item, index) => {
            total_budget += item.cost;
            let sf = item.cost / gsf;

            $(".categories").append(`
                <div class="row" budcatid="${item.budCatID}">
                    <div class="form-element five-ten">
                        <span class="category-link">${index + 1} . ${item.category}</span>
                    </div>
                    <div class="form-element three-ten">
                        <input class="budget" type="text" value="${item.cost}">
                    </div>
                    <div class="form-element two-ten">
                        <span class="currency sf">${sf.toFixed(2)}</span>
                    </div>
                    <div class="form-element two-ten" style="text-align:center; margin-right: 0px;">
                        <span> 
                            <i class="fa fa-edit category-edit"></i>
                            <i class="fa fa-trash category-delete"></i>
                        </span>
                    </div>
                </div>
            `);

        });

        
        if (gsf != 0) {
            $("#total-budget").html(kendo.toString(total_budget, "c"));
            $("#total-sf").html((total_budget / gsf).toFixed(2));
        }
            

        

        $(".categories .budget").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');

                
                let cat = categories.find(item => {
                    return item.budCatID == row.attr("budcatid")
                })

                let new_budget = e.sender.value();
                let offset = new_budget - cat.cost;
                cat.cost = new_budget;

                
                console.log('catUpdate', cat);                
                axios.put("api/budget/UpdateBudCat", cat);
                row.find(".sf").html((cat.cost / gsf).toFixed(2));

                let origin_total_budget = Utilities.Currency2Float($("#total-budget").html());
                let new_total_budget = origin_total_budget + offset;
                $("#total-budget").html(Utilities.Float2Currency(new_total_budget));
                $("#total-sf").html((new_total_budget / gsf).toFixed(2));

                let budDetails = this.data.details.budDetails.filter(detail => {
                    return (detail.budCatID == cat.budCatID)
                })
                // Sync Details
                if (budDetails.length == 0) {
                    // in case category has no details
                    return;
                }

                let i = 0
                if (offset > 0) {
                    budDetails[0].rate = parseFloat(budDetails[0].rate) + offset / budDetails[0].qty;

                    console.log('detail Update', budDetails[0])
                    axios.put("api/budget/UpdateBudDetail", budDetails[0])
                    this.RedrawDetailRow(budDetails[0], offset)
                }
                else if (offset < 0) {
                    console.log(offset);
                    offset = -offset;
                    while (offset > 0) {
                        console.log(i);
                        let detail_cost = budDetails[i].rate * budDetails[i].qty
                        if (detail_cost >= offset) {
                            budDetails[i].rate -= offset / budDetails[i].qty;
                            this.RedrawDetailRow(budDetails[i], - offset)
                            offset = 0;
                            console.log('detail Update', budDetails[i])
                            axios.put("api/budget/UpdateBudDetail", budDetails[i])
                            console.log('UpdateDepDetail', budDetails[i]);
                        }
                        else {
                            offset -= detail_cost
                            budDetails[i].rate = 0
                            this.RedrawDetailRow(budDetails[i], - detail_cost)

                            console.log('detail Update', budDetails[i])
                            axios.put("api/budget/UpdateBudDetail", budDetails[i])
                            console.log('UpdateDepDetail', budDetails[i]);
                            i++
                        }
                    }
                }
                
            }
        });


        


        $(".category-link").click((e) => {

            let budcatid = $(e.target).parent().parent().attr("budcatid");
            $("#general-view-btn").parent().removeClass("active");
            $("#detail-view-btn").parent().addClass("active");
            $(".detail-pane").show().slideDown();

            this.detailsCollapseAll();

            this.detailsExpandCat(budcatid);

        });

        let editKendoWindow = $("#edit-window").kendoWindow({
            title: "Edit Category",
            resizable: true,
            modal: true,
            width: '1000px'
        });
        editKendoWindow
            .find(".save-button")
            .click( async () => {
                editKendoWindow.data("kendoWindow").close();


                let budcatid = editKendoWindow.find("#edit-id").val();
                let edit_row = $(`.categories .row[budcatid='${budcatid}']`);

                edit_row.removeClass('editing');
                let cat = this.data.details.categories.find(item => {
                    return item.budCatID == budcatid
                })

                let offset = Number(editKendoWindow.find("#edit-cost").val()) - cat.cost;

                cat.catOrder = Number(editKendoWindow.find("#edit-catOrder").val());
                cat.category = editKendoWindow.find("#edit-category").val();
                cat.cost = Number(editKendoWindow.find("#edit-cost").val());
                cat.weight = Number(editKendoWindow.find("#edit-weight").val());

                console.log('catUpdate', cat)
                axios.put("api/budget/UpdateBudCat", cat)


                $(".categories .row").each((i, obj) => {
                    let budcatid = $(obj).attr('budcatid')
                    if (budcatid == cat.budCatID) {
                        $(obj).find("input.budget:nth-child(2)").data("kendoNumericTextBox").value(cat.cost)
                        $(obj).find(".sf").html((cat.cost / this.data.bud.gsf).toFixed(2));

                        let old_total_budget = Utilities.Currency2Float($("#total-budget").html());
                        let new_total_budget = old_total_budget + offset;
                        $("#total-budget").html(Utilities.Float2Currency(new_total_budget));
                        $("#total-sf").html((new_total_budget / gsf).toFixed(2));
                    }
                })
                

                let budDetails = this.data.details.budDetails.filter(detail => {
                    return (detail.budCatID == cat.budCatID)
                })
                // Sync Details
                if (budDetails.length == 0) {
                    // in case category has no details
                    return;
                }

                let i = 0
                if (offset > 0) {
                    budDetails[0].rate = parseFloat(budDetails[0].rate) + offset / budDetails[0].qty;

                    console.log('detail Update', budDetails[0])
                    axios.put("api/budget/UpdateBudDetail", budDetails[0])
                    this.RedrawDetailRow(budDetails[0], offset)
                }
                else if (offset < 0) {
                    console.log(offset);
                    offset = -offset;
                    while (offset > 0) {
                        console.log(i);
                        let detail_cost = budDetails[i].rate * budDetails[i].qty
                        if (detail_cost >= offset) {
                            budDetails[i].rate -= offset / budDetails[i].qty;
                            this.RedrawDetailRow(budDetails[i], - offset)
                            offset = 0;
                            console.log('detail Update', budDetails[i])
                            axios.put("api/budget/UpdateBudDetail", budDetails[i])
                            console.log('UpdateDepDetail', budDetails[i]);
                        }
                        else {
                            offset -= detail_cost
                            budDetails[i].rate = 0
                            this.RedrawDetailRow(budDetails[i], - detail_cost)

                            console.log('detail Update', budDetails[i])
                            axios.put("api/budget/UpdateBudDetail", budDetails[i])
                            console.log('UpdateDepDetail', budDetails[i]);
                            i++
                        }
                    }
                }
                

            })
            .end();

        editKendoWindow
            .find(".cancel-button")
            .click(() => {
                editKendoWindow.data("kendoWindow").close();
                let budcatid = editKendoWindow.find("#edit-id").val();
                let edit_row = $(`.detail-data tr[budcatid='${budcatid}']`);

                edit_row.removeClass('editing');
            })
            .end();

        $(".category-edit").click((e) => {

            let budcatid = $(e.target).parent().parent().parent().attr("budcatid");

            $(e.target).parent().parent().parent().addClass("editing");

            let edit_item = this.data.details.categories.find(item => {
                return item.budCatID == budcatid;
            });

            console.log(edit_item);

            editKendoWindow.find("#edit-catOrder").val(edit_item.catOrder);
            editKendoWindow.find("#edit-category").val(edit_item.category);
            editKendoWindow.find("#edit-cost").val(edit_item.cost);
            editKendoWindow.find("#edit-weight").val(edit_item.weight);
            editKendoWindow.find("#edit-id").val(budcatid);

            $("#edit-window").data("kendoWindow")
                .center().open();

        });

        $(".category-delete").click( async (e) => {

            if (!window.confirm("Are you sure to delete the category?"))
                return false;

            let budcatid = $(e.target).closest('.row').attr("budcatid");

            console.log(budcatid);

            let details = this.data.details.budDetails.filter(item => {
                return item.budCatID == budcatid
            });

            if (details.length == 0) {
                console.log('cat Delete', budcatid)
                const catDelete = axios.delete("api/budget/DeleteBudgetCat?id=" + budcatid)

                /* Delete item from categories Array */
                this.data.details.categories.map((cat, index) => {
                    if (cat.budCatID == budcatid) {
                        this.data.details.categories.splice(index, 1)
                    }
                })

                this.DrawCategories(this.data.details.categories)
                this.DrawDetails(this.data.details.categories, this.data.details.budDetails)
            }
            else {
                if (window.confirm("This will remove all the budget details for the category")) {
                    console.log('cat Delete', budcatid)

                    details.forEach(async (item) => {
                        axios.delete("api/budget/DeleteBudgetDetail?id=" + item.budgetDetailID);
                    });
                    axios.delete("api/budget/DeleteBudgetCat?id=" + budcatid)
                    

                    /* Delete item from categories Array */
                    this.data.details.categories.map((cat, index) => {
                        if (cat.budCatID == budcatid) {
                            this.data.details.categories.splice(index, 1)
                        }
                    })

                    /* Delete items from budDetails Array */
                    this.data.details.budDetails.map((detail, index) => {
                        if (detail.budCatID == budcatid) {
                            this.data.details.budDetails.splice(index, 1)
                        }
                    })
                    this.DrawCategories(this.data.details.categories)
                    this.DrawDetails(this.data.details.categories, this.data.details.budDetails)
                }
            }

        });

        // Redraw Kendo Chart
        let chartArray = [];
        chartArray = categories.map(item => {
            return {
                category: item.category,
                value: (item.cost / total_budget * 100).toFixed(2)
            };
        });

        let chart = $('#budget-chart').data('kendoChart');

        chart.options.series[0].data = chartArray;
        chart.redraw();
    }

    private RedrawDetailRow(budDetail, offset) {
        $(".detail-pane .detail-data .detail-row").each( (i, obj) => {
            let detailid = $(obj).attr('detailid') //depositDetailID

            if (detailid == budDetail.budgetDetailID) {
                let table = $(obj).closest("table")
                let row = $(obj)
                
                row.find("input.detail-rate").val(budDetail.rate);
                row.find(".detail-total").html(Utilities.Float2Currency(budDetail.rate * budDetail.qty));
                row.find(".detail-sf").html((budDetail.rate * budDetail.qty / this.data.bud.gsf).toFixed(2));

                let old_total = Utilities.Currency2Float(table.find("thead .head-total").html());
                let new_total = old_total + offset;
                table.find("thead .head-total").html(Utilities.Float2Currency(new_total));
                table.find("thead .head-sf").html((new_total / this.data.bud.gsf).toFixed(2));
                table.find("tbody .tail-total").html(Utilities.Float2Currency(new_total));
                table.find("tbody .tail-sf").html((new_total / this.data.bud.gsf).toFixed(2));

                let old_grand_total = Utilities.Currency2Float($("#grand-total").html());
                let new_grand_total = old_grand_total + offset;
                $("#grand-total").html(Utilities.Float2Currency(new_grand_total))
                $("#grand-total-sf").html((new_grand_total / this.data.bud.gsf).toFixed(2))
            }

        });

    }

    private DeleteDetailRow(budDetail, offset) {
        $(".detail-pane .detail-data .detail-row").each((i, obj) => {
            let detailid = $(obj).attr('detailid') //depositDetailID

            if (detailid == budDetail.budgetDetailID) {
                let table = $(obj).closest("table")
                let row = $(obj)

                
                

                let old_total = Utilities.Currency2Float(table.find("thead .head-total").html());
                let new_total = old_total + offset;
                console.log('deletedetailrow', old_total, offset)
                table.find("thead .head-total").html(Utilities.Float2Currency(new_total));
                table.find("thead .head-sf").html((new_total / this.data.bud.gsf).toFixed(2));
                table.find("tbody .tail-total").html(Utilities.Float2Currency(new_total));
                table.find("tbody .tail-sf").html((new_total / this.data.bud.gsf).toFixed(2));

                row.html("");
                let old_grand_total = Utilities.Currency2Float($("#grand-total").html());
                let new_grand_total = old_grand_total + offset;
                $("#grand-total").html(Utilities.Float2Currency(new_grand_total))
                $("#grand-total-sf").html((new_grand_total / this.data.bud.gsf).toFixed(2))
            }

        });

    }

    private InsertDetailRow(budDetail, offset) {
        $(".detail-pane .detail-data .subheading").each((i, obj) => {
             let budcatid = $(obj).attr('budcatid') //budcatid

            if (budcatid == budDetail.budCatID) {
                
                let table = $(obj)

                let gsf = this.data.bud.gsf;
                let index = 0;
                let category = this.data.details.categories.find((cat, ind) => {
                    
                    if (cat.budCatID == budcatid) {
                        index = ind;
                        return true;
                    }
                    return false;
                    
                })
                let category_total = category.cost;
                let sf = category.cost / gsf;

                let c_details = this.data.details.budDetails.filter(detail => {
                    return detail.budCatID == category.budCatID;
                })

                let content = `
                <table class="subheading" cellspacing="0" budcatid="${category.budCatID}">
                    <thead>
                        <tr>
                            <td colspan="2" style="width: 320px; position: relative;" budcatid="${category.budCatID}">
                                <span class="category-expand-btn fa fa-angle-double-right count-icon" style="position: absolute; top: 5px; font-size: 14px; font-weight: 800; color: #050ce0; display:none;"></span>
                                <span class="category-collapse-btn fa fa-angle-double-down count-icon" style="position: absolute; top: 5px; font-size: 14px; font-weight: 800; color: #050ce0;"></span>
                                <div class="detail-category">${index + 1} . ${category.category}</div>
                                <button class="detail-add-btn btn-1" style="float:right; margin-right: 70px;">+</button>
                            </td>
                            <td style="width: 150px;"></td>
                            <td style="width: 150px;"></td>
                            <td style="width: 90px;"></td>
                            <td style="width: 90px;"></td>
                            <td style="width: 90px;" class="currency detail-total-column">
                                <span class="head-total">${kendo.toString(category.cost, "c")}</span>
                            </td>
                            <td style="width: 90px;" class="currency"><span class="head-sf">${kendo.toString(sf, "0.00")}</span></td>
                            <td style="flex: 1;"></td>
                            <td style="width: 90px;text-align: center;"></td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>`;

                c_details.forEach((detail, dindex) => {
                    let detail_total = detail.qty * detail.rate;
                    content += `<tr class="detail-row" detailid="${detail.budgetDetailID}">
                                <td style="width: 70px;">
                                    <input class="number detail-code" value="${detail.code}"/>
                                </td>
                                <td style="width: 250px;">
                                    <input class="detail-item" value="${dindex + 1} . ${detail.item}" />
                                </td>
                                <td style="width: 150px;">
                                    <input class="detail-basis" value="${detail.basis}"/>
                                </td>
                                <td style="width: 150px;">
                                    <input class="detail-unit"  value="${detail.unit}"/>
                                </td>
                                <td style="width: 90px;">
                                    <input class="number detail-qty" style="width: calc(100% - 20px) !important; margin-right: 3px;" value="${detail.qty}"/> X
                                </td>
                                <td style="width: 90px;">
                                    <input class="number detail-rate" style="width: calc(100% - 15px); margin-right: 3px;" value="${detail.rate}"/> =
                                </td>
                                <td style="width: 90px;" class="currency detail-total-column">
                                    <span class="currency detail-total"> ${ kendo.toString(detail_total, "c")}</span>
                                </td>
                                <td style="width: 90px;" class="currency">
                                    <span class="currency detail-sf">${kendo.toString(detail_total / gsf, "0.00")}</span>
                                </td>
                                <td style="flex: 1;">
                                    <input class="detail-note" value="${detail.note}"/>
                                </td>
                                <td style="width: 90px; text-align: center;" class="schedSwitchBox">
                                    <input type="checkbox" class="sched-switch" />
                                </td>
                                <td  style="text-align:center"><span class="detail-menu"><i class="fa fa-bars"></i></span></td>
                            </tr>
                            <tr class="hidden">
                                <td colspan=11>
                                    <div class="row">
                                        <div class="form-element innerSwitchBox">
                                            <input type="checkbox" class="sched-inner-switch" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="form-element">
                                            <label>ID</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Task Description</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Duration</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Start</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>End</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Schedule Note</label>
                                            <input />
                                        </div>

                                    </div>
                                </td>
                            </tr>
                            `;
                });

                content += `<tr class="total-row">
                            <td style="wdith: 70px;"></td>
                            <td colspan="4" style="width: 730px;">
                                Total - ${category.category} (Category #${index + 1})</td>
                            <td style="width: 90px;" class="currency detail-total-column">
                                <span class="currency tail-total">${kendo.toString(category_total, "c")}</span>
                            </td>
                            <td style="width: 90px;" class="currency">
                                <span class="currency tail-sf" >${kendo.toString(category_total / gsf, "0.00")}</span>
                            </td>
                            <td style="flex: 1;"></td>
                            <td style="width: 90px;"></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            `;
                table.html(content)
                let old_grand_total = Utilities.Currency2Float($("#grand-total").html());
                let new_grand_total = old_grand_total + offset;
                $("#grand-total").html(Utilities.Float2Currency(new_grand_total))
                $("#grand-total-sf").html((new_grand_total / this.data.bud.gsf).toFixed(2))

                table.find(".detail-row input").change(async (e) => {

                    let row = $(e.target).closest('tr');


                    let detailid = row.attr("detailid");

                    let detail = this.data.details.budDetails.find(item => {
                        return item.budgetDetailID == detailid
                    })
                    let origin_cost = detail.qty * detail.rate;


                    let item = row.find(".detail-item").val()
                    let res = item.toString().split(".");
                    detail.basis = row.find("input.detail-basis:nth-child(2)").data('kendoComboBox').value()
                    detail.code = row.find(".detail-code").val()
                    detail.item = res[1].trim()
                    detail.qty = row.find(".detail-qty").val()
                    detail.unit = row.find("input.detail-unit:nth-child(2)").data('kendoComboBox').value()
                    detail.rate = row.find(".detail-rate").val()
                    detail.note = row.find(".detail-note").val()

                    console.log('detail Update', detail)
                    axios.put("api/budget/UpdateBudDetail", detail)

                    let offset = detail.qty * detail.rate - origin_cost;

                    // Sync Category 
                    let cat = this.data.details.categories.find((cat) => {
                        return cat.budCatID == detail.budCatID
                    })
                    cat.cost = 0;
                    this.data.details.budDetails.find((item) => {
                        if (item.budCatID == detail.budCatID) {
                            cat.cost += item.rate * item.qty;
                        }
                    })

                    console.log('cat Update', cat)
                    axios.put("api/budget/UpdateBudCat", cat);

                    this.RedrawDetailRow(detail, offset);

                    let total_budget = 0;
                    this.data.details.categories.map((cat) => {
                        total_budget += cat.cost
                    })

                    $(".categories .row").each((i, obj) => {
                        let budcatid = $(obj).attr('budcatid')
                        if (budcatid == detail.budCatID) {
                            $(obj).find("input.budget:nth-child(2)").data("kendoNumericTextBox").value(cat.cost)
                            $(obj).find(".sf").html((cat.cost / this.data.bud.gsf).toFixed(2));

                            $("#total-budget").html(Utilities.Float2Currency(total_budget));
                            $("#total-sf").html((total_budget / this.data.bud.gsf).toFixed(2));
                        }
                    })

                });

                table.find(".detail-row input").focus((e) => {
                    $(e.target).parent().parent().addClass("editing");
                });

                table.find(".detail-row input").focusout((e) => {
                    $(e.target).parent().parent().removeClass("editing");
                });

                table.find(".sched-switch").kendoSwitch({
                    checked: false,
                    change: (e) => {
                        let parent_row = $(e.sender.element[0]).parent().parent().parent();
                        //parent_row.append("<tr></tr>");
                        console.log(e.checked);
                        console.log(parent_row.next());
                        if (e.checked == false) {
                            parent_row.next().addClass("hidden");
                        }
                        else {
                            parent_row.next().removeClass("hidden");
                        }

                    }
                });

                table.find(".sched-inner-switch").kendoMobileSwitch({
                    checked: false,
                    offLabel: 'Attach to Existing',
                    onLabel: 'New',
                    change: (e) => {

                    }
                });



                table.find(".detail-basis").kendoComboBox({
                    dataTextField: "title",
                    dataValueField: "title",
                    dataSource: [
                        {
                            id: 1, title: "Estimate"
                        },
                        {
                            id: 2, title: "Quote"
                        },
                        {
                            id: 3, title: "ROM"
                        }
                    ],
                    filter: "contains",
                    suggest: true,
                    index: 100
                });

                table.find(".detail-unit").kendoComboBox({
                    dataTextField: "title",
                    dataValueField: "title",
                    dataSource: [
                        {
                            id: 1, title: "Each"
                        },
                    ],
                    filter: "contains",
                    suggest: true,
                    index: 100
                });

                table.find(".category-expand-btn").click((e) => {

                    let table = $(e.target).parent().parent().parent().parent();
                    table.find("tbody").show();
                    table.find(".category-expand-btn").hide();
                    table.find(".category-collapse-btn").show();
                });

                table.find(".category-collapse-btn").click((e) => {
                    let table = $(e.target).parent().parent().parent().parent();
                    table.find("tbody").hide();
                    table.find(".category-expand-btn").show();
                    table.find(".category-collapse-btn").hide();
                });



                table.find(".detail-add-btn").click((e) => {
                    var popup = $("#detail-window").data("kendoWindow");
                    console.log("1",popup);
                    $("#detail-window").data("kendoWindow")
                        .center().open();

                    $("#add-detail-catID").val($(e.target).parent().attr("budcatid"));
                });


                table.find(".detail-menu").kendoMenu({
                    dataSource: [
                        {
                            text: ``,
                            cssClass: "detail-menu-icon",
                            expanded: false,
                            items: [
                                {
                                    text: "Move",
                                    cssClass: "detail-move"
                                },
                                {
                                    text: "Delete",
                                    cssClass: "detail-delete"
                                }
                            ]
                        },
                    ]
                });

                let detailMoveKendoWindow = $("#detail-move-window").kendoWindow({
                    title: "Budget Detail Move",
                    resizable: true,
                    modal: true,
                    width: '300px'
                });
                detailMoveKendoWindow
                    .find(".save-button")
                    .click(async () => {
                        console.log('detail add');
                        detailMoveKendoWindow.data("kendoWindow").close();



                        let detailid = detailMoveKendoWindow.find("#detail-move-id").val();
                        let edit_row = $(`.detail-data tr[detailid='${detailid}']`);
                        edit_row.removeClass('editing');

                        let detail = this.data.details.budDetails.find(item => {
                            return item.budgetDetailID == detailid
                        })

                        detail.detailOrder = detailMoveKendoWindow.find("#detail-move-order").val();

                        console.log('detail Update', detail)
                        axios.put("api/budget/UpdateBudDetail", detail)

                        //                this.DrawDetails(this.data.details.categories, this.data.details.budDetails)
                    })
                    .end();

                detailMoveKendoWindow
                    .find(".cancel-button")
                    .click(() => {
                        let detailid = detailMoveKendoWindow.find("#detail-move-id").val();
                        let edit_row = $(`.detail-data tr[detailid='${detailid}']`);
                        edit_row.removeClass('editing');

                        detailMoveKendoWindow.data("kendoWindow").close();
                    })
                    .end();

                table.find(".detail-move").click((e) => {
                    let tr = $(e.target).closest('tr');
                    let detail_id = tr.attr("detailid");

                    tr.addClass("editing");

                    let detail = this.data.details.budDetails.find(item => {
                        return item.budgetDetailID == detail_id
                    })
                    detailMoveKendoWindow.find("#detail-move-order").val(detail.detailOrder);
                    detailMoveKendoWindow.find("#detail-move-id").val(detail_id);

                    $("#detail-move-window").data("kendoWindow")
                        .center().open();
                });

                table.find(".detail-delete").click(async (e) => {
                    if (!window.confirm("Are you sure to delete the detail?"))
                        return false;
                    let tr = $(e.target).closest('tr');
                    let detail_id = tr.attr("detailid");

                    const detailDelete = await axios.delete("api/budget/DeleteBudgetDetail?id=" + detail_id);
                    console.log('detail Delete', detail_id)

                    let detail = this.data.details.budDetails.find((item) => {
                        return item.budgetDetailID == detail_id;
                    })
                    let budCatID = detail.budCatID;
                    console.log('budcatID', budCatID);
                    this.data.details.budDetails.map((detail, index) => {
                        if (detail.budgetDetailID == detail_id) {
                            this.data.details.budDetails.splice(index, 1)
                        }
                    })
                    let offset = - detail.qty * detail.rate;
                    // Sync Category 
                    let cat = this.data.details.categories.find((cat) => {
                        return cat.budCatID == budCatID
                    })
                    cat.cost = 0;
                    console.log(detail);
                    this.data.details.budDetails.find((item) => {
                        if (item.budCatID == detail.budCatID) {
                            cat.cost += item.rate * item.qty;
                        }
                    })

                    console.log('cat Update', cat)
                    axios.put("api/budget/UpdateBudCat", cat);

                    this.DeleteDetailRow(detail, offset);

                    let total_budget = 0;
                    this.data.details.categories.map((cat) => {
                        total_budget += cat.cost
                    })

                    $(".categories .row").each((i, obj) => {
                        let budcatid = $(obj).attr('budcatid')
                        if (budcatid == detail.budCatID) {
                            $(obj).find("input.budget:nth-child(2)").data("kendoNumericTextBox").value(cat.cost)
                            $(obj).find(".sf").html((cat.cost / this.data.bud.gsf).toFixed(2));

                            $("#total-budget").html(Utilities.Float2Currency(total_budget));
                            $("#total-sf").html((total_budget / this.data.bud.gsf).toFixed(2));
                        }
                    })

                });

            }

        });

    }

    private detailsExpandAll() {
        $(".detail-pane .detail-data").find("tbody").show();

        $(".detail-pane .detail-data").find("thead .category-expand-btn").hide();
        $(".detail-pane .detail-data").find("thead .category-collapse-btn").show();

        $(".expand-all-btn").hide();
        $(".collapse-all-btn").show();
    }

    private detailsCollapseAll() {
        $(".detail-pane .detail-data").find("tbody").hide();

        $(".detail-pane .detail-data").find("thead .category-expand-btn").show();
        $(".detail-pane .detail-data").find("thead .category-collapse-btn").hide();

        $(".expand-all-btn").show();
        $(".collapse-all-btn").hide();
    }

    private detailsExpandCat(budcatid) {
        let table = $(".detail-pane .detail-data").find(`table[budcatid='${budcatid}']`)

        table.find("thead .category-expand-btn").hide();
        table.find("thead .category-collapse-btn").show();
        table.find("tbody").show(); 
        
    }
    private LoadDetails() {
        kendo.culture("en-US");

        let categories = this.data.details.categories;

        let details = this.data.details.budDetails;

        if (categories == null || categories.length == 0)
            categories = [];

        if (details == null || details.length == 0)
            details = [];
        this.DrawDetails(categories, details);

        this.makeDetailAddWindow();

        $("#add-detail-basis").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "Estimate"
                },
                {
                    id: 2, title: "Quote"
                },
                {
                    id: 3, title: "ROM"
                }
            ],
            filter: "contains",
            suggest: true,
            index: 100
        });

        $("#add-detail-unit").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "Each"
                },
            ],
            filter: "contains",
            suggest: true,
            index: 100
        });
    }

    private DrawDetails(categories, details) {

        $(".detail-pane .detail-data").html("");

        const gsf = this.data.bud.gsf;

        let grand_total = 0;
        categories.forEach((category, index) => {

            let sf = category.cost / gsf;
            let c_details = details.filter(detail => {
                return detail.budCatID == category.budCatID;
            })

            let category_total = 0;
            c_details.forEach(detail => {
                let detail_total = detail.qty * detail.rate;
                category_total += detail_total;
            });
            grand_total += category_total;
            let classname = "currency";
            /*if (category.cost != category_total) {
                classname += " alert"
            }*/

            let content = `
                <table class="subheading" cellspacing="0" budcatid="${category.budCatID}">
                    <thead>
                        <tr>
                            <td colspan="2" style="width: 320px; position: relative;" budcatid="${category.budCatID}">
                                <span class="category-expand-btn fa fa-angle-double-right count-icon" style="position: absolute; top: 5px; font-size: 14px; font-weight: 800; color: #050ce0; display:none;"></span>
                                <span class="category-collapse-btn fa fa-angle-double-down count-icon" style="position: absolute; top: 5px; font-size: 14px; font-weight: 800; color: #050ce0;"></span>
                                <div class="detail-category">${index + 1} . ${category.category}</div>
                                <button class="detail-add-btn btn-1" style="float:right; margin-right: 70px;">+</button>
                            </td>
                            <td style="width: 150px;"></td>
                            <td style="width: 150px;"></td>
                            <td style="width: 90px;"></td>
                            <td style="width: 90px;"></td>
                            <td style="width: 90px;" class="currency detail-total-column">
                                <span class="head-total">${kendo.toString(category.cost, "c")}</span>
                            </td>
                            <td style="width: 90px;" class="currency"><span class="head-sf">${kendo.toString(sf, "0.00")}</span></td>
                            <td style="flex:1;"></td>
                            <td style="width: 90px;text-align: center;"></td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>`;

            c_details.forEach((detail, dindex) => {
                let detail_total = detail.qty * detail.rate;
                content += `<tr class="detail-row" detailid="${detail.budgetDetailID}">
                                <td style="width: 50px;">
                                    <input class="number detail-code" value="${detail.code}"/>
                                </td>
                                <td style="width: 250px;">
                                    <input class="detail-item" value="${dindex + 1} . ${detail.item}" />
                                </td>
                                <td style="width: 150px;">
                                    <input class="detail-basis" value="${detail.basis}"/>
                                </td>
                                <td style="width: 150px;">
                                    <input class="detail-unit" value="${detail.unit}"/>
                                </td>
                                <td style="width: 90px;">
                                    <input class="number detail-qty" style="width: calc(100% - 20px) !important; margin-right: 3px;" value="${detail.qty}"/> X
                                </td>
                                <td style="width: 90px;">
                                    <input class="number detail-rate" style="width: calc(100% - 15px); margin-right: 3px;" value="${detail.rate}"/> =
                                </td>
                                <td style="width: 90px;" class="currency detail-total-column">
                                    <span class="currency detail-total"> ${ kendo.toString(detail_total, "c")}</span>
                                </td>
                                <td style="width: 90px;" class="currency">
                                    <span class="currency detail-sf">${kendo.toString(detail_total / gsf, "0.00")}</span>
                                </td>
                                <td style="flex: 1;">
                                    <input class="detail-note" value="${detail.note}"/>
                                </td>
                                <td style="width: 90px; text-align: center;" class="schedSwitchBox">
                                    <input type="checkbox" class="sched-switch" />
                                </td>
                                <td  style="text-align:center"><span class="detail-menu"><i class="fa fa-bars"></i></span></td>
                            </tr>
                            <tr class="hidden">
                                <td colspan=11>
                                    <div class="row">
                                        <div class="form-element innerSwitchBox">
                                            <input type="checkbox" class="sched-inner-switch" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="form-element">
                                            <label>ID</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Task Description</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Duration</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Start</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>End</label>
                                            <input />
                                        </div>
                                        <div class="form-element">
                                            <label>Schedule Note</label>
                                            <input />
                                        </div>

                                    </div>
                                </td>
                            </tr>
                            `;
            });

            content += `<tr class="total-row">
                            <td style="width:50px;"></td>
                            <td colspan="4" style="width: 730px;">
                                Total - ${category.category} (Category #${index + 1})</td>
                            <td style="width: 90px;" class="currency detail-total-column">
                                <span class="${classname} tail-total">${kendo.toString(category_total, "c")}</span>
                            </td>
                            <td style="width: 90px;" class="currency">
                                <span class="${classname} tail-sf" >${kendo.toString(category_total / gsf, "0.00")}</span>
                            </td>
                            <td style="flex:1;"></td>
                            <td style="width: 90px;"></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            `;
            $(".detail-pane .detail-data").append(content);

            $("#grand-total").html(Utilities.Float2Currency(grand_total));
            $("#grand-total-sf").html((grand_total / gsf).toFixed(2));
        });

        $(".detail-data input").change(async (e) => {
            
            let row = $(e.target).closest('tr');
            
            
            let detailid = row.attr("detailid");

            let detail = this.data.details.budDetails.find(item => {
                return item.budgetDetailID == detailid
            })
            let origin_cost = detail.qty * detail.rate;

            
            let item = row.find(".detail-item").val()
            let res = item.toString().split(".");
            detail.basis = row.find("input.detail-basis:nth-child(2)").data('kendoComboBox').value()
            detail.code = row.find(".detail-code").val()
            detail.item = res[1].trim()
            detail.qty = row.find(".detail-qty").val()
            detail.unit = row.find("input.detail-unit:nth-child(2)").data('kendoComboBox').value()
            detail.rate = row.find(".detail-rate").val()
            detail.note= row.find(".detail-note").val()

            console.log('detail Update', detail)
            axios.put("api/budget/UpdateBudDetail", detail)
            
            let offset = detail.qty * detail.rate - origin_cost;

            // Sync Category 
            let cat = this.data.details.categories.find((cat) => {
                return cat.budCatID == detail.budCatID
            })
            cat.cost = 0;
            this.data.details.budDetails.find((item) => {
                if (item.budCatID == detail.budCatID) {
                    cat.cost += item.rate * item.qty;
                }
            })

            console.log('cat Update', cat)
            axios.put("api/budget/UpdateBudCat", cat);

            this.RedrawDetailRow(detail, offset);

            let total_budget = 0;
            this.data.details.categories.map((cat) => {
                total_budget += cat.cost
            })

            $(".categories .row").each( (i, obj) => {
                let budcatid = $(obj).attr('budcatid')
                if (budcatid == detail.budCatID) {
                    $(obj).find("input.budget:nth-child(2)").data("kendoNumericTextBox").value(cat.cost)
                    $(obj).find(".sf").html((cat.cost / this.data.bud.gsf).toFixed(2));

                    $("#total-budget").html(Utilities.Float2Currency(total_budget));
                    $("#total-sf").html((total_budget / this.data.bud.gsf).toFixed(2));
                }
            })

        });

        $(".detail-data input").focus((e) => {
            $(e.target).parent().parent().addClass("editing");
        });

        $(".detail-data input").focusout((e) => {
            $(e.target).parent().parent().removeClass("editing");
        });

        $(".sched-switch").kendoSwitch({
            checked: false,
            change: (e) => {
                let parent_row = $(e.sender.element[0]).parent().parent().parent();
                //parent_row.append("<tr></tr>");
                console.log(e.checked);
                console.log(parent_row.next());
                if (e.checked == false) {
                    parent_row.next().addClass("hidden");
                }
                else {
                    parent_row.next().removeClass("hidden");
                }

            }
        });

        $(".sched-inner-switch").kendoMobileSwitch({
            checked: false,
            offLabel: 'Attach to Existing',
            onLabel: 'New',
            change: (e) => {

            }
        });

        

        $(".detail-basis").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "Estimate"
                },
                {
                    id: 2, title: "Quote"
                },
                {
                    id: 3, title: "ROM"
                }
            ],
            filter: "contains",
            suggest: true,
            index: 100
        });

        $(".detail-unit").kendoComboBox({
            dataTextField: "title",
            dataValueField: "title",
            dataSource: [
                {
                    id: 1, title: "Each"
                },
            ],
            filter: "contains",
            suggest: true,
            index: 100
        });

        $(".category-expand-btn").click((e) => {

            let table = $(e.target).parent().parent().parent().parent();
            table.find("tbody").show();
            table.find(".category-expand-btn").hide();
            table.find(".category-collapse-btn").show();
        });

        $(".category-collapse-btn").click((e) => {
            let table = $(e.target).parent().parent().parent().parent();
            table.find("tbody").hide();
            table.find(".category-expand-btn").show();
            table.find(".category-collapse-btn").hide();
        });

        

        $(".detail-add-btn").click((e) => {
            var popup = $("#detail-window").data("kendoWindow");
            console.log("2", popup);

            $("#detail-window").data("kendoWindow")
                .center().open();

            $("#add-detail-catID").val($(e.target).parent().attr("budcatid"));
        });


        $(".detail-menu").kendoMenu({
            dataSource: [
                {
                    text: ``,
                    cssClass: "detail-menu-icon",
                    expanded: false,
                    items: [
                        {
                            text: "Move",
                            cssClass: "detail-move"
                        },
                        {
                            text: "Delete",
                            cssClass: "detail-delete"
                        }
                    ]
                },
            ]
        });

        let detailMoveKendoWindow = $("#detail-move-window").kendoWindow({
            title: "Budget Detail Move",
            resizable: true,
            modal: true,
            width: '300px'
        });
        detailMoveKendoWindow
            .find(".save-button")
            .click(async () => {
                console.log('detail add');
                detailMoveKendoWindow.data("kendoWindow").close();



                let detailid = detailMoveKendoWindow.find("#detail-move-id").val();
                let edit_row = $(`.detail-data tr[detailid='${detailid}']`);
                edit_row.removeClass('editing');

                let detail = this.data.details.budDetails.find(item => {
                    return item.budgetDetailID == detailid
                })

                detail.detailOrder = detailMoveKendoWindow.find("#detail-move-order").val();

                console.log('detail Update', detail)
                axios.put("api/budget/UpdateBudDetail", detail)
                
//                this.DrawDetails(this.data.details.categories, this.data.details.budDetails)
            })
            .end();

        detailMoveKendoWindow
            .find(".cancel-button")
            .click(() => {
                let detailid = detailMoveKendoWindow.find("#detail-move-id").val();
                let edit_row = $(`.detail-data tr[detailid='${detailid}']`);
                edit_row.removeClass('editing');

                detailMoveKendoWindow.data("kendoWindow").close();
            })
            .end();

        $(".detail-move").click((e) => {
            let tr = $(e.target).closest('tr');
            let detail_id = tr.attr("detailid");

            tr.addClass("editing");

            let detail = this.data.details.budDetails.find(item => {
                return item.budgetDetailID == detail_id
            })
            detailMoveKendoWindow.find("#detail-move-order").val(detail.detailOrder);
            detailMoveKendoWindow.find("#detail-move-id").val(detail_id);

            $("#detail-move-window").data("kendoWindow")
                .center().open();
        });

        $(".detail-delete").click(async (e) => {
            if (!window.confirm("Are you sure to delete the detail?"))
                return false;
            let tr = $(e.target).closest('tr');
            let detail_id = tr.attr("detailid");
           
            const detailDelete = await axios.delete("api/budget/DeleteBudgetDetail?id=" + detail_id);
            console.log('detail Delete', detail_id)

            let detail = this.data.details.budDetails.find((item) => {
                return item.budgetDetailID == detail_id;
            })
            let budCatID = detail.budCatID;
            console.log('budcatID', budCatID);
            this.data.details.budDetails.map((detail, index) => {
                if (detail.budgetDetailID == detail_id) {
                    this.data.details.budDetails.splice(index, 1)
                }
            })
            let offset = - detail.qty * detail.rate;
            // Sync Category 
            let cat = this.data.details.categories.find((cat) => {
                return cat.budCatID == budCatID
            })
            cat.cost = 0;
            console.log(detail);
            this.data.details.budDetails.find((item) => {
                if (item.budCatID == detail.budCatID) {
                    cat.cost += item.rate * item.qty;
                }
            })

            console.log('cat Update', cat)
            axios.put("api/budget/UpdateBudCat", cat);

            this.DeleteDetailRow(detail, offset);

            let total_budget = 0;
            this.data.details.categories.map((cat) => {
                total_budget += cat.cost
            })

            $(".categories .row").each((i, obj) => {
                let budcatid = $(obj).attr('budcatid')
                if (budcatid == detail.budCatID) {
                    $(obj).find("input.budget:nth-child(2)").data("kendoNumericTextBox").value(cat.cost)
                    $(obj).find(".sf").html((cat.cost / this.data.bud.gsf).toFixed(2));

                    $("#total-budget").html(Utilities.Float2Currency(total_budget));
                    $("#total-sf").html((total_budget / this.data.bud.gsf).toFixed(2));
                }
            })
            
        });
    }

    private makeDetailAddWindow() {
        let detailKendoWindow = $("#detail-window").kendoWindow({
            title: "Add Category Detail",
            resizable: true,
            modal: true,
            width: '1100px'
        });
        detailKendoWindow
            .find(".save-button")
            .click( async () => {
                detailKendoWindow.data("kendoWindow").close();

                let detail = {} as any;

                detail.basis = detailKendoWindow.find("#add-detail-basis").data("kendoComboBox").value();
                detail.budCatID = detailKendoWindow.find("#add-detail-catID").val();
                detail.code = detailKendoWindow.find("#add-detail-code").val();
                detail.detailOrder = detailKendoWindow.find("#add-detail-order").val();
                detail.item = detailKendoWindow.find("#add-detail-item").val();
                detail.qty = detailKendoWindow.find("#add-detail-qty").val();
                detail.rate = detailKendoWindow.find("#add-detail-rate").val();
                detail.unit = detailKendoWindow.find("#add-detail-unit").data("kendoComboBox").value();
                detail.note = detailKendoWindow.find("#add-detail-note").val();
                detail.onSched = false;
                detail.budgetid = this.data.bud.budgetID;

                console.log('detail Insert', detail)

                let offset = detail.qty * detail.rate;

                const detailInsert = await axios.post("api/budget/InsertBudDetail", detail)
                this.data.details.budDetails.push(detailInsert.data)

                // Sync Category 
                let cat = this.data.details.categories.find((cat) => {
                    return cat.budCatID == detail.budCatID
                })
                cat.cost = 0;
                this.data.details.budDetails.find((item) => {
                    if (item.budCatID == detail.budCatID) {
                        cat.cost += item.rate * item.qty;
                    }
                })

                console.log('cat Update', cat)
                axios.put("api/budget/UpdateBudCat", cat);

                
                this.InsertDetailRow(detailInsert.data, offset);

                let total_budget = 0;
                this.data.details.categories.map((cat) => {
                    total_budget += cat.cost
                })

                $(".categories .row").each((i, obj) => {
                    let budcatid = $(obj).attr('budcatid')
                    if (budcatid == detail.budCatID) {
                        $(obj).find("input.budget:nth-child(2)").data("kendoNumericTextBox").value(cat.cost)
                        $(obj).find(".sf").html((cat.cost / this.data.bud.gsf).toFixed(2));

                        $("#total-budget").html(Utilities.Float2Currency(total_budget));
                        $("#total-sf").html((total_budget / this.data.bud.gsf).toFixed(2));
                    }
                })
                
            })
            .end();

        detailKendoWindow
            .find(".cancel-button")
            .click(() => {
                detailKendoWindow.data("kendoWindow").close();
            })
            .end();

            
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

        $("#date-open").val(Utilities.FormatDateString(this.data.bud.dateEntered));
        $("#date-published").val(Utilities.FormatDateString(this.data.bud.datePublished));
        if (this.data.bud.budgetID != 0) {
            $("#projectdate").val(Utilities.FormatDateString(this.data.bud.projectDate));
            $("#due-date").val(Utilities.FormatDateString(this.data.bud.dueDate));
        }
        

        $("#ad").val(this.data.bud.addendumNo);
        $("#budget-type").data("kendoComboBox").value(this.data.bud.budgetType);
        $("#classification").data("kendoComboBox").value(this.data.bud.classification);

        $("#status").data("kendoComboBox").value(this.data.bud.status);
        $("#gsf").kendoNumericTextBox({
            format: "n0",
            min: 0,
            spinners: false,
            change: async (e) => {
                this.data.bud.gsf = e.sender.value();
                this.DrawCategories(this.data.details.categories)
                this.DrawDetails(this.data.details.categories, this.data.details.budDetails)

                if (this.data.bud.gsf > 0) {
                    let avl_commit = this.data.currentTotals.deposits - this.data.currentTotals.commitments;
                    let avl_pnd = this.data.currentTotals.deposits - (this.data.currentTotals.commitments + this.data.currentTotals.pending);

                    $("#deposits-sf").html((this.data.currentTotals.deposits / this.data.bud.gsf).toFixed(2));
                    $("#commits-sf").html((this.data.currentTotals.commitments / this.data.bud.gsf).toFixed(2));
                    $("#pending-sf").html((this.data.currentTotals.pending / this.data.bud.gsf).toFixed(2));
                    $("#avl-commit-sf").html(kendo.toString(avl_commit / this.data.bud.gsf, "0.00"));
                    $("#avl-pnd-sf").html(kendo.toString(avl_pnd / this.data.bud.gsf, "0.00"));
                }
            }
        });
        $("#gsf").data('kendoNumericTextBox').value(this.data.bud.gsf);
        
        $("#account-no").val(this.data.bud.accountNo);

        var conArray = this.data.contributors.map(item => {
            return {
                id: item.contactID,
                item: item.showAsName
            }
        });
        
       

        $("#contributors").kendoListView({
            template: kendo.template("<div> ${item}</div>"),
            dataSource: conArray
        });


        
    }

    private async Save(): Promise<void> {

        this.PublishButton.disabled = true;
        this.DraftButton.disabled = true;
        document.body.classList.toggle("wait");


        this.data.bud.projectID = parseInt($("#project").data("kendoComboBox").value());
        this.data.bud.classification = $("#classification").data("kendoComboBox").value();

        this.data.bud.dateEntered = $("#date-open").val();


        this.data.bud.datePublished = $("#date-published").val();
        this.data.bud.dueDate = $("#due-date").val();
        this.data.bud.projectDate = $("#projectdate").val();


        
        this.data.bud.budgetType = $("#budget-type").data("kendoComboBox").value();

        this.data.bud.addendumNo = $("#ad").val()

        this.data.bud.accountNo = $("#account-no").val();
        this.data.bud.gsf = $("#gsf").val();

        this.data.bud.entCode = this.data.bud.entCode;
        this.data.bud.writer = this.data.bud.writer;

        let total_budget = 0;
        this.data.details.categories.forEach((item, index) => {
            total_budget += item.cost;
        });
        this.data.bud.total = total_budget;

        console.log(this.data.bud);
        try {
            if (this.data.bud.budgetID == 0) {
                const budInsert = await axios.post("api/budget/InsertBudget", this.data.bud);
                console.log('budget inserted', budInsert);
                window.location.href = "/budgets/" + budInsert.data.budgetID;
                this.notification.ShowNotification("Save Success!", "Budget Inserted Successfully", "success")

                this.orig = Utilities.deep(this.data)
                this.IsDirty = false;

                history.pushState({
                    id: 'homepage'
                }, 'Budget Details - Syvenn', '/budgets/' + this.data.bud.budgetID);
            }
            else {
                const budUpdate = await axios.put("api/budget/UpdateBudget", this.data.bud);
                console.log('budget updated', budUpdate);
                this.notification.ShowNotification("Save Success!", "Budget Updated Successfully", "success")

                this.orig = Utilities.deep(this.data)
                this.IsDirty = false;
            }
        }
        catch (error) {
            this.notification.ShowNotification("Save Failed", error, "error")
        }
        


        document.body.classList.toggle("wait");
        this.PublishButton.classList.remove('running');
        this.DraftButton.classList.remove('running');
        this.PublishButton.disabled = false;
        this.DraftButton.disabled = false;

    }

    private async Publish(): Promise<void> {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        this.data.bud.datePublished = mm + '/' + dd + '/' + yyyy;
        $("#date-published").val(this.data.bud.datePublished);
        
        let adVal = $("#ad").val();
        this.data.bud.addendumNo = parseInt(adVal.toString()) + 1;
        $("#ad").val(this.data.bud.addendumNo);

        this.data.bud.status = "Approved";
        $("#status").data("kendoComboBox").value("Approved");

        this.PublishButton.classList.add('running')
        this.Save()
    }

    private async Draft(): Promise<void> {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        this.data.bud.dateEntered = mm + '/' + dd + '/' + yyyy;
        $("#date-open").val(this.data.bud.dateEntered);

        this.data.bud.status = "Approved";
        $("#status").data("kendoComboBox").value("Draft");

        this.DraftButton.classList.add('running')
        this.Save()
    }

    private BuildNotes(): void {
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
        if (this.data.bud.budgetID == 0)
            return;
        const emails = await axios.get("api/budget/GetAttachDocs?entcode=" + this.data.bud.entCode + "&id=" + this.data.bud.budgetID);
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
        
        let response = await axios.get("api/budget/GetContributorsbyBudID?budid=" + this.data.bud.budgetID);
        let contributors = response.data;
        this.data.contributors = contributors
        console.log('reload contributors', contributors);
        var conArray = contributors.map(item => {
            return {
                id: item.contactID,
                item: item.showAsName
            }
        });
       
        $("#contributors").kendoListView({
            template: kendo.template("<div> ${item}</div>"),
            dataSource: conArray
        });


    }

    private async ReloadCategories() {
        let response = await axios.get("api/budget/getBudCatbyBudID?id=" + this.data.bud.budgetID);
        let categories = response.data;

        if (categories === null || categories.length === 0)
            categories = []
        this.data.details.categories = categories;
        kendo.culture("en-US");

        

        this.DrawCategories(categories);

        // Redraw Budget Details
        this.ReloadBudDetails();

        
    }

    // Redraw Budget Details
    private async ReloadBudDetails() {
        let response = await axios.get("api/budget/getBudDetailsbyBudID?budid=" + this.data.bud.budgetID);
        let details = response.data;
        console.log(details);

        kendo.culture("en-US");

        const categories = this.data.details.categories;

        

        this.DrawDetails(categories, details);
    }
}

function Currency2Float(str) {
    let c = jQuery.trim(str);
    c = c.replace("$", "");
    c = c.replace(",", "");
    return parseFloat(c);
}

function Float2Currency(val) {
    return kendo.toString(val, "c")
}