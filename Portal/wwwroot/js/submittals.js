import axiosES6 from "../lib/axios/axios.esm.min.js";
const axios = axiosES6;
import { Tabs } from "./components/tabs.js";
import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
export class SubmittalsList {
    constructor(data) {
        this.SubGridSelectionChanged = (arg) => {
            let selectedItem = arg.sender.dataItem(arg.sender.select());
            console.log("Submittal List", arg.sender.select());
            window.location.href = selectedItem.submittalID;
        };
        this.data = data;
        this.init();
    }
    init() {
        this.setupGrids();
        this.NewVendorButton = document.querySelector("#new-submittal-button");
        this.NewVendorButton.addEventListener("click", () => {
            window.location.href = "new";
        });
        // this.testInsertSubmittal();
    }
    testInsertSubmittal() {
        let sub = {};
        sub.projectID = 1001;
        sub.fromName = "L. Edwards";
        sub.description = "Description";
        sub.recToName = "V Jordon";
        sub.recToCompany = "ProSys Inc";
        sub.recSummary = "Recommendation Summary";
        sub.status = "Pending";
        sub.category = "TBD";
        sub.publishedDate = new Date();
        sub.dueDate = new Date();
        sub.reviewedDate = new Date();
        sub.reviewedDateSent = new Date();
        sub.classification = "TBD";
        sub.specification = "TBD";
        sub.revName = "T Wilson";
        sub.revCompany = "Syvenn";
        sub.entCode = "PRO1";
        console.log("testInsertSubmittal", sub);
        const newSub = axios.post("api/submittal/insertSubmittal", sub);
    }
    setupGrids() {
        const tableHeight = 660;
        console.log("Submittal Grid", this.data);
        $("#sub-grid").kendoGrid({
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
                        id: "submittalID"
                    }
                },
                sort: { field: "submittalID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.SubGridSelectionChanged,
            columns: [
                { field: "submittalID", title: "ID", width: '10%' },
                { field: "fromName", title: "From", width: '20%' },
                { field: "category", title: "Category" },
                { field: "summary", title: "Summary", width: '20%' },
                { field: "status", title: "Status", width: '20%' }
            ],
        });
        Utilities.MoveKendoToolbar("#sub-grid");
    }
}
export class SubmittalDetailsItem {
    constructor(data) {
        this.data = data;
        this.init();
    }
    init() {
        this.docUpload = new DocUploadModal();
        console.log("Sub Init", this.data);
        this.GetCurrentUser();
        this.setupProjectItems();
        this.SaveButton = document.querySelector("#save-button");
        this.SaveButton.addEventListener("click", async (evt) => {
            this.Save();
        });
        this.CancelButton = document.querySelector("#cancel-button");
        this.CancelButton.addEventListener("click", () => {
            location.reload();
        });
        this.UploadDocButton = document.querySelector(".doc-button");
        this.UploadDocButton.addEventListener("click", () => {
            this.docUpload.Show(this.data.sub.projectID, this.data.sub.entCode, "Submittal", this.data.sub.submittalID);
        });
        this.DistributonExpandButton = document.querySelector(".dist-expand-btn");
        this.DistributonExpandButton.addEventListener("click", () => {
            this.ExpandDistributionBox();
        });
        this.DistributonReduceButton = document.querySelector(".dist-reduce-btn");
        this.DistributonReduceButton.addEventListener("click", () => {
            this.ReduceDistributionBox();
        });
        const tabs = document.querySelector(".container--tabs");
        const tab1 = new Tabs(tabs);
        tab1.onTabSelected(event => {
        });
        const addNoteButton = document.querySelector("#add-note-button");
        addNoteButton.addEventListener("click", async (evt) => {
            addNoteButton.disabled = true;
            evt.preventDefault();
            let noteText = $('#new-note').val();
            let note = {};
            note.ProjectID = this.data.sub.projectID;
            note.writer = this.user.userName;
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = this.data.sub.submittalID;
            note.itemType = "Submittal";
            let noteDiv = this.CreateNote(note);
            let prevNotes = document.querySelector(".previous-notes");
            prevNotes.insertBefore(noteDiv, prevNotes.childNodes[0]);
            $('#new-note').val("");
            const noteUpdate = await axios.post("api/note/addNote", note);
            addNoteButton.disabled = false;
        });
        $("#submittal-published").kendoDatePicker();
        $("#date-due").kendoDatePicker();
        $("#log-date-sent").kendoDatePicker();
        $("#log-date-received").kendoDatePicker();
        $("#reviewed-date").kendoDatePicker();
        $("#reviewed-date-sent").kendoDatePicker();
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
        this.LoadLookups();
        this.BindData();
        this.BuildDistributionLogsGrid();
        this.BuildAttachments();
        this.GetEmails();
        this.BuildNotes();
    }
    async GetCurrentUser() {
        let userData = await axios.get("api/budget/GetCurrentUser");
        this.user = userData.data;
        console.log(this.user);
    }
    setupProjectItems() {
        let projectItems = document.querySelector(".project-components");
        let typesLinks = projectItems.querySelectorAll("a");
        typesLinks.forEach((item, key) => {
            item.classList.remove("open");
            item.addEventListener("click", (evt) => {
                evt.preventDefault();
                this.hideShowTable(item);
            });
        });
    }
    hideShowTable(a, force = false) {
        let typeName = a.getAttribute("href");
        if (a.classList.contains("open")) {
            a.classList.remove("open");
        }
        else { //open and show 
            a.classList.add("open");
        }
    }
    LoadLookups() {
        if (this.data.sub.submittalID == 0)
            this.data.sub.entCode = "PRO1";
        const contacts = axios.get("api/submittal/GetContactsList?entcode=" + this.data.sub.entCode);
        contacts.then((data) => {
            console.log("contacts", data);
            this.contacts = data.data;
            $("#from-name").kendoComboBox({
                dataTextField: "username",
                dataValueField: "contactID",
                template: '<span><p>#: username # (#: company #)</p></span>',
                dataSource: data.data,
                filter: "contains",
                suggest: true,
                index: 0,
                change: (e) => {
                    let selected = data.data.find((item) => {
                        return item.contactID == e.sender.value();
                    });
                    $("#from-company").val(selected.company);
                },
            });
            $("#from-name").data("kendoComboBox").value(this.data.sub.fromName);
            $("#rec-to-name").kendoComboBox({
                dataTextField: "username",
                dataValueField: "contactID",
                template: '<span><p>#: username # (#: company #)</p></span>',
                dataSource: data.data,
                filter: "contains",
                suggest: true,
                index: 0,
                change: (e) => {
                    let selected = data.data.find((item) => {
                        return item.contactID == e.sender.value();
                    });
                    $("#rec-to-company").val(selected.company);
                },
            });
            $("#rec-to-name").data("kendoComboBox").value(this.data.sub.recToName);
            $("#rev-name").kendoComboBox({
                dataTextField: "username",
                dataValueField: "contactID",
                template: '<span><p>#: username # (#: company #)</p></span>',
                dataSource: data.data,
                filter: "contains",
                suggest: true,
                index: 0,
                change: (e) => {
                    let selected = data.data.find((item) => {
                        return item.contactID == e.sender.value();
                    });
                    $("#rev-company").val(selected.company);
                },
            });
            $("#rev-name").data("kendoComboBox").value(this.data.sub.revName);
        });
        const projects = axios.get("api/submittal/GetProjectsList?entcode=" + this.data.sub.entCode);
        projects.then((data) => {
            console.log("projects", data);
            this.projects = data.data;
            $("#project").kendoComboBox({
                dataTextField: "title",
                dataValueField: "projectId",
                dataSource: data.data,
                filter: "contains",
                suggest: true,
                index: 100
            });
            if (this.data.sub.projectID != 0)
                $("#project").data("kendoComboBox").value(this.data.sub.projectID);
        });
        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
        $("#category").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Category"),
            filter: "contains",
            suggest: true,
            index: 3
        });
        $("#classification").kendoComboBox({
            dataTextField: "value",
            dataValueField: "value",
            dataSource: grouped.get("Classification"),
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
    groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            }
            else {
                collection.push(item);
            }
        });
        return map;
    }
    BindData() {
        //        $("#project").val(this.data.projectTitle);
        $("#classification").data("kendoComboBox").value(this.data.sub.classification);
        $("#category").data("kendoComboBox").value(this.data.sub.category);
        $("#submittal-published").val(Utilities.FormatDateString(this.data.sub.publishedDate));
        $("#date-due").val(Utilities.FormatDateString(this.data.sub.dueDate));
        $("#specification").val(this.data.sub.specification);
        //        $("#from-name").val(this.data.sub.fromName);
        $("#from-company").val(this.data.sub.fromCompany);
        $("#summary-description").val(this.data.sub.summary);
        $("#sender-submittal").val(this.data.sub.submittalNo);
        $("#description").val(this.data.sub.description);
        $("#attachments").val(this.data.sub.attachments);
        $("#status").data("kendoComboBox").value(this.data.sub.status);
        // Recommendation Part
        //        $("#rec-to-name").val(this.data.sub.recToName);
        $("#rec-to-company").val(this.data.sub.recToCompany);
        //        $("#rev-name").val(this.data.sub.revName);
        $("#rev-company").val(this.data.sub.revCompany);
        $("#reviewed-date").val(Utilities.FormatDateString(this.data.sub.reviewedDate));
        $("#reviewed-date-sent").val(Utilities.FormatDateString(this.data.sub.reviewedDateSent));
        $("#rec-summary").val(this.data.sub.recSummary);
        $("#reviewer-submittal-no").val(this.data.sub.reviewerSubmittalNo);
        $("#rec-detail").val(this.data.sub.recDetail);
    }
    async Save() {
        this.SaveButton.disabled = true;
        document.body.classList.toggle("wait");
        let submittal = {};
        submittal.submittalID = this.data.sub.submittalID;
        submittal.projectID = $("#project").data("kendoComboBox").value();
        submittal.classification = $("#classification").data("kendoComboBox").value();
        submittal.category = $("#category").data("kendoComboBox").value();
        submittal.publishedDate = $("#submittal-published").val();
        submittal.dueDate = $("#date-due").val();
        submittal.specification = $("#specification").val();
        submittal.fromName = $("#from-name").data("kendoComboBox").text();
        submittal.fromCompany = $("#from-company").val();
        submittal.summary = $("#summary-description").val();
        submittal.submittalNo = $("#sender-submittal").val();
        submittal.description = $("#description").val();
        submittal.entCode = this.data.sub.entCode;
        submittal.attachments = $("#attachments").val();
        submittal.status = $("#status").data("kendoComboBox").value();
        // Recommendation Part
        submittal.summary = $("#summary-description").val();
        submittal.submittalNo = $("#sender-submittal").val();
        submittal.description = $("#description").val();
        submittal.recToName = $("#rec-to-name").data("kendoComboBox").text();
        submittal.recToCompany = $("#rec-to-company").val(); //(this.data.sub.recToCompany);
        submittal.revName = $("#rev-name").data("kendoComboBox").text();
        submittal.revCompany = $("#rev-company").val(); ///(this.data.sub.revCompany);
        submittal.reviewedDate = $("#reviewed-date").val(); //Utilities.FormatDateString(this.data.sub.reviewedDate));
        submittal.reviewedDateSent = $("#reviewed-date-sent").val(); //(Utilities.FormatDateString(this.data.sub.reviewedDateSent));
        submittal.recSummary = $("#rec-summary").val(); //(this.data.sub.recSummary);
        submittal.reviewerSubmittalNo = $("#reviewer-submittal-no").val(); //(this.data.sub.reviewerSubmittalNo);
        submittal.recDetail = $("#rec-detail").val(); //(this.data.sub.recDetail);
        if (this.data.sub.submittalID == 0) {
            const submittalInsert = await axios.post("api/submittal/InsertSubmittal", submittal);
            console.log(submittalInsert);
            window.location.href = "/submittals/" + submittalInsert.data.submittalID;
        }
        else {
            /*var data = new FormData();
            data.append("Submittal", submittal);
            const config = {
                headers: { 'content-type': 'multipart/form-data' }
            }
            const submittalUpdate = await axios.put("api/submittal/UpdateSubmittal", submittal, config);
            */
            console.log("submittalUpdate", submittal);
            const submittalUpdate = await axios.put("api/submittal/UpdateSubmittal", submittal);
            console.log(submittalUpdate);
        }
        document.body.classList.toggle("wait");
        this.SaveButton.disabled = false;
    }
    BuildNotes() {
        const notes = document.querySelector(".previous-notes");
        notes.innerHTML = "";
        this.data.notes.forEach((item, key) => {
            let note = this.CreateNote(item);
            notes.appendChild(note);
        });
    }
    CreateNote(note) {
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
    async GetEmails() {
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        const emails = await axios.get("api/submittal/GetAttachDocs?entcode=" + this.data.sub.entCode + "&id=" + this.data.sub.submittalID); //, config);
        console.log('emails', emails);
        this.MakeCarousel(emails.data);
        this.LoadEmailsGrid(emails.data);
    }
    MakeCarousel(data) {
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
            /*
            <li data-target="#myCarousel" data-slide-to="4">
                <b class="prem">|</b><div class="pagination_count">5 of ##</div>
            </li>
            */
            let indicatorLi = document.createElement("li");
            indicatorLi.setAttribute('data-target', '#myCarousel');
            indicatorLi.setAttribute('data-slide-to', index.toString());
            if (i == 0)
                indicatorLi.className = "active";
            let itemB = document.createElement("b");
            itemB.className = "prem";
            itemB.innerText = '|';
            let paginationDiv = document.createElement("div");
            paginationDiv.className = "pagination_count";
            paginationDiv.innerText = (index + 1).toString() + " of ##";
            //            indicatorLi.appendChild(itemB);
            //indicatorLi.appendChild(paginationDiv);
            indicatorContainer.append(indicatorLi);
            index++;
        }
        $('#myCarousel').bind('slide.bs.carousel', function (e) { });
    }
    LoadEmailsGrid(data) {
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
            var dataItem = grid.dataItem(cell.closest("tr"));
            console.log('click', dataItem);
            this.getDocUrl(dataItem.docID);
        });
    }
    async getDocUrl(docId) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        console.log('docUrl', docUrl.data);
        window.open(docUrl.data);
        document.body.classList.toggle("wait");
    }
    CreateCard(item) {
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
            });
        }
        footerDiv.appendChild(attachSpan);
        itemDiv.appendChild(headerDiv);
        itemDiv.appendChild(contentDiv);
        itemDiv.appendChild(footerDiv);
        // add click event listener
        itemDiv.onclick = async function () {
            console.log('card type', item.type);
            document.body.classList.toggle("wait");
            if (item.type == 'Email') {
                let message = await axios.get("api/Message/getMessageByID?messid=" + item.itemNo);
                let closeButton = document.createElement("button");
                closeButton.className = "btn gray";
                closeButton.setAttribute("style", "float:right;");
                closeButton.innerText = "Close";
                closeButton.onclick = function () {
                    $("#emailBox").hide();
                };
                let headerDiv = document.createElement("div");
                headerDiv.className = "email-header";
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
                $("#emailBox .top-area").html("");
                $("#emailBox .top-area").append(closeButton);
                $("#emailBox .top-area").append(headerDiv);
                $("#emailBox").show();
            }
            else {
                // this.getDocUrl(item.docID);
                // let win = window.open("", '_blank');
                let docUrl = await axios.get("api/document/GetFile?id=" + item.docID);
                let closeButton = document.createElement("button");
                closeButton.className = "btn teal";
                closeButton.setAttribute("style", "float:right;");
                closeButton.innerText = "Close";
                closeButton.onclick = function () {
                    $("#emailBox").hide();
                };
                let expandButton = document.createElement("button");
                expandButton.className = "btn teal";
                expandButton.setAttribute("style", "float:right; margin-right: 10px;");
                expandButton.innerText = "Expand";
                expandButton.onclick = function () {
                    window.open(docUrl.data);
                };
                let headerDiv = document.createElement("div");
                headerDiv.className = "email-header";
                $("#emailBody").html(`<embed src="${docUrl.data}" width="100%" height="300px"/>`);
                $("#emailBox .top-area").html("");
                $("#emailBox .top-area").append(closeButton);
                $("#emailBox .top-area").append(expandButton);
                $("#emailBox .top-area").append(headerDiv);
                $("#emailBox").show();
            }
            document.body.classList.toggle("wait");
        };
        columnDiv.appendChild(itemDiv);
        return columnDiv;
    }
    BuildDistributionLogsGrid() {
        $("#logs-grid").kendoGrid({
            dataSource: {
                data: this.data.distrLogs,
                schema: {
                    model: {
                        id: "distributionLogID",
                        fields: {
                            activity: { type: "string", editable: false },
                            fromName: { type: "string", editable: false },
                            fromCompany: { type: "string", editable: false },
                            dateSent: { type: "date", editable: false },
                            toName: { type: "string", editable: false },
                            toCompany: { type: "string", editable: false },
                            dateReceived: { type: "date", editable: false },
                        }
                    }
                },
                sort: { field: "distributionLogID", dir: "desc" }
            },
            dataBound: function (e) {
                let items = this._data;
                let tableRows = $(this.table).find("tr");
                tableRows.each(function (index) {
                    let row = $(this);
                    let Item = items[index];
                    if (Item.name !== "Jane Doe") {
                        row.addClass("green");
                    }
                    else {
                        row.addClass("red");
                    }
                });
            },
            height: 135,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: false,
            persistSelection: true,
            columns: [
                { field: "activity", title: "Activity" },
                { field: "fromName", title: "From Name", hidden: true, },
                { field: "fromCompany", title: "From Company", hidden: true, },
                { field: "dateSent", title: "Date Sent", template: "#= kendo.toString(kendo.parseDate(dateSent, 'yyyy-MM-dd'), 'MM/dd/yyyy') #", editor: dateEditor },
                { field: "toName", title: "To Name", },
                { field: "toCompany", title: "To Company", hidden: true, },
                { field: "dateReceived", title: "Date Received", hidden: true, template: "#= kendo.toString(kendo.parseDate(dateReceived, 'yyyy-MM-dd'), 'MM/dd/yyyy') #", editor: dateEditor },
                {
                    command: [{
                            name: "destroy",
                            text: ""
                        }],
                    width: "60px",
                    hidden: true,
                },
            ],
            editable: true
        }).on("click", "tbody td", (e) => {
            // let cell = $(e.currentTarget);
            // let grid = $("#logs-grid").data("kendoGrid");
            // document.body.classList.toggle("wait");
            // let dataItem = grid.dataItem(cell.closest("tr"));
            //this.getDocUrl(dataItem.docID);
        });
        function dateEditor(container, options) {
            $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                .appendTo(container)
                .kendoDatePicker({});
        }
        let grid = $("#logs-grid").data("kendoGrid");
        grid.bind("remove", grid_remove);
        function grid_remove(e) {
            const distrUpdate = axios.delete("api/submittal/DeleteDistrLog?id=" + e.model.id); // { data: { id: e.model.id } });
        }
        let distAddButton = document.querySelector("#distribution-add-button");
        distAddButton.addEventListener("click", (evt) => {
            let kendoWindow = $("#window").kendoWindow({
                title: "Add Distribution Log",
                resizable: true,
                modal: true,
                width: '700px'
            });
            kendoWindow
                .find("#add-from-name").kendoComboBox({
                dataTextField: "username",
                dataValueField: "contactID",
                template: '<span><p>#: username # (#: company #)</p></span>',
                dataSource: this.contacts,
                filter: "contains",
                suggest: true,
                change: (e) => {
                    let selected = this.contacts.find((item) => {
                        return item.contactID == e.sender.value();
                    });
                    $("#add-from-company").val(selected.company);
                },
            });
            kendoWindow
                .find("#add-to-name").kendoComboBox({
                dataTextField: "username",
                dataValueField: "contactID",
                template: '<span><p>#: username # (#: company #)</p></span>',
                dataSource: this.contacts,
                filter: "contains",
                suggest: true,
                change: (e) => {
                    let selected = this.contacts.find((item) => {
                        return item.contactID == e.sender.value();
                    });
                    $("#add-to-company").val(selected.company);
                },
            });
            kendoWindow.find("#add-date-sent").kendoDatePicker();
            kendoWindow.find("#add-date-received").kendoDatePicker();
            $("#window").data("kendoWindow")
                .center().open();
            kendoWindow
                .find("#log-save-button")
                .click(() => {
                const dateSent = kendoWindow.find("#add-date-sent").data("kendoDatePicker").value();
                const dateReceived = kendoWindow.find("#add-date-received").data("kendoDatePicker").value();
                grid.dataSource.add({
                    activity: kendoWindow.find("#add-activity").val(),
                    fromName: kendoWindow.find("#add-from-name").data("kendoComboBox").text(),
                    fromCompany: kendoWindow.find("#add-from-company").val(),
                    dateSent: dateSent,
                    toName: kendoWindow.find("#add-to-name").data("kendoComboBox").text(),
                    toCompany: kendoWindow.find("#add-to-company").val(),
                    dateReceived: dateReceived
                });
                kendoWindow.data("kendoWindow").close();
                let distrlog = {};
                distrlog.activity = kendoWindow.find("#add-activity").val();
                distrlog.fromName = kendoWindow.find("#add-from-name").data("kendoComboBox").text();
                distrlog.fromCompany = kendoWindow.find("#add-from-company").val();
                distrlog.dateSent = dateSent;
                distrlog.toName = kendoWindow.find("#add-to-name").data("kendoComboBox").text();
                distrlog.toCompany = kendoWindow.find("#add-to-company").val();
                distrlog.dateReceived = dateReceived;
                distrlog.itemID = this.data.sub.submittalID;
                distrlog.itemType = "Submittal";
                distrlog.fromContactID = kendoWindow.find("#add-from-name").data("kendoComboBox").value();
                distrlog.toContactID = kendoWindow.find("#add-to-name").data("kendoComboBox").value();
                distrlog.messageID = 0;
                if (this.data.distrLogs.length > 0)
                    distrlog.messageID = this.data.distrLogs[0].messageID;
                const distrUpdate = axios.post("api/submittal/InsertDistrLog", distrlog);
                // reset values to initial
                kendoWindow.find("#add-activity").val("");
                kendoWindow.find("#add-from-name").data("kendoComboBox").text("");
                kendoWindow.find("#add-from-company").val("");
                kendoWindow.find("#add-date-sent").data("kendoDatePicker").value("");
                kendoWindow.find("#add-to-name").data("kendoComboBox").text("");
                kendoWindow.find("#add-to-company").val("");
                kendoWindow.find("#add-date-received").data("kendoDatePicker").value("");
            })
                .end();
            kendoWindow
                .find("#log-cancel-button")
                .click(() => {
                kendoWindow.data("kendoWindow").close();
            })
                .end();
        });
    }
    /*
         * <div>
                <span class="sunny">${item.submittalDocLinkID}</span>
                <div class="weather">
                    <h2>${item.type}</h2>
                    <p>This is the content for ${item.docID}</p>
                </div>
            </div>
          */
    BuildAttachments() {
        const attachments = this.data.attachments;
        attachments.forEach((item, idx) => {
            if (item.type == "Recommendation") {
                $("#recommend_tabstrip .tapstrip-buttons").append(`
                    <li title="${item.docID}-${item.fileName}" id="${item.docID}">${item.docID}</li>
                `);
            }
            /*$("#recommend_tabstrip").append(`
                <div>
                    <span class="sunny">${item.submittalDocLinkID}</span>
                </div>
            `);*/
        });
        $("#recommend_tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });
        attachments.forEach((item, idx) => {
            if (item.type == "Description") {
                $("#description_tabstrip .tapstrip-buttons").append(`
                    <li title="${item.docID}-${item.fileName}" id="${item.docID}">${item.docID}</li>
                `);
            }
            /*$("#description_tabstrip").append(`
                <div>
                    <span class="sunny">${item.submittalDocLinkID}</span>
                </div>
            `);*/
        });
        $("#description_tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            },
            select: function (element) { }
        });
        let obj = this;
        let onSelect = async function (e) {
            document.body.classList.toggle("wait");
            obj.getDocUrl(e.item.id);
        };
        $("#recommend_tabstrip").data("kendoTabStrip").bind("select", onSelect);
        $("#description_tabstrip").data("kendoTabStrip").bind("select", onSelect);
        let recAttachAddButton = document.querySelector("#rec-attach-add-button");
        recAttachAddButton.addEventListener("click", async (evt) => {
            this.docUpload.ShowForSubmittal(this.data.sub.submittalID, "Recommendation", this.data.sub.projectID, this.data.sub.entCode);
        });
        let descAttachAddButton = document.querySelector("#desc-attach-add-button");
        descAttachAddButton.addEventListener("click", async (evt) => {
            this.docUpload.ShowForSubmittal(this.data.sub.submittalID, "Description", this.data.sub.projectID, this.data.sub.entCode);
        });
    }
    ExpandDistributionBox() {
        let grid = $("#logs-grid").data("kendoGrid");
        grid.showColumn(1);
        grid.showColumn(2);
        grid.showColumn(5);
        grid.showColumn(6);
        grid.showColumn(7);
        $(".recommendationRow .half:first-child").hide();
        $(".distributionBox").css('flex', '2');
        $(".recommendationBox").css('flex', '1');
        $(".dist-reduce-btn").show();
        $(".dist-expand-btn").hide();
    }
    ReduceDistributionBox() {
        let grid = $("#logs-grid").data("kendoGrid");
        grid.hideColumn(1);
        grid.hideColumn(2);
        grid.hideColumn(5);
        grid.hideColumn(6);
        grid.hideColumn(7);
        $(".recommendationRow .half:first-child").show();
        $(".distributionBox").css('flex', '1');
        $(".recommendationBox").css('flex', '2');
        $(".dist-reduce-btn").hide();
        $(".dist-expand-btn").show();
    }
    BuildDistributionLogs() {
        const logContainer = document.querySelector(".distributionRow");
        const logs = this.data.distrLogs;
        for (let log of logs) {
            let itemDiv = document.createElement("div");
            itemDiv.className = "row";
            let elementDiv = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv.innerHTML = `<input type="text" name="log-activity" value="` + log.activity + `"/>`;
            itemDiv.appendChild(elementDiv);
            let elementDiv2 = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv2.innerHTML = `<input type="text" name="log-from-name" value="` + log.fromName + `"/>`;
            itemDiv.appendChild(elementDiv2);
            let elementDiv3 = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv3.innerHTML = `<input type="text" name="log-from-company" value="` + log.fromCompany + `"/>`;
            itemDiv.appendChild(elementDiv3);
            let elementDiv4 = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv4.innerHTML = `<input type="text" name="log-date-sent" value="` + log.dateSent + `"/>`;
            itemDiv.appendChild(elementDiv4);
            let elementDiv5 = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv5.innerHTML = `<input type="text" name="log-to-name" value="` + log.toName + `"/>`;
            itemDiv.appendChild(elementDiv5);
            let elementDiv6 = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv6.innerHTML = `<input type="text" name="log-to-company" value="` + log.toCompany + `"/>`;
            itemDiv.appendChild(elementDiv6);
            let elementDiv7 = document.createElement("div");
            elementDiv.className = "form-element";
            elementDiv7.innerHTML = `<input type="text" name="log-date-received" value="` + log.dateReceived + `"/>`;
            itemDiv.appendChild(elementDiv7);
            logContainer.appendChild(itemDiv);
        }
    }
}
