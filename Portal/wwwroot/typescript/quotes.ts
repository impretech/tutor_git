import axiosES6 from "../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
import { Tabs } from "./components/tabs.js";
import { Notification } from "./components/notification.js";

export class QuotesList {

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
        console.log("Quote Grid", this.data);
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
                        id: "quoteID"
                    }
                },
                sort: { field: "quoteID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.BudgetGridSelectionChanged,
            columns: [
                { field: "quoteID", title: "QuoteID", width: '10%' },
                { field: "title", title: "Project", width: '10%' },
                { field: "createdDate", title: "Created", width: '10%', template: '#= kendo.toString(kendo.parseDate(createdDate), "MM/dd/yyyy") #' },
                { field: "description", title: "Description" },
                { field: "status", title: "Status", width: '10%' },
                {
                    field: "budget", title: "Amount", width: '10%', attributes: {
                        "class": "currency",
                    }, template: '#= kendo.toString(budget, "c") #' }
            ]
        });

        Utilities.MoveKendoToolbar("#contacts-grid");
    }

    private BudgetGridSelectionChanged = (arg: kendo.ui.GridChangeEvent): void => {
        let selectedItem: any = arg.sender.dataItem(arg.sender.select());
        console.log("Quote List", arg.sender.select());
        window.location.href = selectedItem.quoteID;
    }
}


export class QuoteDetailsItem {
    private data: any;
    private orig: any;
    private user: any;

    private UploadDocButton: HTMLDivElement;
    private docUpload: DocUploadModal;

    private SaveButton: HTMLButtonElement;
    private CancelButton: HTMLButtonElement;

    private GeneralViewButton: HTMLSpanElement;
    private DetailViewButton: HTMLSpanElement;


    private projects: any;
    private vendors: any;
    private documents: any;
    private IsDirty: Boolean;

    private notification: Notification;

   
    constructor(data: any) {
        this.data = data;
        if (this.data.quote.quoteID == 0) {
            this.data.quote.createdDate = kendo.toString(new Date(), 'MM/dd/yyyy');
        }
        this.orig = Utilities.deep(this.data)
        this.init();
        this.IsDirty = false;
    }

    private async init(): Promise<void> {
        this.docUpload = new DocUploadModal();
        console.log("Quote Init", this.data);

        this.notification = new Notification();
        this.GetCurrentUser();
        
        this.SaveButton = document.querySelector("#save-button") as HTMLButtonElement;
        this.SaveButton.addEventListener("click", async (evt) => {
            this.Save();
        });


        this.CancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
        this.CancelButton.addEventListener("click", () => {
            window.location.href = "/quotes/";
        });

        this.UploadDocButton = document.querySelector(".doc-button") as HTMLDivElement;
        this.UploadDocButton.addEventListener("click", () => {
            this.docUpload.Show(this.data.quote.projectID, this.data.quote.entCode, "bud", this.data.quote.budgetID);
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

                window.location.href = "/quotes/";
            });
        }

        const addNoteButton = document.querySelector("#add-note-button") as HTMLButtonElement;
        addNoteButton.addEventListener("click", async (evt) => {
            addNoteButton.disabled = true;
            evt.preventDefault();

            let noteText = $('#new-note').val();

            let note = {} as any;
            note.ProjectID = parseInt(this.data.quote.projectID);
            note.writer = this.user.userName;
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = this.data.quote.depositID;
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
        $("#bid-issued").kendoDatePicker();
        $("#pre-bid").kendoDatePicker();
        $("#due-date").kendoDatePicker();

        

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

        //if (this.data.quote.quoteID === 0)
        {
            this.SaveButton.disabled = true;

        }

        await this.LoadProjectsAndVendorsAndDocuments();
        this.LoadLookups();

        if (this.data.quote.quoteID !== 0) {

            $("#detail-view-btn").removeClass("tooltip");
            $("#detail-view-btn .tooltiptext").remove();
            $(".detail-pane > .title").removeClass("tooltip");
            $(".detail-pane > .title .tooltiptext").remove();
            $(".add-addendum-tooltip").removeClass("tooltip");
            $(".add-addendum-tooltip .tooltiptext").remove();
            $(".add-alternate-tooltip").removeClass("tooltip");
            $(".add-alternate-tooltip .tooltiptext").remove();
            $(".add-document-tooltip").removeClass("tooltip");
            $(".add-document-tooltip .tooltiptext").remove();
        }
        this.BindData();
        this.LoadBidders();
        this.LoadDetails();

        this.LoadAddBid();

        this.LoadAddAddendumKendoWindow();
        
        this.LoadAddAlternativeKendoWindow();

        this.GetEmails();
        this.BuildNotes();

       
        $(".expand-all-btn").click((e) => {
            this.detailsExpandAll();
        });

        $(".collapse-all-btn").click((e) => {
            this.detailsCollapseAll();
        });

        this.DocInsertHandler()

        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
        }

        $("input").change(() => {
            this.IsDirty = true;
            console.log('input change');

            console.log($("#bid-issued").data("kendoDatePicker").value());
            console.log($("#pre-bid").data("kendoDatePicker").value());
            console.log($("#due-date").data("kendoDatePicker").value());
            if ($("#pre-bid").data("kendoDatePicker").value() < $("#bid-issued").data("kendoDatePicker").value() ) {
                $("#pre-bid").data("kendoDatePicker").value( $("#bid-issued").data("kendoDatePicker").value() );
            }

            if ($("#due-date").data("kendoDatePicker").value() < $("#pre-bid").data("kendoDatePicker").value()) {
                $("#due-date").data("kendoDatePicker").value( $("#pre-bid").data("kendoDatePicker").value() );
            }

            if ($("#project").data("kendoComboBox").value() != ''
                && $("#type-quote").data("kendoComboBox").value() != ''
                && $("#type-work").data("kendoComboBox").value() != ''
                && $("#work-index").data("kendoComboBox").value() != ''
                && $("#status").data("kendoComboBox").value() != '') {
                this.SaveButton.disabled = false;
            }
            else {
                this.SaveButton.disabled = true;
            }
        })

        
    }

    private async GetCurrentUser(): Promise<void> {

        let userData = await axios.get("api/budget/GetCurrentUser")
        this.user = userData.data;
        console.log(this.user)
    }
    

