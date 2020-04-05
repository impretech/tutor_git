using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.API;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.Features.PMAssignment {
    [Route("pmassignments")]
    [Authorize]
    public class PMAssignmentController : Controller {

        private readonly SyvennDBContext _db;
        public PMAssignmentController(SyvennDBContext dbContext) {
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index() {
            //PMAssignmentVM pms = new PMAssignmentVM();
            //pms.ProjectTitles = new List<string>();
            //pms.ProjectTitles = await _db.Project.Where(i => i.Status != "Complete").Select(i => i.Title).ToListAsync();

            //pms.PMs = new List<ProjectMgr>();
            //pms.PMs = await _db.ProjectMgrs.Where(i => i.Status == "Active").ToListAsync();

            //pms.Skillsets = new List<Skillset>();
            //pms.Skillsets = await _db.Skillsets.ToListAsync();

            return View("Index");
        }

        public DateTime GetStartDate(long projid)
        {
            try
            {
                var start = _db.Tasks.Where(i => i.ProjectID == projid).Min(i => i.StartDate);
                return start;
            }
            catch
            {
                return DateTime.Now;
            }
        }

        public async Task<DateTime> GetEndDate(long projid, DateTime start)
        {
            try
            {

                var tasks =await _db.Tasks.Where(i => i.ProjectID == projid).ToListAsync();
                DateTime end = start;
                foreach (Data.Models.Task t in tasks)
                {
                    if (t.StartDate.AddDays(t.Duration) > end)
                        end = t.StartDate.AddDays(t.Duration);
                }
                return end;
            }
            catch
            {
                return DateTime.Now.AddMonths(2);
            }
        }

        //[HttpGet]
        //[Route("GetAssignmentVM")]
        //public async Task<PMAssignmentViewModel> GetAssignmentVM()
        //{
        //    try
        //    {
        //        PMAssignmentViewModel PMAVM = new PMAssignmentViewModel();
        //        PMAVM.PMs = new List<ProjectMgr>();
        //        PMAVM.PMs =await _db.ProjectMgrs.Where(i => i.Status == "Active").ToListAsync();

        //        PMAVM.Skillsets = new List<Skillset>();
        //        PMAVM.Skillsets = await _db.Skillsets.ToListAsync();

        //        PMAVM.Events = new List<WebAPIEvent>();

        //        var projs =await _db.Project.Where(i => i.Status != "Complete").ToListAsync();

        //        foreach (Project P in projs)
        //        {
        //            SchedulerEvent ev = new SchedulerEvent()
        //            {
        //                Name = P.Title,
        //                PMId = P.PMId,
        //                StartDate = DateTime.Now,
        //                EndDate = DateTime.Now.AddDays(30)
        //            };
        //        }

        //        return PMAVM;
        //    }
        //    catch
        //    {
        //        return null;
        //    }

        //}

    }
}
