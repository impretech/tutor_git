import { Utilities } from "../utilities.js";

export class SlidingPanel {

    private parentElement: HTMLDivElement;
    private steps: NodeListOf<HTMLDivElement>;
    private titleElement: HTMLDivElement;
    private selectedIndex: number = 0;

    private isAnimiationRunning = false;

    private previousButton: HTMLAnchorElement;
    private nextButton: HTMLAnchorElement;

    constructor(parent: any) {
        this.parentElement = Utilities.validateElement(parent);
        this.steps = this.parentElement.querySelector(".sliding-panel-container").querySelectorAll(".sliding-panel-content");

        this.init();
    }


    private init(): void {
        this.titleElement = this.parentElement.querySelector(".sliding-panel-header").querySelector(".title");

        this.previousButton = this.parentElement.querySelector(".control-bar").querySelector("a:first-of-type");
        this.previousButton.addEventListener("click", (evt) => this.previousButtonClicked(evt));

        this.nextButton = this.parentElement.querySelector(".control-bar").querySelector("a:last-of-type");
        this.nextButton.addEventListener("click", (evt) => this.nextButtonClicked(evt));

        for (let s of this.steps) {
            s.classList.add("animated", "faster", "hidden");
        }
        this.steps[0].classList.remove("hidden");

        this.titleElement.innerHTML = this.steps[0].dataset.title;
        this.titleElement.classList.add("animated", "faster");
    }


    private previousButtonClicked(evt: MouseEvent): any {
        evt.preventDefault();
        if (!this.isAnimiationRunning) {
            this.movePreviousStep();
        }
    }

    private nextButtonClicked(evt: MouseEvent): any {
        evt.preventDefault();
        if (!this.isAnimiationRunning) {
            this.moveNextStep();
        }
    }

    public refreshTitles(): void {
        this.titleElement.innerHTML = this.steps[this.selectedIndex].dataset.title;
    }

    private moveNextStep() {
        this.isAnimiationRunning = true;
        this.steps[this.selectedIndex].classList.add("fadeOutLeft");
        this.titleElement.classList.add("fadeOutUp");

        this.steps[this.selectedIndex].addEventListener('animationend', () => {
            this.steps[this.selectedIndex].classList.add("hidden");
            this.steps[this.selectedIndex].classList.remove("fadeOutLeft");
            this.titleElement.classList.remove("fadeOutUp");

            if (this.selectedIndex === this.steps.length - 1) {
                this.selectedIndex = 0;
            }
            else {
                this.selectedIndex += 1;
            }

            this.steps[this.selectedIndex].classList.remove("hidden");
            this.steps[this.selectedIndex].classList.add("fadeInRight");
            this.titleElement.classList.add("fadeInLeft");

            this.titleElement.innerHTML = this.steps[this.selectedIndex].dataset.title;

            this.steps[this.selectedIndex].addEventListener('animationend', () => {
                this.steps[this.selectedIndex].classList.remove("fadeInRight");
                this.titleElement.classList.remove("fadeInLeft");

                this.isAnimiationRunning = false;
            }, { once: true });

        }, { once: true });
    }

    private movePreviousStep() {
        this.isAnimiationRunning = true;
        this.steps[this.selectedIndex].classList.add("fadeOutRight");
        this.titleElement.classList.add("fadeOutUp");

        this.steps[this.selectedIndex].addEventListener('animationend', () => {

            this.steps[this.selectedIndex].classList.add("hidden");
            this.steps[this.selectedIndex].classList.remove("fadeOutRight");
            this.titleElement.classList.remove("fadeOutUp");

            if (this.selectedIndex === 0) {
                this.selectedIndex = this.steps.length - 1;
            }
            else {
                this.selectedIndex -= 1;
            }

            this.steps[this.selectedIndex].classList.remove("hidden");
            this.steps[this.selectedIndex].classList.add("fadeInLeft");
            this.titleElement.classList.add("fadeInRight");

            this.titleElement.innerHTML = this.steps[this.selectedIndex].dataset.title;

            this.steps[this.selectedIndex].addEventListener('animationend', () => {
                this.steps[this.selectedIndex].classList.remove("fadeInLeft");
                this.titleElement.classList.remove("fadeInRight");
                this.isAnimiationRunning = false;
            }, { once: true });

        }, { once: true });
    }

}