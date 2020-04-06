using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;

namespace Portal.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulerController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        public IHostingEnvironment HostingEnvironment { get; set; }
        private CurrentUser currentUser;

        public SchedulerController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
            HostingEnvironment = hostingEnvironment;
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

        [HttpGet]
        [Route("GetSchedulerEvents")]
        public async Task<SchedulerControl> GetSchedulerEvents()
        {
            try
            {
                var scheduleControl = new SchedulerControl();
                List<WebAPIEvent> Events = new List<WebAPIEvent>();

                var projs = await _db.Project.Where(i => i.Status != "Complete").ToListAsync();
                int L = 1;
                foreach (Project P in projs)
                {
                    scheduleControl.Collections.Projects.Add(new SchedulerCollectionItems() { id = P.ProjectId.ToString(), value = P.ProjectId.ToString(), label = P.Title });

                    var sched = await _db.Schedules.Where(i => i.ProjectID == P.ProjectId).FirstOrDefaultAsync();
                    if (sched != null)
                    {
                        var start = GetStartDate(P.ProjectId);
                        WebAPIEvent ev = new WebAPIEvent()
                        {
                            id = L,
                            text = P.Title,
                            pmId = P.PMId,
                            start_date = start.ToString("yyyy-MM-dd HH:mm"), //DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                            end_date = (await GetEndDate(P.ProjectId, start)).ToString("yyyy-MM-dd HH:mm"),   // DateTime.Now.AddDays(30).ToString("yyyy-MM-dd HH:mm"),
                            userid = sched.CreatedBy
                        };
                        Events.Add(ev);
                        L++;
                    }
                    else
                    {
                        DateTime start = GetStartDate(P.ProjectId);
                        Schedule S1 = new Schedule()
                        {
                            CreatedBy = P.CreatedBy,
                            EntCode = P.EntCode,
                            EstimatedStart = start,
                            InstallDate = start,
                            RequestedStart = start,
                            MaterialsDelivery = start,
                            ProjectID = P.ProjectId,
                            Status = P.Status
                        };
                        _db.Schedules.Add(S1);
                        await _db.SaveChangesAsync();

                        WebAPIEvent ev = new WebAPIEvent()
                        {
                            id = L,
                            text = P.Title,
                            pmId = P.PMId,
                            start_date = start.ToString("yyyy-MM-dd HH:mm"), //DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                            end_date = (await GetEndDate(P.ProjectId, start)).ToString("yyyy-MM-dd HH:mm"),   // DateTime.Now.AddDays(30).ToString("yyyy-MM-dd HH:mm"),
                            userid = S1.CreatedBy
                        };
                        Events.Add(ev);
                        L++;
                    }
                }

                var pms = await _db.ProjectMgrs.Where(i => i.Status == "Active").ToListAsync();
                foreach(ProjectMgr pm in pms) {
                    scheduleControl.Collections.PMs.Add(new SchedulerCollectionItems() { id = pm.PMId.ToString(), value = pm.PMId.ToString(), label = pm.Name });
                }

                var skillsets = await _db.Skillsets.ToListAsync();
                foreach (Skillset s in skillsets) {
                    scheduleControl.Collections.Skillsets.Add(new SchedulerCollectionItems() { id = s.SkillsetId.ToString(), value = s.SkillsetId.ToString(), label = s.Skill });
                }

                scheduleControl.Data = Events;
                return scheduleControl;
            }
            catch
            {
                return null;
            }
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
                var tasks = await _db.Tasks.Where(i => i.ProjectID == projid).ToListAsync();
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

        public async Task<bool> AssignPMProject(long projid, long pmid)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                var pm =await _db.ProjectMgrs.Where(i => i.PMId == pmid).FirstOrDefaultAsync();
                var pmcont = await _db.Contacts.Where(i => i.Username == pm.UserId).FirstOrDefaultAsync();
                var project = await _db.Project.Where(i => i.ProjectId == projid).FirstOrDefaultAsync();

                var teammember = await _db.ProjectTeams.Where(i => i.ContactID == pmcont.ContactID).FirstOrDefaultAsync();
                if (teammember != null)
                {
                    teammember.Role = "PM";
                    _db.ProjectTeams.Update(teammember);
                }
                else
                {
                    ProjectTeam newteam = new ProjectTeam()
                    {
                        ContactID = pmcont.ContactID,
                        ProjectID = projid,
                        Role = "PM",
                        EntCode = project.EntCode
                    };
                    _db.ProjectTeams.Add(newteam);
                }

                project.PMId = pm.PMId;
                _db.Project.Update(project);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    ItemType = "PMId",
                    ItemID = pmid,
                    Change = "AssignPMProject: PM Assigned: " + pm.Name + "  project : " + projid
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,

                    ItemType = "PMId",
                    ItemID = pmid,
                    Change = "AssignPMProject: " + ex.Message + " while setting PM for project : " + projid
                };
                await _Logger.InsertActivityLog(log);
                return false;
            }
        }

    }
}