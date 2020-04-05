using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class GanttController : Controller
    {
        private readonly SyvennDBContext _context;
        public GanttController(SyvennDBContext context)
        {
            _context = context;
        }

        // GET api/data
        [Route("GetGanttbyProject")]
        public object Get(long proj)
        {
            return new
            {
                data = _context.Tasks
                         .OrderBy(t => t.SortOrder)
                         .Where(i => i.ProjectID == proj)
                         .Select(t => (WebApiTask)t).ToList(),
                links = _context.Links
                    .Where(i => i.ProjectID == proj)
                     .Select(l => (WebApiLink)l)
                    .ToList()
                   
            };
        }

        [Route("InsertDefaultSched")]
        public async Task<bool> InsertDefaultSched(long projid, DateTime start)
        {
            try
            {
                int s = 1;
                DateTime current = start;
                var proj = await _context.Project.Where(i => i.ProjectId == projid).FirstOrDefaultAsync();
                List<Link> links = new List<Link>();

                Schedule newschedule = new Schedule()
                {
                    ProjectID = proj.ProjectId,
                    CreatedBy = proj.CreatedBy,
                    SalesPerson = proj.Requestor,
                    SalesforceID = "TBD",
                    EntCode = proj.EntCode,
                    EstimatedStart = start,
                    InstallDate = start.AddDays(203),
                    Status = "Assign PM",
                    RequestedStart = start
                };
                _context.Schedules.Add(newschedule);

                bool result = await UpdatePM(newschedule);

                Data.Models.Task design = new Data.Models.Task()
                {
                    Text = "Design",
                    StartDate = start,
                    Duration = 14,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = null,
                    Editable = true,
                    Readonly = false,
                    Type = "project",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(design);
                await _context.SaveChangesAsync();

                Data.Models.Task eng = new Data.Models.Task()
                {
                    Text = "Engineering",
                    StartDate = start,
                    Duration = 14,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = design.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s
                };
                s++;
                _context.Tasks.Add(eng);
                await _context.SaveChangesAsync();
                current = start.AddDays(design.Duration);

                Data.Models.Task precon = new Data.Models.Task()
                {
                    Text = "Pre-Construction",
                    StartDate = current,
                    Duration = 189,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = null,
                    Editable = true,
                    Readonly = false,
                    Type = "project",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(precon);
                await _context.SaveChangesAsync();
                
                Data.Models.Task teamassign = new Data.Models.Task()
                {
                    Text = "Team Assignment",
                    StartDate = current,
                    Duration = 7,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = precon.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(teamassign);
                await _context.SaveChangesAsync();
                current = current.AddDays(teamassign.Duration);
                Link teamlink = new Link() { SourceTaskId = eng.Id, TargetTaskId = teamassign.Id, Type = "0", ProjectID = projid };
                links.Add(teamlink);

                Data.Models.Task buyout = new Data.Models.Task()
                {
                    Text = "Buy Out",
                    StartDate = current,
                    Duration = 14,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = precon.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(buyout);
                await _context.SaveChangesAsync();
                current = current.AddDays(buyout.Duration);
                Link buyoutlink = new Link() { SourceTaskId = teamassign.Id, TargetTaskId = buyout.Id, Type = "0", ProjectID = projid };
                links.Add(buyoutlink);

                Data.Models.Task eqmtdel = new Data.Models.Task()
                {
                    Text = "Equipment Delivery",
                    StartDate = current,
                    Duration = 84,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = precon.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(eqmtdel);
                await _context.SaveChangesAsync();
                current = current.AddDays(eqmtdel.Duration);
                Link eqmtlink = new Link() { SourceTaskId = buyout.Id, TargetTaskId = eqmtdel.Id, Type = "0", ProjectID = projid };
                links.Add(eqmtlink);

                Data.Models.Task SiteReady = new Data.Models.Task()
                {
                    Text = "Site Ready",
                    StartDate = current,
                    Duration = 84,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = precon.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(SiteReady);
                await _context.SaveChangesAsync();
                current = current.AddDays(SiteReady.Duration);
                Link sitelink = new Link() { SourceTaskId = eqmtdel.Id, TargetTaskId = SiteReady.Id, Type = "0", ProjectID = projid };
                links.Add(sitelink);

                Data.Models.Task install = new Data.Models.Task()
                {
                    Text = "Installation",
                    StartDate = current,
                    Duration = 126,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = null,
                    Editable = true,
                    Readonly = false,
                    Type = "project",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(install);
                await _context.SaveChangesAsync();
               

                Data.Models.Task mobil = new Data.Models.Task()
                {
                    Text = "Mobilization",
                    StartDate = current,
                    Duration = 14,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = install.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(mobil);
                await _context.SaveChangesAsync();
                current = current.AddDays(mobil.Duration);
                Link mobilelink = new Link() { SourceTaskId = SiteReady.Id, TargetTaskId = mobil.Id, Type = "0", ProjectID = projid };
                links.Add(mobilelink);


                Data.Models.Task install2 = new Data.Models.Task()
                {
                    Text = "Installation",
                    StartDate = current,
                    Duration = 84,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = install.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(install2);
                await _context.SaveChangesAsync();
                current = current.AddDays(install2.Duration);
                Link installlink2 = new Link() { SourceTaskId = mobil.Id, TargetTaskId = install2.Id, Type = "0", ProjectID = projid };
                links.Add(installlink2);

                Data.Models.Task qc = new Data.Models.Task()
                {
                    Text = "QC & Commissioning",
                    StartDate = current,
                    Duration = 84,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = install.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(qc);
                await _context.SaveChangesAsync();
                current = current.AddDays(qc.Duration);
                Link qclink = new Link() { SourceTaskId = install2.Id, TargetTaskId = qc.Id, Type = "0", ProjectID = projid };
                links.Add(qclink);

                Data.Models.Task closeout = new Data.Models.Task()
                {
                    Text = "Close-Out",
                    StartDate = current,
                    Duration = 21,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = null,
                    Editable = true,
                    Readonly = false,
                    Type = "project",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(closeout);
                await _context.SaveChangesAsync();

                Data.Models.Task inservice = new Data.Models.Task()
                {
                    Text = "In Service & Training",
                    StartDate = current,
                    Duration = 7,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = closeout.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(inservice);
                await _context.SaveChangesAsync();
                current = current.AddDays(inservice.Duration);
                Link inservicelink = new Link() { SourceTaskId = qc.Id, TargetTaskId = inservice.Id, Type = "0", ProjectID = projid };
                links.Add(inservicelink);

                Data.Models.Task customer = new Data.Models.Task()
                {
                    Text = "Customer Acceptance",
                    StartDate = current,
                    Duration = 7,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = closeout.Id,
                    Editable = true,
                    Readonly = false,
                    Type = "task",
                    SortOrder = s,
                };
                s++;
                _context.Tasks.Add(customer);
                await _context.SaveChangesAsync();
                current = current.AddDays(customer.Duration);
                Link customerlink = new Link() { SourceTaskId = inservice.Id, TargetTaskId = customer.Id, Type = "0", ProjectID = projid };
                links.Add(customerlink);

                Data.Models.Task invoice = new Data.Models.Task()
                {
                    Text = "Final Invoice",
                    StartDate = current,
                    Duration = 7,
                    Progress = 0m,
                    ProjectID = projid,
                    ParentId = closeout.Id,
                     Editable = true,
                     Readonly = false,
                     Type = "task",
                     SortOrder = s,
                };
                _context.Tasks.Add(invoice);
                await _context.SaveChangesAsync();
                current = current.AddDays(invoice.Duration);
                Link invoicelink = new Link() { SourceTaskId = customer.Id, TargetTaskId = invoice.Id, Type = "0", ProjectID = projid };
                links.Add(invoicelink);

                links.ForEach(p => _context.Links.Add(p));
               await _context.SaveChangesAsync();

                return true;
            }


            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return false;
            }
        }

        [Route("UpdateAllSchedPMs")]
        public async Task<bool> UpdatePM()
        {
            try
            {
                var scheds =await  _context.Schedules.ToListAsync();
                foreach (Schedule s in scheds)
                {
                    bool result = await UpdatePM(s);
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }

        public async Task<bool> UpdatePM(Schedule s)
        {
            try
            {
                var pmid = await _context.Project.Where(i => i.ProjectId == s.ProjectID).Select(i => i.PMId).FirstOrDefaultAsync();
                var pm = await _context.ProjectMgrs.Where(i => i.PMId == pmid).Select(i => i.UserId).FirstOrDefaultAsync();
                s.CreatedBy = pm;
                _context.Schedules.Update(s);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }


    }
}