    private LoadAddAddendumKendoWindow(): void {

        
        let adKendoWindow = $("#addendum-add-window").kendoWindow({
            title: "Add Addendum",
            resizable: true,
            modal: true,
            width: '700px'
        });

        adKendoWindow.find(".doc-add-btn").click(async (e) => {
            if ($("#ad-id").val() == 0) {

                let ad = {} as any

                ad.title = adKendoWindow.find("#ad-title").val()
                ad.description = adKendoWindow.find("#ad-description").val()
                ad.quoteID = this.data.quote.quoteID;

                const adInsert = await axios.post("api/quote/InsertQuoteAddendum", ad);
                console.log('addendum added before adding documents', adInsert)
                this.ReloadAddendums();
                if (adInsert.data) {
                    this.docUpload.ShowForQuote(adInsert.data.addendumID, "QuoteAddendum", this.data.quote.projectID, this.data.quote.quoteID, this.data.quote.entCode);
                    $("#ad-id").val(adInsert.data.addendumID)
                }
            }
            else {
                this.docUpload.ShowForQuote($("#ad-id").val(), "QuoteAddendum", this.data.quote.projectID, this.data.quote.quoteID, this.data.quote.entCode);
            }
            

        })
        adKendoWindow
            .find(".save-button")
            .click(() => {
                console.log('addendum add');
                adKendoWindow.data("kendoWindow").close();

                let ad = {} as any
                ad.addendumID = adKendoWindow.find("#ad-id").val()
                ad.title = adKendoWindow.find("#ad-title").val()
                ad.description = adKendoWindow.find("#ad-description").val()
                ad.quoteID = this.data.quote.quoteID;
                console.log('addendum add', ad)

                if (ad.addendumID == 0) {

                    const adInsert = axios.post("api/quote/InsertQuoteAddendum", ad).then(async () => {
                        console.log('add new addendum ', adInsert)
                        await this.ReloadAddendums();

                        this.DrawDetails(this.data.bids)
                        let content = "";

                        this.data.addendums.forEach((add, dindex) => {
                            content += `<div style="display:flex; padding-top: 5px; padding-left: 5px;" addid="${add.addendumID}" addackid="0">
                            <div style="flex: 1">
                                ${dindex + 1}. <span>Add-${dindex + 1}</span> 
                            </div>
                            <div style="flex: 1">
                                <select class="add-select" >
                                    <option value="true">Yes</option>
                                    <option value="false" selected>No</option>
                                </select>
                            </div>
                        </div>`
                        })
                        console.log('content', content)
                        $(".new-detail .detail-addendum").html(content);
                        console.log('new_detail add addendum');
                    });
                }
                else {
                    const adUpdate = axios.put("api/quote/UpdateQuoteAddendum", ad).then(async () => {
                        console.log('update existing addendum ', adUpdate)
                        await this.ReloadAddendums()
                        this.DrawDetails(this.data.bids)
                        let content = "";

                        this.data.addendums.forEach((add, dindex) => {
                            content += `<div style="display:flex; padding-top: 5px; padding-left: 5px;" addid="${add.addendumID}" addackid="0">
                            <div style="flex: 1">
                                ${dindex + 1}. <span>Add-${dindex + 1}</span> 
                            </div>
                            <div style="flex: 1">
                                <select class="add-select" >
                                    <option value="true">Yes</option>
                                    <option value="false" selected>No</option>
                                </select>
                            </div>
                        </div>`
                        })
                        console.log('content', content)
                        $(".new-detail .detail-addendum").html(content);
                        console.log('new_detail add addendum');
                    });
                }
                
            })
            .end();

        adKendoWindow
            .find(".cancel-button")
            .click(() => { adKendoWindow.data("kendoWindow").close(); })
            .end();

        let addendumAddButton = document.querySelector("#addendum-add-btn") as HTMLLinkElement;
        if (this.data.quote.quoteID == 0) {
            $(".new-detail .detail-save").prop('disabled', true);
            addendumAddButton.disabled = true;
        }
            
        addendumAddButton.addEventListener("click", () => {
            $("#ad-id").val(0)
            $("#ad-title").val("")
            $("#ad-description").val("")
            $("#ad-documents").html("")
            $("#addendum-add-window").data("kendoWindow")
                .center().open();
            $('#addendum-add-window_wnd_title').html('Add Addendum');
        });


    }


    

    private DocInsertHandler(): void {
        // Listen for the event.
        window.addEventListener('quotedocinsert', async (e: CustomEvent) => {
            console.log("quotedocinsert", e)
            let detail = e.detail;
            if (detail.type == "QuoteBid") {
                
                let documents = await axios.get("api/quote/getQuoteDocs?quoteid=" + this.data.quote.quoteID);
                this.data.documents = documents.data;
                /*this.data.documents.push({
                    docType: detail.type,
                    linkID: detail.itemid,
                    docID: detail.docID,
                })*/
                this.DrawDetails(this.data.bids)
                if ($("#new-bid-id").val() != 0) {
                    var content = "";
                    let doc_index = 1
                    this.data.documents.map((item) => {
                        if (item.docType == "QuoteBid" && item.linkID == $("#new-bid-id").val()) {
                            content += `<div class="doc-link" docid="${item.docID}"> ${doc_index} . ${item.name} </div>`
                            doc_index++
                        }

                    })
                    $(".new-detail .detail-documents").html(content)

                    $(".new-detail .doc-link").click(async (e) => {

                        let docID = $(e.target).attr('docid')
                        document.body.classList.toggle("wait");
                        this.getDocUrl(docID);

                    })

                }
            }
            if (detail.type == "QuoteAddendum") {
                
                //const documents = await axios.get("api/quote/getQuoteDocs?quoteid=" + this.data.quote.quoteID);
                //this.data.documents = documents.data;
                let documents = await axios.get("api/quote/getQuoteDocs?quoteid=" + this.data.quote.quoteID);
                this.data.documents = documents.data;

                let ad = this.data.addendums[this.data.addendums.length - 1];

                let doc = this.data.documents.find(item => {
                    return item.docID == detail.docID
                });
                
                console.log(doc)

                let docs_content = ""
                let doc_index = 1
                this.data.documents.map((item) => {
                    if (item.docType == "QuoteAddendum" && item.linkID == ad.addendumID) {
                        docs_content += `<div class="doc-link" docid="${item.docID}"> ${doc_index} . ${item.name} </div>`
                        doc_index++
                    }
                })
                //            console.log(docs_content)
                $("#ad-documents").html(docs_content)

                //$("#ad-documents").append(`<div class=""> ${doc.name} </div>`)
//                this.ReloadAddendums()
            }
            
            
        });
    }

