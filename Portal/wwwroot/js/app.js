import axiosES6 from "../lib/axios/axios.esm.min.js";
const axios = axiosES6;
import PerfectScrollbar from "../lib/perfect-scrollbar/dist/perfect-scrollbar.esm.min.js";
import { Utilities } from "./utilities.js";
import { Modal } from "./components/modal.js";
export class App {
    constructor() {
        this.init();
    }
    init() {
        this.GetCurrentUser();
        //const db = new window.Dexie('MyDatabase');
        axios.defaults.baseURL = '/';
        this.preloader = document.getElementById("preloader");
        this.nav = document.querySelector("nav");
        this.logo = document.querySelector(".logo");
        this.sidebar = document.querySelector(".sidebar");
        this.pushpin = document.querySelector(".push-pin a");
        this.rightPane = document.querySelector("#right-pane");
        this.rightSidebar = document.querySelector(".right-sidebar");
        this.rightPushpin = document.querySelector(".right-push-pin a");
        this.menuItems = document.querySelectorAll(".main-menu a");
        this.searchBar = document.querySelector(".search-bar");
        this.setupMenu();
        this.loadDockingConfig();
        this.setupDocking();
        this.setupScrollbars();
        this.setupSearchBar();
        this.getMessages();
        this.getCount();
        this.getDocuments();
        this.modal = new Modal();
        this.setupBackButton();
        window.addEventListener("load", () => {
            this.pageReady();
        });
        window.addEventListener("resize", () => {
            if (window.innerWidth < 1366) {
                if (localStorage.getItem("docked") === "true") {
                    this.pushpin.click();
                }
                if (localStorage.getItem("right-docked") === "true") {
                    this.rightPushpin.click();
                }
            }
        });
    }
    setupBackButton() {
        let backButton = document.querySelector(".back-button");
        if (backButton !== null) {
            backButton.addEventListener("click", async (evt) => {
                evt.preventDefault();
                history.back();
            });
        }
    }
    async getMessages() {
        const msgResponse = await axios.get("api/message/getMessageByUser?user=null&count=3&cleanseHTML=true");
        const unreadedMsg = await axios.get("api/message/getUnreadMessageByUser?user=null&cleanseHTML=true");
        let count = 0;
        let html = "";
        let html1 = "";
        console.log(unreadedMsg.data);
        unreadedMsg.data.forEach((item, index) => {
            console.log(index);
            let tmpCl;
            html = html + "<li class=" + tmpCl + "><div><a id=\"msgID" + item.messageID + "\">Message from " + item.emailFrom + "<br>   Date: " + new Date(item.dateRec).toLocaleString() + "</a></div></li>";
        });
        $(".notification-bar").empty();
        $(".notification-bar").append(html);
        unreadedMsg.data.forEach((item, index) => {
            var doc = document.querySelector("#msgID" + item.messageID);
            doc.addEventListener("click", async (evt) => {
                evt.preventDefault();
                item.isRead = true;
                var temp = $(".outlook-365").find("a[data-id=" + item.messageID + "]").find(".fa-exclamation-circle").remove();
                // console.log(temp);
                this.getMessage(item.messageID);
                $("a#msgID" + item.messageID).parent().parent().remove();
                let num = parseInt($(".messageCounter").html());
                num = num - 1;
                $(".messageCounter").html(num.toString());
                if (num == 0) {
                    html = "";
                    $(".notification-bar").remove();
                    $(".notification-bar").append(html);
                    $(".panel").css("display", "none");
                    $(".messageCounter").attr("style", "display:none");
                }
                const updateMsg = await axios.put("api/message/UpdateMessage", item);
                //this.getCount();
                // this.getMessages();
            });
        });
        //$(".notification-bar").after(html1);
        this.buildMessages(msgResponse.data);
    }
    async getCount() {
        const msg = await axios.get("api/message/getMessageNotifyCountbyEmail?email=" + this.mail);
        console.log(msg.data);
        $(".messageCounter").attr("style", "");
        $(".messageCounter").html(msg.data);
        if (msg.data == 0) {
            $(".panel").css("display", "none");
            $(".messageCounter").attr("style", "display:none");
        }
    }
    async buildMessages(data) {
        let container = document.querySelector(".outlook-365 > .content");
        container.innerHTML = "";
        for (const msg of data) {
            let anchor = document.createElement("a");
            anchor.href = "#";
            anchor.dataset.id = msg.messageID;
            anchor.addEventListener("click", async (evt) => {
                evt.preventDefault();
                let a = evt.currentTarget;
                let msgID = a.dataset.id;
                this.getMessage(msgID);
            });
            let div = document.createElement("div");
            div.classList.add("outlook-365-item");
            div.title = msg.emailBody;
            let divEmail = document.createElement("div");
            divEmail.classList.add("email");
            let tm = msg.isRead ? "" : "<i class=\"fa fa-exclamation-circle\" aria-hidden=\"true\" title=\"No reply has been sent\"></i>";
            divEmail.innerHTML = tm + " " + msg.emailFrom + " (" + msg.type + ")";
            let divTS = document.createElement("div");
            divTS.classList.add("timestamp");
            divTS.innerHTML = Utilities.FormatDateTimeString(msg.dateRec);
            let divMessage = document.createElement("div");
            divMessage.classList.add("message");
            divMessage.innerHTML = msg.emailSubject == null ? msg.emailBody.substring(0, 40) : msg.emailSubject.substring(0, 40);
            div.appendChild(divEmail);
            div.appendChild(divTS);
            div.appendChild(divMessage);
            anchor.appendChild(div);
            container.appendChild(anchor);
        }
    }
    async GetCurrentUser() {
        this.email = "ledwards@prosysusa.com"; //userData.data.userEmail;
        let userData = await axios.get("api/budget/GetCurrentUser");
        this.mail = userData.data.userEmail;
        console.log(this.mail);
        $("#logged_in_user").html(userData.data.userName);
    }
    async getMessage(msgId) {
        let docUrl = await axios.get("api/message/getMessageByID?messid=" + msgId);
        console.log('message', docUrl);
        let html = "";
        const item = docUrl.data;
        //        if (item.itemType == 'Email') {
        let headerDiv = document.createElement("div");
        headerDiv.className = "email-header";
        let ToSpan = document.createElement("div");
        ToSpan.innerText = "To: " + item.emailTo;
        headerDiv.appendChild(ToSpan);
        let fromSpan = document.createElement("di");
        fromSpan.innerText = "From: " + item.emailFrom;
        headerDiv.appendChild(fromSpan);
        let subSpan = document.createElement("div");
        subSpan.innerText = "Subject: " + item.emailSubject;
        headerDiv.appendChild(subSpan);
        let dateSpan = document.createElement("div");
        dateSpan.innerText = "Sent: " + item.dateRec;
        headerDiv.appendChild(dateSpan);
        //        }
        //html += `
        //<div id="outlookEmailBox">
        //    <div class="top-area">
        //        <div class="email-header">
        //            <div>To: DocPortal@prosysusa.com; </div>
        //            <div>From: LEdwards@prosysusa.com</div>
        //            <div>Subject: Fw: This is a test RFI {RFI:PRO1-L123}</div>
        //            <div>Sent: 2019-05-13T11:57:26.71</div>
        //        </div>
        //    </div>
        //     <div id="outlookEmailBody">
        //        ${item.emailBody}
        //    </div>
        //</div>
        //`;
        html += `<div class="messageTitle">Message Info</div>
        <div id="outlookEmailBox">
            <div class="top-area">
                <div class="email-header1">
                    <div><span>To:</span> ${item.emailTo}</div>
                    <div><span>From:</span> ${item.emailFrom}</div>
                    <div><span>Subject:</span> ${item.emailSubject}</div>
                    <div><span>Sent:</span> ${item.dateRec}</div>
                </div>
            </div>
            <div class="msgBody">
                <button class="btnmain gray" id="viewBtn${item.messageID}" style="float:left">View Item</button>
                    <div id="message_tabstrip_test-${item.messageID}" class="message_tabstrip" style="margin:5px;float:left;">
                             <ul class="tapstrip-buttons"></ul>
                                </div>
                <div style="clear:both"></div>
            <div class="msgTxt">Message body:</div>
             <div id="outlookEmailBody">
                ${item.emailBody}
            </div>
            </div>
        </div>
        `;
        this.modal.SetContent(html);
        this.modal.Show();
        $(".modal-container .close-button").attr("style", "font-size:30px;z-index:999");
        $(".modal-container").css("border", "1px solid #666");
        $(".modal-container").css("height", "auto");
        let sendBtn = document.querySelector("#viewBtn" + item.messageID);
        sendBtn.addEventListener("click", async (evt) => {
            let pm = item.itemType == 'RFI' ? 'rfis' : 'projects';
            window.location.href = "/" + pm + "/" + item.itemNo;
        });
        const msgIns = await axios.get("api/message/getMessageDoc?messid=" + item.messageID + "&type=" + item.itemType);
        msgIns.data.forEach((it, ind) => {
            $("#message_tabstrip_test-" + item.messageID + " .tapstrip-buttons").append(`
                    <li title="${it.docID}-${it.name}"  id="${it.docID}"><i class="fa fa-file" aria-hidden="true"></i><span style="z-index:999;color:#fff">${it.docID}</span></li>
                `);
            $("#message_tabstrip_test-" + item.messageID).kendoTabStrip({
                animation: {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });
            let onSelectKendo12 = async (e) => {
                document.body.classList.toggle("wait");
                this.getDocUrl(e.item.id);
                e.preventDefault();
            };
            $("#message_tabstrip_test-" + item.messageID).data("kendoTabStrip").bind("select", onSelectKendo12);
        });
    }
    async getDocuments() {
        const docResponse = await axios.get("api/document/GetDocsByUser?user=l. edwards&count=4");
        this.buildDocs(docResponse.data);
    }
    async getDocUrl(docId) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        window.open(docUrl.data);
        document.body.classList.toggle("wait");
    }
    async buildDocs(data) {
        let container = document.querySelector(".doc-portal > .content");
        container.innerHTML = "";
        for (const doc of data) {
            let anchor = document.createElement("a");
            anchor.href = "#";
            anchor.dataset.id = doc.docID;
            anchor.addEventListener("click", async (evt) => {
                evt.preventDefault();
                document.body.classList.toggle("wait");
                let a = evt.currentTarget;
                let docId = a.dataset.id;
                this.getDocUrl(docId);
            });
            let div = document.createElement("div");
            div.classList.add("doc-item");
            let svgType = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgType.classList.add("menu-icon");
            svgType.style.fill = "#B1878A";
            let useSVG = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            useSVG.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/images/icons.svg#file-pdf');
            svgType.appendChild(useSVG);
            let divInfo = document.createElement("div");
            divInfo.classList.add("file-info");
            let divName = document.createElement("div");
            divName.classList.add("file-name");
            divName.innerHTML = doc.name;
            divInfo.appendChild(divName);
            let divSize = document.createElement("div");
            divSize.classList.add("file-size");
            divSize.innerHTML = Utilities.formatBytes(doc.fileLength);
            divInfo.appendChild(divSize);
            let svgDownload = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgDownload.classList.add("menu-icon");
            svgDownload.style.fill = "#666";
            let useSVG2 = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            useSVG2.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/images/icons.svg#cloud-download-alt');
            svgDownload.appendChild(useSVG2);
            div.appendChild(svgType);
            div.appendChild(divInfo);
            div.appendChild(svgDownload);
            anchor.appendChild(div);
            container.appendChild(anchor);
        }
    }
    setupMenu() {
        if (this.menuItems.length > 0) {
            this.loadMenuConfig();
            for (const menuItem of this.menuItems) {
                menuItem.addEventListener('click', (event) => {
                    var link = event.currentTarget;
                    var closestListItem = link.closest("li");
                    if (closestListItem.lastElementChild && closestListItem.lastElementChild.tagName === "UL") { //parent menu item
                        if (closestListItem.classList.contains("active")) {
                            this.storeMenuConfig(link.id, false);
                        }
                        else {
                            this.storeMenuConfig(link.id, true);
                        }
                        closestListItem.classList.toggle("active");
                        setTimeout(() => {
                            this.scrollbar.update();
                        }, 100);
                    }
                });
            }
        }
    }
    loadMenuConfig() {
        if (localStorage.getItem("menu") !== null) {
            const menuString = localStorage.getItem("menu");
            const menuArray = menuString.split(",");
            for (const menuItem of menuArray) {
                const link = document.getElementById(menuItem);
                if (link != null) {
                    const closestListItem = link.closest("li");
                    closestListItem.classList.add("active");
                }
            }
        }
        else { //open first menu item and store
            const first = document.querySelector(".main-menu a");
            const closestListItem = first.closest("li");
            closestListItem.classList.add("active");
            this.storeMenuConfig(first.id, true);
        }
    }
    storeMenuConfig(id, add) {
        if (localStorage.getItem("menu")) {
            const menuString = localStorage.getItem("menu");
            const menuArray = menuString.split(",");
            if (menuArray.indexOf(id) > -1) {
                if (!add) {
                    menuArray.splice(menuArray.indexOf(id), 1);
                    localStorage.setItem("menu", menuArray.join(","));
                }
            }
            else {
                if (add) {
                    localStorage.setItem("menu", (localStorage.getItem("menu") + "," + id));
                }
            }
        }
        else {
            if (add) {
                localStorage.setItem("menu", id);
            }
        }
    }
    loadDockingConfig() {
        if (localStorage.getItem("docked") === "false") {
            this.nav.classList.add("show-slider");
            this.sidebar.classList.add("floating");
            this.pushpin.parentElement.classList.toggle("pushed");
            //this.searchBar.classList.add("collapsed");
            //this.logo.classList.add("collapsed");
            this.nav.classList.remove("docked");
            this.sidebar.classList.remove("visible");
            this.sidebar.addEventListener("mouseleave", this.navMouseLeave);
            this.pushpin.addEventListener("mouseenter", this.navMouseEnter);
            this.pushpin.addEventListener("mouseleave", this.pushPinMouseLeave);
        }
        else { // no previous setting or true, nothing to do as this is default load
            this.storeDockingConfig("true");
        }
        if (localStorage.getItem("right-docked") === "false") {
            this.rightPushpin.parentElement.classList.toggle("pushed");
            this.rightPane.classList.remove("docked");
            this.rightSidebar.classList.remove("visible");
        }
        else { // no previous setting or true, nothing to do as this is default load
            this.storeRightDockingConfig("true");
        }
    }
    storeDockingConfig(val) {
        localStorage.setItem("docked", val);
    }
    storeRightDockingConfig(val) {
        localStorage.setItem("right-docked", val);
    }
    pushPinMouseLeave(e) {
        if (e.relatedTarget == null || e.relatedTarget.classList.contains("push-pin") || e.relatedTarget.classList.contains("sidebar") || e.relatedTarget.offsetParent.classList.contains("sidebar")) {
            //moved over the menu, so leave it open
        }
        else {
            document.querySelector(".sidebar").classList.remove("visible");
        }
    }
    navMouseLeave() {
        document.querySelector(".sidebar").classList.remove("visible");
    }
    navMouseEnter() {
        document.querySelector(".sidebar").classList.add("visible");
    }
    setupDocking() {
        this.pushpin.addEventListener("click", (e) => {
            if (this.pushpin.classList.contains('running'))
                return;
            this.pushpin.classList.add("running");
            if (this.nav.classList.contains("docked")) {
                this.storeDockingConfig("false");
                this.nav.classList.add("show-slider");
                this.sidebar.classList.add("floating");
                setTimeout(() => {
                    this.pushpin.parentElement.classList.toggle("pushed");
                    //this.searchBar.classList.add("collapsed");
                    //this.logo.classList.add("collapsed");
                    this.nav.classList.remove("docked");
                    this.sidebar.classList.remove("visible");
                    setTimeout(() => {
                        this.sidebar.addEventListener("mouseleave", this.navMouseLeave);
                        this.pushpin.addEventListener("mouseenter", this.navMouseEnter);
                        this.pushpin.addEventListener("mouseleave", this.pushPinMouseLeave);
                        this.pushpin.classList.remove("running");
                    }, 500);
                }, 500);
            }
            else {
                this.storeDockingConfig("true");
                this.sidebar.removeEventListener("mouseleave", this.navMouseLeave);
                this.pushpin.removeEventListener("mouseenter", this.navMouseEnter);
                this.pushpin.removeEventListener("mouseleave", this.pushPinMouseLeave);
                this.pushpin.parentElement.classList.toggle("pushed");
                this.sidebar.classList.add("visible");
                //this.logo.classList.remove("collapsed");
                //this.searchBar.classList.remove("collapsed");
                this.nav.classList.add("docked");
                setTimeout(() => {
                    this.nav.classList.remove("show-slider");
                    this.sidebar.classList.remove("floating");
                    this.pushpin.classList.remove("running");
                }, 500);
            }
        }, false);
        this.rightPushpin.addEventListener("click", (e) => {
            if (this.rightPushpin.classList.contains('running'))
                return;
            this.rightPushpin.classList.add("running");
            if (this.rightPane.classList.contains("docked")) {
                this.storeRightDockingConfig("false");
                this.rightPushpin.parentElement.classList.toggle("pushed");
                this.rightPane.classList.remove("docked");
                this.rightSidebar.classList.remove("visible");
                setTimeout(() => {
                    this.rightPushpin.classList.remove("running");
                }, 500);
            }
            else {
                this.storeRightDockingConfig("true");
                this.rightPushpin.parentElement.classList.toggle("pushed");
                this.rightSidebar.classList.add("visible");
                this.rightPane.classList.add("docked");
                setTimeout(() => {
                    this.rightPushpin.classList.remove("running");
                }, 500);
            }
        }, false);
    }
    turnOnTransitions() {
        setTimeout(() => {
            const hiddenClasses = document.querySelectorAll(".hide-transitions");
            for (const classes of hiddenClasses) {
                classes.classList.remove("hide-transitions");
            }
        }, 500);
    }
    ;
    setupScrollbars() {
        this.scrollbar = new PerfectScrollbar('.sidebar', {
            scrollXMarginOffset: 5
        });
        this.rightScrollbar = new PerfectScrollbar('.right-sidebar', {
            scrollXMarginOffset: 5
        });
    }
    ;
    pageReady() {
        this.preloader.style.display = "none";
        this.turnOnTransitions();
    }
    setupSearchBar() {
        document.querySelector(".search-bar-button").addEventListener("click", (event) => {
            this.searchBar.classList.toggle("show");
            let input = document.querySelector(".search-bar-input");
            input.focus();
        });
        document.querySelector(".search-bar-close-button").addEventListener("click", (event) => {
            this.searchBar.classList.toggle("show");
        });
    }
}
