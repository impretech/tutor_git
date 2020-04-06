#pragma checksum "F:\clients\Impre\ppc-master\Portal\Features\PCC\Indexmap.cshtml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "08299e642b58183739357cf7aaeaee4ce5be0939"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Features_PCC_Indexmap), @"mvc.1.0.view", @"/Features/PCC/Indexmap.cshtml")]
[assembly:global::Microsoft.AspNetCore.Mvc.Razor.Compilation.RazorViewAttribute(@"/Features/PCC/Indexmap.cshtml", typeof(AspNetCore.Features_PCC_Indexmap))]
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
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"08299e642b58183739357cf7aaeaee4ce5be0939", @"/Features/PCC/Indexmap.cshtml")]
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"6c1831ff6ff6d1f6721b272e06c352287d2a1fb2", @"/Features/_ViewImports.cshtml")]
    public class Features_PCC_Indexmap : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<dynamic>
    {
        #line hidden
        #pragma warning disable 0169
        private string __tagHelperStringValueBuffer;
        #pragma warning restore 0169
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperExecutionContext __tagHelperExecutionContext;
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperRunner __tagHelperRunner = new global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperRunner();
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager __backed__tagHelperScopeManager = null;
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager __tagHelperScopeManager
        {
            get
            {
                if (__backed__tagHelperScopeManager == null)
                {
                    __backed__tagHelperScopeManager = new global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager(StartTagHelperWritingScope, EndTagHelperWritingScope);
                }
                return __backed__tagHelperScopeManager;
            }
        }
        private global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.HeadTagHelper __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_HeadTagHelper;
        private global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.BodyTagHelper __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_BodyTagHelper;
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
#line 1 "F:\clients\Impre\ppc-master\Portal\Features\PCC\Indexmap.cshtml"
  
    ViewData["Title"] = "Home Page";
    Layout = null;

#line default
#line hidden
            BeginContext(65, 27, true);
            WriteLiteral("\r\n<!DOCTYPE html>\r\n<html>\r\n");
            EndContext();
            BeginContext(92, 533, false);
            __tagHelperExecutionContext = __tagHelperScopeManager.Begin("head", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.StartTagAndEndTag, "08299e642b58183739357cf7aaeaee4ce5be09393626", async() => {
                BeginContext(98, 520, true);
                WriteLiteral(@"
    <meta name=""viewport"" content=""initial-scale=1.0, user-scalable=no"">
    <meta charset=""utf-8"">
    <title>Markers</title>
    <style>
         /* Always set the map height explicitly to define the size of the div
        * element that contains the map. */
         #map {
             height: 100%;
         }
         /* Optional: Makes the sample page fill the window. */
         html, body {
             height: 100%;
             margin: 0;
             padding: 0;
         }
    </style>
");
                EndContext();
            }
            );
            __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_HeadTagHelper = CreateTagHelper<global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.HeadTagHelper>();
            __tagHelperExecutionContext.Add(__Microsoft_AspNetCore_Mvc_Razor_TagHelpers_HeadTagHelper);
            await __tagHelperRunner.RunAsync(__tagHelperExecutionContext);
            if (!__tagHelperExecutionContext.Output.IsContentModified)
            {
                await __tagHelperExecutionContext.SetOutputContentAsync();
            }
            Write(__tagHelperExecutionContext.Output);
            __tagHelperExecutionContext = __tagHelperScopeManager.End();
            EndContext();
            BeginContext(625, 2, true);
            WriteLiteral("\r\n");
            EndContext();
            BeginContext(627, 7435, false);
            __tagHelperExecutionContext = __tagHelperScopeManager.Begin("body", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.StartTagAndEndTag, "08299e642b58183739357cf7aaeaee4ce5be09395332", async() => {
                BeginContext(633, 7061, true);
                WriteLiteral(@"

    <div id=""map""></div>
    <script>
        var locations = [
            { lat: 39.489925, lng: -76.649907 },
            { lat: 39.373907, lng: -76.459098 },
            { lat: 39.097505, lng: -76.860349 },
            { lat: 38.804399, lng: -77.092330 },
            { lat: 17.9700973, lng: -66.664164 },
            { lat: 18.3892246, lng: -66.1306844 },   //Ponce, PR
            { lat: 18.4243245, lng: -64.6334053 },  //San Juan, PR
            { lat: 30.3110713, lng: -81.6632028 },  //Jacksonville, FL
            { lat: 25.7823907, lng: -80.2996703 },  //Miami, FL
            { lat: 30.0326981, lng: -90.1634374 },  //New Orleans, LA
            { lat: 39.0921167, lng: -94.8559015 },  //Kansas City, MO
            { lat: 32.8208751, lng: -96.8716264 },  //Dallas, TX
            { lat: 29.8174782, lng: -95.6814769 },   //Houston TX
            { lat: 33.2953387, lng: -111.8340024 },   //Gilbert AZ
            { lat: 36.1175584, lng: -115.2014622 }, //Las Vegas NV
            { lat: 3");
                WriteLiteral(@"8.875868, lng: -104.8984428 },  // Colorado Springs, CO
            { lat: 38.561919, lng: -121.5829959 },  //Sacramento, CA
            { lat: 37.7589061, lng: -122.3753914 },   //Oakland, CA
            { lat: 34.0207305, lng: -118.6919165 },  //Los Angeles, CA
            { lat: 33.9541079, lng: -118.36363 },  //Inglewood, CA
            { lat: 45.5428679, lng: -122.7944098 }, //Portland, OR
            { lat: 47.6131746, lng: -122.482147 },  //Seattle, WA
            { lat: 42.347245, lng: -71.0816589 },   //Boston MA
            { lat: 40.7666022, lng: - 73.9868357 },   //New York, NY
            { lat: 40.0026767, lng: -75.2581116 }, //Phila PA
            { lat: 44.970797, lng: -93.3315181 }  //Minneaoplis MN
        ]

        function initMap() {
            var heatMapData = [
                { location: new google.maps.LatLng(47.6129432, -122.482147), weight: 1187 },  //Seattle
                { location: new google.maps.LatLng(41.8336478, -87.8720469), weight: 288 }, // chicago
  ");
                WriteLiteral(@"              { location: new google.maps.LatLng(39.7797003, -86.2728332), weight: 39 }, // Indy, IN
                { location: new google.maps.LatLng(41.6470476, -91.5743828),  weight: 16 }, // Iowa, IA
                { location: new google.maps.LatLng(40.9301894, -73.8439365), weight: 4325 }, //New Rochelle NY
                { location: new google.maps.LatLng(38.9764568, -107.7936348), weight: 216 }, //CO
                { location: new google.maps.LatLng(33.7676338, -84.5606878), weight: 262},   //GA
                { location: new google.maps.LatLng(45.5426274, -122.7944096), weight: 24 },   //Portland OR
                { location: new google.maps.LatLng(36.1249185, -115.3150836), weight: 11 }, //Vegas
                { location: new google.maps.LatLng(42.0314669, -72.8045511), weight: 108 }, //MA
                { location: new google.maps.LatLng(39.2846854, -76.6905365), weight: 12}, //MD
                { location: new google.maps.LatLng(40.2160482, -74.8092249), weight: 29 }, //NJ
      ");
                WriteLiteral(@"          { location: new google.maps.LatLng(37.5246403, -77.5633012), weight: 29 },  //VA
                { location: new google.maps.LatLng(28.4810971, -81.5089228), weight: 299 },  //Fl
                { location: new google.maps.LatLng(30.0329222, -90.0226477), weight: 261 },  //New Orleans, LA
                { location: new google.maps.LatLng(32.8205865, -96.8716264), weight: 24 },  //Dallas, TX
                { location: new google.maps.LatLng(34.7242065, -92.4783548), weight: 37 },  //Little Rock, AK
                { location: new google.maps.LatLng(41.7657461, -72.7151922), weight: 96 },  //Hartford, CN
                { location: new google.maps.LatLng(39.1564772, -75.5485252), weight: 26 },  //Dover, DE
                { location: new google.maps.LatLng(38.893709, -77.0847875), weight: 39 },  //DC
                { location: new google.maps.LatLng(38.1889912, -85.8171975), weight: 35 },  //Louisville, KN
                { location: new google.maps.LatLng(44.9707969, -93.3316898), weight:");
                WriteLiteral(@" 10 },  //Minneapolis, MN
                { location: new google.maps.LatLng(41.4830383, -101.9293943), weight: 10 },  //Lincoln, NE
                { location: new google.maps.LatLng(35.0747963, -79.022443), weight: 15 },  //Fayetteville, NC
                { location: new google.maps.LatLng(40.2822047, -76.9155307), weight: 23 },  //Harrisburg, PA
                { location: new google.maps.LatLng(34.0377136, -81.0779923), weight: 12 },  //Columbia, SC
                { location: new google.maps.LatLng(44.370824, -100.3556437), weight: 8 },  //Pierre, SD
                { location: new google.maps.LatLng(36.1868356, -86.9256726), weight: 18 },  //Nashville, TN
                { location: new google.maps.LatLng(44.9624985, -89.7309858), weight: 8 },  //Wausau, WI
                { location: new google.maps.LatLng(33.6056695, -112.4059227), weight: 27 },  //Pheonix, AZ
                { location: new google.maps.LatLng(33.5314444, -86.9905644), weight: 51 }, //Birmingham, AL
                { locati");
                WriteLiteral(@"on: new google.maps.LatLng(61.1083631, -150.0020606), weight: 6 }, //Achorage, AK
                { location: new google.maps.LatLng(34.020729, -118.692604), weight: 652 }, //Los Angeles, CA
                { location: new google.maps.LatLng(37.6647975, 97.5841205), weight: 21 }, //Witchita, KS
                { location: new google.maps.LatLng(44.8297696, -68.8591907), weight: 44 } //Bangor, ME
            ];

            var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
               // center: sanFrancisco,
                center: { lat: 39.489925, lng: -77.092330 },
                //mapTypeId: 'satellite'
            });

            var heatmap = new google.maps.visualization.HeatmapLayer({
                data: heatMapData
            });
            heatmap.set('radius', 100); 
            heatmap.setMap(map);

            // Create an array of alphabetical chara");
                WriteLiteral(@"cters used to label the markers.
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

            // Add some markers to the map.
            // Note: The code uses the JavaScript Array.prototype.map() method to
            // create an array of markers based on a given ""locations"" array.
            // The map() method here has nothing to do with the Google Maps API.
            var markers = locations.map(function (location, i) {
                return new google.maps.Marker({
                    position: location,
                    label: labels[i % labels.length]
                });
            });

            // Add a marker clusterer to manage the markers.
            var markerCluster = new MarkerClusterer(map, markers,
                { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });


        }


    </script>
");
                EndContext();
                BeginContext(7751, 304, true);
                WriteLiteral(@"
    <script src='https://cdnjs.cloudflare.com/ajax/libs/markerclustererplus/2.1.4/markerclusterer.min.js'></script>
    <script async defer
            src=""https://maps.googleapis.com/maps/api/js?key=AIzaSyAVvNmOP-SZ-Rt8Aeu_o19kAn4HO9vRiiU&libraries=visualization&callback=initMap"">
    </script>
");
                EndContext();
            }
            );
            __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_BodyTagHelper = CreateTagHelper<global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.BodyTagHelper>();
            __tagHelperExecutionContext.Add(__Microsoft_AspNetCore_Mvc_Razor_TagHelpers_BodyTagHelper);
            await __tagHelperRunner.RunAsync(__tagHelperExecutionContext);
            if (!__tagHelperExecutionContext.Output.IsContentModified)
            {
                await __tagHelperExecutionContext.SetOutputContentAsync();
            }
            Write(__tagHelperExecutionContext.Output);
            __tagHelperExecutionContext = __tagHelperScopeManager.End();
            EndContext();
            BeginContext(8062, 15, true);
            WriteLiteral("\r\n</html>\r\n\r\n\r\n");
            EndContext();
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
        public global::Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper<dynamic> Html { get; private set; }
    }
}
#pragma warning restore 1591
