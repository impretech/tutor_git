using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Okta.AspNetCore;
using Portal.Models;

namespace Portal.Features.Account {
    [Route("account")]
    public class AccountController : Controller {
        private OktaSettings _oktaSettings;

        public AccountController(IOptions<OktaSettings> oktaSettings) {
            _oktaSettings = oktaSettings.Value;
        }

        [Route("login")]
        [HttpGet]
        public IActionResult Login() {
              return View();
            //return RedirectToAction("Signin");
        }

        [Route("signin")]
        [HttpGet]
        public IActionResult Signin()
        {
            return View();
            //return RedirectToAction("Signin");
        }

        [Route("signin2")]
        [HttpGet]
        public IActionResult Signin2()
        {
            return View();
            //return RedirectToAction("Signin");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("authenticate")]
        public IActionResult Authenticate(string sessionToken) {
            if (!HttpContext.User.Identity.IsAuthenticated) {
                var properties = new AuthenticationProperties();
                properties.Items.Add("sessionToken", sessionToken);
                properties.RedirectUri = "/";
                return Challenge(properties, OktaDefaults.MvcAuthenticationScheme);
            }

            return RedirectToAction("Index", "PCC");
        }

        [HttpGet]
        [Route("logout")]
        public IActionResult Logout() {
            return new SignOutResult(new[] { CookieAuthenticationDefaults.AuthenticationScheme, OktaDefaults.MvcAuthenticationScheme });
        }

        [HttpPost]
        [Route("callback")]
        public IActionResult Callback() {
            return RedirectToAction("Index", "PCC");
        }
    }
}