    private LoadAddAlternativeKendoWindow(): void {
        $("#alt-amount").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false
        });

        let altKendoWindow = $("#alternative-add-window").kendoWindow({
            title: "Add Alternate",
            resizable: true,
            modal: true,
            width: '700px'
        });
        altKendoWindow
            .find(".save-button")
            .click( async () => {
                
                altKendoWindow.data("kendoWindow").close();

                let alt = {} as any

                alt.title = altKendoWindow.find("#alt-title").val()
                alt.amount = altKendoWindow.find("#alt-amount").val()
                alt.bidID = altKendoWindow.find("#alt-bid").val()
                alt.bidAltID = altKendoWindow.find("#alt-id").val()
                alt.selected = false

                console.log('alt save', alt)

                if (alt.bidAltID == 0) {
                    const altInsert = await axios.post("api/quote/InsertQuoteBidAlt", alt)
                    console.log('altInsert', altInsert)
                    
                }
                else {
                    const altUpdate = await axios.put("api/quote/UpdateQuoteBidAlt", alt)
                    console.log('altUpdate', altUpdate)
                    
                }
                let bidAlts = await axios.get("api/quote/GetQuoteBidAltByBidID?id=" + alt.bidID)
                console.log(bidAlts)
                this.data.alternatives = this.data.alternatives.filter(( item ) => {
                    return item.bidID != alt.bidID
                })
                console.log('before', this.data.alternatives)
                this.data.alternatives = this.data.alternatives.concat(bidAlts.data)

                console.log('after',this.data.alternatives)
//                let bidAlts = values.filter(function (val) { return val.Rev != "NO ACCESS"; });
                this.DrawDetails(this.data.bids);


                // add alternates for new-detail
                if ($("#new-bid-id").val() != 0) {
                    let altArray = this.data.alternatives.filter((item) => {
                        return item.bidID == $("#new-bid-id").val()
                    })
                    console.log('alters for new bid', altArray);
                    let content = "";
                    altArray.forEach((alt, dindex) => {
                        if (alt.selected == true) {
                            content += `<div style="padding-top: 5px;" class="alt-link" bidaltid="${alt.bidAltID}">
                                    <input type="checkbox" checked/> ${ dindex + 1} . <span>${kendo.toString(alt.amount, "c")} |  ${alt.title} </span>
                                </div>`
                        } else {
                            content += `<div style="padding-top: 5px;" class="alt-link" bidaltid="${alt.bidAltID}">
                                    <input type="checkbox" /> ${ dindex + 1} . <span>${kendo.toString(alt.amount, "c")} | ${alt.title} </span>
                                </div>`
                        }
                    })
                    $(".new-detail .detail-alternatives").html(content);

                    $(".new-detail .alt-link span").click(async (e) => {
                        console.log('alt edit dlg open')
                        let altID = $(e.target).parent().attr('bidaltid')
                        let bidID = $(e.target).closest('.detail-row').attr('bidid')

                        let alternate = this.data.alternatives.find(alt => {
                            return alt.bidAltID == altID;
                        })

                        $("#alternative-add-window_wnd_title").html("Edit Alternate")


                        $("#alt-title").val(alternate.title)
                        $("#alt-amount").data("kendoNumericTextBox").value(alternate.amount)
                        $("#alt-id").val(altID)
                        $("#alt-bid").val(bidID)

                        $("#alternative-add-window").data("kendoWindow")
                            .center().open()


                    })
                }

            })
            .end();

        altKendoWindow
            .find(".cancel-button")
            .click(() => { altKendoWindow.data("kendoWindow").close(); })
            .end();


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

    private async LoadProjectsAndVendorsAndDocuments() {
        if (this.data.quote.quoteID == 0)
            this.data.quote.entCode = "PRO1";
        
        const projects = await axios.get("api/deposit/GetProjectsList?entcode=" + this.data.quote.entCode);
        this.projects = projects.data;

        const vendors = await axios.get("api/quote/GetVendorLookup?entcode=" + this.data.quote.entCode);
        this.vendors = vendors.data;
        console.log('vendors', this.vendors);
        const documents = await axios.get("api/quote/getQuoteDocs?quoteid=" + this.data.quote.quoteID);
        this.data.documents = documents.data;
    }


    private LoadLookups() {
        if (this.data.quote.quoteID == 0)
            this.data.quote.entCode = "PRO1";


        $("#project").kendoComboBox({
            dataTextField: "title",
            dataValueField: "projectId",
            dataSource: this.projects,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                var projectid = e.sender.value();

                const budget = await axios.get("api/quote/GetProjectBudget?entCode=" + this.data.quote.entCode + "&projid=" + projectid);
                this.data.quote.budget = budget.data;
                $("#budget").val(kendo.toString(budget.data, "c"))

                if ($("#project").data("kendoComboBox").value() != ''
                    && $("#type-quote").data("kendoComboBox").value() != ''
                    && $("#type-work").data("kendoComboBox").value() != ''
                    && $("#work-index").data("kendoComboBox").value() != ''
                    && $("#status").data("kendoComboBox").value() != '') {
                    this.SaveButton.disabled = false;
                }
                else {
                    this.SaveButton.disabled = true;
                }
            },
        });
        if (this.data.quote.projectID != 0)
            $("#project").data("kendoComboBox").value(this.data.quote.projectID);


        

        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
       
        $("#type-quote").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("TypeQuote"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        $("#type-work").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("TypeWork"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        $("#work-index").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("WorkIndex"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        $("#status").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Status"),
            filter: "contains",
            suggest: true,
            index: 0
        });

        this.data.bids.map((item, index) => {
            let vendor = this.vendors.find(v => {
                return v.vendorID == item.vendorID
            })
            item.vendorName = vendor.vendorName
            item.index = index + 1
        })
        $("#bidder").kendoComboBox({
            template: "#: index# #: data.vendorName#,  #: kendo.toString(data.bidTot, 'c')#",
            dataTextField: "bidID",
            dataValueField: "bidID",
            dataSource: this.data.bids,
            filter: "contains",
            suggest: true,
            change: async (e) => {
                var bidID = e.sender.value();

                console.log(bidID)
                let bid = this.data.bids.find(item => {
                    return item.bidID == bidID;
                })
                console.log(bid)
                if (bid != null) {
                    $("#bidder").data("kendoComboBox").value(bid.vendorName + ", " + kendo.toString(bid.bidTot, "c"));
                    this.data.quote.awardedBidderID = bidID
                    $("#award").prop('disabled', false);
                }

                
            },
        });

        if (this.data.bids.length == 0) {
            $("#bidder").data("kendoComboBox").enable(false);
        }
        
    }

    private LoadBidders() {
        kendo.culture("en-US");

        let bidders = this.data.bids;

        if (bidders === null || bidders.length === 0)
            bidders = [];
        this.data.bids = bidders;

        this.DrawBidders(bidders);
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

        const bids = this.data.bids
        
        if (bids === null || bids.length === 0)
            return;

        this.DrawDetails(bids);
        
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

        $("#date").val(Utilities.FormatDateString(this.data.quote.createdDate));

        
        $("#type-quote").data("kendoComboBox").value(this.data.quote.typeQuote);
        $("#type-work").data("kendoComboBox").value(this.data.quote.typeWork);
        $("#work-index").data("kendoComboBox").value(this.data.quote.workIndex);

        $("#bid-issued").data("kendoDatePicker").value(Utilities.FormatDateString(this.data.quote.bidIssue));
        $("#pre-bid").data("kendoDatePicker").value(Utilities.FormatDateString(this.data.quote.preBid)); 
        $("#due-date").data("kendoDatePicker").value(Utilities.FormatDateString(this.data.quote.dueDate));

        $("#description").html(this.data.quote.description);

        if (this.data.quote.awardedBidderID != 0) {
            let bid = this.data.bids.find(item => {
                return item.bidID == this.data.quote.awardedBidderID;
            })
            console.log(bid)
            if (bid != null) {
                $("#bidder").data("kendoComboBox").value(bid.vendorName + ", " + kendo.toString(bid.bidTot, "c"));
                $("#award").prop('disabled', false);
                $("#award").kendoNumericTextBox({
                    format: "c2",
                    min: 0,
                    spinners: false
                });
            }
        }
        
        $("#po").val(this.data.quote.poNo);
        $("#contract").val(this.data.quote.contractNo);
        $("#award").val(this.data.quote.awardAmount);
        
        $("#account").val(this.data.quote.acctNo);
        $("#budget").val(kendo.toString(this.data.quote.budget, "c") );


        $("#status").data("kendoComboBox").value(this.data.quote.status);

        this.data.addendums.map((ad,index) => {

            $("#addendum").append(`
                <div class="ad-link" adid=" ${ad.addendumID} "> ${index + 1} . ${ ad.title }</div>
            `)
        });

        $(".ad-link").click((e) => {
            let adID = $(e.target).attr('adid')
            let ad = this.data.addendums.find(ad => {
                return ad.addendumID == adID
            })
            console.log('addendum click', adID, ad)
            $("#ad-id").val(adID)
            $("#ad-title").val(ad.title)
            $("#ad-description").val(ad.description)

            let docs_content = ""
            let doc_index = 1
            this.data.documents.map((item) => {
                if (item.docType == "QuoteAddendum" && item.linkID == ad.addendumID) {
                    docs_content += `<div class="doc-link" docid="${item.docID}"> ${doc_index} . ${item.name} </div>`
                    doc_index++
                }
            })
//            console.log(docs_content)
            $("#ad-documents").html(docs_content)

            $("#ad-documents .doc-link").click((e) => {
                let docID = $(e.target).attr('docid')
                document.body.classList.toggle("wait");
                this.getDocUrl(docID)
            })
            
            $("#addendum-add-window").data("kendoWindow")
                .center().open();
            $('#addendum-add-window_wnd_title').html('Edit Addendum');
        })

       
        
    }

    private async Save() {

        this.SaveButton.disabled = true;
        document.body.classList.toggle("wait");
        this.SaveButton.classList.add('running');

        

        this.data.quote.projectID = parseInt($("#project").data("kendoComboBox").value());
        this.data.quote.createdDate = $("#date").val();

        
        this.data.quote.typeQuote = $("#type-quote").data("kendoComboBox").value();
        this.data.quote.typeWork = $("#type-work").data("kendoComboBox").value();
        this.data.quote.workIndex = $("#work-index").data("kendoComboBox").value();

        this.data.quote.bidIssue = $("#bid-issued").val();
        this.data.quote.preBid = $("#pre-bid").val();
        this.data.quote.dueDate = $("#due-date").val();
 
        this.data.quote.description = $("#description").val();

        this.data.quote.poNo = $("#po").val();
        this.data.quote.contractNo = $("#contract").val();
        this.data.quote.awardAmount = $("#award").val();

        this.data.quote.acctNo = $("#account").val();
        this.data.quote.budget = Utilities.Currency2Float($("#budget").val());

        
        this.data.quote.status = $("#status").data("kendoComboBox").value();

        if (this.data.quote.quoteID == 0) {
            const quoteInsert = await axios.post("api/quote/InsertQuote", this.data.quote)
            this.data.quote.quoteID = quoteInsert.data.quoteID
            this.notification.ShowNotification("Save Success!", "Quote Inserted Successfully", "success")
            this.orig = Utilities.deep(this.data)
            this.IsDirty = false;
            $(".page-header h3").html("Financial - Quote - " + this.data.quote.quoteID)
            history.pushState({
                id: 'detail'
            }, 'Quote Details - Syvenn', '/quotes/' + this.data.quote.quoteID);

            let addendumAddButton = document.querySelector("#addendum-add-btn") as HTMLLinkElement;
            addendumAddButton.disabled = false;
            $(".new-detail .detail-save").prop('disabled', false);
            $(".new-detail input.detail-bidder:nth-child(2)").data("kendoComboBox").enable(true)
            $("#detail-view-btn").removeClass("tooltip");
            $("#detail-view-btn .tooltiptext").remove();
            $(".detail-pane > .title").removeClass("tooltip");
            $(".detail-pane > .title .tooltiptext").remove();
            $(".add-addendum-tooltip").removeClass("tooltip");
            $(".add-addendum-tooltip .tooltiptext").remove();
            $(".add-alternate-tooltip").removeClass("tooltip");
            $(".add-alternate-tooltip .tooltiptext").remove();
            $(".add-document-tooltip").removeClass("tooltip");
            $(".add-document-tooltip .tooltiptext").remove();

            $("#addendum-add-window .tooltiptext").html("Add Document for Addendum for Quote " + this.data.quote.quoteID)
        }
        else {
            const quoteUpdate = await axios.put("api/quote/UpdateQuote", this.data.quote);
            console.log(quoteUpdate);
            this.notification.ShowNotification("Save Success!", "Quote Updated Successfully", "success")
            this.orig = Utilities.deep(this.data)
            this.IsDirty = false;
        }

        this.SaveButton.classList.remove('running');
        document.body.classList.toggle("wait");
//        this.SaveButton.disabled = false;


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
        if (this.data.quote.quoteID == 0)
            return;
        const emails = await axios.get("api/quote/GetAttachDocs?entcode=" + this.data.quote.entCode + "&id=" + this.data.quote.quoteID);
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

    private async ReloadAddendums() {
        
        let response = await axios.get("api/quote/GetQuoteAddendumByQuoteID?id=" + this.data.quote.quoteID)
        let ads = response.data
        this.data.addendums = ads
        $("#addendum").html("")



        

        this.data.addendums.map((ad, index) => {

            $("#addendum").append(`
                <div class="ad-link" adid=" ${ad.addendumID} "> ${index + 1} . ${ad.title}</div>
            `)
        });

        $(".ad-link").click((e) => {
            let adID = $(e.target).attr('adid')
            let ad = this.data.addendums.find(ad => {
                return ad.addendumID == adID
            })
            console.log('addendum click', adID, ad)
            $("#ad-id").val(adID)
            $("#ad-title").val(ad.title)
            $("#ad-description").val(ad.description)

            let docs_content = ""
            let doc_index = 1
            this.data.documents.map((item) => {
                if (item.docType == "QuoteAddendum" && item.linkID == ad.addendumID) {
                    docs_content += `<div class="doc-link" docid="${item.docID}"> ${doc_index} . ${item.name} </div>`
                    doc_index++
                }
            })
            //            console.log(docs_content)
            $("#ad-documents").html(docs_content)

            $("#ad-documents .doc-link").click((e) => {
                let docID = $(e.target).attr('docid')
                document.body.classList.toggle("wait");
                this.getDocUrl(docID)
            })

            $("#addendum-add-window").data("kendoWindow")
                .center().open();
            $('#addendum-add-window_wnd_title').html('Edit Addendum');
        })


    }

    private async ReloadBidders() {
        let response = await axios.get("api/quote/GetBidSumByQuoteID?id=" + this.data.quote.quoteID);
        let bidders = response.data;
        console.log('reload bidders', bidders);

        let documents = await axios.get("api/quote/getQuoteDocs?quoteid=" + this.data.quote.quoteID);
        this.data.documents = documents.data;

        if (bidders === null || bidders.length === 0) {
            bidders = [];
        }

        this.data.bids = bidders;
        
        this.DrawAll()

    }

    private async DrawAll() {
        

        kendo.culture("en-US");

        this.data.bids.map((item, index) => {
            console.log(item.vendorName)
            let vendor = this.vendors.find(v => {
                return v.vendorID == item.vendorID
            })
            item.vendorName = vendor.vendorName
            item.index = index + 1
        })

        this.DrawBidders(this.data.bids);
        this.DrawDetails(this.data.bids);

        $("#bidder").data("kendoComboBox").setDataSource(this.data.bids);

    }

    // Draw Bidders
    private DrawBidders(bidders) {
        
        $(".bids").html("");
        let high_bid = 0;
        let avg_bid = 0;
        let low_bid = 0;

        high_bid = bidders.length > 0 ? Math.max.apply(Math, bidders.map(function (o) { return o.baseBid; })) : 0;
        let arrSum = 0;
        bidders.map(item => arrSum += item.baseBid)
        avg_bid = bidders.length > 0 ? arrSum / bidders.length : 0;
        low_bid = bidders.length > 0 ? Math.min.apply(Math, bidders.map(function (o) { return o.baseBid; })) : 0;

        
        bidders.forEach((item, index) => {
            let vendor = null
            if (this.vendors != "" && this.vendors != null) {
                vendor = this.vendors.find(v => {
                    return v.vendorID == item.vendorID
                })
            }
            
            
            let bidder = vendor ? vendor.vendorName : `Bidder ${item.vendorID}`
            $(".bids").append(`
                <div class="row" bidid="${item.bidID}">
                    <div style="width: 100px;">
                        <span class="bid-link">
                            ${index + 1} . ${bidder}
                        </span>
                    </div>
                    <div class="currency" style="width:90px; padding-right: 10px;">
                        <span>${ kendo.toString(item.bidTot, "c")}</span>
                    </div>
                    <div style="width:65px; text-align:center;">
                        <span class="available">${ item.version }</span>
                    </div>
                    <div style="width:60px; text-align:center;">
                         <span class="available">${ item.bidBond ? "Yes" : 'No' }</span>
                    </div>
                    <div class="currency" style="width:80px; text-align:center;">
                        <span class="available">${ kendo.toString(item.mwdbe / 100, "p0")}</span>
                    </div>
                    <div  style="flex-grow:1; min-width:100px;">
                        <span class="new-funding">${ item.comment }</span>
                    </div>
                </div>

            `);

        });

        $("#high-bid").html(kendo.toString(high_bid, "c"));
        $("#bid-budget").html(kendo.toString(this.data.quote.budget, "c"));
        $("#avg-bid").html(kendo.toString(avg_bid, "c"));
        $("#low-bid").html(kendo.toString(low_bid, "c"));
        $("#low-bid2").html(kendo.toString(low_bid, "c"));
        $("#bal-var").html(kendo.toString(this.data.quote.budget - low_bid, "c"));

        $(".bid-link").click((e) => {
            $("#general-view-btn").parent().removeClass("active");
            $("#detail-view-btn").parent().addClass("active");
            $(".detail-pane").show().slideDown();
        });


    }

    // Draw Budget Details
    private DrawDetails(bids) {
        $(".detail-pane .details").html("");

        bids.forEach(async (bid, index) => {

//            const docs = await axios.get("api/quote/getQuoteAttDocs?type=QuoteBid&id=" + bid.bidID)
            

            let content = `<div class="detail-row row" bidid="${ bid.bidID }">
                    <div class="form-element">
                            
                            <label> Bidder #${ index + 1} <abbr title="required">*</abbr> </label>
                                <input type="text" class="detail-bidder" value="${ bid.vendorName }"/>
                            
                                <label> Bid Base Amount <abbr title="required">*</abbr> </label>
                                <input type="text" class="detail-basebid" value=" ${ bid.baseBid }"/>

                                <label> Bid Amount </label>
                                <span class="detail-bidtot">  ${ kendo.toString(bid.bidTot, 'c') } </span>

                    </div>`

            content += `<div class="form-element" style="flex: 1 1 200px;">
                        <label>Alternates: <button class="btn-1 alt-add-btn" >+</button> </label>
                        <div class="detail-alternatives" >`

            let altArray = this.data.alternatives.filter(alt => {
                return alt.bidID == bid.bidID;
            })

            altArray.forEach((alt, dindex) => {
                if (alt.selected == true) {
                    content += `<div style="padding-top: 5px;" class="alt-link" bidaltid="${alt.bidAltID}">
                                    <input type="checkbox" checked/> ${ dindex + 1} . <span>${kendo.toString(alt.amount, "c")} |  ${alt.title} </span>
                                </div>`
                } else {
                    content += `<div style="padding-top: 5px;" class="alt-link" bidaltid="${alt.bidAltID}">
                                    <input type="checkbox" /> ${ dindex + 1} . <span>${kendo.toString(alt.amount, "c")} | ${alt.title} </span>
                                </div>`
                }
            })
            //addendAck
                            
               content += `</div>
                    </div>`

            content += `<div class="form-element" style="max-width:160px;">
                        <label>Addendum:  </label>
                        <div class="detail-addendum" >`

            
            this.data.addendums.forEach((add, dindex) => {
                let addAck = this.data.addendAck.find(ack => {
                    return ack.bidID == bid.bidID && ack.addendumID == add.addendumID;
                })
                
                if (addAck && addAck.acknowledgement == true) {
                    content += `<div style="display:flex; padding-top: 5px; padding-left: 5px;" addid="${add.addendumID}" addackid="${addAck.bidAddendumID}">
                                <div style="flex: 1">
                                    ${dindex + 1}. <span>Add-${dindex + 1}</span> 
                                </div>
                                <div style="flex: 1">
                                    <select class="add-select" >
                                        <option value="true" selected>Yes</option>
                                        <option value="false" >No</option>
                                    </select>
                                </div>
                            </div>`
                }
                else if (addAck){
                    content += `<div style="display:flex; padding-top: 5px; padding-left: 5px;" addid="${add.addendumID}" addackid="${addAck.bidAddendumID}">
                                <div style="flex: 1">
                                    ${dindex + 1}. <span>Add-${dindex + 1}</span> 
                                </div>
                                <div style="flex: 1">
                                    <select class="add-select" >
                                        <option value="true">Yes</option>
                                        <option value="false" selected>No</option>
                                    </select>
                                </div>
                            </div>`
                }
                else {
                    content += `<div style="display:flex; padding-top: 5px; padding-left: 5px;" addid="${add.addendumID}" addackid="0">
                                <div style="flex: 1">
                                    ${dindex + 1}. <span>Add-${dindex + 1}</span> 
                                </div>
                                <div style="flex: 1">
                                    <select class="add-select" >
                                        <option value="true">Yes</option>
                                        <option value="false" selected>No</option>
                                    </select>
                                </div>
                            </div>`
                }
            })

            content += `</div>
                    </div>`

            content += `<div class="form-element small" style="max-width:70px; min-width:70px;">
                            <label> Bid Bond </label>`

            if (bid.bidBond) {
                content += `<select class="bond-select" style="padding-left: 18px;">
                                <option value="true" selected>Yes</option>
                                <option value="false" >No</option>
                            </select>`
            }
            else {
                content += `<select class="bond-select" style="padding-left: 18px;">
                                <option value="true" >Yes</option>
                                <option value="false" selected>No</option>
                            </select>`
            }

            content +=   `<label> M/W/DBE% </label>
                            <input type="text" class="detail-mwdbe" value="${ bid.mwdbe}"/>
                        </div>
                        <div class="form-element">
                            <label>Comment:  </label>
                            <textarea class="detail-comment">${ bid.comment}</textarea>
                        </div>
                        <div class="form-element">
                            <label class="tooltip">Documents List: <button class="btn-1 doc-add-btn " ><i class="fa fa-paperclip"></i></button> <span class="tooltiptext tooltip-top">Add Document for Quote ${ this.data.quote.quoteID } </label>`

            content += `<div class="detail-documents">`

            let doc_index = 1
            this.data.documents.map( (item) => {
                if (item.docType == "QuoteBid" && item.linkID == bid.bidID) {
                    content += `<div class="doc-link" docid="${item.docID}"> ${doc_index} . ${item.name} </div>`
                    doc_index ++
                }

            })
            content += `</div>`

            content +=      `</div>
                        <div class="form-element small" style="max-width: 50px;">
                            <label>Actions:  </label>
                            <button class="detail-save btn darkgreen" style="height: 30px; margin-bottom: 10px;">Save</button>
                            <button class="detail-delete btn darkred" style="height: 30px;">Delete</button>
                        </div>
                    </div>`

            $(".detail-pane .details").append(content)
        })

       
        $(".details .detail-bidder").kendoComboBox({
            dataTextField: "vendorName",
            dataValueField: "vendorName",
            dataSource: this.vendors,
            filter: "contains",
            suggest: true,
            index: 100,
        });


        
        
        $(".details .detail-basebid").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
            change: async (e) => {
                let row = $(e.sender.element).closest('.row');
                let bidID = row.attr('bidid')
                let bid = this.data.bids.find(item => { return item.bidID == bidID })

                bid.baseBid = e.sender.value();
                bid.bidTot = bid.baseBid
                this.data.alternatives.map(alt => {
                    if (alt.bidID == bid.bidID && alt.selected == true) {
                        bid.bidTot += alt.amount
                    }
                })

                row.find('.detail-bidtot').html(Utilities.Float2Currency(bid.bidTot))
            },
        });
        
        $(".details .detail-alternatives input:checkbox").change(async (e) => {
            let row = $(e.target).closest('.detail-row')
            let altID = $(e.target).parent().attr('bidaltid')
            let alt = this.data.alternatives.find(item => { return item.bidAltID == altID })
            let bidID = row.attr('bidid')
            let bid = this.data.bids.find(item => { return item.bidID == bidID })

            
            if ($(e.target).is(":checked") == true) {
                alt.selected = true;
                bid.bidTot += alt.amount
            }
            else {
                alt.selected = false;
                bid.bidTot -= alt.amount
            }

            row.find('.detail-bidtot').html( Utilities.Float2Currency(bid.bidTot) )
           
            // Update bidAlternatives
            const altUpdate = await axios.put("api/quote/UpdateQuoteBidAlt", alt);
            console.log('altUpdate', altUpdate)
 
        })

        $(".details .detail-addendum select").change(async (e) => {
            let addID = $(e.target).parent().parent().attr('addid')
            let ackID = $(e.target).parent().parent().attr('addackid')
            let add = this.data.addendums.find(item => { return item.addendumID == addID })
            let bidID = $(e.target).parent().parent().parent().parent().parent().attr('bidid')
            let bid = bids.find(item => { return item.bidID == bidID })

            console.log(add)
            console.log(ackID)
             // update Bid and addendumAcknowledge
            if (parseInt(ackID) == 0) {
                let ack = {} as any
                ack.acknowledgement = $(e.target).val()
                ack.bidID = bidID
                ack.addendumID = addID
                const ackInsert = await axios.post("api/quote/InsertQuoteBidAddendum", ack);
                console.log('ackInsert', ackInsert)
                if (ackInsert.data) {
                    this.data.addendAck.push(ackInsert.data)
                    $(e.target).parent().parent().attr('addackid', ackInsert.data.bidAddendumID)
                }
            }
            else {
                let ack = this.data.addendAck.find(item => { return item.bidAddendumID == ackID })
                ack.acknowledgement = $(e.target).val()
                const ackUpdate = await axios.put("api/quote/UpdateQuoteBidAddendum", ack);
                console.log('ackUpdate', ackUpdate)
            }
            
        })
 
        
        $(".details .alt-add-btn").click((e) => {
            console.log('alt add dlg open')
            let parent = $(e.target).closest('.detail-row')
            $("#alternative-add-window_wnd_title").html("Add Alternate")

            $("#alt-title").val("")
            $("#alt-amount").data("kendoNumericTextBox").value(0)
            $("#alt-id").val(0)
            $("#alt-bid").val(parent.attr('bidid'))

            $("#alternative-add-window").data("kendoWindow")
                .center().open()
        })

        $(".details .alt-link span").click(async (e) => {
            console.log('alt edit dlg open')
            let altID = $(e.target).parent().attr('bidaltid')
            let bidID = $(e.target).closest('.detail-row').attr('bidid')

            let alternate = this.data.alternatives.find(alt => {
                return alt.bidAltID == altID;
            })

            $("#alternative-add-window_wnd_title").html("Edit Alternate")

            
            $("#alt-title").val(alternate.title)
            $("#alt-amount").data("kendoNumericTextBox").value(alternate.amount)
            $("#alt-id").val(altID)
            $("#alt-bid").val(bidID)

            $("#alternative-add-window").data("kendoWindow")
                .center().open()
            

        })
        $(".details .doc-add-btn").click(async (e) => {
            let parent = $(e.target).closest('.detail-row')
            let bidID = parent.attr('bidid')
            this.docUpload.ShowForQuote(bidID, "QuoteBid", this.data.quote.projectID, this.data.quote.quoteID, this.data.quote.entCode);
        })

        $(".details .doc-link").click(async (e) => {
            
            let docID = $(e.target).attr('docid')
            document.body.classList.toggle("wait");
            this.getDocUrl(docID);
            
        })

        $(".details .detail-save").click(async (e) => {
            $(e.target).prop('disabled', true);
            let parent = $(e.target).closest('.detail-row')
            let bidID = parent.attr('bidid')

            let bid = this.data.bids.find(item => {
                return item.bidID == bidID
            })

            let vendorName = parent.find('input.detail-bidder:nth-child(2)').data("kendoComboBox").value()
            let v = this.vendors.find(item => {
                return item.vendorName == vendorName
            })
            bid.vendorID = v.vendorID
            
            bid.bidBond = parent.find('.bond-select').val()
            bid.baseBid = parent.find('input.detail-basebid:nth-child(2)').data("kendoNumericTextBox").value()

            bid.bidTot = Utilities.Currency2Float( parent.find('.detail-bidtot').html() )
           
            bid.version = "Original"

            let alts = this.data.alternatives.filter(item => { return item.bidID == bid.bidID && item.selected == true})

            if (alts.length > 0) {
                if (alts.length == 1) {
                    bid.version = alts[0].title;
                }
                else
                    bid.version = "Multiple";
            }
            
            bid.mwdbe = parent.find('.detail-mwdbe').val()
            bid.comment = parent.find('.detail-comment').val()

            console.log('bid update', bid)
            try {
                const bidUpdate = await axios.put("api/quote/UpdateQuoteBid", bid);
                console.log('bidUpdated', bidUpdate)
                this.Save();
                //this.notification.ShowNotification("Bid Save Success!", "Bid Updated Successfully", "success")
                this.DrawBidders(this.data.bids);
            }
            catch (error) {
                this.notification.ShowNotification("Bid Save Error!", error, "error")
            }

            $(e.target).prop('disabled', false);
            
        })

        $(".details .detail-delete").click(async (e) => {
            $(e.target).prop('disabled', true);
            let parent = $(e.target).closest('.detail-row')
            let bidID = parent.attr('bidid')
            console.log('delete bid', bidID)
            try {
                const bidDelete = await axios.delete("api/quote/DeleteQuoteBid?id=" + bidID);
                /* Delete item from bid Array */
                this.data.bids.map((bid, index) => {
                    if (bid.bidID == bidID) {
                        this.data.bids.splice(index, 1)
                    }
                })
                this.notification.ShowNotification("Bid Delete Success!", "Bid Deleted Successfully", "success")
                /* Redraw All */
                this.DrawAll()
            }
            catch (error) {
                this.notification.ShowNotification("Bid Delete Error!", error, "error")
            }
            $(e.target).prop('disabled', false);
        })
    }

    private LoadAddBid(): void {

        
        $(".new-detail .detail-bidder").kendoComboBox({
            dataTextField: "vendorName",
            dataValueField: "vendorName",
            dataSource: this.vendors,
            filter: "contains",
            suggest: true,
            index: 100,
            change: async (e) => {
                
                $(".new-detail input.detail-basebid:nth-child(2)").data("kendoNumericTextBox").enable(true)
            },

        });

        if (this.data.quote.quoteID == 0) {
            $(".new-detail input.detail-bidder:nth-child(2)").data("kendoComboBox").enable(false)
        }

        $(".new-detail .detail-basebid").kendoNumericTextBox({
            format: "c2",
            min: 0,
            spinners: false,
            change: async (e) => {
                $(".new-detail .bond-select").prop('disabled', false);
                $(".new-detail .detail-mwdbe").prop('disabled', false);
                $(".new-detail .detail-comment").prop('disabled', false);
                $(".new-detail .alt-add-btn").prop('disabled', false);
                $(".new-detail .doc-add-btn").prop('disabled', false);
                $('.new-detail .add-select').each((i, obj) => {
                    $(obj).prop("disabled", false)
                })
                this.SaveNewBidAndWait();
            },
        });

        $(".new-detail input.detail-basebid:nth-child(2)").data("kendoNumericTextBox").enable(false)

        let content = ''

        this.data.addendums.forEach((add, dindex) => {

            content += `<div style="display:flex; padding-top: 5px; padding-left: 5px;" addid="${add.addendumID}" addackid="0">
                            <div style="flex: 1">
                                ${dindex + 1}. <span>Add-${dindex + 1}</span> 
                            </div>
                            <div style="flex: 1">
                                <select class="add-select" disabled>
                                    <option value="true">Yes</option>
                                    <option value="false" selected>No</option>
                                </select>
                            </div>
                        </div>`

        })
        $(".new-detail .detail-addendum").html(content)

        

        $(".new-detail .detail-save").click(async (e) => {
            $(".new-detail .detail-save").prop('disabled', true);
            let parent = $('.new-detail')
            let detail = {} as any
            detail.bidID = $("#new-bid-id").val();
            let vendorName = parent.find('input.detail-bidder:nth-child(2)').data("kendoComboBox").value()
            let v = this.vendors.find(item => {
                return item.vendorName == vendorName
            })
            detail.vendorID = v.vendorID
            detail.bidBond = parent.find('.bond-select').val()
            detail.baseBid = Number(parent.find('input.detail-basebid:nth-child(2)').data("kendoNumericTextBox").value())

            detail.bidTot = detail.baseBid
            this.data.alternatives.map(alt => {
                if (alt.bidID == detail.bidID && alt.selected == true) {
                    detail.bidTot += alt.amount
                }
            })


            detail.mwdbe = Number(parent.find('.detail-mwdbe').val())
            detail.comment = parent.find('.detail-comment').val()

            detail.version = "Original"

            let alts = this.data.alternatives.filter(item => { return item.bidID == detail.bidID && item.selected == true })

            if (alts.length > 0) {
                if (alts.length == 1) {
                    detail.version = alts[0].title;
                }
                else
                    detail.version = "Multiple";
            }

            detail.quoteID = this.data.quote.quoteID

            console.log('update new bid', detail)
            try {
                $(".new-detail .detail-addendum select").each((i, obj) => {
                    let addID = $(obj).parent().parent().attr('addid')
                    let add = this.data.addendums.find(item => { return item.addendumID == addID })
                    let bidID = $("#new-bid-id").val();


                    console.log(add)

                    let ack = {} as any
                    ack.acknowledgement = $(obj).val()
                    ack.bidID = bidID
                    ack.addendumID = addID
                    if ($(obj).val() == "true" ) {
                        axios.post("api/quote/InsertQuoteBidAddendum", ack).then((resp) => {
                            console.log('ackInsert', resp)
                            if (resp.data) {
                                this.data.addendAck.push(resp.data)
                                $(e.target).parent().parent().attr('addackid', resp.data.bidAddendumID)
                            }
                        })
                    }
                })

                const bidInsert = await axios.put("api/quote/UpdateQuoteBid", detail);
                console.log('bidInserted to the list', bidInsert)

                //                bidInsert.data.version = "Original"
                this.Save();
                
                $("#bidder").data("kendoComboBox").enable(true);
                this.data.bids.push(detail)

                this.DrawAll()

                // Clear the values for the New Bid Box
                parent.find('input.detail-bidder:nth-child(2)').data("kendoComboBox").value("")
                parent.find('input.detail-basebid:nth-child(2)').data("kendoNumericTextBox").value("")
                parent.find('input.detail-basebid:nth-child(2)').data("kendoNumericTextBox").enable(false)
                parent.find('.detail-mwdbe').val("")
                parent.find('.detail-mwdbe').prop("disabled", true)
                parent.find('.bond-select').prop("disabled", true)
                parent.find('.detail-comment').val("")
                parent.find('.detail-comment').prop("disabled", true)
                parent.find('.detail-alternatives').html("")
                
                parent.find('.detail-documents').html("")
                
                parent.find('.alt-add-btn').prop('disabled', true)
                parent.find('.doc-add-btn').prop('disabled', true)

                parent.find('.add-select').each((i, obj) => {
                    $(obj).prop("disabled", true)
                })
                $(".new-detail .detail-addendum select").each((i, obj) => {
                    $(obj).val("false");
                    
                })
                $("#new-bid-id").val("0")
                //this.notification.ShowNotification("Bid Save Success!", "Bid Inserted Successfully", "success")
            }
            catch (error) {
                this.notification.ShowNotification("Insert Error!", error, "error")
            }

            $(".new-detail .detail-save").prop('disabled', false);
        })

        
        $(".new-detail .alt-add-btn").click((e) => {
            console.log('alt add dlg open')
            let parent = $(e.target).closest('.detail-row')
            $("#alternative-add-window_wnd_title").html("Add Alternate")

            $("#alt-title").val("")
            $("#alt-amount").data("kendoNumericTextBox").value(0)
            $("#alt-id").val(0)
            $("#alt-bid").val($("#new-bid-id").val())

            $("#alternative-add-window").data("kendoWindow")
                .center().open()
        })

        
        $(".new-detail .doc-add-btn").click(async (e) => {
            let parent = $(e.target).closest('.detail-row')
            let bidID = $("#new-bid-id").val(); 
            this.docUpload.ShowForQuote(bidID, "QuoteBid", this.data.quote.projectID, this.data.quote.quoteID, this.data.quote.entCode);
        })

        
        
    }

    private async SaveNewBidAndWait(): Promise<void> {

        let parent = $('.new-detail')
        let detail = {} as any
        detail.bidID = 0
        let vendorName = parent.find('input.detail-bidder:nth-child(2)').data("kendoComboBox").value()
        let v = this.vendors.find(item => {
            return item.vendorName == vendorName
        })
        detail.vendorID = v.vendorID
        detail.bidBond = parent.find('.bond-select').val()
        detail.baseBid = Number(parent.find('input.detail-basebid:nth-child(2)').data("kendoNumericTextBox").value())

        detail.bidTot = detail.baseBid

        detail.mwdbe = Number(parent.find('.detail-mwdbe').val())
        detail.comment = parent.find('.detail-comment').val()

        detail.version = "Original"

        detail.quoteID = this.data.quote.quoteID

        console.log('insert bid and wait ', detail)

        try {
            const bidInsert = await axios.post("api/quote/InsertQuoteBid", detail);
            console.log('bidInsert', bidInsert)
            $("#new-bid-id").val(bidInsert.data.bidID);

        }
        catch (error) {

        }

    }
}