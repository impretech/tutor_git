import { Utilities } from "../utilities.js";

export class AlertsCustomPanel {

    private parentElement: HTMLDivElement;
    private steps: NodeListOf<HTMLDivElement>;

    private typesPanel: HTMLDivElement;
    private categoriesPanelBudget: HTMLDivElement;
    private categoriesPanelBuyout: HTMLDivElement;
    private categoriesPanelMilestone: HTMLDivElement;
    private categoriesPanelDocuments: HTMLDivElement;
    private detailsPanel: HTMLDivElement;

    private budgetCount: HTMLSpanElement;
    private buyoutCount: HTMLSpanElement;
    private milestoneCount: HTMLSpanElement;
    private documentsCount: HTMLSpanElement;

    private titleElement: HTMLDivElement;
    private selectedIndex: number = 0;

    private lastSelectedCategory: string;
    private isAnimiationRunning = false;

    private previousButton: HTMLAnchorElement;

    private AlertsData: any;

    constructor(parent: any) {
        this.parentElement = Utilities.validateElement(parent);

        this.typesPanel = this.parentElement.querySelector(".alerts-custom-panel-content.types")

        this.budgetCount = this.typesPanel.querySelector(".budgetCount");
        this.buyoutCount = this.typesPanel.querySelector(".buyoutCount");
        this.milestoneCount = this.typesPanel.querySelector(".milestoneCount");
        this.documentsCount = this.typesPanel.querySelector(".documentsCount");

        this.categoriesPanelBudget = this.parentElement.querySelector(".alerts-custom-panel-content.categories.Budget");
        this.categoriesPanelBuyout = this.parentElement.querySelector(".alerts-custom-panel-content.categories.Buyout");
        this.categoriesPanelMilestone = this.parentElement.querySelector(".alerts-custom-panel-content.categories.Milestone");
        this.categoriesPanelDocuments = this.parentElement.querySelector(".alerts-custom-panel-content.categories.Documents");

        this.detailsPanel = this.parentElement.querySelector(".alerts-custom-panel-content.details");

        this.previousButton = this.parentElement.querySelector(".alerts-custom-panel-header").querySelector("a:first-of-type");

        this.titleElement = this.parentElement.querySelector(".alerts-custom-panel-header").querySelector(".title");

        this.init();
    }


    private init(): void {
        this.previousButton.style.display = "none";
        this.previousButton.addEventListener("click", (evt) => this.previousButtonClicked(evt));

        this.typesPanel.classList.add("animated", "faster", "hidden");
        this.categoriesPanelBudget.classList.add("animated", "faster", "hidden");
        this.categoriesPanelBuyout.classList.add("animated", "faster", "hidden");
        this.categoriesPanelMilestone.classList.add("animated", "faster", "hidden");
        this.categoriesPanelDocuments.classList.add("animated", "faster", "hidden");

        this.detailsPanel.classList.add("animated", "faster", "hidden");

        this.titleElement.innerHTML = "Alert Details";
        this.titleElement.classList.add("animated", "faster");

        let typesLinks = this.typesPanel.querySelectorAll("a");

        typesLinks.forEach((item, key) => {
            item.addEventListener("click", (evt) => {
                evt.preventDefault();

                this.hideShowCategories(item);
            });
        });

    }

    public ForceCategory(name: string) {
        if (name !== "Budget" && name !== "Buyout" && name !== "Milestone" && name !== "Documents")
            return;

        let anchor = this.typesPanel.querySelector("a[href^='" + name + "'") as HTMLAnchorElement;
        this.hideShowCategories(anchor, true);
    }

    private hideShowCategories(a: HTMLAnchorElement, force: boolean = false) {

        let typeName = a.getAttribute("href");

        if (a.classList.contains("open")) {
            a.classList.remove("open");

            this.LoadCategories(typeName, true);
        }
        else {  //open and show categories
            a.classList.add("open");
            this.LoadCategories(typeName);
        }
    }


