export type Handler<E> = (event: E) => void;

export class EventDispatcher<E> {
    private handlers: Handler<E>[] = [];
    fire(event: E) {
        for (let h of this.handlers)
            h(event);
    }

    subscribe(handler: Handler<E>) {
        this.handlers.push(handler);
    }

    unsubscribe(handler: Handler<E>) {
        var index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
        }
    }
}