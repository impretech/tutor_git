import axiosES6 from "../lib/axios/axios.esm.min.js";
import { DocUploadModal } from "./modals/doc-upload-modal.js";
const axios = axiosES6;
export class MessageHelper {
    constructor(data) {
        this.documents = [];
        this.isValid = [];
        this.IsDirty = false;
        this.data = data;
        console.log(this.data);
        this.init();
    }
    async init() {
        this.docUpload = new DocUploadModal();
        this.BuildAttachments();
        window.addEventListener('attachupdate', (e) => {
            console.log("attachupdate", e);
            let detail = e.detail;
            if (detail.type == "Message") {
                this.documents.push(detail.docID);
                if (detail.element == null) {
                    if ($("#message_tabstripMain .tapstrip-buttons").find("#" + detail.docID).length == 0) {
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
                    <li title="${detail.docID}-${detail.fileName}" style="bottom:-10px;margin-bottom:10px;"  id="${detail.docID}">${detail.docID}</li>
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
    async BuildAttachments() {
        this.data.projectMessages.forEach((item, index) => {
            //console.log(item);
            if (item.documentDb.length > 0) {
                $("#message_tabstrip-" + item.id).kendoTabStrip({
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
                $("#message_tabstrip-" + item.id).data("kendoTabStrip").bind("select", onSelect);
            }
            let replyMsg = document.querySelector("#replyMessage-" + item.id);
            replyMsg.addEventListener("click", async (evt) => {
                let template = $("#second-message-template-" + item.id).html();
                $(".compose-container-reply-new").html("");
                $(".compose-container").html("");
                $("#new-message-container-reply-" + item.id).html(template);
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
                this.InitializeMessageEventsParam(item.id);
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
                            /* $("#secondDiv-" + item.id).addClass("col-lg-2");
                             $("#secondDiv-" + item.id).removeClass("col-lg-1");
                             $("#fourthDiv-" + item.id).addClass("col-lg-2");
                             $("#fourthDiv-" + item.id).removeClass("col-lg-1");
                             $("#fifthDiv-" + item.id).addClass("col-lg-2");
                             $("#fifthDiv-" + item.id).removeClass("col-lg-1");*/
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
                    message.itemNo = $("#hdnbtn").val() == 'RFI' ? item.itemNo : $("#hdnbtn").val() == 'Project' ? this.data.projectId : 0;
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
                    console.log(this.isValid[item.id]);
                    var multiselect = $("#cc-list-reply-" + item.id).val();
                    var selectedData = '';
                    $.each(multiselect, function (i, v) {
                        if (selectedData != '') {
                            selectedData += ",";
                        }
                        selectedData += v;
                    });
                    message.dateRec = new Date().toLocaleString();
                    message.dueDate = new Date().toLocaleDateString();
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
                        /*$("#message_tabstripMain-" + item.id).parent().parent().css("display", "none");
                        $("#message_tabstripMain-" + item.id + " .tapstrip-buttons").html();*/
                        console.log(msgIns);
                        this.resetButton();
                        this.documents = [];
                        $("#importantDiv").html(msgIns.data);
                        this.BuildAttachments();
                    }
                    document.body.classList.toggle("wait");
                });
            });
            /*$(`#response_tabstrip${item.rfiResponseID}`).data("kendoTabStrip").bind("select", onSelect);*/
            // $(".from-name").val('');
            // $(".response-status").val('');
            $(".send-to-reply").val('');
            $(".send-to").val('');
        });
    }
    resetButton() {
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
        /* var tmp = new Date();
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
        $(".has-schedule-reply").attr("style", "display:none");
        $(".cc-list-reply1").attr("style", "display:none");
        $(".has-schedule-reply").prop("checked", false);
        $(".has-cc-reply").prop("checked", false);
        $("select.send-to-reply").prop('selectedIndex', 0);
        $(".cclist").val('');
        $(".schedule-list-reply").prop('selectedIndex', 0);
        $(".message-type-reply").prop('selectedIndex', 0);
        $(".send-to-reply").prop('selectedIndex', 0);
        $(".dueInp").val('');
        $(".type-status").val('');
        $(".action-type").val('');
    }
    async getDocUrl(docId, evt) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        console.log('docUrl', docUrl.data);
        window.open(docUrl.data);
        $(evt.contentElement).html("");
        document.body.classList.toggle("wait");
    }
}
