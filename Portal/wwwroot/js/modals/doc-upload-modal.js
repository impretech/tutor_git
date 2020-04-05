import axiosES6 from "../../lib/axios/axios.esm.min.js";
const axios = axiosES6;
import { Modal } from "../components/modal.js";
export class DocUploadModal {
    constructor() {
        this.init();
    }
    init() {
        this.modal = new Modal();
        let html = "<div class='box'><h2>Document Upload</h2></div>";
        html = html + "<div style='display: flex;flex-direction: row;align-items: center; margin-top:40px;padding: 0 20px;'><div class='demo-section k-content wide' style='width: 50%;flex:1;padding-right:20px;'><div class='wrapper' style='display: flex;justify-content: center;'><div class='dropZoneElement' style='height: 100px; width: 50%; border: 2px solid #999; visibility:visible;'><div class='textWrapper'><p class='dropImageHereText'>Drop document here to upload</p></div></div></div></div>";
        html = html + "<input name='files' class='files' id='files' type='file' /></div>";
        let html1 = "<div class='k-widget k-upload k-header k-upload-empty'><div class='k-dropzone'><div class='k - button k-upload-button' aria-label='Select files...'><input name='files' id='files' type='file' data-role='upload' multiple='multiple' autocomplete='off'><span>Select files...</span></div><em>Drop files here to upload</em></div></div></div>";
        this.modal.SetContent(html);
    }
    removeAllFiles() {
        $(".files").data("kendoUpload").removeAllFiles();
    }
    Show(projectid, entcode, itemtype, itemid) {
        this.modal.Show();
        $("#files").kendoUpload({
            async: {
                saveUrl: "/upload/saveAsync",
                removeUrl: "/upload/remove",
                autoUpload: true
            },
            showFileList: false,
            upload: function (e) {
                let uploadData = {};
                uploadData.projectID = projectid;
                uploadData.itemType = itemtype;
                uploadData.ItemNo = itemid,
                    uploadData.entCode = entcode;
                e.data = uploadData;
                console.log("KendoUpload", uploadData);
            },
            validation: {
                allowedExtensions: [".txt", ".doc", ".docx", ".pdf", ".png", ".jpg", ".xls", ".xlsx"]
            },
            success: this.OnSuccess,
            dropZone: ".dropZoneElement"
        });
    }
    OnSuccess(e) {
        console.log(e);
    }
    ShowForSubmittal(submittalID, type, projectid, entcode) {
        this.modal.Show();
        $("#files").kendoUpload({
            async: {
                saveUrl: "/upload/saveAsync",
                removeUrl: "/upload/remove",
                autoUpload: true
            },
            upload: function (e) {
                let uploadData = {};
                uploadData.projectID = projectid;
                uploadData.itemType = "Submittal";
                uploadData.ItemNo = submittalID,
                    uploadData.entCode = entcode;
                e.data = uploadData;
                console.log("KendoUpload", uploadData);
            },
            validation: {
                allowedExtensions: [".txt", ".doc", ".docx", ".pdf", ".png", ".jpg", ".xls", ".xlsx"]
            },
            success: (e) => {
                e.response.forEach((element) => {
                    this.InsertSubDocLink(element, submittalID, type);
                });
                $(".k-upload-files.k-reset").find("li").remove();
            },
            dropZone: ".dropZoneElement"
        });
    }
    InsertSubDocLink(uid, submittalID, type) {
        let subdocData = {};
        subdocData.SubmittalDocLinkID = submittalID;
        subdocData.SubmittalID = submittalID;
        subdocData.Type = type;
        subdocData.DocID = uid;
        console.log('insert', subdocData);
        const subDocInsert = axios.post("api/Submittal/InsertSubDocLink", subdocData);
    }
    ShowForRFI(rfI_ID, type, responseid, projectid, entcode) {
        this.modal.Show();
        $("#files").kendoUpload({
            async: {
                saveUrl: "/upload/saveAsync",
                removeUrl: "/upload/remove",
                autoUpload: true
            },
            upload: function (e) {
                let uploadData = {};
                uploadData.projectID = projectid;
                uploadData.itemType = "RFI";
                uploadData.ItemNo = rfI_ID,
                    uploadData.entCode = entcode;
                e.data = uploadData;
                console.log("KendoUpload", uploadData);
            },
            validation: {
                allowedExtensions: [".txt", ".doc", ".docx", ".pdf", ".png", ".jpg", ".xls", ".xlsx"]
            },
            success: (e) => {
                console.log("Upload Success", e);
                e.response.forEach((element) => {
                    this.InsertRFIDocLink(element, rfI_ID, type, responseid);
                });
            },
            dropZone: ".dropZoneElement"
        });
    }
    InsertRFIDocLink(uid, rfI_ID, type, responseid) {
        let rfidocData = {};
        rfidocData.rfI_ID = rfI_ID;
        rfidocData.itemID = responseid;
        rfidocData.type = type;
        rfidocData.docID = uid;
        console.log('insert', rfidocData);
        const rfiDocInsert = axios.post("api/rfi/InsertRFIDocLink", rfidocData).then((res) => {
            console.log(res);
            var event = new CustomEvent('attachupdate', { detail: { 'type': type, 'responseid': responseid, 'docID': uid } });
            // Dispatch the event.
            window.dispatchEvent(event);
        });
    }
    ShowForQuote(itemID, itemType, projectID, quoteID, entcode) {
        let html = "<div class='box'><h2>Document Upload</h2></div>";
        html = html + "<div style='display: flex;flex-direction: row;align-items: center; margin-top:40px;padding: 0 20px;'><div class='demo-section k-content wide' style='width: 50%;flex:1;padding-right:20px;'><div class='wrapper' style='display: flex;justify-content: center;'><div class='dropZoneElement' style='height: 100px; width: 100%; border: 2px solid #999; visibility:visible;'><div class='textWrapper'><p class='dropImageHereText'>Drop document here to upload</p></div></div></div></div>";
        html = html + "<input name='files' id='files' type='file' /></div>";
        this.modal.SetContent(html);
        this.modal.Show();
        var kendoUpload = $("#files").data("kendoUpload");
        if (kendoUpload) {
            console.log('exist');
            kendoUpload.clearAllFiles();
            kendoUpload.destroy();
        }
        $("#files").kendoUpload({
            async: {
                saveUrl: "/upload/saveAsync",
                removeUrl: "/upload/remove",
                autoUpload: false
            },
            upload: function (e) {
                let uploadData = {};
                uploadData.projectID = projectID;
                uploadData.itemType = "Quote";
                uploadData.ItemNo = quoteID;
                uploadData.entCode = entcode;
                e.data = uploadData;
                console.log("KendoUpload", uploadData);
            },
            validation: {
                allowedExtensions: [".txt", ".doc", ".docx", ".pdf", ".png", ".jpg", ".xls", ".xlsx"]
            },
            success: (e) => {
                console.log("Upload Success", e);
                e.response.forEach((element) => {
                    this.InsertQuoteDocLink(element, itemID, itemType);
                });
            },
            dropZone: ".dropZoneElement"
        });
    }
    InsertQuoteDocLink(DocID, itemID, itemType) {
        let docData = {};
        //        docData.DocLinkID = quoteID;
        docData.ItemNo = itemID;
        docData.ItemType = itemType;
        docData.DocID = DocID;
        console.log('insert', docData);
        const quoteDocInsert = axios.post("api/quote/InsertQuoteDocLink", docData).then((res) => {
            //                console.log('quotedocInsert', res);
            var event = new CustomEvent('quotedocinsert', { detail: { 'type': itemType, 'itemid': itemID, 'docID': DocID } });
            console.log('trigger evevnt');
            // Dispatch the event.
            window.dispatchEvent(event);
        });
    }
    ShowForOther(type, messageid, projectid, entcode, element1) {
        this.modal = new Modal();
        let html = "<div class='box'><h2>Document Upload</h2></div>";
        html = html + "<div style='display: flex;flex-direction: row;align-items: center; margin-top:40px;padding: 0 20px;'><div class='demo-section k-content wide' style='width: 50%;flex:1;padding-right:20px;'><div class='wrapper' style='display: flex;justify-content: center;'><div class='dropZoneElement' style='height: 100px; width: 50%; border: 2px solid #999; visibility:visible;'><div class='textWrapper'><p class='dropImageHereText'>Drop document here to upload</p></div></div></div></div>";
        html = html + "<input name='files' class='files' id='files' type='file' /></div>";
        let html1 = "<div class='k-widget k-upload k-header k-upload-empty'><div class='k-dropzone'><div class='k - button k-upload-button' aria-label='Select files...'><input name='files' id='files' type='file' data-role='upload' multiple='multiple' autocomplete='off'><span>Select files...</span></div><em>Drop files here to upload</em></div></div></div>";
        this.modal.SetContent(html);
        this.modal.Show();
        $(".files").kendoUpload({
            async: {
                saveUrl: "/upload/saveAsync",
                removeUrl: "/upload/remove",
                autoUpload: true
            },
            upload: function (e) {
                let uploadData = {};
                uploadData.projectID = projectid;
                uploadData.itemType = type;
                uploadData.ItemNo = messageid,
                    uploadData.entCode = entcode;
                e.data = uploadData;
                console.log("KendoUpload", uploadData);
            },
            validation: {
                allowedExtensions: [".txt", ".doc", ".docx", ".pdf", ".png", ".jpg", ".xls", ".xlsx"]
            },
            success: (e) => {
                e.response.forEach((element) => {
                    this.InsertMessageDocLink(element, messageid, type, element1);
                    console.log('Upload Success', element);
                });
            },
            dropZone: ".dropZoneElement"
        });
    }
    InsertMessageDocLink(uid, messageid, type, element) {
        let docData = {};
        docData.itemNo = messageid;
        docData.itemType = "Message";
        docData.docID = uid;
        console.log('insert', docData);
        const messageDocInsert = axios.post("api/message/InsertMessageDocLink", docData).then((res) => {
            console.log(res);
            var event = new CustomEvent('attachupdate', { detail: { 'type': docData.itemType, 'messageid': messageid, 'docID': uid, 'element': element } });
            // Dispatch the event.
            window.dispatchEvent(event);
        });
    }
}
