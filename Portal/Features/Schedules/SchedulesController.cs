using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.API;
using Portal.Data;
using Portal.Data.Models;

namespace Portal.Features.Schedules
{
    [Route("schedules")]
    [Authorize]
    public class SchedulesController : Controller
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }
        private CurrentUser currentUser = new CurrentUser();

        public SchedulesController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<ActionResult> Index() ///(string ent)
        {
            List<ScheduleVM> result = new List<ScheduleVM>();
            ProjectController PC = new ProjectController(HostingEnvironment, _db);

            var scheds =  _db.Schedules.Where(p => p.EntCode == "PRO1").ToList();
            foreach (Schedule s in scheds)
            {
                string title =await PC.GetProjectTitlebyID(s.ProjectID, s.EntCode);
                ScheduleVM newshed = new ScheduleVM()
                {
                    SchedID = s.SchedID,
                    ProjectID = s.ProjectID,
                    CreatedBy = s.CreatedBy,
                    EntCode = s.EntCode,
                    EstimatedStart = s.EstimatedStart,
                    InstallDate = s.InstallDate,
                    MaterialsDelivery = s.MaterialsDelivery,
                    RequestedStart = s.RequestedStart,
                    SalesforceID = s.SalesforceID,
                    SalesPerson = s.SalesPerson,
                    SalesPersonEmail = s.SalesPersonEmail,
                    ProjectTitle = title
                };
                result.Add(newshed);
            }
            return View("Index", result);
        }

        [Route("{id}")]
        [HttpGet]
        public async  Task<IActionResult> Edit(long id) //, string ent)
        {
            try
            {
                currentUser = await GetCurrentUser(HttpContext);
                ProjectController PC = new ProjectController(HostingEnvironment, _db);
                var s = await _db.Schedules.Where(p => p.EntCode == currentUser.EntCode && p.SchedID == id).FirstOrDefaultAsync();
                string title = await PC.GetProjectTitlebyID(s.ProjectID, currentUser.EntCode);
                ScheduleVM result = new ScheduleVM()
                {
                    SchedID = s.SchedID,
                    ProjectID = s.ProjectID,
                    CreatedBy = s.CreatedBy,
                    EntCode = s.EntCode,
                    EstimatedStart = s.EstimatedStart,
                    InstallDate = s.InstallDate,
                    MaterialsDelivery = s.MaterialsDelivery,
                    RequestedStart = s.RequestedStart,
                    SalesforceID = s.SalesforceID,
                    SalesPerson = s.SalesPerson,
                    SalesPersonEmail = s.SalesPersonEmail,
                    ProjectTitle = title
                };
              
                return View("AddEdit", result);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        public async Task<CurrentUser> GetCurrentUser(HttpContext context)
        {
            try
            {
                currentUser = new CurrentUser();
                var principal = context.User.Identity as ClaimsIdentity;
                var login = principal.Claims.SingleOrDefault(c => c.Type == "email")?.Value;
                var name = principal.Claims.SingleOrDefault(c => c.Type == "name")?.Value;
                currentUser.UserEmail = login;
                currentUser.UserName = name;

                var ent = await _db.UserContacts.Where(i => i.UserEmail.ToLower() == login.ToLower()).Select(i => i.EntCode).FirstOrDefaultAsync();
                currentUser.EntCode = ent;

                return currentUser;
            }
            catch (Exception ex)
            {
                Console.Write("GetCurrentUser", ex.Message);
                return null;
            }
        }

    }
}