    private LoadCategories(name: string, hide: boolean = false) {
        //build ul list
        //this.categoriesPanel.innerHTML = "";
        //this.detailsPanel.innerHTML = "";
        

        //this.lastSelectedCategory = name;


        let catPanel = null as HTMLDivElement;
        let alerts = [];

        switch (name) {
            case "Budget":
                alerts = this.AlertsData.budgetAlerts;
                catPanel = this.categoriesPanelBudget;
                break;

            case "Buyout":
                alerts = this.AlertsData.buyoutAlerts;
                catPanel = this.categoriesPanelBuyout;
                break;

            case "Milestone":
                alerts = this.AlertsData.milestoneAlerts;
                catPanel = this.categoriesPanelMilestone;
                break;

            case "Documents":
                alerts = this.AlertsData.documentAlerts;
                catPanel = this.categoriesPanelDocuments;
                break;
        }

        catPanel.innerHTML = "";

        if (hide)
            return;

        if (alerts.length > 0) {
            const ul = document.createElement('ul');

            alerts.forEach((item, key) => {
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.href = "#";
                a.dataset.id = item.details.alertId;
                a.dataset.name = item.title;

                let titleDiv = document.createElement("div");
                titleDiv.className = "title";

                let titleDivInner1 = document.createElement("div");
                titleDivInner1.innerText = item.title;

                let titleDivInner2 = document.createElement("div");
                titleDivInner2.innerText = item.subTitle;

                titleDiv.appendChild(titleDivInner1);
                titleDiv.appendChild(titleDivInner2);

                //let span2 = document.createElement("span");
                //span2.innerHTML = "<svg class='alerts-custom-panel-icon'><use xlink:href='/images/icons.svg#angle-right'></use></svg>";

                a.appendChild(titleDiv);
                //a.appendChild(span2);

                li.appendChild(a);
                ul.appendChild(li);
            });

            catPanel.appendChild(ul);
        }
        else {
            const noneSpan = document.createElement('span');
            noneSpan.classList.add("none");
            noneSpan.innerHTML = "There are no alerts for this type";
            catPanel.appendChild(noneSpan);
        }



        let categoryLinks = catPanel.querySelectorAll("a");

        categoryLinks.forEach((item, key) => {
            item.addEventListener("click", (evt) => {
                evt.preventDefault();

                let categoryId = item.dataset.id;
                let categoryName = item.dataset.name;
                this.LoadDetails(name, categoryName, categoryId);
            });
        });

        //if (skipAnimation) {
        //    this.typesPanel.classList.add("hidden");
        //    this.selectedIndex = 1;
        //    this.categoriesPanel.classList.remove("hidden");

        //    this.previousButton.style.display = "flex";
        //    this.titleElement.innerHTML = name; // + " Alerts";
        //}
        //else {
        //    this.isAnimiationRunning = true;
        //    this.typesPanel.classList.add("fadeOutLeft");
        //    this.titleElement.classList.add("fadeOutLeft");

        //    this.typesPanel.addEventListener('animationend', () => {
        //        this.typesPanel.classList.add("hidden");
        //        this.typesPanel.classList.remove("fadeOutLeft");
        //        this.titleElement.classList.remove("fadeOutLeft");

        //        this.selectedIndex = 1;

        //        this.categoriesPanel.classList.remove("hidden");
        //        this.categoriesPanel.classList.add("fadeInRight");
        //        this.titleElement.classList.add("fadeInRight");

        //        this.previousButton.style.display = "flex";
        //        this.titleElement.innerHTML = name; // + " Alerts";

        //        this.categoriesPanel.addEventListener('animationend', () => {
        //            this.categoriesPanel.classList.remove("fadeInRight");
        //            this.titleElement.classList.remove("fadeInRight");

        //            this.isAnimiationRunning = false;
        //        }, { once: true });

        //     }, { once: true });
        //}
    }

