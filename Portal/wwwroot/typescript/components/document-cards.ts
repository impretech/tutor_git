import axiosES6 from "../../lib/axios/axios.esm.min.js";
import { AxiosStatic } from "../../lib/axios/axios";  //needed for type definitions
const axios: AxiosStatic = axiosES6;

export class DocumentCardList {
    private data: any
    private DocCards:  any;
    private isCardSwitch: HTMLInputElement;

    constructor(data: any) {  //passes in DocumentLoookup
        this.data = data;
        this.init();
    }

    private async init() {
        this.DocCards = await axios.post("api/document/GetDocumentCards" + this.data);
        this.isCardSwitch = document.querySelector("#isCard") as HTMLInputElement;
        var cardElement = document.getElementById('carouselview');
        var tableElement = document.getElementById('documents-grid');

        this.isCardSwitch.addEventListener("click", () => {
            if (this.isCardSwitch.checked == true) {
                cardElement.style.display = 'block';
                tableElement.style.display = 'none';
            }
            else {
                cardElement.style.display = 'none';
                tableElement.style.display = 'block';
            }
        })
        this.LoadDocumentsGrid(this.DocCards);
        this.setupCards(this.DocCards);
    }

    private setupCards(doccarddata: any): void {
        const carouselContainer = document.querySelector(".carousel-container");
        let i = 0;
        let carouselDiv = document.createElement("div");
        carouselDiv.className = "carousel slide";
        let slideshowDiv = document.createElement("div");
        slideshowDiv.className = "carousel-inner";
        carouselDiv.appendChild(slideshowDiv);
        let carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        carouselDiv.appendChild(carouselItem);
        for (let doccard of doccarddata) {

            if (i==0 || i % 4 == 0) {
                let carouselItem = document.createElement("div");
                carouselItem.className = "carousel-item";
                carouselDiv.appendChild(carouselItem);
            }
            let cardDiv = document.createElement("div");
            cardDiv.className = "card bg-primary";
            cardDiv.nodeValue = doccard.docID;

            let base64 = btoa(String.fromCharCode(...new Uint8Array(doccard.image)));
            let imageDiv = document.createElement("img");
            imageDiv.className = "card-img-top";
            imageDiv.alt = doccard.name;
            imageDiv.src = "data:image/png; base64," + base64;
            cardDiv.appendChild(imageDiv);

            let bodyDiv = document.createElement("div");
            bodyDiv.className = "card-body";
            let titleDiv = document.createElement("h4");
            titleDiv.className = "card-title";
            titleDiv.innerText = doccard.writer;
            bodyDiv.appendChild(titleDiv);
            let filenameDiv = document.createElement("p");
            filenameDiv.className = "card-text";
            filenameDiv.innerText = doccard.name
            bodyDiv.appendChild(filenameDiv);
            cardDiv.appendChild(bodyDiv);
            carouselItem.appendChild(cardDiv);
            i = i + 1;
        }
    }

    private LoadDocumentsGrid(doctable: any) {
        $("#documents-grid").kendoGrid({
            dataSource: {
                data: doctable,
                schema: {
                    model: {
                        id: "docID"
                    }
                }
            },
            height: 280,
            sortable: true,
            scrollable: true,
            selectable: true,
            filterable: true,
            persistSelection: true,
            columns: [
                { field: "docID", title: "ID", width: '10%' },
                { field: "title", title: "Name" },
                { field: "writer", title: "From", width: '20%' },
                { field: "itemType", title: "Item Type", width: '20%' },
                { field: "itemNo", title: "Item No", width: '20%' }
            ]
        }).on("click", "tbody td", (e) => {
            var cell = $(e.currentTarget);
            var grid = $("#documents-grid").data("kendoGrid");

            document.body.classList.toggle("wait");

            var dataItem = grid.dataItem(cell.closest("tr")) as any;
            this.getDocUrl(dataItem.docID as number);
        });
    }

    private async getDocUrl(docId: number) {
        let docUrl = await axios.get("api/document/GetFile?id=" + docId);
        window.open(docUrl.data);
        document.body.classList.toggle("wait");
    }

}