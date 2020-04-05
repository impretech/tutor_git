export class Modal {
    constructor() {
        this.init();
    }
    init() {
        this.modalContainer = document.createElement("div");
        this.modalContainer.className = "modal-container";
        this.modalContainer.classList.add('animated', 'zoomIn', 'faster');
        this.modalContainer.style.width = "50%";
        this.modalContainer.style.height = "50%";
        this.modalContainer.style.top = "25%";
        this.modalContainer.style.left = "25%";
        this.modalContent = document.createElement("div");
        this.modalContent.className = "modal-content";
        this.closeButton = document.createElement("a");
        this.closeButton.href = "#";
        this.closeButton.className = "close-button";
        this.closeButton.innerHTML = "&times;";
        this.closeButton.addEventListener("click", () => {
            this.Hide();
        });
        this.modalContainer.appendChild(this.closeButton);
        this.modalContainer.appendChild(this.modalContent);
    }
    SetContent(html) {
        this.modalContent.innerHTML = "";
        this.modalContent.innerHTML = html;
    }
    Show() {
        document.body.appendChild(this.modalContainer);
        this.modalContainer.classList.add("visible");
    }
    Hide() {
        this.modalContainer.classList.remove("visible");
        document.body.removeChild(this.modalContainer);
    }
}
