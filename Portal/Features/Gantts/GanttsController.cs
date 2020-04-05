using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Data;

namespace Portal.Features.TestGantt
{
    [Authorize]
    [Route("gantts")]
    public class GanttsController : Controller
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public GanttsController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public ActionResult Index() ///(string ent)
        {
           
            return View("Index");
        }
    }
}