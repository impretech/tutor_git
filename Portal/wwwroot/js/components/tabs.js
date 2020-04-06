import { EventDispatcher } from "./events.js";
export class TabSelectedEvent {
    constructor(tab) {
        this.SelectedTab = tab;
    }
}
export class Tabs {
    constructor(parent) {
        this.eventsDispatcher = new EventDispatcher();
        this.parent = parent;
        this.init();
    }
    init() {
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
    }
    ;
    fireTabSelectedEvent(event) {
        this.eventsDispatcher.fire(event);
    }
    onTabSelected(handler) {
        this.eventsDispatcher.subscribe(handler);
    }
}
