#pragma checksum "F:\clients\Impre\ppc-master\Portal\Features\Account\SignIn2.cshtml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "cd72d5ddba200b95ea5cab8a07cbcff6120b627d"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Features_Account_SignIn2), @"mvc.1.0.view", @"/Features/Account/SignIn2.cshtml")]
[assembly:global::Microsoft.AspNetCore.Mvc.Razor.Compilation.RazorViewAttribute(@"/Features/Account/SignIn2.cshtml", typeof(AspNetCore.Features_Account_SignIn2))]
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
#line 5 "F:\clients\Impre\ppc-master\Portal\Features\Account\SignIn2.cshtml"
using Microsoft.Extensions.Options;

#line default
#line hidden
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"cd72d5ddba200b95ea5cab8a07cbcff6120b627d", @"/Features/Account/SignIn2.cshtml")]
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"6c1831ff6ff6d1f6721b272e06c352287d2a1fb2", @"/Features/_ViewImports.cshtml")]
    public class Features_Account_SignIn2 : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<dynamic>
    {
        private static readonly global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute __tagHelperAttribute_0 = new global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute("src", new global::Microsoft.AspNetCore.Html.HtmlString("~/images/PCC-Login Screen.png"), global::Microsoft.AspNetCore.Razor.TagHelpers.HtmlAttributeValueStyle.DoubleQuotes);
        private static readonly global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute __tagHelperAttribute_1 = new global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute("style", new global::Microsoft.AspNetCore.Html.HtmlString("height: 100%; width: 100%; object-fit: contain"), global::Microsoft.AspNetCore.Razor.TagHelpers.HtmlAttributeValueStyle.SingleQuotes);
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
        private global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.UrlResolutionTagHelper __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper;
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
#line 1 "F:\clients\Impre\ppc-master\Portal\Features\Account\SignIn2.cshtml"
  
    Layout = "";

#line default
#line hidden
            BeginContext(22, 1, true);
            WriteLiteral("\n");
            EndContext();
#line 8 "F:\clients\Impre\ppc-master\Portal\Features\Account\SignIn2.cshtml"
  
    ViewData["Title"] = "PCC Sign In";

#line default
#line hidden
            BeginContext(202, 105, true);
            WriteLiteral("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Strict//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n<html>\n");
            EndContext();
            BeginContext(307, 5123, false);
            __tagHelperExecutionContext = __tagHelperScopeManager.Begin("head", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.StartTagAndEndTag, "cd72d5ddba200b95ea5cab8a07cbcff6120b627d4998", async() => {
                BeginContext(313, 280, true);
                WriteLiteral(@"
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <meta name=""robots"" content=""none"" />
    <link rel=""SHORTCUT ICON"" href=""images/favicon.ico"">
    <title>PCC Sign In</title>
");
                EndContext();
                BeginContext(629, 4794, true);
                WriteLiteral(@"
    <link href=""https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.16.0/css/okta-sign-in.min.css"" type=""text/css"" rel=""stylesheet"" />
    <link href=""https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.16.0/css/okta-theme.css"" type=""text/css"" rel=""stylesheet"" />

    <script src=""https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.16.0/js/okta-sign-in.min.js"" type=""text/javascript""></script>
    <link rel=""stylesheet"" type=""text/css"" href=""https://fonts.googleapis.com/css?family=Lato:100,300,300i,400"">
    <link rel=""stylesheet"" href=""https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css"">
    <style>
        /* ---------------------- BASE ------------------------*/
        *,
        *:before,
        *:after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #000000;
        }

        .container {
            font-family: 'Lato', 'Arial', sans-serif;
            fo");
                WriteLiteral(@"nt-size: 1em;
            font-weight: 300;
            line-height: 1.5;
            text-rendering: optimizeLegibility;
            display:flex;
            width: 100%;
            margin: auto;
            position: relative;
            /* max-width: 1280px; */
        }


        

        h1,
        h2,
        h3 {
            font-weight: 300;
        }

        h1 {
            font-size: 240%;
            word-spacing: 0.3rem;
            letter-spacing: 0.1rem;
            margin: 0.3em 0;
            line-height: 1;
        }

        h2 {
            font-size: 100%;
        }

        p {
            font-weight: 100;
        }

        /* ---------------------- LOGIN ------------------------*/

        .container header {
            position: absolute;
            top: 2em;
            left: 5em;
        }

        header h1 {
            font-weight: 800;
            font-size: 240%;
            word-spacing: 0.2rem;
            letter-spacing: 0.07rem;
            margin: 0.3em 0;
       ");
                WriteLiteral(@"     color: black;
        }

        .content {
            display: flex;
            flex-direction: row;
            width: 100%;
        }

        .information-section {
            min-height: 100vh;
            color: black;
            flex-direction: column;
            text-align: left;
            width: 70%;
            padding: 1em;
            background-size: cover;
            background-position:  initial;
            background-attachment: fixed;
        }

        .information {
            margin-top: 5%;
        }

        .information-section h1 {
        color: black;
        }

        .information-section h2 {
            font-weight: 600;
        }

        .information-section p {
            font-weight: 200;
        }

        .information-section ul {
            list-style: none;
            padding-top: 0.5em;
        }

        .information-section li {
            margin-bottom: 1em;
        }

        .login-section {
            min-height: 100vh;
            background: w");
                WriteLiteral(@"hite;
            width: 50%;
            padding: 5em;
            max-width: 600px;
        }

        .col {
            flex: 1;
        }

        /*---------------------------- OKTA SIGN IN WIDGET OVERRIDES -----------------------*/

        #okta-sign-in.auth-container.main-container {
            background-color: white;
            border: 0;
            font-family: 'Lato', 'Arial', sans-serif;
        }

        #okta-sign-in.auth-container .okta-sign-in-header {
            border: 0;
        }

        #okta-sign-in.auth-container input[type=""submit""] {
            background: #f45224;
            color: black;
            border: 0;
        }

        #okta-sign-in.auth-container .registration-link,
        #okta-sign-in.auth-container .auth-footer
        {
            color: #f45224;
        }

        #okta-sign-in.auth-container .o-form-input-name-remember {
            display: none;
        }

        #okta-sign-in.auth-container .o-form-head {
            color: #777;
            font-wei");
                WriteLiteral(@"ght: bold;
        }

        .login-section input::placeholder {
            opacity: 0.5
        }

        .login-section input {
            color: #777;
        }

        .login-section input:-webkit-autofill {
            -webkit-text-fill-color: #777;
            color: #777
        }

        .login-section #okta-sign-in .auth-org-logo {
            display: none;
        }

        .login-section #okta-sign-in a.help:active,
        .login-section #okta-sign-in a.help:link,
        .login-section #okta-sign-in a.help:visited {
            color: #f45224;
        }

        .login-section #okta-sign-in {
            margin-top: 0;
            min-height: 0;
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
            BeginContext(5430, 1, true);
            WriteLiteral("\n");
            EndContext();
            BeginContext(5431, 6208, false);
            __tagHelperExecutionContext = __tagHelperScopeManager.Begin("body", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.StartTagAndEndTag, "cd72d5ddba200b95ea5cab8a07cbcff6120b627d11556", async() => {
                BeginContext(5437, 1, true);
                WriteLiteral("\n");
                EndContext();
                BeginContext(7730, 389, true);
                WriteLiteral(@"
    <main role=""main"" class=""container"" style=""background-image: url('https://i.imgur.com/6IQDYI1.jpg')"">
        <header><h1>PCC Sign In</h1></header>
        <section class=""col login-section""> <div id=""okta-login-container"">
                                                <script type=""text/javascript"">
                var oktaSignIn = new oktaSignIn({
                    baseUrl: '");
                EndContext();
                BeginContext(8120, 29, false);
#line 277 "F:\clients\Impre\ppc-master\Portal\Features\Account\SignIn2.cshtml"
                         Write(oktaSettings.Value.OktaDomain);

#line default
#line hidden
                EndContext();
                BeginContext(8149, 124, true);
                WriteLiteral("\',\n                    clientId: \'0oaivc8tjgoSec5X20h7\',\n                    authParams: {\n                        issuer: \'");
                EndContext();
                BeginContext(8274, 29, false);
#line 280 "F:\clients\Impre\ppc-master\Portal\Features\Account\SignIn2.cshtml"
                            Write(oktaSettings.Value.OktaDomain);

#line default
#line hidden
                EndContext();
                BeginContext(8303, 1773, true);
                WriteLiteral(@"' + '/oauth2/default',
                        responseType: ['token', 'id_token'],
                        display: 'page'
                    }
                });
                if (oktaSignIn.token.hasTokensInUrl()) {
                    oktaSignIn.token.parseTokensFromUrl(
                        function success(res) {
                            var accessToken = res[0];
                            var idToken = res[1];

                            console.log('Hello, ' + idToken.claims.email);

                            oktaSignIn.tokenManager.add('accessToken', accessToken);
                            oktaSignIn.tokenManager.add('idToken', idToken);

                            window.location.hash = '';
                        },
                        function eror(err) {
                            console.error(err);
                        }
                    );
                } else {
                    oktaSignIn.session.get(function (res) {
                        if (res.status === ");
                WriteLiteral(@"'ACTIVE') {
                            console.log('Welcome back, ' + res.login);
                            return;
                        }
                        oktaSignIn.renderEl(
                            {
                                el: '#okta-login-container'
                            },
                            function succss(res) {

                            },
                            function error(err) {
                                console.error(err);
                            }

                        );
                    });
                }
                                                </script>
               </div> </section>
        <section class=""col information-section"">
            ");
                EndContext();
                BeginContext(10076, 98, false);
                __tagHelperExecutionContext = __tagHelperScopeManager.Begin("img", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.SelfClosing, "cd72d5ddba200b95ea5cab8a07cbcff6120b627d15138", async() => {
                }
                );
                __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper = CreateTagHelper<global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.UrlResolutionTagHelper>();
                __tagHelperExecutionContext.Add(__Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper);
                __tagHelperExecutionContext.AddHtmlAttribute(__tagHelperAttribute_0);
                __tagHelperExecutionContext.AddHtmlAttribute(__tagHelperAttribute_1);
                await __tagHelperRunner.RunAsync(__tagHelperExecutionContext);
                if (!__tagHelperExecutionContext.Output.IsContentModified)
                {
                    await __tagHelperExecutionContext.SetOutputContentAsync();
                }
                Write(__tagHelperExecutionContext.Output);
                __tagHelperExecutionContext = __tagHelperScopeManager.End();
                EndContext();
                BeginContext(10174, 1458, true);
                WriteLiteral(@"
        </section>
    </main>



    {{{OktaUtil}}}


    <script type=""text/javascript"">
        // ""config"" object contains default widget configuration
        // with any custom overrides defined in your admin settings.
        var config = {{{config}}};
        config.features.registration = true;
        config.registration = {
          parseSchema: function(schema, onSuccess, onFailure) {
             console.log('parseSchema');
             gtag('event', 'Start Sign-Up', {'event_category': 'Login Atko'});
             onSuccess(schema);
          },
          preSubmit: function (postData, onSuccess, onFailure) {
             console.log('preSubmit');
             gtag('event', 'Process Sign-Up', {'event_category': 'Login Atko'});
             onSuccess(postData);
          },
          postSubmit: function (response, onSuccess, onFailure) {
             console.log('postSubmit');
             gtag('event', 'User Created', {'event_category': 'Login Atko'});
             onSuccess(response);
       ");
                WriteLiteral(@"   }
    };

           var oktaSignIn = new OktaSignIn(config);
        oktaSignIn.renderEl({ el: '#okta-login-container' },
            OktaUtil.completeLogin,
            function(error) {
                // Logs errors that occur when configuring the widget.
                // Remove or replace this with your own custom error handler.
                console.log(error.message, error);
            }
        );
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
            BeginContext(11639, 9, true);
            WriteLiteral("\n</html>\n");
            EndContext();
        }
        #pragma warning restore 1998
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public IOptions<OktaSettings> oktaSettings { get; private set; }
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
