#pragma checksum "F:\clients\Impre\ppc-master\Portal\Features\Components\DocumentCard\index.cshtml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "e3b312921b887f4575fee919657418dea0320698"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Features_Components_DocumentCard_index), @"mvc.1.0.view", @"/Features/Components/DocumentCard/index.cshtml")]
[assembly:global::Microsoft.AspNetCore.Mvc.Razor.Compilation.RazorViewAttribute(@"/Features/Components/DocumentCard/index.cshtml", typeof(AspNetCore.Features_Components_DocumentCard_index))]
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
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"e3b312921b887f4575fee919657418dea0320698", @"/Features/Components/DocumentCard/index.cshtml")]
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"6c1831ff6ff6d1f6721b272e06c352287d2a1fb2", @"/Features/_ViewImports.cshtml")]
    public class Features_Components_DocumentCard_index : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<dynamic>
    {
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
            BeginContext(6, 296, true);
            WriteLiteral(@"<div>
    <label class=""switch"">
        <span>Card View</span>
        <input id=""isCard"" type=""checkbox"">
        <span class=""slider"">Table View</span>
    </label>
    <div id=""carouselview"" class="".carousel-container""></div>
    <div id=""documents-grid"" style=""display:none""></div>
</div>


");
            EndContext();
            DefineSection("scripts", async() => {
                BeginContext(320, 159, true);
                WriteLiteral("\n    <script type=\"module\" asp-append-version=\"true\">\n        import { DocumentCardList } from \"/js/components/document-cards.js\"\n        new DocumentCardList(");
                EndContext();
                BeginContext(480, 31, false);
#line 18 "F:\clients\Impre\ppc-master\Portal\Features\Components\DocumentCard\index.cshtml"
                        Write(Html.Raw(Json.Serialize(Model)));

#line default
#line hidden
                EndContext();
                BeginContext(511, 18, true);
                WriteLiteral(");\n    </script>\n\n");
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
        public global::Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper<dynamic> Html { get; private set; }
    }
}
#pragma warning restore 1591
