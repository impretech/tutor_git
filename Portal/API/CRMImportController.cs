using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Data;
using Portal.Data.Models;
using Microsoft.EntityFrameworkCore;
using Portal.Models;
using System.Net.Http;
using System.Net;
using System.Text;
using System.IO;
using Newtonsoft.Json.Linq;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class CRMImportController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;


        public CRMImportController(SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        [HttpGet]
        [Route("ConvertOpportunity")]
        public async Task<List<Project>> ConvertOpportunity()
        {
            List<Project> result = new List<Project>();
            long crmid = 0;

            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                var crms = await _db.CRM_Imports.Where(p => p.isNew == true).ToListAsync();
                int i = 0;

                foreach (CRM_Import c in crms)
                {
                    if (c.Stage == "Closed Won")
                    {
                        crmid = c.CRM_ID;
                        bool exist = await ProjectLookupbyOppID(c.OppID);
                        if (!exist)
                        {
                            Project newproject = new Project()
                            {
                                ProjectNo = c.AccountName,
                                CapitalNo = "CRM-" + c.CRM_ID,
                                Phase = "Project Setup",
                                Status = "Assign PM",
                                Title = c.OpportunityName,
                                DateReceived = DateTime.Now,
                                ImpactDate = DateTime.Now.AddDays(32),
                                Description = c.Description,
                                TypeConstruction = c.Type,
                                Gsf = 0,
                                Requestor = c.OpportunityOwner,
                                Site = c.Territory,
                                TypeArea = "TBD",
                                CreatedBy = c.CRM_Type,
                                EntCode = "PRO1",
                                OwnerEmail = c.OwnerEmail,
                                Client = c.AccountName,
                                OppID = c.OppID

                            };

                            _db.Project.Add(newproject);
                            await _db.SaveChangesAsync();
                            i++;
                            Location newloc = new Location()
                            {
                                Address1 = c.SiteAddress1,
                                Address2 = c.SiteAddress2,
                                AddCity = c.SiteCity,
                                AddState = c.SiteState,
                                AddZip = c.SiteZip,
                                Label = "CRM Loc - " + i,
                                AddActive = true,
                                isPrimary = true,
                                 Bldg = "",
                                  Floor = "",
                                  Room = "",
                            };

                            _db.Locations.Add(newloc);
                            await _db.SaveChangesAsync();

                            LocationLink ll = new LocationLink()
                            {
                                ItemID = newproject.ProjectId,
                                ItemType = "Project",
                                LocationID = newloc.LocationID
                            };
                            _db.LocationLinks.Add(ll);
                            await _db.SaveChangesAsync();

                            bool update = await CheckOwneronTeam(c.OwnerEmail, newproject.ProjectId, newproject.EntCode);

                            c.ProjectCreated = true;
                            c.Created = DateTime.Now;
                            c.isNew = false;
                            _db.CRM_Imports.Update(c);
                            await _db.SaveChangesAsync();

                        
                            SF_Note newnote = new SF_Note()
                            {
                                Body = "New  project created for Opportunity: " + c.OpportunityName + " with ProjectNo: " + newproject.ProjectNo,
                                Title = "New Syvenn Project Created",
                                CreatedById = c.OwnerID,
                                OppId = c.OppID,
                                OwnerId = c.OwnerID,
                                ParentId = c.OppID
                            };

                            var client = new HttpClient
                            {
                                BaseAddress = new Uri("http://saleforce-connect-ebik.us-e2.cloudhub.io/")
                            };
                            HttpResponseMessage response = await client.PostAsJsonAsync("updatestatus", newnote);

                            string id = await CreateHubPlannerProject(newproject);
                        }
                        else
                        {
                            var proj = await _db.Project.Where(u => u.OppID == c.OppID).FirstOrDefaultAsync();
                            proj.ProjectNo = c.AccountName;
                            proj.CapitalNo = "CRM-" + c.CRM_ID;
                            proj.Title = c.OpportunityName;
                            proj.Description = c.Description;
                            proj.TypeConstruction = c.Type;
                            proj.Requestor = c.OpportunityOwner;
                            proj.Site = c.Territory;
                            proj.CreatedBy = c.CRM_Type;
                            proj.OwnerEmail = c.OwnerEmail;
                            proj.Client = c.AccountName;
                            proj.OppID = c.OppID;
                            _db.Project.Update(proj);
                            await _db.SaveChangesAsync();
                            bool ans = await CheckOwneronTeam(c.OwnerEmail, proj.ProjectId, proj.EntCode);
                        }
                    }
                    else
                    {
                        c.isNew = false;
                        _db.CRM_Imports.Update(c);
                        await _db.SaveChangesAsync();
                    }
                }
                return result;

            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "CRMImport",
                    ItemID = crmid,
                    Change = "CRM - ConvertOpportunity Error: " + ex.Message + " while getting for CRM : " + crmid
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

        public async Task<bool> CheckOwneronTeam(string email, long proj, string entcode)
        {
            try
            {
                long contactid = 0;
                contactid = await GetContactFromEmail(email);
                if (contactid == 0)
                {
                    string[] user = email.Split('@');
                    Contact newcontact = new Contact
                    {
                        EntCode = entcode,
                        PreferredName = user[0],
                        Username = user[0],
                    };

                    Email newemail = new Email
                    {
                        EmailAddress = email,
                        isPrimary = true,
                        Label = "Default"
                    };
                    _db.Contacts.Add(newcontact);
                    _db.Emails.Add(newemail);
                    await _db.SaveChangesAsync();
                }
                long teamid = 0;
                teamid = await CheckIfContactonTeam(proj, contactid);
                if (teamid == 0)
                {
                    ProjectTeam team = new ProjectTeam()
                    {
                        ContactID = contactid,
                        ProjectID = proj,
                        EntCode = entcode
                    };
                    _db.ProjectTeams.Add(team);
                    await _db.SaveChangesAsync();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<long> GetContactFromEmail( string email)
        {
            long contactid = 0;
            try
            {
                var ems =await _db.Emails.Where(e => e.EmailAddress.ToUpper() == email.ToUpper()).FirstOrDefaultAsync();
                if (ems != null)
                {
                    var link = await _db.ContactLinks.Where(e => e.ItemType == "EMAIL" && e.ItemID == ems.EmailID).FirstOrDefaultAsync();
                    contactid = link.ContactID;
                    return contactid;
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<long> CheckIfContactonTeam(long proj, long contactid)
        {
            try
            {
                var team = await _db.ProjectTeams.Where(i => i.ProjectID == proj && i.ContactID == contactid).ToListAsync();
                if (team.Count > 0)
                    return team[0].ProjectTeamID;
                else
                    return 0;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<bool> ProjectLookupbyOppID(string oppid)
        {
            try
            {
                var proj = await _db.Project.Where(i => i.OppID == oppid).CountAsync();
                if (proj > 0)
                    return true;
                else
                    return false;
            }
            catch 
            {
                return false;
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


        public async Task<string> CreateHubPlannerProject(Project project)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://api.hubplanner.com/v1/project");
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Accept = "application/json";
                request.UserAgent = "Syvenn 2 HubPlanner App (ledwards@prosysusa.com)";
                request.Headers.Add("Authorization" , "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6IlNDT1BFX1JFQURfV1JJVEUiLCJpc3MiOiI1ZDliNDg3NWQ4ZDQ2ODQ0NDI0ZTNlZjkiLCJyZXNvdXJjZSI6IjVkOTYwZTk5MDJmYjE4MDkyZmQ5MTk4YSIsImlhdCI6MTU3MDQ1NzczMX0.czsDNhc9gKRIo6WV1Ue2a7zh2-SWxl8dWGntRTNuWbU");
               
                HubProjecct newproject = new HubProjecct()
                {
                    _id = null,
                    name = project.Title,
                    note = project.Description
                };

                List<HubProjecct> projlist = new List<HubProjecct>();
                projlist.Add(newproject);

                using (var streamWriter = new StreamWriter(await request.GetRequestStreamAsync()))
                {
                    string json = Newtonsoft.Json.JsonConvert.SerializeObject(projlist);
                    streamWriter.Write(json);
                }

                var response2 = (HttpWebResponse)request.GetResponse();  //await client2.PostAsJsonAsync("project", newproject);
                string result;
                using (StreamReader rdr = new StreamReader(response2.GetResponseStream()))
                {
                    result = rdr.ReadToEnd();
                    dynamic data = JObject.Parse(result);
                    result = data._id;
                }
                    return result;
            }
            catch
            {
                return null;
            }
        }
    }


    public class HubProjecct
    {
        public string _id { get; set; }
        public string name { get; set; }
        public string note { get; set; }
    }
}