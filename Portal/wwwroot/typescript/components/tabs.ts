

import { Handler, EventDispatcher } from "./events.js";

interface ITabSelectedEvent {
    SelectedTab: string;
}

export class TabSelectedEvent implements ITabSelectedEvent{
    constructor(tab: string) {
        this.SelectedTab = tab;
    }
    SelectedTab: string;
}

export class Tabs {
    private parent: HTMLElement;

    constructor(parent) {
        this.parent = parent;

        this.init();
    }

    private init(): void{
        let tabs = this.parent.querySelectorAll("ul.nav-tabs > li");

        tabs.forEach((item, key) => {
            item.addEventListener("click", (evt) => {
                evt.preventDefault();

                let panes = this.parent.querySelectorAll(".tab-pane");
                panes.forEach(pane => {
                    pane.classList.remove("active");
                });

                tabs.forEach(element => {
                    element.classList.contains("active")
                        ? element.classList.remove("active")
                        : null;
                });

                item.classList.add("active");
                let activePane = document.querySelector(item.querySelector("a").getAttribute("href"));
                activePane.classList.add("active");

                const tabEvent = new TabSelectedEvent(activePane.id.substring(4));
                this.fireTabSelectedEvent(tabEvent);
            });
        });
    };

    private fireTabSelectedEvent(event: ITabSelectedEvent) {
        this.eventsDispatcher.fire(event);
    }

    private eventsDispatcher = new EventDispatcher<ITabSelectedEvent>();
    public onTabSelected(handler: Handler<ITabSelectedEvent>) {
        this.eventsDispatcher.subscribe(handler);
    }
}
