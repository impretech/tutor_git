#pragma checksum "F:\clients\Impre\ppc-master\Portal\Features\PMAssignment\Index.cshtml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "97ac47a6ca07bc819ebb71df93b9eda6a467b494"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Features_PMAssignment_Index), @"mvc.1.0.view", @"/Features/PMAssignment/Index.cshtml")]
[assembly:global::Microsoft.AspNetCore.Mvc.Razor.Compilation.RazorViewAttribute(@"/Features/PMAssignment/Index.cshtml", typeof(AspNetCore.Features_PMAssignment_Index))]
namespace AspNetCore
{
    #line hidden
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
#line 1 "F:\clients\Impre\ppc-master\Portal\Features\_ViewImports.cshtml"
using Portal;

#line default
#line hidden
#line 2 "F:\clients\Impre\ppc-master\Portal\Features\_ViewImports.cshtml"
using Portal.Models;

#line default
#line hidden
#line 3 "F:\clients\Impre\ppc-master\Portal\Features\_ViewImports.cshtml"
using Portal.Helpers.HTML;

#line default
#line hidden
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"97ac47a6ca07bc819ebb71df93b9eda6a467b494", @"/Features/PMAssignment/Index.cshtml")]
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"6c1831ff6ff6d1f6721b272e06c352287d2a1fb2", @"/Features/_ViewImports.cshtml")]
    public class Features_PMAssignment_Index : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<Portal.Data.Models.PMAssignmentVM>
    {
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
            BeginContext(41, 1, true);
            WriteLiteral("\n");
            EndContext();
#line 3 "F:\clients\Impre\ppc-master\Portal\Features\PMAssignment\Index.cshtml"
  
    ViewData["Title"] = "PM Assignment Scheduler";

#line default
#line hidden
            BeginContext(98, 2, true);
            WriteLiteral("\n\n");
            EndContext();
            DefineSection("styles", async() => {
                BeginContext(117, 18649, true);
                WriteLiteral(@"
    <link href=""https://fonts.googleapis.com/css?family=Lato&display=swap"" rel=""stylesheet"" />

    <style>
        .assignments-container {
            background: #fff;
            padding: 10px;
            display: flex;
        }

        #search-panel {
            order: 1;
            flex: 0 0 220px;
            margin: 8px 4px 8px 8px;
        }

        #scheduler_here {
            line-height: 100%;
            width: 100%;
            height: calc(100% - 16px);
            background: white;
            order: 2;
            flex: 10;
            margin: 8px 8px 8px 0;
        }

        #search-panel form,
        .search_form {
            height: 100%;
        }

        .hd_line {
            height: 1px;
            width: 100%;
            margin: 10px 0 20px;
        }

        .search_form {
            width: 220px;
            padding: 14px 12px;
            box-sizing: border-box;
            background-repeat: repeat-x;
            background-color: white;
        }

        .search");
                WriteLiteral(@"_title {
            font-weight: 500;
        }

        .message {
            text-align: right;
            color: White;
            font-size: 18px;
            height: 24px;
            padding: 5px;
        }

        .car_brand, .car_price {
            border-left: none !important;
            overflow: hidden;
        }

        div.car_price {
            color: rgba(0, 0, 0, 0.54);
            font-size: 14px;
            height: 14px;
            line-height: 14px;
            margin-top: -2px;
            text-align: center;
            width: 100%;
        }

        div.car_brand {
            color: rgba(0, 0, 0, 0.87);
            font-size: 14px;
            font-weight: 500;
            height: 33px;
            line-height: 33px;
            white-space: nowrap;
        }

        .search_form select {
            height: 21px;
            vertical-align: top;
        }

        .search_form option {
            vertical-align: middle;
        }

        .search_form fieldset {
         ");
                WriteLiteral(@"   border: solid 1px #ededed;
            margin: 10px 0 20px;
            padding: 6px 18px;
        }

        .search_form .type_filter {
            padding-bottom: 17px;
        }

            .search_form .type_filter legend {
                margin-left: -6px;
            }

        .search_form .price_filter legend {
            margin-left: -8px;
        }

        .search_form .price_filter {
            padding-bottom: 12px;
        }

        .search_form fieldset label {
            line-height: 2;
        }

        .search_form legend {
            color: rgba(0, 0, 0, 0.87);
            font-size: 14px;
            font-weight: 500;
            line-height: 1.71;
            padding: 0 6px;
            text-align: left;
        }

        .search_form {
            border: none;
        }

        .pick_up_filter {
            margin-top: 27px;
        }

        .drop_off_filter {
            margin-top: 19px;
        }

        .minical_container {
            position: absolute;
           ");
                WriteLiteral(@" width: 200px;
        }

        .check_dates {
            line-height: 14px;
            margin-bottom: -10px;
            margin-left: 3px;
            margin-top: 7px;
        }

            .check_dates > input {
                width: 20px;
                vertical-align: middle;
            }

            .check_dates .checkbox {
                margin-right: 4px;
            }

        /*#dateFrom, #dateTo {
            color: rgba(0, 0, 0, 0.87);
            font-size: 14px;
            padding: 1px 5px 1px 30px;
            width: 113px;
        }

        #dateFrom, #dateTo {
            border: solid 1px rgba(0, 0, 0, 0.08);
            box-sizing: border-box;
            height: 32px;
            vertical-align: top;
        }*/

        .select {
            display: inline-block;
            height: 32px;
            margin-left: 5px;
            position: relative;
            vertical-align: middle;
            width: 73px;
        }

            .select > select {
                -webkit-ap");
                WriteLiteral(@"pearance: none;
                -moz-appearance: none;
                appearance: none;
                background: transparent;
                border: none;
                color: rgba(0, 0, 0, 0.87);
                font-size: 14px;
                height: 100%;
                outline: none;
                padding: 0 0 0 8px;
                position: absolute;
                width: 100%;
                z-index: 1;
            }

            .select > .select_layout {
                border: solid 1px rgba(0, 0, 0, 0.08);
                box-sizing: border-box;
                display: block;
                height: 100%;
                width: 100%;
            }

                .select > .select_layout:after {
                    content: ' ';
                    border: 5px solid #757575;
                    border-right-color: transparent;
                    border-left-color: transparent;
                    border-bottom-color: transparent;
                    margin-top: -2px;
               ");
                WriteLiteral(@"     position: absolute;
                    right: 10px;
                    top: 50%;
                }

        .date_calendar {
            cursor: pointer;
            height: 18px;
            left: -2px;
            position: relative;
            vertical-align: baseline;
            top: 1px;
            width: 18px;
        }

        .dhx_cal_navline {
            box-shadow: 0 1px 2px 2px #FFF;
        }

        .dhx_cal_header {
            width: 100% !important;
            border: 1px solid white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
        }

            .dhx_cal_header div div {
                border-left: 1px solid white;
                border-left: 1px solid white;
            }

        .dhx_cal_event_line {
            margin-top: 42px;
            line-height: 32px;
        }

            .dhx_cal_event_line .dhx_event_resize_start {
                display: none;
            }

        .checkbox {
            display: inline-block;");
                WriteLiteral(@"
            height: 18px;
            margin-right: 10px;
            position: relative;
            vertical-align: middle;
            width: 18px;
        }

            .checkbox > input[type=checkbox] {
                cursor: pointer;
                height: 100%;
                margin: 0;
                opacity: 0;
                padding: 0;
                position: absolute;
                width: 100%;
                z-index: 1;
            }

            .checkbox .checkbox_marker {
                background-color: transparent;
                border: 2px solid #797979;
                border-radius: 2px;
                box-sizing: border-box;
                display: block;
                height: 100%;
                width: 100%;
            }

            .checkbox > input[type=checkbox]:checked + .checkbox_marker {
                background-color: #0097a7;
                border: none;
            }

            .checkbox .checkbox_marker:after {
                background-color: tran");
                WriteLiteral(@"sparent;
                border: 2px solid #f2fafb;
                border-right: none;
                border-top: none;
                content: ' ';
                display: block;
                height: 35%;
                position: absolute;
                transform: rotate(-45deg);
                top: 15%;
                left: 10%;
                width: 70%;
                visibility: hidden;
            }

            .checkbox > input[type=checkbox]:checked + .checkbox_marker:after {
                visibility: visible;
            }

        .checkbox_text {
            vertical-align: middle;
        }

        .dhx_nav_container {
            text-align: center;
            width: 100%;
        }

        .dhx_cal_navline div {
            top: 20px;
        }

        .dhx_cal_prev_button {
            margin-right: 270px;
        }

        div.dhx_cal_prev_button, div.dhx_cal_next_button {
            background: none;
            border: none;
            display: inline-block;
         ");
                WriteLiteral(@"   position: relative;
            left: -90px;
            right: 0;
            top: 2px;
            width: 20px;
        }

        .dhx_cal_prev_button:after, .dhx_cal_next_button:after {
            border: 2px solid #868686;
            content: ' ';
            display: block;
            height: 7px;
            margin-top: -5px;
            position: absolute;
            transform: rotate(45deg);
            top: 50%;
            width: 7px;
        }

        .dhx_cal_prev_button:after {
            border-right: none;
            border-top: none;
            left: 50%;
        }

        .dhx_cal_next_button:after {
            border-left: none;
            border-bottom: none;
            right: 50%;
        }

        .dhx_cal_today_button {
            border-radius: 2px;
            left: 22px;
            width: 74px;
        }

            .dhx_cal_today_button:hover {
                background-color: #0dbbce;
                color: #fff;
            }

        .dhx_cal_tab {
           ");
                WriteLiteral(@" font-family: Roboto, Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            line-height: 32px;
            width: 87px;
        }

            .dhx_cal_tab[name=week_timeline_tab] {
                right: 196px;
            }

            .dhx_cal_tab[name=two_week_timeline_tab] {
                right: 108px;
            }

            .dhx_cal_tab[name=month_timeline_tab] {
                right: 20px;
            }

            .dhx_cal_tab.active, .dhx_cal_tab, .dhx_cal_today_button {
                border: solid 1px #0097a7;
                color: #0097a7;
                font-family: Roboto, Arial, sans-serif;
                font-size: 14px;
                font-weight: 500;
            }

                .dhx_cal_tab.active {
                    background-color: #0097a7;
                    color: #ffffff;
                    text-shadow: none;
                }

                .dhx_cal_tab:hover {
                    background-color: #0dbbce;
                  ");
                WriteLiteral(@"  color: #fff;
                }

        .dhx_cal_tab_first {
            border-top-left-radius: 2px;
            border-bottom-left-radius: 2px;
        }

        .dhx_cal_tab_last {
            border-top-right-radius: 2px;
            border-bottom-right-radius: 2px;
        }

        #lightbox_form {
            background-color: #ffffff;
            border-radius: 2px;
            box-sizing: border-box;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
            display: none;
            height: 409px;
            padding: 30px 26px 20px 28px;
            position: absolute;
            width: 405px;
            z-index: 10001;
        }

        .lightbox_left_section, .lightbox_right_section {
            display: inline-block;
            height: auto;
            line-height: 32px;
            min-height: 32px;
            position: relative;
            text-align: left;
            vertical-align: top;
        }

        .lightbox_left_section {
       ");
                WriteLiteral(@"     margin-bottom: 15px;
            width: 70px;
        }

            .lightbox_left_section label {
                color: rgba(0, 0, 0, 0.87);
                font-family: Roboto, serif;
                font-size: 14px;
                font-weight: 500;
            }

            .lightbox_left_section:nth-child(3),
            .lightbox_right_section:nth-child(4) {
                margin-bottom: 20px;
            }

        .lightbox_right_section {
            margin-bottom: 15px;
            padding-left: 1px;
            width: 275px;
        }

        #lightboxStatus {
            margin-bottom: 19px;
        }

        .lightbox_text_field {
            background-color: rgba(0, 0, 0, 0);
            border: 0;
            box-sizing: border-box;
            color: rgba(0, 0, 0, 0.87);
            font-family: Roboto, serif;
            font-size: 14px;
            height: 32px;
            outline: solid 1px rgba(0, 0, 0, 0.08);
            outline-offset: -1px;
            padding: 1px 5px 1px ");
                WriteLiteral(@"10px;
            width: 100%;
        }

        .lightbox_select_field {
            margin-left: 0;
            width: 100%;
        }

        .dhx_minical_popup {
            z-index: 10001;
        }

        .date_time_selector {
            margin-top: 7px;
            position: relative;
        }

        .search_form .date_calendar,
        .lightbox_date_select .date_calendar {
            bottom: 2px;
            left: 7px;
            margin: auto;
            position: absolute;
            top: 0;
        }

        .lightbox_date_select .date_text {
            background-color: rgba(0, 0, 0, 0);
            border: solid 1px rgba(0, 0, 0, 0.08);
            color: rgba(0, 0, 0, 0.87);
            font-size: 14px;
            height: 32px;
        }

        .lightbox_date_select .date_text {
            box-sizing: border-box;
            padding: 1px 5px 1px 30px;
            vertical-align: middle;
            width: 113px;
        }

        .lightbox_buttons {
            margin-top: 19p");
                WriteLiteral(@"x;
        }

            .lightbox_buttons .lightbox_right_section {
                text-align: right;
            }

            .lightbox_buttons .lightbox_button:not(:last-child) {
                margin-right: 16px;
            }

        .lightbox_left_section .lightbox_button {
            margin-left: -16px;
        }

        .lightbox_button:not(.lightbox_button_active):hover {
            background-color: rgba(153, 153, 153, 0.2);
        }

        .lightbox_button {
            background: none;
            border: none;
            border-radius: 2px;
            color: rgba(0, 0, 0, 0.54);
            cursor: pointer;
            font-family: Roboto, serif;
            font-size: 14px;
            font-weight: 500;
            height: 32px;
            padding: 0 16px;
        }

        .lightbox_button_active {
            color: #ffffff;
            background-color: #0097a7;
        }

        .radio {
            display: inline-block;
            height: 20px;
            margin-right: ");
                WriteLiteral(@"10px;
            position: relative;
            vertical-align: middle;
            width: 20px;
        }

            .radio > input[type=radio] {
                cursor: pointer;
                height: 100%;
                margin: 0;
                opacity: 0;
                padding: 0;
                position: absolute;
                width: 100%;
                z-index: 1;
            }

            .radio > .radio_marker {
                background-color: transparent;
                border: 2px solid #797979;
                border-radius: 50%;
                box-sizing: border-box;
                display: block;
                height: 100%;
                width: 100%;
            }

            .radio > input[type=radio]:checked + .radio_marker {
                border-color: #009688;
            }

                .radio > input[type=radio]:checked + .radio_marker:after {
                    content: ' ';
                    background-color: #009688;
                    border-radius: ");
                WriteLiteral(@"50%;
                    height: 50%;
                    left: 50%;
                    position: absolute;
                    transform: translate(-50%, -50%);
                    top: 50%;
                    width: 50%;
                }

        .dhx_rent_reservation {
            background-color: #ef6c00;
        }

        .dhx_rent_prepaid {
            background-color: #ba68c8;
        }

        .dhx_rent_payed {
            background-color: #0097a7;
        }

        .dhtmlXTooltip.tooltip {
            color: rgba(0, 0, 0, 0.87);
            font-family: Roboto, serif;
            line-height: 22px;
            font-size: 14px;
        }

        .dhx_cell_holiday {
            background-color: #fafafa;
        }

        .dhx_scale_bar {
            color: rgba(0, 0, 0, 0.54);
            font-size: 12px;
            line-height: 15px;
        }

        .dhx_cal_navline .dhx_cal_date {
            color: rgba(0, 0, 0, 0.87);
            font-size: 20px;
            font-weight: 500;
      ");
                WriteLiteral(@"      left: -90px;
            opacity: 0.87;
            top: 20px;
        }

        .dhx_cal_event_line .dhx_event_resize {
            background: url(../content/resize_dots.png);
            background-repeat: no-repeat;
            padding-right: 7px;
            opacity: 0.6;
        }

        .dhx_cal_event_line {
            font-size: 14px;
        }

        div.event-bar-text {
            box-sizing: border-box;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: calc(100% - 15px);
        }

        .dhx_matrix_scell, .dhx_matrix_cell {
            border-color: #EDEDED;
        }

        .row {
            display: -ms-flexbox;
            display: flex;
            -ms-flex-wrap: wrap;
            flex-wrap: wrap;
            margin-right: -15px;
            margin-left: -15px;
        }

        .col-12 {
            -ms-flex: 0 0 100%;
            flex: 0 0 100%;
            max-width: 100%;
  ");
                WriteLiteral(@"      }

        .col-4 {
            -ms-flex: 0 0 33.33%;
            flex: 0 0 33.33%;
            max-width: 33.33%;
        }

        .col-2 {
            -ms-flex: 0 0 16.666667%;
            flex: 0 0 16.666667%;
            max-width: 16.666667%;
        }

        .col-6 {
            -ms-flex: 0 0 50%;
            flex: 0 0 50%;
            max-width: 50%;
        }

        .col-8 {
            -ms-flex: 0 0 66.66%;
            flex: 0 0 66.66%;
            max-width: 66.66%;
        }

        .col-10 {
            -ms-flex: 0 0 83.333333%;
            flex: 0 0 83.333333%;
            max-width: 83.333333%;
        }

        .mt-5px {
            margin-top: 5px;
        }

        .mb-5px {
            margin-top: 5px;
        }

        .w-100 {
            width: 100%;
        }

        .borderd-grey {
            border: 1px solid #e4dfdf;
        }

        .h-50px {
            height: 50px;
        }

        .h-80px {
            height: 80px;
        }
         .h-80px {
            h");
                WriteLiteral("eight: 90px;\n        }\n          .h-70px {\n            height: 70px;\n        }\n\n        .cell-pad {\n            padding-top: 10px;\n            padding-left: 3px;\n            padding-right: 3px;\n        }\n    </style>\n");
                EndContext();
            }
            );
            BeginContext(18768, 69, true);
            WriteLiteral("\n\n<div class=\"page-header\">\n    <h3>Project Manager Assignments</h3>\n");
            EndContext();
            BeginContext(19072, 5045, true);
            WriteLiteral(@"</div>

<div class=""assignments-container"" style=""height: calc(100% - 50px);"">

    <div id=""search-panel"">
        <div class=""controls"">
            <fieldset style="" padding: 5px 20px 5px 20px"">
                <legend>PM Assignment</legend>
                <div class=""row mt-5px"">
                    <div class=""col-12"">
                        <label>Choose Project</label>
                    </div>
                    <div class=""col-12"">
                        <select id=""project-list"" style=""width:100%""><option id=""loading-option"">Loading projects...</option></select>
                    </div>
                </div>
                <div class=""row mt-5px"">
                    <div class=""col-6"">
                        <label>Start Date</label>
                    </div>
                    <div class=""col-6"">
                        <label>End Date</label>
                    </div>
                    <div class=""col-6"">
                        <input id=""dateFrom"" name=""dateFrom"" type=""text"" clas");
            WriteLiteral(@"s=""w-100"" placeholder=""Date From"" readonly=""readonly"" />
                    </div>
                    <div class=""col-6"" style=""padding-left:2px"">
                        <input id=""dateTo"" name=""dateTo"" type=""text"" class=""w-100"" placeholder=""Date To"" readonly=""readonly"" />
                    </div>
                </div>
                <div class=""row mt-5px"">
                    <label class=""col-12"">
                        Type
                    </label>
                    <div class=""col-12"">
                        <input id=""project-type"" type=""text"" class=""w-100"" readonly=""readonly"" />
                    </div>
                </div>
                <div class=""row mt-5px"">
                    <label class=""col-12"">
                        Total Ext Value
                    </label>
                    <input id=""ext-value"" type=""currency"" class=""w-100"" readonly=""readonly"" />
                </div>
                <div class=""row"">
                    <div class=""col-12"">
                    ");
            WriteLiteral(@"    <input type=""button"" class=""btny  btn-1 mt-5px"" style=""float:right;background-color:#ffbf48"" value=""Recommend PM"" id=""pm-recm-btn"" />
                    </div>
                </div>
                <div class=""row mt-5px mb-5px"">
                    <label class=""col-12"">
                        Assigned PM
                    </label>
                    <input id=""assigned-pm"" type=""text"" class=""w-100"" readonly=""readonly"" />
                </div>
            </fieldset>
        </div>
        <div class=""controls mt-5px"">
            <fieldset style=""padding: 5px 20px 5px 20px"">
                <legend>PM Filters</legend>
                <div class=""row mt-5px"">
                    <div class=""col-12"">
                        <fieldset style=""padding: 0px 20px 0px 20px"">
                            <legend>Skill Sets:</legend>
                            <span id=""skills-checkboxes""></span>
                        </fieldset>
                    </div>
                </div>
                <div clas");
            WriteLiteral(@"s=""row mt-5px"">
                    <div class=""col-12"">
                        <fieldset style=""padding: 0px 20px 0px 20px"">
                            <legend>Locations:</legend>
                            <span id=""locations-checkboxes""></span>
                        </fieldset>
                    </div>
                </div>
            </fieldset>
        </div>
    </div>
    <div id=""scheduler_here"" class=""dhx_cal_container borderd-grey"" style='width:100%; height:100%; display: none;overflow:auto;'>
        <div style=""display:flex;justify-content:center"">
            <h1>Project Manager Availability</h1>
        </div>        
        <div style=""display:flex;justify-content:center"">
            <h5><span style=""font-size:15px""><</span><span id=""d-from"" style=""font-size:14px""></span> <span style=""font-size:15px""> thru </span><span id=""d-to"" style=""font-size:14px""></span><span style=""font-size:15px"">></span></h5>
        </div>
        <div class=""row mt-5px  borderd-grey h-90px"" style=""margin:0p");
            WriteLiteral(@"x 10px 0px 10px;"">
            <div class=""col-2  borderd-grey cell-pad h-90px"">
                <u>Project</u>:<br /><br /> <span id=""p-title"" style=""font-size:14px;font-weight:bold;""></span>
                <br />
                <input type=""text"" placeholder=""Current PM"" style=""height: 20px;width: 110px;"" id=""current-pm"" readonly=""readonly"" />
                <br />
                <button style=""width:100px;margin-top:1px;background:#e3af50"" id=""assign-pm"">Assign PM</button>
                <br />
                <button style=""width:100px;margin-top:1px;background:#d37d58"" id=""remove-pm"">Remove PM</button>
            </div>
            <div class=""col-10 borderd-grey  h-90px"">
                <div id=""graph-0"" style=""width:100%;""></div>               
            </div>           
        </div>
        <div class=""row mt-5px  borderd-grey"" style=""margin:0px 10px 0px 10px;"" id=""pm-list-div"">
        </div>
    </div>   
</div>

");
            EndContext();
            DefineSection("scripts", async() => {
                BeginContext(24135, 142, true);
                WriteLiteral("\n\n    <script type=\"module\" asp-append-version=\"true\">\n        import { PMAssignments } from \"/js/pmassignments.js\"\n        new PMAssignments(");
                EndContext();
                BeginContext(24278, 31, false);
#line 875 "F:\clients\Impre\ppc-master\Portal\Features\PMAssignment\Index.cshtml"
                     Write(Html.Raw(Json.Serialize(Model)));

#line default
#line hidden
                EndContext();
                BeginContext(24309, 19, true);
                WriteLiteral(");\n\n\n    </script>\n");
                EndContext();
            }
            );
        }
        #pragma warning restore 1998
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.ViewFeatures.IModelExpressionProvider ModelExpressionProvider { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IUrlHelper Url { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IViewComponentHelper Component { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IJsonHelper Json { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper<Portal.Data.Models.PMAssignmentVM> Html { get; private set; }
    }
}
#pragma warning restore 1591