    private LoadDetails(name: string, categoryName: string, id: string) {

        let alerts = [];

        switch (name) {
            case "Budget":
                alerts = this.AlertsData.budgetAlerts;
                break;

            case "Buyout":
                alerts = this.AlertsData.buyoutAlerts;
                break;

            case "Milestone":
                alerts = this.AlertsData.milestoneAlerts;
                break;

            case "Documents":
                alerts = this.AlertsData.documentAlerts;
                break;
        }

        let intId = parseInt(id);
        let item = alerts.find(x => x.details.alertId === intId);

        let alertName = item.title;
        item = item.details;
        //alert(item);

        this.detailsPanel.querySelector(".date").innerHTML = Utilities.FormatDateString(item.date);
        this.detailsPanel.querySelector(".alert-type").innerHTML = item.alertType;
        this.detailsPanel.querySelector(".stage").innerHTML = item.stage;
        this.detailsPanel.querySelector(".node-id").innerHTML = item.nodeId;
        this.detailsPanel.querySelector(".node-desc").innerHTML = item.nodeDescription;
        this.detailsPanel.querySelector(".condition").innerHTML = item.condition;
        this.detailsPanel.querySelector(".recommendation").innerHTML = item.recommendation;


        this.isAnimiationRunning = true;
        this.typesPanel.classList.add("fadeOutLeft");
        this.titleElement.classList.add("fadeOutLeft");

        this.typesPanel.addEventListener('animationend', () => {
            this.typesPanel.classList.add("hidden");
            this.typesPanel.classList.remove("fadeOutLeft");
            this.titleElement.classList.remove("fadeOutLeft");

            this.selectedIndex = 1;

            this.detailsPanel.classList.remove("hidden");
            this.detailsPanel.classList.add("fadeInRight");
            this.titleElement.classList.add("fadeInRight");

            this.previousButton.style.display = "flex";
            this.titleElement.innerHTML = alertName;

            this.detailsPanel.addEventListener('animationend', () => {
                this.detailsPanel.classList.remove("fadeInRight");
                this.titleElement.classList.remove("fadeInRight");

                this.isAnimiationRunning = false;
            }, { once: true });
        }, { once: true });
    }


    public Load(alertsData: any): void {

        this.AlertsData = alertsData;

        this.budgetCount.classList.add("hidden");
        this.buyoutCount.classList.add("hidden");
        this.milestoneCount.classList.add("hidden");
        this.documentsCount.classList.add("hidden");

        if (this.AlertsData.budgetAlerts.length > 0) {
            this.budgetCount.innerHTML = this.AlertsData.budgetAlerts.length;
            this.budgetCount.classList.remove("hidden");
        }

        if (this.AlertsData.buyoutAlerts.length > 0) {
            this.buyoutCount.innerHTML = this.AlertsData.buyoutAlerts.length;
            this.buyoutCount.classList.remove("hidden");
        }

        if (this.AlertsData.milestoneAlerts.length > 0) {
            this.milestoneCount.innerHTML = this.AlertsData.milestoneAlerts.length;
            this.milestoneCount.classList.remove("hidden");
        }

        if (this.AlertsData.documentAlerts.length > 0) {
            this.documentsCount.innerHTML = this.AlertsData.documentAlerts.length;
            this.documentsCount.classList.remove("hidden");
        }

        this.typesPanel.classList.remove("hidden");

        this.categoriesPanelBudget.innerHTML = "";
        this.categoriesPanelBuyout.innerHTML = "";
        this.categoriesPanelMilestone.innerHTML = "";
        this.categoriesPanelDocuments.innerHTML = "";

        let typesLinks = this.typesPanel.querySelectorAll("a");
        typesLinks.forEach((item, key) => {
            item.classList.remove("open");
        });

        this.detailsPanel.classList.add("hidden");
        this.previousButton.style.display = "none";
        this.titleElement.innerHTML = "Alert Details";
    }


    private previousButtonClicked(evt: MouseEvent): any {
        evt.preventDefault();
        if (!this.isAnimiationRunning) {
            this.movePreviousStep();
        }
    }

    private movePreviousStep() {
        this.isAnimiationRunning = true;

        this.detailsPanel.classList.add("fadeOutRight");
        this.titleElement.classList.add("fadeOutRight");

        this.detailsPanel.addEventListener('animationend', () => {

            this.detailsPanel.classList.add("hidden");
            this.detailsPanel.classList.remove("fadeOutRight");
            this.titleElement.classList.remove("fadeOutRight");

            this.selectedIndex = 0;

            this.typesPanel.classList.remove("hidden");
            this.typesPanel.classList.add("fadeInLeft");
            this.titleElement.classList.add("fadeInLeft");

            this.previousButton.style.display = "none";
            this.titleElement.innerHTML = "Alert Details";

            this.typesPanel.addEventListener('animationend', () => {
                this.typesPanel.classList.remove("fadeInLeft");
                this.titleElement.classList.remove("fadeInLeft");
                this.isAnimiationRunning = false;
            }, { once: true });

        }, { once: true });
        
    }
    
}