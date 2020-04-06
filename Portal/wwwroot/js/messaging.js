$(document).ready(function () {

    $("#new-message-btn").on("click", function () {

        $(this).html("...");

        var url = "../api/message/insertmessage";
        var projectId = $("#project-id").val();
        var type = $("#message-type").val();
        var item = "Project";
        var itemType = "RFI";
        var message = { ProjectID: projectId, EmailFrom: "", EmailTo: $("#send-to").val(), EmailBody: $("#new-message").val(), Type: type, ItemType: itemType, ItemNo: projectId};
        console.log(message);
       /* $.post(url, data, function (result) {
        });*/
        $.ajax({
            url: url,
            data: JSON.stringify(message),
            type: "POST",
            contentType: "application/json; charset=utf-8",
        }).done(function () {
            window.location.reload();
        });

        return false;
    });

    $(".new-message-btn-reply").on("click", function () {

        $(this).html("...");
        var id = $(this).attr("id");

        var url = "/Message/InsertMessage";
        var projectId = $("#project-id").val();
        var type = $("#message-type-reply-" + id).val();
        var data = { ProjectID: projectId, From: "", To: $("#send-to-reply-" + id).val(), Message: $("#new-message-reply-" + id).val(), Type: type };

        $.post(url, data, function (result) {
            window.location.reload();
        });

        return false;
    });

    $("#new-message").on("click", function () {
        var template = $("#message-container-template").html();
        $(".compose-container").html("");
        $("#new-message-container").html(template);
        InitializeMessageEvents();
    });

    $(".replyMessage").on("click", function (e) {
        var id = $(this).attr("id");
        var template = $("#second-message-template-" + id).html();
        $(".compose-container-reply-new").html("");
        $("#new-message-container-reply-" + id).html(template);
        InitializeMessageEvents(id);
    });

    

    //$("body").on("click", function() {
    //    //$("#cc-list").hide();
    //});
});

function InitializeMessageEvents(id) {
    $("#has-cc").on("click", function () {
        if ($(this).is(":checked")) {
            $("#cc-list").slideDown();
        } else {
            $("#cc-list").slideUp();
        }
    });

    $("#has-schedule").on("click", function () {
        if ($(this).is(":checked")) {
            $("#schedule-list").slideDown();
        } else {
            $("#schedule-list").slideUp();
        }
    });
    $("#has-cc-reply-" + id).on("click", function () {
        if ($(this).is(":checked")) {
            $("#cc-list-reply-" + id).slideDown();
        } else {
            $("#cc-list-reply-" + id).slideUp();
        }
    });

    $("#has-schedule-reply-" + id).on("click", function () {
        if ($(this).is(":checked")) {
            $("#schedule-list-reply-" + id).slideDown();
        } else {
            $("#schedule-list-reply-" + id).slideUp();
        }
    });
    $("#has-scheduleRfi").on("click", function () {
        if ($(this).is(":checked")) {
            $("#schedule-list-rfi").slideDown();
        } else {
            $("#schedule-list-rfi").slideUp();
        }
    });

    $(".addDocumentReply").on("click", function () {
        $("#modal").removeAttr("style");
        $("#files").kendoUpload({
            async: {
                saveUrl: "/upload/saveAsync",
                removeUrl: "/upload/remove",
                autoUpload: true
            },
            upload: function (e) {
                let uploadData = {};
                uploadData.projectID = 1;
                uploadData.itemType = "RFI";
                uploadData.ItemNo = 1,
                    uploadData.entCode = entcode;
                e.data = uploadData;
                console.log("KendoUpload", uploadData);
            },
            validation: {
                allowedExtensions: [".txt", ".doc", ".docx", ".pdf"]
            },
            success: (e) => {
                console.log("Upload Success", e);
            },
            dropZone: ".dropZoneElement"
        });
    });
    $(".close-button").on("click", function () {
        $("#modal").attr("style","display:none");
    })
}

$(document).mouseup(function (e) {
    var container = $("#cc-list");

    if (!container.is(e.target) // if clicked outside
        && container.has(e.target).length === 0) //nor a descendant of the container
    {
        container.hide();
        //$("#drop1").prop("checked", false); //to uncheck
    }
    var container1 = $(".cc-list-reply");

    if (!container1.is(e.target) // if clicked outside
        && container1.has(e.target).length === 0) //nor a descendant of the container
    {
        container1.hide();
        //$("#drop1").prop("checked", false); //to uncheck
    }
});

$(document).mouseup(function (e) {
    var container = $("#schedule-list");
    var containerRfi = $("#schedule-list-rfi");
    var containerReply= $(".schedule-list-reply");
    if (!container.is(e.target) // if clicked outside
        && container.has(e.target).length === 0) //nor a descendant of the container
    {
        container.hide();
        //$("#drop1").prop("checked", false); //to uncheck
    }
    if (!containerRfi.is(e.target) // if clicked outside
        && containerRfi.has(e.target).length === 0) //nor a descendant of the container
    {
        containerRfi.hide();
        //$("#drop1").prop("checked", false); //to uncheck
    }
    if (!containerReply.is(e.target) // if clicked outside
        && containerReply.has(e.target).length === 0) //nor a descendant of the container
    {
        containerReply.hide();
        //$("#drop1").prop("checked", false); //to uncheck
    }
});