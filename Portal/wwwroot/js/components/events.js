export class EventDispatcher {
    constructor() {
        this.handlers = [];
    }
    fire(event) {
        for (let h of this.handlers)
            h(event);
    }
    subscribe(handler) {
        this.handlers.push(handler);
    }
    unsubscribe(handler) {
        var index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
        }
    }
}
