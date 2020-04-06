import axiosES6 from "../../lib/axios/axios.esm.min.js";
//import { google } from "google-maps";
//declare var google: google;
const axios = axiosES6;
export class LinkedLocationList {
    constructor(data) {
        this.data = data;
        this.init();
    }
    init() {
        this.setupGrids();
    }
    //private setupList(): void {
    //    const tableHeight = 150;
    //    var addressTemplate = '<span><h3>#: data.address1 #</h3><p>#: data.address2 #</p></span>';
    //    //var addressTemplate = '<span><h3></h3><p></p></span>';
    //    $("#address-list").kendoListBox({
    //        dataTextField: "address1",
    //        dataValueField: "locationID",
    //        template: addressTemplate,
    //        dataSource: {
    //            transport: {
    //                read: {
    //                    dataType: "json",
    //                    url: "../api/locations/GetLocationsByContactID?c=" + this.data.itemid
    //                }
    //            }
    //        },
    //    });
    //}
    setupGrids() {
        const tableHeight = 150;
        var dTemplate = "<div>#: address1 #</div><div>#: address2 #</div><div>#: addCity # , #: addState # #: addZip #</div><div>#: bldg # #: floor # #: room #</div>";
        var dataSource2 = new kendo.data.DataSource({
            batch: true,
            transport: {
                read: { url: "../api/Locations/Read?c=" + this.data.itemid + "&type=" + this.data.itemtype, dataType: "json", type: "GET" },
                update: { url: "../api/Locations/Update", dataType: "json", type: "POST" },
                create: { url: "../api/Locations/Create", dataType: "json", type: "POST" }
            },
            schema: {
                data: "data",
                total: "total",
                model: {
                    id: "locationID",
                    fields: {
                        locationID: { type: "number", editable: false, nullable: true, },
                        label: { type: "string" },
                        bldg: { type: "string" },
                        floor: { type: "string" },
                        room: { type: "string" },
                        address1: { type: "string" },
                        address2: { type: "string" },
                        addCity: { type: "string" },
                        addState: { type: "string" },
                        addZip: { type: "string" },
                        addActive: { type: "boolean" },
                        isPrimary: { type: "boolean" },
                        parentID: { type: "number", editable: false, defaultValue: this.data.itemid },
                        parentType: { type: "string", editable: false, defaultValue: this.data.itemtype }
                    }
                }
            }
        });
        dataSource2.fetch(function () {
            if (dataSource2.total() > 0) {
                $("#locationexcalmination").css("display", "none");
            }
            else {
                $("#locationexcalmination").css("display", "block");
            }
        });
        $("#location-grid").kendoGrid({
            dataSource: dataSource2,
            height: tableHeight,
            sortable: false,
            scrollable: true,
            selectable: true,
            editable: {
                mode: "popup",
                template: $("#location-popup-editor").html()
            },
            toolbar: ["create"],
            filterable: false,
            persistSelection: true,
            edit: function (e) {
                if (!e.model.isNew()) {
                    e.container.data("kendoWindow").title("Edit Address");
                    e.container.find(".k-edit-label:last").hide();
                    e.container.find("input[name='isPrimary']").hide();
                    //e.container.find("input[name='lookup']").attr('placeholder', 'Enter your address');
                    //e.container.find("input[name='lookup']").attr('id', 'autocomplete');
                    //var autocomplete;
                    //var placeSearch;
                    //var componentForm = {
                    //    address1: 'long_name',
                    //    addCity: 'long_name',
                    //    addState: 'short_name',
                    //    addZip: 'short_name'
                    //};
                    //autocomplete = new google.maps.places.Autocomplete(
                    //    document.getElementById("autocomplete") as HTMLInputElement);
                    //autocomplete.setFields(['address_component']);
                    //console.log(autocomplete);
                    //autocomplete.addListener('place_changed', function () {
                    //    var place = autocomplete.getPlace();
                    //    //for (var component in componentForm) {
                    //    //  document.getElementById(component).value = '';
                    //    // document.getElementById(component).disabled = false;
                    //    // }
                    //    // Get each component of the address from the place details,
                    //    // and then fill-in the corresponding field on the form.
                    //    for (var i = 0; i < place.address_components.length; i++) {
                    //        var addressType = place.address_components[i].types[0];
                    //        if (componentForm[addressType]) {
                    //            var val = place.address_components[i][componentForm[addressType]];
                    //            //document.getElementById(addressType).value = val;
                    //        }
                    //    }
                    //});
                    //e.container.find("#autocomplete").focus(function () {
                    //    if (navigator.geolocation) {
                    //        navigator.geolocation.getCurrentPosition(function (position) {
                    //            var geolocation = {
                    //                lat: position.coords.latitude,
                    //                lng: position.coords.longitude
                    //            };
                    //            var circle = new google.maps.Circle(
                    //                { center: geolocation, radius: position.coords.accuracy });
                    //            autocomplete.setBounds(circle.getBounds());
                    //        });
                    //    }
                    //    console.log(autocomplete);
                    //});
                }
                else {
                    e.container.data("kendoWindow").title("Add Address");
                    e.container.find(".k-edit-label:last").hide();
                    e.container.find("input[name='isPrimary']").hide();
                }
            },
            columns: [
                {
                    field: "lookup", title: "Address Lookup", groupable: false, template: "<input id='autocomplete' placeholder='Enter your address' onFocus='geolocate()' type='text' />"
                },
                { field: "label", title: "Label", hidden: true },
                { field: "address1", title: "Address", width: '65%', template: dTemplate },
                { field: "address2", title: "Address2", hidden: true },
                { field: "addCity", title: "City", hidden: true },
                { field: "addState", title: "State", hidden: true },
                { field: "addZip", title: "Zip", hidden: true },
                { field: "bldg", title: "Bldg", hidden: true },
                { field: "floor", title: "Floor", hidden: true },
                { field: "room", title: "Room", hidden: true },
                {
                    field: "isPrimary", title: "Primary", width: '20%',
                    template: '<input type="checkbox" #= isPrimary ? checked="checked" : "" # disabled="disabled" ></input>'
                },
                //{ command: ["edit", "destroy"], title: "&nbsp;", width: "25%" }
                {
                    width: '15%',
                    command: [{ name: "edit", text: "" }, { name: "destroy", text: "" }]
                },
            ]
        });
        //function detailInit(e) {
        //    var detailRow = e.detailRow;
        //    var model = e.data;
        //}
    }
}
