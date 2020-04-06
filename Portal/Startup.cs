using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Serialization;
using Okta.AspNetCore;
using Portal.Data;
using Portal.Data.Models;
using Portal.Helpers;
using Portal.Models;

namespace Portal {
    public class Startup {
        public Startup(IConfiguration configuration) {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) {
            services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");

            services.Configure<RazorViewEngineOptions>(o => {
                var expander = new Helpers.ViewLocationExpander();
                o.ViewLocationExpanders.Add(expander);
            });

            services.Configure<CookiePolicyOptions>(options => {
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

            services.AddDbContext<SyvennDBContext>(options => {
                options.UseSqlServer(Configuration["ConnectionStrings:SyvennDbEF"]);
            });

            services.AddHttpClient();

            services.Configure<CurrentUser>(Configuration);

            services.Configure<OktaSettings>(Configuration.GetSection("Okta"));

            var oktaMvcOptions = new OktaMvcOptions() {
                OktaDomain = Configuration.GetSection("Okta").GetValue<string>("OktaDomain"),
                ClientId = Configuration.GetSection("Okta").GetValue<string>("ClientId"),
                ClientSecret = Configuration.GetSection("Okta").GetValue<string>("ClientSecret"),
                PostLogoutRedirectUri = Configuration.GetSection("Okta").GetValue<string>("PostLogoutRedirectUri"),
                CallbackPath = "/account/callback",
                Scope = new List<string> { "openid", "profile", "email" },
                GetClaimsFromUserInfoEndpoint = true,
            };

            services.AddAuthentication(options => {
                options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OktaDefaults.MvcAuthenticationScheme;
            })
            .AddCookie()
            .AddOktaMvc(oktaMvcOptions);


            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddKendo();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }
            else {
                //app.UseExceptionHandler("/Default/Error");
                app.UseHsts();
            }

            app.UseGanttErrorMiddleware();
            app.ConfigureCustomExceptionMiddleware();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
