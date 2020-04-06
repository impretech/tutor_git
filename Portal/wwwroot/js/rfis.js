import axiosES6 from "../lib/axios/axios.esm.min.js";
const axios = axiosES6;
import { Utilities } from "./utilities.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
import { Tabs } from "./components/tabs.js";
export class RFIsList {
    constructor(data) {
        this.RFIGridSelectionChanged = (arg) => {
            let selectedItem = arg.sender.dataItem(arg.sender.select());
            window.location.href = selectedItem.rfI_ID;
            //this.LoadAlertsPanel(selectedItem.projectId as number);
        };
        this.data = data;
        this.init();
    }
    init() {
        this.setupGrids();
        this.TestDocCards();
        this.NewRFIButton = document.querySelector("#new-rfi-button");
        this.NewRFIButton.addEventListener("click", () => {
            window.location.href = "new";
        });
    }
    setupGrids() {
        const tableHeight = 660;
        console.log("RFIs", this.data);
        $("#rfi-grid").kendoGrid({
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
            dataSource: {
                data: this.data,
                schema: {
                    model: {
                        id: "rfI_ID"
                    }
                },
                sort: { field: "rfI_ID", dir: "desc" }
            },
            height: tableHeight,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            change: this.RFIGridSelectionChanged,
            columns: [
                { field: "senderRFINo", title: "Sender's RFI#", width: '10%' },
                { field: "projectTitle", title: "Project", width: '20%' },
                { field: "requestSummary", title: "Summary" },
                { field: "requester", title: "Requester", width: '20%' },
                { field: "status", title: "Status", width: '10%' },
                { field: "rfI_ID", title: "ID", width: '10%' }
            ]
        });
        Utilities.MoveKendoToolbar("#rfi-grid");
    }
    async TestDocCards() {
        let doclookup = {};
        doclookup.itemType = "RFI";
        doclookup.itemId = 1001;
        doclookup.entCode = "PRO1";
        const docCards = await axios.post("api/document/GetDocCardsByLookup", doclookup);
        console.log(docCards);
    }
}
export class RFIDetailsItem {
    constructor(data) {
        this.pom = 0;
        this.typeValue = [];
        this.pm = 'Message';
        this.documents = [];
        this.IsDirty = false;
        this.isValid1 = true;
        this.data = data;
        this.init();
        let responseAddButton = document.querySelector(".refreshButton");
        responseAddButton.addEventListener("click", async (evt) => {
            var projectId = this.data.rFI.projectID;
            var item = this.data.rFI.rfI_ID == undefined ? 'Project' : 'RFI';
            var itemNo = this.data.rFI.rfI_ID == undefined ? 0 : this.data.rFI.rfI_ID;
            this.getMessagesByItem(item, itemNo, projectId);
        });
        setInterval(() => {
            var projectId = this.data.rFI.projectID;
            var item = this.data.rFI.rfI_ID == undefined ? 'Project' : 'RFI';
            var itemNo = this.data.rFI.rfI_ID == undefined ? 0 : this.data.rFI.rfI_ID;
            this.getMessagesByItem(item, itemNo, projectId);
            console.log('triggered');
        }, 120000);
    }
    async init() {
        this.docUpload = new DocUploadModal();
        console.log("RFI Init", this.data);
        this.id = 1;
        this.max = 1000;
        this.GetCurrentUser();
        this.setupProjectItems();
        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
        };
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
            this.docUpload.Show(this.data.rFI.projectID, this.data.rFI.entCode, "RFI", this.data.rFI.rfI_ID);
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
            note.ProjectID = parseInt(this.data.rFI.projectID);
            note.writer = this.user.userName;
            note.created = new Date();
            note.progressNote = noteText;
            note.itemNo = this.data.rFI.rfI_ID;
            note.itemType = "RFI";
            let noteDiv = this.CreateNote(note);
            console.log("AddNote", note);
            let prevNotes = document.querySelector(".previous-notes");
            prevNotes.insertBefore(noteDiv, prevNotes.childNodes[0]);
            $('#new-note').val("");
            const noteUpdate = await axios.post("api/note/addNote", note);
            addNoteButton.disabled = false;
        });
        this.ResponseExpandButton = document.querySelector(".response-expand-btn");
        this.ResponseExpandButton.addEventListener("click", () => {
            $(".response-expand-btn").hide();
            $(".response-reduce-btn").show();
            $(".singleBox").hide();
            $(".scrollBox").show();
        });
        this.ResponseReduceButton = document.querySelector(".response-reduce-btn");
        this.ResponseReduceButton.addEventListener("click", () => {
            $(".response-expand-btn").show();
            $(".response-reduce-btn").hide();
            $(".singleBox").show();
            $(".scrollBox").hide();
            this.id = 1;
            $(".lblCounter").html("1 of " + (this.max + this.pom));
        });
        let kendoWindow = $("#window").kendoWindow({
            title: "Add Response",
            resizable: true,
            modal: true,
            width: '1000px'
        });
        kendoWindow
            .find("#res-save-button")
            .click(() => {
            console.log('save');
            kendoWindow.data("kendoWindow").close();
            const responseDate = kendoWindow.find("#add-response-date").data("kendoDatePicker").value();
            let response = {};
            response.responseDate = responseDate;
            response.type = kendoWindow.find("#add-response-type").data("kendoComboBox").text();
            response.fromName = kendoWindow.find("#add-from-name").data("kendoComboBox").text();
            // response.company = kendoWindow.find("#add-from-company").val();
            response.status = kendoWindow.find("#response-status").data("kendoComboBox").text();
            //                response.companyCode = kendoWindow.find("#add-from-company").val();
            response.companyCode = "PRO1";
            response.response = kendoWindow.find("#add-response").val();
            response.rfI_ID = this.data.rFI.rfI_ID;
            response.isAnswer = false;
            if (response.type == "Answer")
                response.isAnswer = true;
            //                    response.rfiEmailID = 1065;
            //                    response.vendorID = 1000;
            //                    response.rfiResponseID = 0;
            /*const responseInsert = axios.post("api/rfi/PostRFIResponse", response).then(() => {
                this.LoadResponses();
            });*/
            kendoWindow.find("#add-response-date").data("kendoDatePicker").value("");
            kendoWindow.find("#add-response-type").data("kendoComboBox").text("");
            kendoWindow.find("#add-from-name").data("kendoComboBox").text("");
            kendoWindow.find("#response-status").data("kendoComboBox").text("");
            // kendoWindow.find("#add-from-company").val("");
            kendoWindow.find("#add-response").val("");
        })
            .end();
        kendoWindow
            .find("#res-cancel-button")
            .click(() => { kendoWindow.data("kendoWindow").close(); })
            .end();
        let responseAddButton = document.querySelector("#response-add-button");
        responseAddButton.addEventListener("click", () => {
            /* $("#window").data("kendoWindow")
                 .center().open();*/
            $(".response-expand-btn").show();
            $(".response-reduce-btn").hide();
            $(".singleBox").show();
            $(".scrollBox").hide();
            this.id++;
            this.max++;
            this.id = 1;
            if (this.id <= this.max) {
                const singleContainer = $(".responseBox .singleBox");
                const singlcont = $(".responseBox .singleBox .responseRow");
                $(".singleBox .responseRow").attr("style", "display:none");
                singleContainer.prepend(`<div class="row responseRow" style="border:1px solid #ccc;">
	<div class="row" style="border-bottom:1px solid #ccc;">
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate" for="lblFrom">From: </label>
			<label class="lblFrom">You</label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Date: </label>
			<label id="response-today${this.id}" class="response-today" name="response-today" ></label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Due: </label>
			<input id="response-date${this.id}" class="response-date" name="response-date">
			</div>
        <div class="form-element firstRow" style="flex: 1 !important;">
			            <label class="lblCounter" style="position: absolute;right: 5px;">${this.id} of ${this.max}</label>
                        </div>	
		</div>
		<div class="form-element" style="flex: 3;">
			<div class="row">
				<div class="form-element">
					<label for="response-type">Type: </label>
					<input id="response-type${this.id}" class="response-type" type="text" name="response-type">
					</div>
					<div class="form-element">
						<label for="from-name">To: </label>
						<input id="from-name${this.id}" class="from-name" type="text" name="from-name${this.id}">
						</div>
						
						<div class="form-element" style="flex: 1;">
							<div class="row">
                                <div class="form-element">
								<label>
									CC:
								</label>
								<select id="testCmb${this.id}" class="testCmb">
								</select>
                                </div>
							</div>
						</div>
					</div>
					<div class="row" style="margin-top: 10px;">
						<div class="form-element">
							<label for="response-status">Status: </label>
							<input id="response-status${this.id}" class="response-status" type="text" name="response-status">
							</div>
							<div class="form-element">
								<label>On Sched: </label>
								<label class="switch">
									<input id="has-scheduleRfi${this.id}" type="checkbox">
										<span class="slider round"/>
									</label>
									<div id="schedule-list-rfi${this.id}" style="display:none">
                                        <input id="ScheduleCmb${this.id}" class="ScheduleCmb" type="text" >
									</div>
								</div>
							</div>
						</div>
						<div class="form-element" style="flex: 3;">
							<div class="row">
								<div class="form-element" style="position: relative;">
									<label for="response" id="lblResponse">${this.pm}</label>
									<span style="position:absolute; right: 4px; top: -1px;font-size: 0.9em;color: #666;text-decoration:underline;"> </span>
									<textarea class="responseArea" id="response${this.id}" type="text" name="response" rows="4"/>
								</div>
							</div>
							<div class="row" style="display:inline">
								<div class="form-action" style="display:inline-block">
<i class="fa fa-paperclip paperclip res-attach-add-button" id="response-attach-add-button${this.id}" aria-hidden="true"></i>
								</div>
                            <div id="message_tabstrip" class="message_tabstrip" style="margin:5px;">
                             <ul class="tapstrip-buttons"></ul>
                                </div>
								<div class="form-action" style="float:right;margin:5px;">
									<button class="btn darkgreen" id="sendBtn${this.id}">Send</button>
								</div>
							</div>
						</div>
					</div>`);
                let sendBtn = document.querySelector("#sendBtn" + this.id);
                sendBtn.addEventListener("click", async (evt) => {
                    this.isValid1 = true;
                    $("#response-status" + this.id).parent().removeClass("error");
                    $("#response" + this.id).removeClass("error");
                    $("#from-name" + this.id).parent().removeClass("error");
                    let message = {};
                    message.projectId = this.data.rFI.projectID;
                    message.type = $("#response-type" + this.id).val();
                    message.status = $("#response-status" + this.id).val();
                    if (message.status == '') {
                        $("#response-status" + this.id).parent().addClass("error");
                        this.isValid1 = false;
                    }
                    message.emailBody = $("#response" + this.id).val();
                    if (message.emailBody == '') {
                        $("#response" + this.id).addClass("error");
                        this.isValid1 = false;
                    }
                    var dt = new Date($("#response-date" + this.id).val().toString());
                    message.dateRec = new Date().toLocaleString();
                    if (message.dueDate == null) {
                        message.dueDate = dt.toLocaleDateString();
                    }
                    message.itemType = this.data.rFI.rfI_ID == undefined ? 'Project' : 'RFI';
                    message.itemNo = this.data.rFI.rfI_ID == undefined ? 0 : this.data.rFI.rfI_ID;
                    message.emailTo = $("#from-name" + this.id).val();
                    if (message.emailTo == '') {
                        $("#from-name" + this.id).parent().addClass("error");
                        //$(".from-name .k-dropdown-wrap").addClass("error");
                        this.isValid1 = false;
                    }
                    var multiselect = $("#testCmb" + this.id).val();
                    var selectedData = '';
                    $.each(multiselect, function (i, v) {
                        if (selectedData != '') {
                            selectedData += ",";
                        }
                        selectedData += v;
                    });
                    message.list = this.documents;
                    message.emailCc = selectedData == undefined ? null : selectedData;
                    message.schedId = $("#ScheduleCmb" + this.id).val() == '' ? 0 : $("#ScheduleCmb" + this.id).val();
                    message.onSched = $("#ScheduleCmb" + this.id).val() == '' ? 0 : 1;
                    console.log(message);
                    if (this.isValid1) {
                        const msgIns = await axios.post("api/message/insertmessage", message);
                        this.resetInputs();
                        this.documents = [];
                        $("#importantDiv").html(msgIns.data);
                        //this.pom += 1;
                        this.LoadResponses();
                        sendBtn.disabled = true;
                        $("#response-attach-add-button" + this.id).attr("enabled", "false");
                    }
                });
                let responseAttachAddButton = document.querySelector("#response-attach-add-button" + this.id);
                responseAttachAddButton.addEventListener("click", async (evt) => {
                    new DocUploadModal().ShowForOther("RFI", this.data.rFI.rfI_ID, 0, this.data.rFI.entCode, null);
                    //this.docUpload.ShowForRFI(this.data.rFI.rfI_ID, "RFI", 0, this.data.rFI.projectID, this.data.rFI.entCode);
                    /* this.docUpload.ShowForOther("Message", 0, this.data.rFI.projectID, this.data.rFI.entCode);*/
                });
                let helper2 = document.querySelector("#has-scheduleRfi" + this.id);
                helper2.addEventListener("click", async (evt) => {
                    if ($("#has-scheduleRfi" + this.id).is(":checked")) {
                        $("#schedule-list-rfi" + this.id).slideDown();
                    }
                    else {
                        $("#schedule-list-rfi" + this.id).slideUp();
                    }
                });
                $(".responseResults #response-today" + this.id).html(new Date().toLocaleDateString());
                $(".responseResults #testCmb" + this.id).kendoMultiSelect({
                    name: "skill",
                    dataTextField: "name",
                    dataValueField: "param",
                    dataSource: this.data.messagingData.projectTeamEmails,
                    filter: "contains",
                    autoClose: false,
                    itemTemplate: "<span>${data.name}</span>"
                }).data("kendoMultiSelect");
                $(".responseResults #ScheduleCmb" + this.id).kendoComboBox({
                    name: "schedule",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: this.data.messagingData.tasks,
                    filter: "contains",
                    suggest: true,
                    template: '<span><p>#: name # </p></span>'
                });
                var tmp = new Date();
                $('.responseResults #response-date' + this.id).kendoDatePicker({
                    value: tmp,
                    max: kendo.date.addDays(tmp, 90),
                    min: tmp,
                    format: 'MM/dd/yyyy'
                });
                $('.responseResults #from-name' + this.id).kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "param",
                    dataSource: this.data.messagingData.projectTeamEmails,
                    filter: "contains",
                    suggest: true
                });
                const grouped = this.groupBy(this.data.lookups, item => item.prompt);
                $('.responseResults #response-type' + this.id).kendoComboBox({
                    dataTextField: "value",
                    dataValueField: "value",
                    dataSource: grouped.get("MessType"),
                    filter: "contains",
                    suggest: true,
                    index: 3,
                    change: function (e) {
                        this.pm = this.value();
                        $("#lblResponse").html(this.value());
                    }
                });
                $('.responseResults #response-status' + this.id).kendoComboBox({
                    dataTextField: "value",
                    dataValueField: "value",
                    dataSource: grouped.get("Status"),
                    filter: "contains",
                    suggest: true,
                    index: 3
                });
            }
            $(".responseArea").change(() => {
                this.IsDirty = true;
            });
            $(".from-name").change(() => {
                this.IsDirty = true;
            });
            $(".ScheduleCmb").change(() => {
                this.IsDirty = true;
            });
            $(".testCmb").change(() => {
                this.IsDirty = true;
            });
            $(".response-type").change(() => {
                this.IsDirty = true;
            });
            $(".response-date").change(() => {
                this.IsDirty = true;
            });
            $(".response-status").change(() => {
                this.IsDirty = true;
            });
        });
        $("#date-published").kendoDatePicker();
        $("#date-due").kendoDatePicker();
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
        // Listen for the event.
        window.addEventListener('attachupdate', (e) => {
            console.log("attachupdate", e);
            let detail = e.detail;
            if (detail.type == "Question") {
                $("#question_tabstrip .tapstrip-buttons").append(`
                    <li id="${detail.docID}" title="${detail.fileName}" class="k-item k-state-default k-first" role = "tab" aria-controls="question_tabstrip-1"> 
                        <span class="k-loading k-complete" ></span>
                        <span unselectable="on"  title="${detail.fileName}"  class="k-link">${detail.docID}</span> 
                    </li>
                    `);
                $("#question_tabstripCustom" + this.id + " .tapstrip-buttons").append(`
                    <li id="${detail.docID}" title="${detail.fileName}" class="k-item k-state-default k-first" role = "tab" aria-controls="question_tabstrip-1"> 
                        <span class="k-loading k-complete" ></span>
                        <span unselectable="on"  title="${detail.fileName}"  class="k-link">${detail.docID}</span> 
                    </li>
                    `);
            }
            if (detail.type == "RFI") {
                this.documents.push(detail.docID);
                $("#message_tabstrip .tapstrip-buttons").append(`
                    <li title="${detail.docID}-${detail.fileName}"  id="${detail.docID}"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${detail.docID}</span></li>
                `);
                $("#message_tabstrip").kendoTabStrip({
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });
                let onSelectKendo1 = async (e) => {
                    document.body.classList.toggle("wait");
                    this.getDocUrl(e.item.id, e);
                    e.preventDefault();
                };
                $("#message_tabstrip").data("kendoTabStrip").bind("select", onSelectKendo1);
            }
            if (detail.type == "RFI") {
            }
            else {
                //detail.responseid
                $(`#response_tabstrip${detail.responseid} .tapstrip-buttons`).append(`
                    <li id="${detail.docID}"  title="${detail.fileName}" class="k-item k-state-default k-first" role = "tab" aria-controls="question_tabstrip-1"> 
                        <span class="k-loading k-complete" ></span>
                        <span unselectable="on"  title="${detail.fileName}"  class="k-link">${detail.docID}</span> 
                    </li>
                    `);
                if (detail.responseid == this.responses[0].messageId) {
                    $(`#response_tabstrip .tapstrip-buttons`).append(`
                    <li id="${detail.docID}"  title="${detail.fileName}" class="k-item k-state-default k-first" role = "tab" aria-controls="question_tabstrip-1"> 
                        <span class="k-loading k-complete" ></span>
                        <span unselectable="on"  title="${detail.fileName}"  class="k-link">${detail.docID}</span> 
                    </li>
                    `);
                }
            }
        });
        await this.LoadContactsAndProjects();
        this.LoadLookups();
        this.BindData();
        await this.LoadResponses();
        this.BuildAttachments();
        this.GetEmails();
        this.BuildNotes();
    }
    async GetCurrentUser() {
        let userData = await axios.get("api/budget/GetCurrentUser");
        this.user = userData.data;
        /*$(".initials").html(this.user.user.firstName + '' + this.user.user.lastName);*/
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
    async LoadContactsAndProjects() {
        if (this.data.rFI.rfI_ID == 0)
            this.data.rFI.entCode = "PRO1";
        const contacts = await axios.get("api/rfi/GetContactsList?entcode=" + this.data.rFI.entCode);
        this.contacts = contacts.data;
        const projects = await axios.get("api/rfi/GetProjectsList?entcode=" + this.data.rFI.entCode);
        this.projects = projects.data;
        //        console.log('contacts', this.contacts);
        //        console.log('projects', this.projects);
    }
    LoadLookups() {
        if (this.data.rFI.rfI_ID == 0)
            this.data.rFI.entCode = "PRO1";
        $("#requester").kendoComboBox({
            dataTextField: "username",
            dataValueField: "contactID",
            template: '<span><p>#: username # (#: company #)</p></span>',
            dataSource: this.contacts,
            filter: "contains",
            suggest: true,
            index: 0,
            change: (e) => {
                let selected = this.contacts.find((item) => {
                    return item.contactID == e.sender.value();
                });
                $("#requester-company").val(selected.company);
            },
        });
        $("#requester").data("kendoComboBox").value(this.data.rFI.requester);
        $("#to-name").kendoComboBox({
            dataTextField: "username",
            dataValueField: "contactID",
            template: '<span><p>#: username # (#: company #)</p></span>',
            dataSource: this.contacts,
            filter: "contains",
            suggest: true,
            index: 0,
            change: (e) => {
                let selected = this.contacts.find((item) => {
                    return item.contactID == e.sender.value();
                });
                $("#to-company").val(selected.company);
            },
        });
        $("#to-name").data("kendoComboBox").value(this.data.rFI.toName);
        $("#project").kendoComboBox({
            dataTextField: "title",
            dataValueField: "projectId",
            dataSource: this.projects,
            filter: "contains",
            suggest: true,
            index: 100
        });
        if (this.data.rFI.projectID != 0)
            $("#project").data("kendoComboBox").value(this.data.rFI.projectID);
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
        // add response window 
        $('#window .response-date').each((i, obj) => {
            $(obj).kendoDatePicker();
        });
        $('#window .response-today').html(new Date().toLocaleDateString());
        $('#window #add-response-date').each((i, obj) => {
            var tmp = new Date();
            $(obj).kendoDatePicker({
                value: tmp,
                max: kendo.date.addDays(tmp, 90),
                min: tmp,
                format: 'MM/dd/yyyy'
            });
        });
        $('#window .from-name').each((i, obj) => {
            $(obj).kendoComboBox({
                dataTextField: "name",
                dataValueField: "param",
                dataSource: this.data.messagingData.projectTeamEmails,
                filter: "contains",
                suggest: true
            });
        });
        $('#window .response-type').each((i, obj) => {
            $(obj).kendoComboBox({
                dataTextField: "value",
                dataValueField: "value",
                dataSource: grouped.get("ResponseType"),
                filter: "contains",
                suggest: true,
                index: 3,
                change: function () {
                    this.pm = this.value();
                    $("#lblResponse").html(this.value());
                }
            });
        });
        $('#window .response-status').each((i, obj) => {
            $(obj).kendoComboBox({
                dataTextField: "value",
                dataValueField: "value",
                dataSource: grouped.get("Status"),
                filter: "contains",
                suggest: true,
                index: 3
            });
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
        $("#classification").data("kendoComboBox").value(this.data.rFI.classification);
        $("#category").data("kendoComboBox").value(this.data.rFI.category);
        $("#date-published").val(Utilities.FormatDateString(this.data.rFI.datePublished));
        $("#date-due").val(Utilities.FormatDateString(this.data.rFI.dateDue));
        $("#status").data("kendoComboBox").value(this.data.rFI.status);
        $("#requester-company").val(this.data.rFI.requesterCompany);
        $("#action").val(this.data.rFI.action);
        $("#to-company").val(this.data.rFI.toCompany);
        $("#request-summary").val(this.data.rFI.requestSummary);
        $("#sender-rfi-no").val(this.data.rFI.senderRFINo);
        $("#request").val(this.data.rFI.request);
        $("#confirmation").val(this.data.rFI.confirmation);
        $("#attachments").val(this.data.rFI.attachments);
    }
    async Save() {
        this.SaveButton.disabled = true;
        document.body.classList.toggle("wait");
        let rfi = {};
        rfi.rfI_ID = this.data.rFI.rfI_ID;
        rfi.projectID = parseInt($("#project").data("kendoComboBox").value());
        rfi.classification = $("#classification").data("kendoComboBox").value();
        rfi.category = $("#category").data("kendoComboBox").value();
        rfi.datePublished = $("#date-published").val();
        rfi.dateDue = $("#date-due").val();
        rfi.status = $("#status").data("kendoComboBox").value();
        rfi.requester = $("#requester").data("kendoComboBox").value();
        rfi.requesterCompany = $("#requester-company").val();
        rfi.action = $("#action").val();
        rfi.toName = $("#to-name").data("kendoComboBox").value();
        rfi.toCompany = $("#to-company").val();
        rfi.requestSummary = $("#request-summary").val();
        rfi.senderRFINo = $("#sender-rfi-no").val();
        rfi.request = $("#request").val();
        rfi.confirmation = $("#confirmation").val();
        rfi.attachments = $("#attachments").val();
        rfi.entCode = this.data.rFI.entCode;
        rfi.dateCreated = this.data.rFI.dateCreated;
        rfi.prevRFI_ID = this.data.rFI.prevRFI_ID;
        rfi.writer = this.data.rFI.writer;
        if (this.data.rFI.rfI_ID == 0) {
            const rfiInsert = await axios.post("api/rfi/PostRFI", rfi);
            console.log(rfiInsert);
            window.location.href = "/rfis/" + rfiInsert.data.rfI_ID;
        }
        else {
            const rfiUpdate = await axios.put("api/rfi/UpdateRFI", rfi);
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
    async getMessagesByItem(item, itemNo, projectId) {
        const responses = await axios.get("api/message/getMessagesByItemAll?item=" + item + "&itemNo=" + itemNo + "&projectId=" + projectId);
        $("#importantDiv").html(responses.data);
    }
    async LoadResponses() {
        const responses = await axios.get("api/message/getMessageByItem?item=RFI&itemno=" + this.data.rFI.rfI_ID + "&count=" + this.max + "&cleanseHTML=false");
        console.log('LoadResponses:');
        console.log(responses);
        this.max = responses.data.length;
        /*responses.data.sort((a, b) => {
            if (a.messageId > b.messageId)
                return -1;
            return 1;
        });

        responses.data.sort((a, b) => {
            if (a.isAnswer == true && b.isAnswer == false)
                return -1;
            return 1;
        });*/
        console.log('answer sorted responses', responses);
        this.responses = responses.data;
        const singleContainer = $(".responseBox .singleBox");
        singleContainer.html("");
        if (responses.data.length == 0) {
            singleContainer.prepend(`<div class="row responseRow" style="border:1px solid #ccc;">
	<div class="row" style="border-bottom:1px solid #ccc;">
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate" for="lblFrom">From: </label>
			<label class="lblFrom">You</label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Date: </label>
			<label id="response-today" class="response-today" name="response-today" ></label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Due: </label>
			<input id="response-date" class="response-date" name="response-date">
			</div>
<div class="form-element firstRow" style="flex: 1 !important;">
			            <label class="lblCounter" style="position: absolute;right: 5px;">${this.id} of ${this.max}</label>
                        </div>	
		</div>
		<div class="form-element" style="flex: 3;">
			<div class="row">
				<div class="form-element">
					<label for="response-type">Type: </label>
					<input id="response-type" class="response-type" type="text" name="response-type">
					</div>
					<div class="form-element">
						<label for="from-name">To: </label>
						<input id="from-name" class="from-name" type="text" name="from-name">
						</div>
						<div class="form-element" style="flex: 1;">
							<div class="row">
                                <div class="form-element">
								<label>
									CC:
								</label>
								<select class="cmbUsers" id="cmbUsers">
								</select>
                                </div>
							</div>
						</div>
					</div>
					<div class="row" style="margin-top: 10px;">
						<div class="form-element">
							<label for="response-status">Status: </label>
							<input id="response-status" class="response-status" type="text" name="response-status">
							</div>
							<div class="form-element">
								<label>On Sched: </label>
								<label class="switch">
									<input id="has-scheduleRfi" type="checkbox" class="has-scheduleRfi">
										<span class="slider round"/>
									</label>
									<div id="schedule-list-rfi" class="schedule-list-rfi">
										<input id="ScheduleCmb" class="ScheduleCmb" type="text" >
									</div>
								</div>
							</div>
						</div>
						
						<div class="form-element" style="flex: 3;">
							<div class="row">
								<div class="form-element" style="position: relative;">
									<label for="response" id="lblResponse" >Message: </label>
									<span style="position:absolute; right: 4px; top: -1px;font-size: 0.9em;color: #666;text-decoration:underline;"> </span>
									<textarea id="response" type="text" class="responseArea" name="response" rows="4"/>
								</div>
							</div>
							<div class="row" style="display:inline">
								<div class="form-action" style="display:inline-block">
                                    <i class="fa fa-paperclip paperclip res-attach-add-button" id="response-attach-add-button" aria-hidden="true"></i>
								</div>
                                <div id="message_tabstrip" class="message_tabstrip" style="margin:5px;">
                             <ul class="tapstrip-buttons"></ul>
                                </div>
								<div class="form-action" style="float:right;margin:5px;">
									<button class="btn darkgreen" id="sendBtn">Send</button>
								</div>
							</div>
						</div>
					</div>`);
            $(".responseArea").change(() => {
                this.IsDirty = true;
            });
            $(".from-name").change(() => {
                this.IsDirty = true;
            });
            $(".ScheduleCmb").change(() => {
                this.IsDirty = true;
            });
            $(".cmbUsers").change(() => {
                this.IsDirty = true;
            });
            $(".response-type").change(() => {
                this.IsDirty = true;
            });
            $(".response-date").change(() => {
                this.IsDirty = true;
            });
            $(".response-status").change(() => {
                this.IsDirty = true;
            });
            let sendBtn = document.querySelector("#sendBtn");
            sendBtn.addEventListener("click", async (evt) => {
                this.isValid1 = true;
                $("#response-type").removeClass("error");
                $("#response-status").removeClass("error");
                $("#response").removeClass("error");
                $("#from-name").removeClass("error");
                let message = {};
                message.projectId = this.data.rFI.projectID;
                message.type = $("#response-type").val();
                if (message.type == '') {
                    $("#response-type").parent().addClass("error");
                    this.isValid1 = false;
                }
                message.status = $("#response-status").val();
                if (message.status == '') {
                    $("#response-status").parent().addClass("error");
                    this.isValid1 = false;
                }
                message.dateRec = new Date().toLocaleString();
                if (message.dueDate == null) {
                    message.dueDate = new Date($("#response-date").val().toString()).toLocaleDateString();
                }
                message.itemType = this.data.rFI.rfI_ID == undefined ? 'Project' : 'RFI';
                message.itemNo = this.data.rFI.rfI_ID == undefined ? 0 : this.data.rFI.rfI_ID;
                message.emailTo = $("#from-name").val();
                if (message.emailTo == '') {
                    $("#from-name").parent().addClass("error");
                    this.isValid1 = false;
                }
                message.emailBody = $("#response").val();
                if (message.emailBody == '') {
                    $("#response").addClass("error");
                    this.isValid1 = false;
                }
                var multiselect = $("#cmbUsers").val();
                var selectedData = '';
                $.each(multiselect, function (i, v) {
                    if (selectedData != '') {
                        selectedData += ",";
                    }
                    selectedData += v;
                });
                message.list = this.documents;
                message.emailCc = selectedData == undefined ? null : selectedData;
                message.schedId = $("#ScheduleCmb").val() == "undefined" ? 0 : $("#ScheduleCmb").val();
                message.onSched = $("#ScheduleCmb").val() == "undefined" ? 0 : 1;
                if (this.isValid1) {
                    const msgIns = await axios.post("api/message/insertmessage", message);
                    this.resetInputs();
                    console.log(msgIns);
                    this.documents = [];
                    $("#importantDiv").html(msgIns.data);
                    this.pom += 1;
                    this.LoadResponses();
                    sendBtn.disabled = true;
                    $("#response-attach-add-button").attr("enabled", "false");
                }
            });
            $(".responseResults .response-today").each((i, obj) => {
                $(obj).html(new Date().toLocaleDateString());
            });
            $('.responseResults .response-date').each((i, obj) => {
                var tmp = new Date();
                $(obj).kendoDatePicker({
                    value: tmp,
                    max: kendo.date.addDays(tmp, 90),
                    min: tmp,
                    format: 'MM/dd/yyyy'
                });
            });
            $('.responseResults .ScheduleCmb').each((i, obj) => {
                $(obj).kendoComboBox({
                    name: "schedule",
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: this.data.messagingData.tasks,
                    filter: "contains",
                    template: '<span><p>#: name # </p></span>'
                });
            });
            $(".responseResults .cmbUsers").each((i, obj) => {
                $(obj).kendoMultiSelect({
                    name: "skill",
                    dataTextField: "name",
                    dataValueField: "param",
                    dataSource: this.data.messagingData.projectTeamEmails,
                    filter: "contains",
                    autoClose: false,
                    itemTemplate: "<span>${data.name}</span>"
                }).data("kendoMultiSelect");
            });
            $('.responseResults .from-name').each((i, obj) => {
                $(obj).kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "param",
                    dataSource: this.data.messagingData.projectTeamEmails,
                    filter: "contains",
                    suggest: true
                });
            });
            const grouped = this.groupBy(this.data.lookups, item => item.prompt);
            $('.responseResults .response-type').each((i, obj) => {
                $(obj).kendoComboBox({
                    dataTextField: "value",
                    dataValueField: "value",
                    dataSource: grouped.get("MessType"),
                    filter: "contains",
                    suggest: true,
                    index: 3,
                    change: function (e) {
                        this.typeValue[i] = this.value();
                    }
                });
            });
            $('.responseResults .response-status').each((i, obj) => {
                $(obj).kendoComboBox({
                    dataTextField: "value",
                    dataValueField: "value",
                    dataSource: grouped.get("Status"),
                    filter: "contains",
                    suggest: true,
                    index: 3
                });
            });
            return;
        }
        $(".from-name").val('');
        $(".response-status").val('');
        $(".send-to-reply").val('');
        $(".send-to").val('');
        const item = responses.data[0];
        //  <div class="form-element" >
        //     <label for= "response-date" > Date: </label>
        //        < input id = "response-date" class="response-date" type = "text" name = "response-date" value = "${item.responseDate}" >
        //          </div>
        console.log(responses);
        this.pm = item.type;
        //this.max = responses.data.length < 3 ? responses.data.length : 3;
        singleContainer.append(`<div class="row responseRow" style="border:1px solid #ccc;">
	<div class="row" style="border-bottom:1px solid #ccc;">
        ${this.isitRead(item)}
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate" for="lblFrom">From: </label>
			<label class="lblFrom">${item.emailFrom}</label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Date: </label>
			<label style="display:inline" id="response-today" class="response-today" name="response-today" value="${this.getYearbyDate(item.dateRec)}"></label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Due: </label>
			<input id="response-date" class="response-date" name="response-date" value="${this.getYearbyDate(item.dueDate)}">
			</div>
            <div class="form-element firstRow" style="flex: 1 !important;">
			<label class="lblCounter" style="position: absolute;right: 5px;">${this.id} of ${this.max}</label>
            </div>		
            </div>
		<div class="form-element" style="flex: 3;">
			<div class="row">
				<div class="form-element">
					<label for="response-type">Type: </label>
					<input id="response-type" class="response-type" type="text" name="response-type" value="${item.type}">
					</div>
					<div class="form-element">
						<label for="from-name">To: </label>
						<input id="from-name" class="from-name" type="text" name="from-name" value="${item.emailTo}">
						</div>
						
						<div class="form-element" style="flex: 1;">
							<div class="row">
                                 <div class="form-element">
								<label>
								CC:
								</label>
								<select class="cmbUsers" id="cmbUsers${item.messageID}">
								</select>
                                </div>
							</div>
						</div>
					</div>
					<div class="row" style="margin-top: 10px;">
						<div class="form-element">
							<label for="response-status">Status: </label>
							<input id="response-status" class="response-status" type="text" name="response-status" value="${item.status}">
							</div>
							<div class="form-element">
								<label>On Sched: </label>
								<label class="switch">
									<input id="has-scheduleRfi-0" type="checkbox">
										<span class="slider round"></span>
									</label>
									<div id="schedule-list-rfi-0"  style="display:none">
										<input id="ScheduleCmb-0" class="ScheduleCmb" type="text" value="${item.schedID == 0 ? '' : item.schedID}" >
									</div>
								</div>
							</div>
						</div>
						
						<div class="form-element" style="flex: 3;">
							<div class="row">
								<div class="form-element" style="position: relative;">
									<label for="response" id="lblResponse">${this.pm}: </label>
									<span style="position:absolute; right: 4px; top: -1px;font-size: 0.9em;color: #666;text-decoration:underline;"> </span>
									<textarea id="response" type="text" class="responseArea" name="response" rows="4">${item.emailBody.replace(/\<br\>/g, "\n").replace(/\<br \/\>/g, "\n")}</textarea>
								</div>
							</div>
							<div class="row" style="display:inline">
								<div class="form-action" style="display:inline-block">
                                    <i class="fa fa-paperclip paperclip res-attach-add-button" id="response-attach-add-button" aria-hidden="true" rfiResponseID="${item.messageId}" ></i>
								</div>
                                <div id="message_tabstrip_1-0" class="message_tabstrip" style="margin:5px;">
                             <ul class="tapstrip-buttons"></ul>
                                </div>
								<div class="form-action" style="float:right;margin:5px;">
									<button class="btn darkgreen" id="sendBtn" rfiResponseID="${item.messageId}" >Send</button>
								</div>
							</div>
						</div>
					</div>`);
        $(".responseArea").change(() => {
            this.IsDirty = true;
        });
        $(".from-name").change(() => {
            this.IsDirty = true;
        });
        $(".ScheduleCmb").change(() => {
            this.IsDirty = true;
        });
        $(".cmbUsers").change(() => {
            this.IsDirty = true;
        });
        $(".response-type").change(() => {
            this.IsDirty = true;
        });
        $(".response-date").change(() => {
            this.IsDirty = true;
        });
        $(".response-status").change(() => {
            this.IsDirty = true;
        });
        if (item.onSched == true) {
            $("#has-scheduleRfi-0").attr("checked", "true");
        }
        if ($("#has-scheduleRfi-0").is(":checked")) {
            $("#schedule-list-rfi-0").slideDown();
        }
        else {
            $("#schedule-list-rfi-0").slideUp();
        }
        var tmp = new Date();
        $('.responseResults #response-date').kendoDatePicker({
            value: new Date(this.getYearbyDate(item.dueDate)),
            max: kendo.date.addDays(tmp, 90),
            min: tmp,
            format: 'MM/dd/yyyy'
        });
        var arr = "";
        if (item.emailCC != null) {
            arr = item.emailCC.split(',');
        }
        $("#cmbUsers" + item.messageID).kendoMultiSelect({
            name: "skill",
            dataTextField: "name",
            dataValueField: "param",
            close: function (e) {
                console.log(e.sender.element.parent());
            },
            dataSource: this.data.messagingData.projectTeamEmails,
            filter: "contains",
            autoClose: false,
            itemTemplate: "<span>${data.name}</span>",
            value: arr
        }).data("kendoMultiSelect");
        let sendBtn = document.querySelector("#sendBtn");
        sendBtn.addEventListener("click", async (evt) => {
            this.isValid1 = true;
            $("#response-type").parent().removeClass("error");
            $("#response-status").parent().removeClass("error");
            $("#response").removeClass("error");
            $("#from-name").parent().removeClass("error");
            let message = {};
            message.projectId = this.data.rFI.projectID;
            message.type = $("#response-type").val();
            if (message.type == '') {
                $("#response-type").parent().addClass("error");
            }
            message.status = $("#response-status").val();
            if (message.status == '') {
                $("#response-status").parent().addClass("error");
            }
            message.dateRec = new Date().toLocaleString();
            if (message.dueDate == null) {
                message.dueDate = new Date($("#response-date").val().toString()).toLocaleString();
            }
            message.itemType = this.data.rFI.rfI_ID == undefined ? 'Project' : 'RFI';
            message.itemNo = this.data.rFI.rfI_ID == undefined ? 0 : this.data.rFI.rfI_ID;
            message.emailTo = $("#from-name").val();
            if (message.emailTo == '') {
                $("#from-name").parent().addClass("error");
            }
            message.emailBody = $("#response").val();
            if (message.emailBody == '') {
                $("#response").addClass("error");
            }
            var multiselect = $("#cmbUsers").val();
            var selectedData = '';
            $.each(multiselect, function (i, v) {
                if (selectedData != '') {
                    selectedData += ",";
                }
                selectedData += v;
            });
            message.list = this.documents;
            message.emailCc = selectedData == undefined ? null : selectedData;
            message.schedId = $("#ScheduleCmb").val() == "undefined" ? 0 : $("#ScheduleCmb").val();
            message.onSched = $("#ScheduleCmb").val() == "undefined" ? 0 : 1;
            console.log(message);
            if (this.isValid1) {
                const msgIns = await axios.post("api/message/insertmessage", message);
                this.resetInputs();
                this.documents = [];
                $("#importantDiv").html(msgIns.data);
                this.LoadResponses();
                sendBtn.disabled = true;
                $("#response-attach-add-button").attr("enabled", "false");
            }
        });
        if (item != null) {
            sendBtn.disabled = true;
            $("#response-attach-add-button").attr("enabled", "false");
        }
        const responseContainer = $(".responseBox .scrollBox");
        responseContainer.html("");
        const count = responses.data.length;
        responses.data.forEach((item, index) => {
            this.typeValue[index] = item.type;
            responseContainer.append(`<div class="row responseRow" style="border:1px solid #ccc;">
	<div class="row" style="border-bottom:1px solid #ccc;">
                ${this.isitRead(item)}
		<div class="form-element firstRow" style="flex: 2 !important;">
			<label class="lblResponseDate" for="lblFrom${index}">From: </label>
			<label class="lblFrom" >${item.emailFrom}</label>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Date: </label>
			<label style="display:inline" id="response-today${index}" class="response-today" name="response-today${index}" value="${this.getYearbyDate(item.dateRec)}"></p>
		</div>
		<div class="form-element firstRow" style="flex: 3 !important;">
			<label class="lblResponseDate">Due: </label>
			<input id="response-date${index}" class="response-date" name="response-date${index}" value="${this.getYearbyDate(item.dueDate)}">
			</div>
            <div class="form-element firstRow" style="flex: 1 !important;">
			            <label class="lblResponseDate" style="position: absolute;right: 10px;">${index + 1} of ${this.max + this.pom}</label>
                        </div>	
		</div>
		<div class="form-element" style="flex: 3;">
			<div class="row">
				<div class="form-element">
					<label for="response-type${index}">Type: </label>
					<input id="response-type${index}" class="response-type" type="text" name="response-type${index}" value="${item.type}">
					</div>
					<div class="form-element">
						<label for="from-name${index}">To: </label>
						<input id="from-name${index}" class="from-name" type="text" name="from-name${index}" value="${item.emailTo}">
						</div>
					</div>
					<div class="row" style="margin-top: 10px;">
						<div class="form-element">
							<label for="response-status${index}">Status: </label>
							<input id="response-status${index}" class="response-status" type="text" name="response-status${index}" value="${item.status}">
							</div>
							<div class="form-element">
								<label>On Sched: </label>
								<label class="switch">
									<input id="has-scheduleRfi${item.messageID}"  type="checkbox">
										<span class="slider round"/>
									</label>
									<div id="schedule-list-rfi${item.messageID}" style="display:none">
                                <input id="ScheduleCmb${item.messageID}" class="ScheduleCmb" type="text" value="${item.schedID == 0 ? '' : item.schedID}">
									</div>
								</div>
							</div>
						</div>
						<div class="form-element" style="flex: 1;">
							<div class="row">
                                <div class="form-element">
								<label>
								CC:
								</label>
								<select class="cmbUsers" id="cmbUsers${index}">
									
								</select>
                                </div>
							</div>
						</div>
						<div class="form-element" style="flex: 3;">
							<div class="row">
								<div class="form-element" style="position: relative;">
									<label for="response${index}">${this.typeValue[index]}: </label>
									
									<textarea id="response${index}" class="responseArea" type="text" name="response${index}" rows="4">${item.emailBody.replace(/\<br\>/g, "\n").replace(/\<br \/\>/g, "\n")}</textarea>
								</div>
							</div>
                                <div class="row" style="display:inline" >
                                <div id="message_tabstrip_1-${item.messageID}" class="message_tabstrip" style="margin:5px;">
                             <ul class="tapstrip-buttons msg"></ul>
                                </div>
							</div>
						</div>
					</div>`);
            let helper = document.querySelector("#has-scheduleRfi" + item.messageID);
            helper.addEventListener("click", async (evt) => {
                if ($("#has-scheduleRfi" + item.messageID).is(":checked")) {
                    $("#schedule-list-rfi" + item.messageID).slideDown();
                }
                else {
                    $("#schedule-list-rfi" + item.messageID).slideUp();
                }
            });
            let helperOne = document.querySelector("#has-scheduleRfi-0");
            helperOne.addEventListener("click", async (evt) => {
                if ($("#has-scheduleRfi-0").is(":checked")) {
                    $("#schedule-list-rfi-0").slideDown();
                }
                else {
                    $("#schedule-list-rfi-0").slideUp();
                }
            });
            var arr = "";
            if (item.emailCC != null) {
                arr = item.emailCC.split(',');
            }
            console.log(item);
            $("#cmbUsers" + index).kendoMultiSelect({
                name: "skill",
                dataTextField: "name",
                dataValueField: "param",
                close: function (e) {
                    console.log(e.sender.element.parent());
                },
                dataSource: this.data.messagingData.projectTeamEmails,
                filter: "contains",
                autoClose: false,
                itemTemplate: "<span>${data.name}</span>",
                value: arr
            }).data("kendoMultiSelect");
            if (item.onSched == true) {
                $("#has-scheduleRfi" + item.messageID).attr("checked", "true");
            }
            if ($("#has-scheduleRfi" + item.messageID).is(":checked")) {
                $("#schedule-list-rfi" + item.messageID).slideDown();
            }
            else {
                $("#schedule-list-rfi" + item.messageID).slideUp();
            }
            var tmp = new Date();
            $('.responseResults #response-date' + index).kendoDatePicker({
                value: new Date(this.getYearbyDate(item.dueDate)),
                max: kendo.date.addDays(tmp, 90),
                min: tmp,
                format: 'MM/dd/yyyy'
            });
        });
        $(".responseResults .response-today").each((i, obj) => {
            $(obj).html(new Date().toLocaleDateString());
        });
        $('.responseResults .from-name').each((i, obj) => {
            $(obj).kendoComboBox({
                dataTextField: "name",
                dataValueField: "param",
                dataSource: this.data.messagingData.projectTeamEmails,
                filter: "contains",
                suggest: true
            });
        });
        /*$(".responseResults .cmbUsers").each((i, obj) => {
            console.log("users:" + obj);
            $(obj).kendoMultiSelect({
                name: "skill",
                dataTextField: "name",
                dataValueField: "param",
                close: function (e) {
                    console.log(e.sender.element.parent());
                },
                dataSource: this.data.messagingData.projectTeamEmails,
                filter: "contains",
                autoClose: false,
                itemTemplate: "<span>${data.name}</span>"
            }).data("kendoMultiSelect");
        });*/
        $('.responseResults .ScheduleCmb').each((i, obj) => {
            $(obj).kendoComboBox({
                name: "schedule",
                dataTextField: "name",
                dataValueField: "id",
                dataSource: this.data.messagingData.tasks,
                filter: "contains",
                template: '<span><p>#: name # </p></span>'
            });
        });
        const grouped = this.groupBy(this.data.lookups, item => item.prompt);
        $('.responseResults .response-type').each((i, obj) => {
            $(obj).kendoComboBox({
                dataTextField: "value",
                dataValueField: "value",
                dataSource: grouped.get("MessType"),
                filter: "contains",
                suggest: true,
                index: 3,
                change: function (e) {
                    this.pm = this.value();
                    $("#lblResponse").html(this.value());
                }
            });
        });
        $('.responseResults .response-status').each((i, obj) => {
            $(obj).kendoComboBox({
                dataTextField: "value",
                dataValueField: "value",
                dataSource: grouped.get("Status"),
                filter: "contains",
                suggest: true,
                index: 3
            });
        });
        responses.data.forEach(async (item, index) => {
            console.log(item.messageID);
            var tmps = +this.data.rFI.rfI_ID == undefined ? 'Project' : 'RFI';
            console.log(tmps);
            const msgIns = await axios.get("api/message/getMessageDoc?messid=" + item.messageID + "&type=" + tmps);
            console.log(msgIns.data);
            if (msgIns.data != null) {
                msgIns.data.forEach((it, ind) => {
                    if (index == 0) {
                        $("#message_tabstrip_1-" + index + " .tapstrip-buttons").append(`
                    <li title="${it.docID}-${it.name}"  id="${it.docID}"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${it.docID}</span></li>
                `);
                        $("#message_tabstrip_1-" + index).kendoTabStrip({
                            animation: {
                                open: {
                                    effects: "fadeIn"
                                }
                            }
                        });
                        let onSelectKendo12 = async (e) => {
                            document.body.classList.toggle("wait");
                            this.getDocUrl(e.item.id, e);
                            e.preventDefault();
                        };
                        $("#message_tabstrip_1-" + index).data("kendoTabStrip").bind("select", onSelectKendo12);
                    }
                    $("#message_tabstrip_1-" + item.messageID + " .tapstrip-buttons").append(`
                    <li title="${it.docID}-${it.name}"  id="${it.docID}"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${it.docID}</span></li>
                `);
                    $("#message_tabstrip_1-" + item.messageID).kendoTabStrip({
                        animation: {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    });
                    let onSelectKendo = async (e) => {
                        document.body.classList.toggle("wait");
                        this.getDocUrl(e.item.id, e);
                        e.preventDefault();
                    };
                    $("#message_tabstrip_1-" + item.messageID).data("kendoTabStrip").bind("select", onSelectKendo);
                });
            }
        });
    }
    isitRead(item) {
        let pm = "";
        if (!item.isRead) {
            pm = "<i class=\"fa fa-exclamation-circle\" aria-hidden=\"true\" style=\"float: left; font-size:15px; margin-top:1px;\" title=\"No reply has been sent\"></i>";
        }
        return pm;
    }
    async GetEmails() {
        if (this.data.rFI.rfI_ID == 0)
            return;
        const emails = await axios.get("api/rfi/GetAttachDocs?entcode=" + this.data.rFI.entCode + "&id=" + this.data.rFI.rfI_ID);
        console.log('emails', emails);
        this.MakeCarousel(emails.data);
        this.LoadEmailsGrid(emails.data);
    }
    getYear() {
        var tmp = new Date();
        var mes = (tmp.getMonth() + 1) < 10 ? '0' + (tmp.getMonth() + 1) : (tmp.getMonth() + 1);
        var den = tmp.getDate() < 10 ? '0' + tmp.getDate() : tmp.getDate();
        var pom = mes + '/' + den + '/' + tmp.getFullYear();
        return pom;
    }
    getYearbyDate(tmp1) {
        var tmp = new Date(tmp1);
        var mes = (tmp.getMonth() + 1) < 10 ? '0' + (tmp.getMonth() + 1) : (tmp.getMonth() + 1);
        var den = tmp.getDate() < 10 ? '0' + tmp.getDate() : tmp.getDate();
        var pom = mes + '/' + den + '/' + tmp.getFullYear();
        return pom;
    }
    resetInputs() {
        this.IsDirty = false;
        $(".response").prop('selectedIndex', 0);
        $(".cmbUsers").val('');
        $('.responseResults .response-date').val(this.getYear());
        $(".response-status").prop('selectedIndex', 0);
        $(".response-type").prop('selectedIndex', 0);
        $(".from-name").prop('selectedIndex', 0);
        $("#new-message").val('');
        $(".schedule-list-reply").attr("style", "display:none");
        $(".cc-list-reply1").attr("style", "display:none");
        $(".has-schedule-reply").prop("checked", false);
        $(".has-cc-reply").prop("checked", false);
        $("select.send-to-reply").prop('selectedIndex', 0);
        $(".cclist").val('');
        $(".cc-list-reply").val('');
        $(".schedule-list-reply").prop('selectedIndex', 0);
        $(".message-type-reply").prop('selectedIndex', 0);
        $(".send-to-reply").prop('selectedIndex', 0);
        //  this.test();
    }
    resetButton() {
        this.IsDirty = false;
        $(".schedule-list-reply").attr("style", "display:none");
        $(".cc-list-reply1").attr("style", "display:none");
        $(".has-schedule-reply").prop("checked", false);
        $(".has-cc-reply").prop("checked", false);
        $("select.send-to-reply").prop('selectedIndex', 0);
        $(".cclist").val('');
        $(".cc-list-reply").val('');
        $(".schedule-list-reply").prop('selectedIndex', 0);
        $(".message-type-reply").prop('selectedIndex', 0);
        $(".send-to-reply").prop('selectedIndex', 0);
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
            this.getDocUrl(dataItem.docID, e);
            e.preventDefault();
        });
    }
    async getDocUrl(docId, evt) {
        let e = this.showDocWindow(docId, evt);
        //let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        //console.log('docUrl', docUrl.data);
        //window.open(docUrl.data);
        //document.body.classList.toggle("wait");
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
        itemDiv.onclick = async () => {
            console.log('card type', item.type);
            document.body.classList.toggle("wait");
            let responseText;
            if (item.type == 'Email') {
                let message = await axios.get("api/Message/getMessageByID?messid=" + item.itemNo);
                console.log('message', message);
                let closeButton = document.createElement("button");
                closeButton.className = "btn teal";
                closeButton.setAttribute("style", "float:right; margin-left: 1em; margin-top: 7px; margin-right: 1em;");
                closeButton.innerText = "Close";
                closeButton.onclick = async () => {
                    $("#emailBox").hide();
                };
                let expandButton = document.createElement("button");
                expandButton.className = "btn teal";
                expandButton.setAttribute("style", "float:right; margin-right: 7px; margin-top: 7px;");
                expandButton.disabled = true;
                expandButton.innerText = "Expand";
                let addButton = document.createElement("button");
                addButton.className = "btn yellow email-response-add-button";
                addButton.setAttribute("style", "margin-left: 7px;");
                addButton.innerText = "Add";
                addButton.onclick = async () => {
                    let response = {};
                    response.responseDate = message.data.dateRec;
                    console.log($("#email-response-type"));
                    response.type = $("#email-response-type").data("kendoComboBox").value();
                    const userResponse = await axios.post("api/rfi/GetUserbyEmail", { ea: message.data.emailFrom });
                    console.log(userResponse);
                    response.fromName = message.data.emailFrom;
                    const companyResponse = await axios.get("api/rfi/GetCompanybyEmail?e=" + message.data.emailFrom);
                    console.log(companyResponse);
                    response.company = companyResponse.data.vendorName;
                    response.companyCode = companyResponse.data.companyCode;
                    response.response = String(responseText);
                    response.rfI_ID = this.data.rFI.rfI_ID;
                    response.isAnswer = false;
                    if (response.type == "Answer")
                        response.isAnswer = true;
                    //                    response.rfiEmailID = 1065;
                    //                    response.vendorID = 1000;
                    //                    response.rfiResponseID = 0;
                    const responseInsert = axios.post("api/rfi/PostRFIResponse", response).then(() => {
                        this.LoadResponses();
                    });
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
                closeButton.className = "btn teal";
                closeButton.setAttribute("style", "float:right; margin-top: 7px; margin-right: 7px;");
                closeButton.innerText = "Close";
                closeButton.onclick = function () {
                    $("#emailBox").hide();
                };
                let expandButton = document.createElement("button");
                expandButton.className = "btn teal";
                expandButton.setAttribute("style", "float:right; margin-right: 7px; margin-top: 7px;");
                expandButton.innerText = "Expand";
                expandButton.onclick = function () {
                    window.open(docUrl.data);
                };
                let addButton = document.createElement("button");
                addButton.className = "btn yellow email-response-add-button";
                addButton.setAttribute("style", "margin-left: 7px;");
                addButton.innerText = "Add";
                addButton.onclick = async () => {
                    let response = {};
                    response.responseDate = item.created;
                    response.type = $("#email-response-type").data("kendoComboBox").value();
                    response.fromName = item.createdBy;
                    response.company = "company";
                    response.companyCode = "PRO1";
                    if (item.createdBy.contains("@")) {
                        const userResponse = await axios.post("api/rfi/GetUserbyEmail", { ea: item.createdBy });
                        console.log(userResponse);
                        //                        response.fromName = userResponse.data.userName;
                        const companyResponse = await axios.get("api/rfi/GetCompanybyEmail?e=" + item.createdBy);
                        console.log(companyResponse);
                        response.company = companyResponse.data.vendorName;
                        response.companyCode = companyResponse.data.companyCode;
                    }
                    response.response = String(responseText);
                    response.rfI_ID = this.data.rFI.rfI_ID;
                    response.isAnswer = false;
                    if (response.type == "Answer")
                        response.isAnswer = true;
                    const responseInsert = axios.post("api/rfi/PostRFIResponse", response).then(() => {
                        this.LoadResponses();
                    });
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
    async BuildAttachments() {
        const attachments = this.data.attachments;
        attachments.forEach((item, idx) => {
            if (item.type == "Question") {
                $("#question_tabstrip .tapstrip-buttons").append(`
                    <li title="${item.docID}-${item.fileName}"  id="${item.docID}">${item.docID}</li>
                `);
            }
        });
        $("#question_tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });
        let onSelect = async (e) => {
            document.body.classList.toggle("wait");
            this.getDocUrl(e.item.id, e);
            e.preventDefault();
        };
        $("#question_tabstrip").data("kendoTabStrip").bind("select", onSelect);
        let questionAttachAddButton = document.querySelector("#question-attach-add-button");
        questionAttachAddButton.addEventListener("click", async (evt) => {
            this.docUpload.ShowForRFI(this.data.rFI.rfI_ID, "Question", 0, this.data.rFI.projectID, this.data.rFI.entCode);
        });
        /*let helper = document.querySelector(".has-scheduleRfi") as HTMLInputElement;
        helper.addEventListener("click", async (evt) => {
            if ($(".has-scheduleRfi").is(":checked")) {
                $(".schedule-list-rfi").slideDown();
            } else {
                $(".schedule-list-rfi").slideUp();
            }

        });*/
        let responseAttachAddButton = document.querySelector("#response-attach-add-button");
        responseAttachAddButton.addEventListener("click", async (evt) => {
            new DocUploadModal().ShowForOther("RFI", this.data.rFI.rfI_ID, 0, this.data.rFI.entCode, null);
            //new DocUploadModal().ShowForRFI(this.data.rFI.rfI_ID, "RFI", 0, this.data.rFI.projectID, this.data.rFI.entCode);
        });
        attachments.forEach((item, idx) => {
            if (item.type == "Response") {
                //                item.rfiDocLinkID = "response_tabstrip${item.rfiResponseID}";
                $(`#response_tabstrip${item.itemID} .tapstrip-buttons`).append(`
                    <li title="${item.fileName}" id="${item.docID}">${item.docID}</li>
                `);
                if (item.itemID == this.responses[0].messageId) {
                    $("#response_tabstrip .tapstrip-buttons").append(`
                        <li title="${item.docID}-${item.fileName}" id="${item.docID}"> ${item.docID} </li>
                    `);
                }
            }
        });
        $("#response_tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });
        /*$("#response_tabstrip").data("kendoTabStrip").bind("select", onSelect);*/
        this.responses.forEach((item, index) => {
            $(`#response_tabstrip${item.messageId}`).kendoTabStrip({
                animation: {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });
            /*$(`#response_tabstrip${item.rfiResponseID}`).data("kendoTabStrip").bind("select", onSelect);*/
        });
        /* $(".res-attach-add-button").each((i, obj) => {
             $(obj).click(() => {
                 this.docUpload.ShowForOther("Message", $(obj).attr('rfiResponseID'), this.data.rFI.projectID, this.data.rFI.entCode);
             });
             
         });*/
    }
    async showDocWindow(docId, evt) {
        console.log("Entering getDocUrl");
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        console.log('docUrl', docUrl.data);
        //window.open(docUrl.data);
        let closeButton = document.createElement("button");
        closeButton.className = "btn teal";
        closeButton.setAttribute("style", "float:right; margin-top: 7px; margin-right: 7px;");
        closeButton.innerText = "Close";
        closeButton.onclick = function () {
            $("#emailBox").hide();
            $(evt.contentElement).html("");
        };
        let expandButton = document.createElement("button");
        expandButton.className = "btn teal";
        expandButton.setAttribute("style", "float:right; margin-right: 7px; margin-top: 7px;");
        expandButton.innerText = "Expand";
        expandButton.onclick = function () {
            window.open(docUrl.data);
        };
        let toolbarDiv = document.createElement("div");
        toolbarDiv.className = "email-toolbar";
        let headerDiv = document.createElement("div");
        headerDiv.className = "email-header";
        $("#emailBody").html(`<embed src="${docUrl.data}" width="100%" height="400px"/>`);
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
        document.body.classList.toggle("wait");
    }
}
