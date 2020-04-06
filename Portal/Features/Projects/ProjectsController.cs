using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.API;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using Portal.Models.Extensions;
using Task = Portal.Data.Models.Task;

namespace Portal.Features.Projects {
    [Route("projects")]
    [Authorize]
    public class ProjectsController : Controller {

        private readonly SyvennDBContext _db;
        public ProjectsController(SyvennDBContext dbContext) {
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index() {
            var projects = await _db.PCCSummary
                                    .Where(p => p.EntCode == "PRO1")
                                    .Select(x => new Models.ProjectControlCenter.PortfolioTableViewModel {
                                        ProjectId = x.ProjectId,
                                        Title = x.Title,
                                        Description = x.Description,
                                        Phase = x.Phase,
                                        Status = x.Status,
                                        ProjectNo = x.ProjectNo
                                    }).ToListAsync();

            //return portfolios.ToDataSourceResult(request);

            return View("Index", projects);
        }

        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New() {
            var project = new ProjectDetails
            {
                Project = new Project
                {
                    Title = "New",
                },
                Lookups = new List<Lookup>()
            };

            project.Lookups = await _db.Lookups.Where(p => (p.Module == "Project") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync();
            project.Notes = new List<Note>();
            project.ProjectItems = GetProjectItems(102);
            project.MessagingData = null;
            project.ProjectManagers = await _db.ProjectMgrs.Where(p => p.Status == "Active").OrderBy(p => p.Name).ToListAsync();
            project.Project.DateReceived = DateTime.Now;
            return View("AddEdit", project);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id) 
        {
            try
            {
                var temp = _db.Lookups.ToList();

                var teams = _db.ProjectTeamDetails.Where(p => p.ProjectID == id);
                /*var messageTypes = _db.MessageTypes.ToList();*/
                var messageTypes = _db.Lookups.Where(x => x.Prompt == "MessType" && x.Module == "Project").ToList();
                var actionTypes = _db.Lookups.Where(x => x.Prompt == "MessAction" && x.Module == "Message").ToList();
                var statusTypes = _db.Lookups.Where(x => x.Prompt == "MessStatus" && x.Module == "Message").ToList();
                var todoTasks = _db.Tasks.Where(t => t.ProjectID == id).ToList();
                var projectMessages = _db.ProjectMessages.Where(m => m.ProjectID == id).ToList();

                var project = new ProjectDetails
                {
                    Project = await _db.Project.Where(p => p.ProjectId == id).FirstOrDefaultAsync(),
                    Lookups = await _db.Lookups.Where(p => (p.Module == "Project") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync(),
                    Notes = await _db.Notes.Where(p => p.ProjectID == id).OrderByDescending(p => p.Created).ToListAsync(),
                    ProjectManagers = await _db.ProjectMgrs.Where(p => p.Status == "Active").OrderBy(p => p.Name).ToListAsync()
                };

                // var messages = await _db.Messages.Where(x => x.ItemNo.ToString() == "PROJECT").OrderByDescending(x => x.DateRec).ToListAsync();
                var messages = new MessageController(_db).getMessageByItem("Project", id, 10, false);
                if (messages != null && messages.Count > 0)
                {
                    foreach (var pn in messages)
                    {
                        pn.DocumentDb = await new MessageController(_db).GetDocAttach("message", pn.MessageID);
                    }
                }
                project.MessagingData = new MessagingViewModel()
                {
                    MessagingTypes = messageTypes.Select(t => new LookupModel()
                    {
                        Id = t.LookupID,
                        Name = t.Value
                    }).ToList(),

                    ProjectTeam = teams.Select(t => new LookupModel()
                    {
                        Id = t.ContactID,
                        Name = $"{t.FirstName} {t.LastName}"
                    }).ToList(),

                    Tasks = todoTasks.Select(t => new LookupModel()
                    {
                        Id = t.Id,
                        Name = t.Text
                    }).ToList(),

                    Actions = actionTypes.Select(t => new LookupModel()
                    {
                        Id = t.LookupID,
                        Name = t.Value
                    }).ToList(),

                    Statuses = statusTypes.Select(t => new LookupModel()
                    {
                        Id = t.LookupID,
                        Name = t.Value
                    }).ToList(),

                    ProjectTeamEmails = teams.Select(t => new newLookupModel()
                    {
                        Id = t.ContactID,
                        param = t.EmailAddress,
                        Name = $"{t.FirstName} {t.LastName}"
                    }).ToList(),
    
                    ProjectMessages = messages.Select(m => m.ToMessageViewModel()).ToList(),
                    
                    projectId = id,
                    rfiId = 0
                };
                project.ProjectItems = GetProjectItems(id);
                return View("AddEdit", project);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Project ID Error: " + ex.Message);
                return null;
            }
        }

        public async Task<MessagingViewModel> getData(long id)
        {

            var teams = _db.ProjectTeamDetails.Where(p => p.ProjectID == id);
            /*var messageTypes = _db.MessageTypes.ToList();*/
            var messageTypes = _db.Lookups.Where(x => x.Prompt == "MessType" && x.Module == "Project").ToList();
            var actionTypes = _db.Lookups.Where(x => x.Prompt == "MessAction" && x.Module == "Message").ToList();
            var statusTypes = _db.Lookups.Where(x => x.Prompt == "MessStatus" && x.Module == "Message").ToList();
            var todoTasks = _db.Tasks.Where(t => t.ProjectID == id).ToList();
            // var messages = await _db.Messages.Where(x => x.ItemNo.ToString() == "PROJECT").OrderByDescending(x => x.DateRec).ToListAsync();
            var messages = new MessageController(_db).getMessageByItem("Project", id, 10, false);
            foreach (var pn in messages)
            {
                pn.DocumentDb = await new MessageController(_db).GetDocAttach("message", pn.MessageID);
                pn.DocumentDb.AddRange(await new MessageController(_db).GetDocAttach("Project", pn.MessageID));
            }
            MessagingViewModel MessagingData = new MessagingViewModel()
            {
                MessagingTypes = messageTypes.Select(t => new LookupModel()
                {
                    Id = t.LookupID,
                    Name = t.Value
                }).ToList(),

                ProjectTeam = teams.Select(t => new LookupModel()
                {
                    Id = t.ContactID,
                    Name = $"{t.FirstName} {t.LastName}"
                }).ToList(),
                Actions = actionTypes.Select(t => new LookupModel()
                {
                    Id = t.LookupID,
                    Name = t.Value
                }).ToList(),

                Statuses = statusTypes.Select(t => new LookupModel()
                {
                    Id = t.LookupID,
                    Name = t.Value
                }).ToList(),

                Tasks = todoTasks.Select(t => new LookupModel()
                {
                    Id = t.Id,
                    Name = t.Text
                }).ToList(),

                ProjectTeamEmails = teams.Select(t => new newLookupModel()
                {
                    Id = t.ContactID,
                    param = t.EmailAddress,
                    Name = $"{t.FirstName} {t.LastName}"
                }).ToList(),

                ProjectMessages = messages.Select(m => m.ToMessageViewModel()).ToList(),
                projectId = id,
                rfiId = 0
            };

            return MessagingData;
        }

        public ProjectItemsViewModel GetProjectItems(long projid)
        {
            try
            {
                ProjectItemsViewModel result = new ProjectItemsViewModel();
                result.GetDefault(projid);
                // this.ProjectItems = result;
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        [HttpPost("savemessage")]
        public async Task<IActionResult> SaveMessage(SaveMessageViewModel model)
        {
            var currentUser = new CurrentUser();
            var principal = HttpContext.User.Identity as ClaimsIdentity;
            var login = principal.Claims.SingleOrDefault(c => c.Type == "email")?.Value;
            var name = principal.Claims.SingleOrDefault(c => c.Type == "name")?.Value;
            currentUser.UserEmail = login;
            currentUser.UserName = name;

            model.SendDate = DateTime.Now;
            model.From = currentUser.UserName;

            var messageModel = model.ToMessageDbModel();
            await _db.ProjectMessages.AddAsync(messageModel);
            await _db.SaveChangesAsync();

            return new JsonResult(new {success = true});
        }
    }
}
