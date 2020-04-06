import axiosES6 from "../lib/axios/axios.esm.min.js";
const axios = axiosES6;
import { DocUploadModal } from "./modals/doc-upload-modal.js";
export class MessagingList {
    constructor(data) {
        this.documents = [];
        this.isValid = [];
        this.isValid1 = true;
        this.IsDirty = false;
        this.data = data;
        console.log(this.data);
        this.init();
        window.onbeforeunload = () => {
            if (this.IsDirty) {
                return "Leaving the site will lose your changes";
            }
            return;
        };
    }
    async init() {
        this.docUpload = new DocUploadModal();
        this.BuildAttachments();
        $(window).resize(function () {
            var offset = $("#has-cc").position();
            console.log(offset);
            $("#cc-list1").css("left", offset.left);
            $("#cc-list1").css("top", offset.top + 10);
            var offset = $("#has-schedule").position();
            $("#schedule-list").css("left", offset.left);
            $("#schedule-list").css("top", offset.top + 10);
        });
        window.addEventListener('attachupdate', (e) => {
            console.log("attachupdate", e);
            let detail = e.detail;
            if (detail.type == "Message") {
                this.documents.push(detail.docID);
                if (detail.element == null) {
                    if ($("#message_tabstripMain .tapstrip-buttons").find("#" + detail.docID).length == 0) {
                        /*$(".firstCol").removeClass("col-lg-12").removeClass("col-lg-10").addClass("col-lg-10");
                        $("#message_tabstripMain .tapstrip-buttons").parent().parent().parent().removeClass("col-lg-2").addClass("col-lg-2");
                        $("#message_tabstripMain .tapstrip-buttons").parent().parent().parent().css("display", "block");*/
                        $("#message_tabstripMain .tapstrip-buttons").parent().parent().css("display", "block");
                        $("#message_tabstripMain .tapstrip-buttons").append(`
                    <li title="${detail.docID}-${detail.fileName}"  id="${detail.docID}" style="bottom:-10px;margin-bottom:10px;"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${detail.docID}</span></li>
                `);
                        $("#message_tabstripMain").kendoTabStrip({
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
                        $("#message_tabstripMain").data("kendoTabStrip").bind("select", onSelectKendo1);
                    }
                }
                else {
                    if ($("#message_tabstripMain-" + detail.element + " .tapstrip-buttons").find("#" + detail.docID).length == 0) {
                        $("#message_tabstripMain-" + detail.element + " .tapstrip-buttons").parent().parent().css("display", "block");
                        $("#message_tabstripMain-" + detail.element + " .tapstrip-buttons").append(`
                    <li title="${detail.docID}-${detail.fileName}" style="bottom:-10px;margin-bottom:10px;"  id="${detail.docID}"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${detail.docID}</span></li>
                `);
                        $("#message_tabstripMain-" + detail.element).kendoTabStrip({
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
                        $("#message_tabstripMain-" + detail.element).data("kendoTabStrip").bind("select", onSelectKendo1);
                    }
                }
            }
        });
    }
    async BuildAttachments() {
        //$(".from-name").val('');
        // $(".response-status").val('');
        $(".send-to-reply").val('');
        $(".send-to").val('');
        $(".newMessage").val('');
        /* $("#question_tabstrip").kendoTabStrip({
             animation: {
                 open: {
                     effects: "fadeIn"
                 }
             }
         });*/
        /*let onSelect = async (e) => {
            document.body.classList.toggle("wait");
            this.getDocUrl(e.item.id);
        };
        $("#question_tabstrip").data("kendoTabStrip").bind("select", onSelect);*/
        let questionAttachAddButton = document.querySelector("#new-message");
        questionAttachAddButton.addEventListener("click", async (evt) => {
            if ($("#new-message-container").html() == '') {
                let template = $("#message-container-template").html();
                $(".compose-container").html("");
                $(".compose-container-reply-new").html("");
                $("#new-message-container").html(template);
                this.InitializeMessageEvents();
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
                $(".send-to").change(() => {
                    this.IsDirty = true;
                });
                $(".send-to-reply").change(() => {
                    this.IsDirty = true;
                });
                $(".message-to-reply").change(() => {
                    this.IsDirty = true;
                });
                $(".message-to").change(() => {
                    this.IsDirty = true;
                });
                $(".cc-list-reply").change(() => {
                    this.IsDirty = true;
                });
                $(".schedule-list-reply").change(() => {
                    this.IsDirty = true;
                });
                window.onbeforeunload = () => {
                    if (this.IsDirty) {
                        return "Leaving the site will lose your changes";
                    }
                    return;
                };
                $(".from-name").val('');
                $(".response-status").val('');
                $(".send-to-reply").val('');
                $(".send-to").val('');
                $(".newMessage").val('');
                $(".dueInp").val('');
                $(".type-status").val('');
                $(".action-type").val('');
                if ($("#hdnbtn").val() == 'Project') {
                    $("#action-type").removeClass("error");
                    $("#dueInp").removeClass("error");
                    $("#action-type-status").removeClass("error");
                }
                $("#send-to-reply").removeClass("error");
                $("#new-message-reply").removeClass("error");
            }
            var offset = $("#has-cc").position();
            $("#cc-list1").css("left", offset.left);
            $("#cc-list1").css("top", offset.top + 10);
            var offset = $("#has-schedule").position();
            $("#schedule-list").css("left", offset.left);
            $("#schedule-list").css("top", offset.top + 10);
            $(window).resize(function () {
                var offset = $("#has-cc").position();
                $("#cc-list1").css("left", offset.left);
                $("#cc-list1").css("top", offset.top + 10);
                var offset = $("#has-schedule").position();
                $("#schedule-list").css("left", offset.left);
                $("#schedule-list").css("top", offset.top + 10);
            });
            if ($("#hdnbtn").val() == 'Project') {
                var tmp = new Date();
                $('#dueInp').kendoDatePicker({
                    value: tmp,
                    max: kendo.date.addDays(tmp, 90),
                    min: tmp,
                    format: 'MM/dd/yyyy'
                });
                let typeAction = document.querySelector("#message-type");
                typeAction.addEventListener("change", async (evt) => {
                    if ($("#message-type").val() == 'Action') {
                        /* $("#secondDiv").removeClass("col-lg-2");
                         $("#secondDiv").addClass("col-lg-1");
                         $("#fourthDiv").removeClass("col-lg-2");
                         $("#fourthDiv").addClass("col-lg-1");
                         $("#fifthDiv").removeClass("col-lg-2");
                         $("#fifthDiv").addClass("col-lg-1");*/
                        $("#actionDivOne").css("display", "block");
                        $("#actionDivOne").addClass("col-lg-2");
                        $("#actionDivTwo").css("display", "block");
                        $("#actionDivTwo").addClass("col-lg-2");
                        $("#actionDivThree").css("display", "block");
                        $("#actionDivThree").addClass("col-lg-2");
                        $("#actionDivThree").addClass("col-mid");
                        $("#actionDivTwo").addClass("col-mid");
                        $("#actionDivOne").addClass("col-mid");
                        $("#secondDiv").addClass("col-mid");
                        $("#thirdDiv").addClass("col-mid");
                        $("#fourthDiv").addClass("col-mid");
                        $("#fifthDiv").addClass("col-mid");
                    }
                    else {
                        /* $("#secondDiv").addClass("col-lg-2");
                         $("#secondDiv").removeClass("col-lg-1");
                         $("#fourthDiv").addClass("col-lg-2");
                         $("#fourthDiv").removeClass("col-lg-1");
                         $("#fifthDiv").addClass("col-lg-2");
                         $("#fifthDiv").removeClass("col-lg-1");*/
                        //$("#cc-list1").css("left", (parseInt($("#cc-list1").css("left"), 10) - $("#actionDiv").width()) + "px");
                        //$("#schedule-list").css("left", (parseInt($("#schedule-list").css("left"), 10) - $("#actionDiv").width()) + "px");
                        $("#actionDivOne").css("display", "none");
                        $("#actionDivOne").removeClass("col-lg-2");
                        $("#actionDivTwo").css("display", "none");
                        $("#actionDivTwo").removeClass("col-lg-2");
                        $("#actionDivThree").css("display", "none");
                        $("#actionDivThree").removeClass("col-lg-2");
                        $("#actionDivThree").removeClass("col-mid");
                        $("#actionDivTwo").removeClass("col-mid");
                        $("#actionDivOne").removeClass("col-mid");
                        $("#secondDiv").removeClass("col-mid");
                        $("#thirdDiv").removeClass("col-mid");
                        $("#fourthDiv").removeClass("col-mid");
                        $("#fifthDiv").removeClass("col-mid");
                    }
                });
            }
            let rstBtn = document.querySelector(".cancel-btn");
            rstBtn.addEventListener("click", async (evt) => {
                this.resetButton();
                if ($("#hdnbtn").val() == 'Project') {
                    $("#action-type").removeClass("error");
                    $("#dueInp").removeClass("error");
                    $("#action-type-status").removeClass("error");
                }
                $("#send-to").removeClass("error");
                $("#new-message").removeClass("error");
                $("#new-message-container").html("");
            });
            let helper = document.querySelector("#has-schedule");
            helper.addEventListener("click", async (evt) => {
                if ($("#has-schedule").is(":checked")) {
                    $("#schedule-list").slideDown();
                }
                else {
                    $("#schedule-list").slideUp();
                }
            });
            let upl = document.querySelector("#addDocumentReply");
            upl.addEventListener("click", async (evt) => {
                //this.docUpload.ShowForRFI(0, "Message", 0, this.data.projectMessages.projectID, 0);
                this.docUpload.ShowForOther($("#hdnbtn").attr('value'), 0, this.data.projectMessages.projectID, "PRO1", null);
            });
        });
        let msg = document.querySelector("#new-message-btn");
        msg.addEventListener("click", async (evt) => {
            document.body.classList.toggle("wait");
            let message = {};
            this.isValid1 = true;
            $("#send-to").removeClass("error");
            $("#new-message").removeClass("error");
            if ($("#hdnbtn").val() == 'Project') {
                $("#action-type").removeClass("error");
                $("#dueInp").removeClass("error");
                $("#action-type-status").removeClass("error");
            }
            message.projectId = this.data.projectId;
            message.type = $("#message-type").val();
            message.itemType = $("#hdnbtn").val();
            message.itemNo = $("#hdnbtn").val() == 'RFI' ? this.data.rfiId : $("#hdnbtn").val() == 'Project' ? this.data.projectId : 0;
            message.emailTo = $("#send-to").val();
            if (message.emailTo == null) {
                $("#send-to").addClass("error");
                this.isValid1 = false;
            }
            if ($("#hdnbtn").val() == 'Project' && $("#message-type").val() == 'Action') {
                if ($("#action-type").val() == null) {
                    $("#action-type").addClass("error");
                    this.isValid1 = false;
                }
                if ($("#dueInp").val() == '') {
                    $("#dueInp").addClass("error");
                    this.isValid1 = false;
                }
                if ($("#action-type-status").val() == null) {
                    $("#action-type-status").addClass("error");
                    this.isValid1 = false;
                }
                message.status = $("#action-type-status").val();
                message.actionType = $("#action-type").val();
                message.dueDate = $("#dueInp").val();
            }
            message.emailBody = $("#new-message").val();
            message.emailBody = message.emailBody.replace(/(?:\r\n|\r|\n)/g, '<br />');
            if (message.emailBody == '') {
                $("#new-message").addClass("error");
                this.isValid1 = false;
            }
            console.log(this.isValid1);
            var multiselect = $("#cc-list").val();
            console.log(multiselect);
            var selectedData = '';
            $.each(multiselect, function (i, v) {
                if (selectedData != '') {
                    selectedData += ",";
                }
                selectedData += v;
            });
            message.dateRec = new Date().toLocaleString();
            if (message.dueDate == null) {
                message.dueDate = new Date().toLocaleDateString();
            }
            message.emailCc = selectedData == undefined ? null : selectedData;
            message.list = this.documents;
            if ($("#schedule-list").css("display") === 'block') {
                message.schedId = $("#schedule-list").find(":selected").val() == undefined ? 0 : $("#schedule-list").find(":selected").val();
                message.onSched = $("#schedule-list").find(":selected").val() == undefined ? 0 : 1;
            }
            message.replyMessageId = 0;
            console.log(message);
            if (this.isValid1) {
                const msgIns = await axios.post("api/message/insertmessage", message);
                this.resetButton();
                $("#message_tabstripMain").parent().parent().css("display", "none");
                $("#message_tabstripMain .tapstrip-buttons").html();
                console.log(msgIns);
                this.documents = [];
                var dt = msgIns.data;
                $("#importantDiv").html(msgIns.data);
            }
            document.body.classList.toggle("wait");
            /*$('#user_content').load('@Url.Action("UserDetails","User")');*/
        });
        this.data.projectMessages.forEach((item, index) => {
            if (item.documentDb.length > 0) {
                $("#message_tabstrip-" + item.id).kendoTabStrip({
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });
                let onSelect = async (e) => {
                    console.log(e);
                    document.body.classList.toggle("wait");
                    this.getDocUrl(e.item.id, e);
                    console.log(e);
                    e.preventDefault();
                };
                $("#message_tabstrip-" + item.id).data("kendoTabStrip").bind("select", onSelect);
            }
            let replyMsg = document.querySelector("#replyMessage-" + item.id);
            replyMsg.addEventListener("click", async (evt) => {
                let template = $("#second-message-template-" + item.id).html();
                $(".compose-container-reply-new").html("");
                $(".compose-container").html("");
                $("#new-message-container-reply-" + item.id).html(template);
                this.InitializeMessageEventsParam(item.id);
                let tmp1 = document.querySelector("#new-message-reply-" + item.id);
                tmp1.addEventListener("change", async (evt) => {
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
                $(".send-to").change(() => {
                    this.IsDirty = true;
                });
                $(".send-to-reply").change(() => {
                    this.IsDirty = true;
                });
                $(".message-to-reply").change(() => {
                    this.IsDirty = true;
                });
                $(".message-to").change(() => {
                    this.IsDirty = true;
                });
                $(".cc-list-reply").change(() => {
                    this.IsDirty = true;
                });
                $(".schedule-list-reply").change(() => {
                    this.IsDirty = true;
                });
                let uploadDoc = document.querySelector("#addDocumentReply-" + item.id);
                uploadDoc.addEventListener("click", async (evt) => {
                    this.docUpload.ShowForOther($("#hdnbtn").attr('value'), 0, this.data.projectMessages.projectID, "PRO1", item.id);
                });
                var offset = $("#has-cc-reply-" + item.id).position();
                $("#cc-list-reply1-" + item.id).css("left", offset.left);
                $("#cc-list-reply1-" + item.id).css("top", offset.top + 10);
                var offset = $("#has-schedule-reply-" + item.id).position();
                $("#schedule-list-reply-" + item.id).css("left", offset.left);
                $("#schedule-list-reply-" + item.id).css("top", offset.top + 10);
                $(window).resize(function () {
                    var offset = $("#has-cc-reply-" + item.id).position();
                    $("#cc-list-reply1-" + item.id).css("left", offset.left);
                    $("#cc-list-reply1-" + item.id).css("top", offset.top + 10);
                    var offset = $("#has-schedule-reply-" + item.id).position();
                    $("#schedule-list-reply-" + item.id).css("left", offset.left);
                    $("#schedule-list-reply-" + item.id).css("top", offset.top + 10);
                });
                if ($("#hdnbtn").val() == 'Project') {
                    let typeAction = document.querySelector("#message-type-reply-" + item.id);
                    typeAction.addEventListener("change", async (evt) => {
                        var tmp = new Date();
                        $('#dueInp-' + item.id).kendoDatePicker({
                            value: tmp,
                            max: kendo.date.addDays(tmp, 90),
                            min: tmp,
                            format: 'MM/dd/yyyy'
                        });
                        if ($("#message-type-reply-" + item.id).val() == 'Action') {
                            /* $("#secondDiv-" + item.id).removeClass("col-lg-2");
                             $("#secondDiv-" + item.id).addClass("col-lg-1");
                             $("#fourthDiv-" + item.id).removeClass("col-lg-2");
                             $("#fourthDiv-" + item.id).addClass("col-lg-1");
                             $("#fifthDiv-" + item.id).removeClass("col-lg-2");
                             $("#fifthDiv-" + item.id).addClass("col-lg-1");*/
                            $("#actionDivOne-" + item.id).css("display", "block");
                            $("#actionDivOne-" + item.id).addClass("col-lg-2");
                            $("#actionDivTwo-" + item.id).css("display", "block");
                            $("#actionDivTwo-" + item.id).addClass("col-lg-2");
                            $("#actionDivThree-" + item.id).css("display", "block");
                            $("#actionDivThree-" + item.id).addClass("col-lg-2");
                            $("#actionDivThree-" + item.id).addClass("col-mid");
                            $("#actionDivTwo-" + item.id).addClass("col-mid");
                            $("#actionDivOne-" + item.id).addClass("col-mid");
                            $("#secondDiv-" + item.id).addClass("col-mid");
                            $("#thirdDiv-" + item.id).addClass("col-mid");
                            $("#fourthDiv-" + item.id).addClass("col-mid");
                            $("#fifthDiv-" + item.id).addClass("col-mid");
                        }
                        else {
                            /* $("#secondDiv-" + item.id).removeClass("col-lg-1");
                             $("#secondDiv-" + item.id).addClass("col-lg-2");
                             $("#fourthDiv-" + item.id).removeClass("col-lg-1");
                             $("#fourthDiv-" + item.id).addClass("col-lg-2");
                             $("#fifthDiv-" + item.id).removeClass("col-lg-1");
                             $("#fifthDiv-" + item.id).addClass("col-lg-2");*/
                            $("#actionDivOne-" + item.id).css("display", "none");
                            $("#actionDivOne-" + item.id).removeClass("col-lg-2");
                            $("#actionDivTwo-" + item.id).css("display", "none");
                            $("#actionDivTwo-" + item.id).removeClass("col-lg-2");
                            $("#actionDivThree-" + item.id).css("display", "none");
                            $("#actionDivThree-" + item.id).removeClass("col-lg-2");
                            $("#actionDivThree-" + item.id).removeClass("col-mid");
                            $("#actionDivTwo-" + item.id).removeClass("col-mid");
                            $("#actionDivOne-" + item.id).removeClass("col-mid");
                            $("#secondDiv-" + item.id).removeClass("col-mid");
                            $("#thirdDiv-" + item.id).removeClass("col-mid");
                            $("#fourthDiv-" + item.id).removeClass("col-mid");
                            $("#fifthDiv-" + item.id).removeClass("col-mid");
                        }
                    });
                }
                window.onbeforeunload = () => {
                    if (this.IsDirty) {
                        return "Leaving the site will lose your changes";
                    }
                    return;
                };
                let rstBtn = document.querySelector("#cancel-btn-" + item.id);
                rstBtn.addEventListener("click", async (evt) => {
                    this.resetButton();
                    if ($("#hdnbtn").val() == 'Project') {
                        $("#action-type-" + item.id).removeClass("error");
                        $("#dueInp-" + item.id).removeClass("error");
                        $("#action-type-status-" + item.id).removeClass("error");
                    }
                    $("#send-to-reply-" + item.id).removeClass("error");
                    $("#new-message-reply-" + item.id).removeClass("error");
                    $("#new-message-container-reply-" + item.id).html("");
                });
                $(".from-name").val('');
                $(".response-status").val('');
                $(".send-to-reply").val('');
                $(".send-to").val('');
                $(".newMessage").val('');
                $(".dueInp").val('');
                $(".type-status").val('');
                $(".action-type").val('');
                if ($("#hdnbtn").val() == 'Project') {
                    $("#action-type-" + item.id).removeClass("error");
                    $("#dueInp-" + item.id).removeClass("error");
                    $("#action-type-status-" + item.id).removeClass("error");
                }
                $("#send-to-reply-" + item.id).removeClass("error");
                $("#new-message-reply-" + item.id).removeClass("error");
                $("#new-message").removeClass("error");
                let msg = document.querySelector("#new-message-btn-reply-" + item.id);
                msg.addEventListener("click", async (evt) => {
                    document.body.classList.toggle("wait");
                    this.isValid[item.id] = true;
                    $("#send-to-reply-" + item.id).removeClass("error");
                    $("#new-message-reply-" + item.id).removeClass("error");
                    if ($("#hdnbtn").val() == 'Project') {
                        $("#action-type-" + item.id).removeClass("error");
                        $("#dueInp-" + item.id).removeClass("error");
                        $("#action-type-status-" + item.id).removeClass("error");
                    }
                    let message = {};
                    message.projectId = this.data.projectId;
                    message.type = $("#message-type-reply-" + item.id).val();
                    message.itemType = $("#hdnbtn").val();
                    message.itemNo = $("#hdnbtn").val() == 'RFI' ? this.data.rfiId : $("#hdnbtn").val() == 'Project' ? this.data.projectId : 0;
                    message.emailTo = $("#send-to-reply-" + item.id).val();
                    if (message.emailTo == null) {
                        $("#send-to-reply-" + item.id).addClass("error");
                        this.isValid[item.id] = false;
                    }
                    if ($("#hdnbtn").val() == 'Project' && $("#message-type-reply-" + item.id).val() == 'Action') {
                        if ($("#action-type-" + item.id).val() == null) {
                            $("#action-type-" + item.id).addClass("error");
                            this.isValid[item.id] = false;
                        }
                        if ($("#dueInp-" + item.id).val() == '') {
                            $("#dueInp-" + item.id).addClass("error");
                            this.isValid[item.id] = false;
                        }
                        if ($("#action-type-status-" + item.id).val() == null) {
                            $("#action-type-status-" + item.id).addClass("error");
                            this.isValid[item.id] = false;
                        }
                        message.status = $("#action-type-status-" + item.id).val();
                        message.actionType = $("#action-type-" + item.id).val();
                        message.dueDate = $("#dueInp-" + item.id).val();
                    }
                    message.emailBody = $("#new-message-reply-" + item.id).val();
                    message.emailBody = message.emailBody.replace(/(?:\r\n|\r|\n)/g, '<br />');
                    if (message.emailBody == '') {
                        $("#new-message-reply-" + item.id).addClass("error");
                        this.isValid[item.id] = false;
                    }
                    var multiselect = $("#cc-list-reply-" + item.id).val();
                    var selectedData = '';
                    $.each(multiselect, function (i, v) {
                        if (selectedData != '') {
                            selectedData += ",";
                        }
                        selectedData += v;
                    });
                    message.dateRec = new Date().toLocaleString();
                    if (message.dueDate == null) {
                        message.dueDate = new Date().toLocaleDateString();
                    }
                    message.emailCc = selectedData == undefined ? null : selectedData;
                    message.list = this.documents;
                    message.replyMessageId = $("#hdnParenId-" + item.id).val();
                    if ($("#schedule-list-reply-" + item.id).css("display") === 'block') {
                        message.schedId = $("#schedule-list-reply-" + item.id).find(":selected").val();
                        message.onSched = $("#schedule-list-reply-" + item.id).find(":selected").val() == 0 ? 0 : 1;
                    }
                    console.log(message);
                    if (this.isValid[item.id]) {
                        const msgIns = await axios.post("api/message/insertmessage", message);
                        this.resetButton();
                        /* $("#message_tabstripMain-" + item.id).parent().parent().css("display", "none");
                         $("#message_tabstripMain-" + item.id + " .tapstrip-buttons").html();*/
                        console.log(msgIns);
                        this.documents = [];
                        $("#importantDiv").html(msgIns.data);
                    }
                    document.body.classList.toggle("wait");
                });
            });
            /*$(`#response_tabstrip${item.rfiResponseID}`).data("kendoTabStrip").bind("select", onSelect);*/
        });
        /* let responseAttachAddButton = document.querySelector("#response-attach-add-button") as HTMLButtonElement;
         responseAttachAddButton.addEventListener("click", async (evt) => {
             this.docUpload.ShowForRFI(this.data.rFI.rfI_ID, "Response", 0, this.data.rFI.projectID, this.data.rFI.entCode);
         });
 
         $("#response_tabstrip").kendoTabStrip({
             animation: {
                 open: {
                     effects: "fadeIn"
                 }
             }
         });*/
        /*$("#response_tabstrip").data("kendoTabStrip").bind("select", onSelect);*/
        /*this.responses.forEach((item, index) => {
            $(`#response_tabstrip${item.rfiResponseID}`).kendoTabStrip({
                animation: {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });
            /*$(`#response_tabstrip${item.rfiResponseID}`).data("kendoTabStrip").bind("select", onSelect);*/
        //});
    }
    resetButton() {
        this.IsDirty = false;
        $(".newMessage").val('');
        $("#new-message").val('');
        $("#send-to").val('');
        $(".send-to-reply").val('');
        $(".message-type").prop('selectedIndex', 0);
        $(".message-type-reply").prop('selectedIndex', 0);
        $(".has-cc-reply").prop("checked", false);
        $(".has-schedule-reply").prop("checked", false);
        $(".schedule-list-reply").prop('selectedIndex', 0);
        $(".schedule-list-reply").attr("style", "display:none");
        $(".cc-list-reply1").attr("style", "display:none");
        $(".has-cc-reply").val('');
        $(".dueInp").val('');
        $(".type-status").val('');
        $(".action-type").val('');
    }
    resetInputs() {
        this.IsDirty = false;
        $(".responseArea").val('');
        $(".cmbUsers").val('');
        $(".tapstrip-buttons > li").remove();
        /*var tmp = new Date();
        $('.responseResults .response-date').kendoDatePicker(
            {
                value: tmp,
                max: kendo.date.addDays(tmp, 14),
                min: tmp,
                format: 'MM/dd/yyyy'
            });*/
        $(".response-status").prop('selectedIndex', 0);
        $(".response-type").prop('selectedIndex', 0);
        $(".from-name").prop('selectedIndex', 0);
        $("#new-message").val('');
        $(".schedule-list-reply").attr("style", "display:none");
        $(".cc-list-reply1").attr("style", "display:none");
        $(".has-schedule-reply").attr("style", "display:none");
        $(".has-schedule-reply").prop("checked", false);
        $(".has-cc-reply").prop("checked", false);
        $("select.send-to-reply").prop('selectedIndex', 0);
        $(".cclist").val('');
        $(".schedule-list-reply").prop('selectedIndex', 0);
        $(".message-type-reply").prop('selectedIndex', 0);
        $(".send-to-reply").prop('selectedIndex', 0);
        $("#send-to").prop('selectedIndex', 0);
        $(".dueInp").val('');
        $(".type-status").val('');
        $(".action-type").val('');
    }
    //private async getDocUrl(docId: any) {
    //    let docUrl = await axios.get("api/document/GetFile?id=" + docId);
    //    console.log('docUrl', docUrl.data);
    //    window.open(docUrl.data);
    //    document.body.classList.toggle("wait");
    //}
    async getDocUrl(docId, evt) {
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
        console.log('done');
    }
    populate(item) {
        let replyMsg = document.querySelector("#replyMessage-" + item.id);
        replyMsg.addEventListener("click", async (evt) => {
            let template = $("#second-message-template-" + item.id).html();
            $(".compose-container-reply-new").html("");
            $(".compose-container").html("");
            $("#new-message-container-reply-" + item.id).html(template);
            this.InitializeMessageEventsParam(item.id);
            let uploadDoc = document.querySelector("#addDocumentReply-" + item.id);
            uploadDoc.addEventListener("click", async (evt) => {
                this.docUpload.ShowForOther($("#hdnbtn").attr('value'), 0, this.data.projectMessages.projectID, "PRO1", item.id);
            });
            $(".from-name").val('');
            $(".response-status").val('');
            $(".send-to-reply").val('');
            $(".send-to").val('');
            $(".newMessage").val('');
            $(".dueInp").val('');
            $(".type-status").val('');
            $(".action-type").val('');
            if ($("#hdnbtn").val() == 'Project') {
                $("#action-type-" + item.id).removeClass("error");
                $("#dueInp-" + item.id).removeClass("error");
                $("#action-type-status-" + item.id).removeClass("error");
            }
            $("#send-to-reply-" + item.id).removeClass("error");
            $("#new-message-reply-" + item.id).removeClass("error");
            $("#new-message").removeClass("error");
            let msg = document.querySelector("#new-message-btn-reply-" + item.id);
            msg.addEventListener("click", async (evt) => {
                document.body.classList.toggle("wait");
                this.isValid[item.id] = true;
                $("#send-to-reply-" + item.id).removeClass("error");
                $("#new-message-reply-" + item.id).removeClass("error");
                if ($("#hdnbtn").val() == 'Project') {
                    $("#action-type-" + item.id).removeClass("error");
                    $("#dueInp-" + item.id).removeClass("error");
                    $("#action-type-status-" + item.id).removeClass("error");
                }
                let message = {};
                message.projectId = this.data.projectId;
                message.type = $("#message-type-reply-" + item.id).val();
                message.itemType = $("#hdnbtn").val();
                message.itemNo = $("#hdnbtn").val() == 'RFI' ? this.data.rfiId : $("#hdnbtn").val() == 'Project' ? this.data.projectId : 0;
                message.emailTo = $("#send-to-reply-" + item.id).val();
                if (message.emailTo == null) {
                    $("#send-to-reply-" + item.id).addClass("error");
                    this.isValid[item.id] = false;
                }
                if ($("#hdnbtn").val() == 'Project' && $("#message-type-reply-" + item.id).val() == 'Action') {
                    if ($("#action-type-" + item.id).val() == null) {
                        $("#action-type-" + item.id).addClass("error");
                        this.isValid[item.id] = false;
                    }
                    if ($("#dueInp-" + item.id).val() == '') {
                        $("#dueInp-" + item.id).addClass("error");
                        this.isValid[item.id] = false;
                    }
                    if ($("#action-type-status-" + item.id).val() == null) {
                        $("#action-type-status-" + item.id).addClass("error");
                        this.isValid[item.id] = false;
                    }
                    message.status = $("#action-type-status-" + item.id).val();
                    message.actionType = $("#action-type-" + item.id).val();
                    message.dueDate = $("#dueInp-" + item.id).val();
                }
                message.emailBody = $("#new-message-reply-" + item.id).val();
                message.emailBody = message.emailBody.replace(/(?:\r\n|\r|\n)/g, '<br />');
                if (message.emailBody == '') {
                    $("#new-message-reply-" + item.id).addClass("error");
                    this.isValid[item.id] = false;
                }
                message.dateRec = new Date().toLocaleString();
                if (message.dueDate == null) {
                    message.dueDate = new Date().toLocaleDateString();
                }
                var multiselect = $("#cc-list-reply-" + item.id).val();
                var selectedData = '';
                $.each(multiselect, function (i, v) {
                    if (selectedData != '') {
                        selectedData += ",";
                    }
                    selectedData += v;
                });
                message.emailCc = selectedData == undefined ? null : selectedData;
                message.list = this.documents;
                message.replyMessageId = $("#hdnParenId-" + item.id).val();
                if ($("#schedule-list-reply-" + item.id).css("display") === 'block') {
                    message.schedId = $("#schedule-list-reply-" + item.id).find(":selected").val();
                    message.onSched = $("#schedule-list-reply-" + item.id).find(":selected").val() == 0 ? 0 : 1;
                }
                console.log(message);
                if (this.isValid[item.id]) {
                    const msgIns = await axios.post("api/message/insertmessage", message);
                    this.resetButton();
                    /* $("#message_tabstripMain-" + item.id).parent().parent().css("display", "none");
                     $("#message_tabstripMain-" + item.id + " .tapstrip-buttons").html();*/
                    console.log(msgIns);
                    this.documents = [];
                    $("#importantDiv").html(msgIns.data);
                }
                document.body.classList.toggle("wait");
            });
        });
    }
    async InitializeMessageEventsParam(id) {
        $("#has-cc-reply-" + id).on("click", function () {
            if ($(this).is(":checked")) {
                $("#schedule-list-reply-" + id).slideUp();
                $("#cc-list-reply1-" + id).show();
                if ($("#cc-list-reply1-" + id + " .k-multiselect").length == 0) {
                    $("#cc-list-reply-" + id).kendoMultiSelect({
                        dataTextField: "name",
                        dataValueField: "param",
                        filter: "contains",
                        autoClose: false
                    }).data("kendoMultiSelect");
                }
            }
            else {
                $("#cc-list-reply1-" + id).hide();
            }
        });
        $("#has-schedule-reply-" + id).on("click", function () {
            if ($(this).is(":checked")) {
                $("#cc-list-reply1-" + id).hide();
                $("#schedule-list-reply-" + id).slideDown();
            }
            else {
                $("#schedule-list-reply-" + id).slideUp();
            }
        });
    }
    async InitializeMessageEvents() {
        $("#has-cc").on("click", function () {
            if ($(this).is(":checked")) {
                $("#schedule-list").slideUp();
                $("#cc-list1").show();
                console.log($("#cc-list1 .k-multiselect"));
                if ($("#cc-list1 .k-multiselect").length == 0) {
                    $("#cc-list").kendoMultiSelect({
                        autoClose: false
                    }).data("kendoMultiSelect");
                }
            }
            else {
                $("#cc-list1").hide();
                /* $("#cc-list").hide();*/
            }
        });
        $("#has-schedule").on("click", function () {
            if ($(this).is(":checked")) {
                $("#cc-list1").hide();
                $("#schedule-list").slideDown();
            }
            else {
                $("#schedule-list").slideUp();
            }
        });
    }
}
