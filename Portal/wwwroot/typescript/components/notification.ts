
export class Notification {
    
    private notificationElement: any; 

    constructor() {
        this.Init();
    }


    public Init(): void {
        this.notificationElement = $("#notification");

        // initialize the widget
        this.notificationElement.kendoNotification({
            stacking: "down",
            show: onShow,
            button: true,
            templates: [{
                type: "success",
                template: $("#successTemplate").html()
            },
            {
                type: "error",
                template: $("#errorTemplate").html()
            }]
        });

        function onShow(e) {
            if (e.sender.getNotifications().length == 1) {
                var element = e.element.parent(),
                    eWidth = element.width(),
                    eHeight = element.height(),
                    wWidth = $(window).width(),
                    wHeight = $(window).height(),
                    newTop, newLeft;

                newLeft = Math.floor(wWidth / 2 - eWidth / 2);
                newTop = Math.floor(wHeight / 2 - eHeight / 2);

                e.element.parent().css({ top: newTop, left: newLeft, width: '200px', height: '100px' });
            }
        }
    }

    public ShowNotification(title: String, message: String, type: String): void {
        var notificationWidget = this.notificationElement.data("kendoNotification");

        notificationWidget.show({
            title: title,
            message: message
        }, type);

        /* 
         notificationWidget.show({}
            title: "Wrong Password",
            message: "Please enter your password again."
            }, "error");
        */
        //        notificationWidget.show(str, "info");

    }
}
