using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Helpers;
using Portal.Models;
using Portal.Data;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Portal.Data.Models;

namespace Portal.Features.Utilities {
    public class UtilitiesController : Controller {

        [Route("ExportToPDF")]
        [HttpPost]
        public ActionResult ExportToPDF(string contentType, string base64, string fileName) {
            var fileContents = Convert.FromBase64String(base64);
            return File(fileContents, contentType, fileName);
        }

        [Route("ExportToExcel")]
        [HttpPost]
        public ActionResult ExportToExcel(string contentType, string base64, string fileName) {
            var fileContents = Convert.FromBase64String(base64);

            return File(fileContents, contentType, fileName);
        }
    }
}
