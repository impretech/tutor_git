using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Portal.API {
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class NoteController : ControllerBase {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        public IHostingEnvironment HostingEnvironment;
        private CurrentUser currentUser;

        public NoteController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext) {
            _db = dbContext;
            HostingEnvironment = hostingEnvironment;
            _Logger = new ActivityLogsController(_db);
        }

        public async Task<bool> GetCurrentUser(HttpContext context)
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

                return true;
            }
            catch (Exception ex)
            {
                Console.Write("GetCurrentUser", ex.Message);
                return false;
            }
        }

        [HttpGet]
        [Route("GetLastNoteByProjectId")]
        public async Task<ActionResult<Note>> GetLastNoteByProjectId(long projectId) {
            try {
                var LastNote = await _db.Notes.Where(p => p.ProjectID == projectId).OrderByDescending(p => p.Created).FirstOrDefaultAsync();
                return LastNote;
            }
            catch {
                return null;
            }
        }

        [HttpGet]
        [Route("GetNotesByProjectId")]
        public async Task<ActionResult<List<Note>>> GetNotesByProjectId(long projectId) {
            try {
                if (currentUser == null)
                {
                    bool err = await GetCurrentUser(HttpContext);
                }
                var LastNote = await _db.Notes.Where(p => p.ProjectID == projectId).OrderByDescending(p => p.Created).ToListAsync();
                return LastNote;
            }
            catch {
                return null;
            }
        }

        [HttpGet]
        [Route("GetNotesAllRecent")]
        public async Task<ActionResult<DataSourceResult>> GetNotesAllRecent(string entCode) {
            try {
                if (currentUser == null)
                {
                    bool err = await GetCurrentUser(HttpContext);
                }

                if (string.IsNullOrEmpty(entCode)) {
                    entCode = "PRO1";
                }

                var ProjectList = await _db.Project.Where(p => p.EntCode == entCode).ToListAsync();

                var recentNotes = from n in _db.Notes
                               from c in ProjectList
                               where n.ProjectID == c.ProjectId
                               orderby n.Created descending
                               select n;

                DataSourceResult result = new DataSourceResult {
                    Data = recentNotes,
                    Total = recentNotes.Count()
                };

                return result;
            }
            catch {
                return null;
            }
        }

        [HttpPost]
        [Route("AddNote")]
        public async Task<ActionResult<long>> AddNote([FromBody] Note newNote) {
            try {
                if (currentUser == null)
                {
                    bool err = await GetCurrentUser(HttpContext);
                }
                newNote.Writer = currentUser.UserName;
                var result = await _db.Notes.AddAsync(newNote);
                await _db.SaveChangesAsync();

                ProjectController pcontrol = new ProjectController(HostingEnvironment, _db);
                string entcode =await pcontrol.GetEntCodebyProjID(newNote.ProjectID);

                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = newNote.ItemType,
                    ItemID = newNote.ItemNo,
                    Change = "AddNote - Note : " + JsonConvert.SerializeObject(newNote)
                };
                await _Logger.InsertActivityLog(log);

                return newNote.NoteID;
            }
            catch {
                return null;
            }
        }

        [HttpPost]
        [Route("AddQuickNote")]
        public async Task<ActionResult<long>> AddQuickNote(long projectId, string note) {
            try {
                if (currentUser == null)
                {
                    bool err = await GetCurrentUser(HttpContext);
                }
                Note n = new Note {
                    ProjectID = projectId,
                    ProgressNote = note,
                    Writer = currentUser.UserName,
                    Created = DateTime.Now
                };

                var result = await _db.Notes.AddAsync(n);
                await _db.SaveChangesAsync();

                ProjectController pcontrol = new ProjectController(HostingEnvironment, _db);
                string entcode = await pcontrol.GetEntCodebyProjID(n.ProjectID);

                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = n.ItemType,
                    ItemID = n.ItemNo,
                    Change = "AddQuickNote - Note : " + JsonConvert.SerializeObject(n)
                };
                await _Logger.InsertActivityLog(log);

                return n.NoteID;
            }
            catch {
                return null;
            }
        }

    }
}
