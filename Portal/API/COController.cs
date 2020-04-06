using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class COController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        public IHostingEnvironment HostingEnvironment { get; set; }
        private CurrentUser currentUser;

        public COController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
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
        [Route("GetCObyID")]
        public async Task<ChangeOrderViewModel> GetCObyID(long id)
        {
            try
            {
                ChangeOrderViewModel cvm = new ChangeOrderViewModel();
                var co = await _db.COs.Where(i => i.ChangeOrderID == id).FirstOrDefaultAsync();
                cvm = await GetCODetails(co);
                return cvm;
            }
            catch
            {
                return null;
            }
        }

        public async Task<ChangeOrderViewModel> GetCODetails(ChangeOrder c)
        {
            try
            {
                ChangeOrderViewModel cm = new ChangeOrderViewModel { CO = c };
                cm.Lookups = new List<Lookup>();
                cm.Lookups = await _db.Lookups.Where(p => (p.Module == "CO") && (p.EntCode == c.EntCode)).OrderBy(p => p.Prompt).ToListAsync();
                ProjectController PC = new ProjectController(HostingEnvironment, _db);
                cm.ProjectTitle = await PC.GetProjectTitlebyID(c.ProjectID, c.EntCode);

                cm.Notes = new List<Note>();
                cm.Notes = await _db.Notes.Where(p => p.ItemType == "CO" && p.ItemNo == c.ChangeOrderID).ToListAsync();

                //cm.LineItems = new List<POLineVM>();
                //cm.LineItems = await GetLineDetails(c.PoID, c.EntCode);

                var docs = await _db.DocumentLinks.Where(p => p.ItemType == "CO" && p.ItemNo == c.ChangeOrderID).ToListAsync();
                foreach (DocumentLink r in docs)
                {
                    DocumentDb docdb = await _db.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                    cm.Documents.Add(docdb);
                }
                return cm;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        public async Task<string> GetProjectTitlebyID(long id, string entcode)
        {
            try
            {
                var result = await _db.Project.Where(p => p.ProjectId == id && p.EntCode == entcode).Select(p => p.Title).FirstOrDefaultAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write("GetProjectTitlebyID Error: " + ex.Message);
                return null;
            }

        }

        [HttpPost]
        [Route("InsertCO")]
        public async Task<ActionResult<ChangeOrderViewModel>> InsertCO([FromBody]ChangeOrder co)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
               // co.Writer = currentUser.UserEmail;
                _db.COs.Add(co);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = co.EntCode,
                    ItemType = "CO",
                    ItemID = co.PoID,
                    Change = "InsertCO - Insert CO: " + JsonConvert.SerializeObject(co)
                };
                await _Logger.InsertActivityLog(log);
                return CreatedAtAction("GetCObyID", new { id = co.ChangeOrderID }, co);
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = co.EntCode,
                    ItemType = "CO",
                    ItemID = co.ChangeOrderID,
                    Change = "CO -InsertCO Error: " + ex.Message + " while inserting: " + JsonConvert.SerializeObject(co)
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }

        }

        [HttpPut]
        [Route("UpdateCO")]
        public async Task<ActionResult<bool>> UpdateCO([FromBody]ChangeOrder co)
        {
            try
            {
                if (!(co.ChangeOrderID > 0))
                {
                    return BadRequest();
                }

                ChangeOrder s = await _db.COs.FindAsync(co.ChangeOrderID);

                if (s == null)
                    return NotFound();

                s.AccountNo = co.AccountNo;
                s.ChangeOrderID = co.ChangeOrderID;
                s.EntCode = co.EntCode;
                s.ProjectID = co.ProjectID;
                s.CSIIndex = co.CSIIndex;
                s.PoID = co.PoID;
                s.RFIID = co.RFIID;
                s.SpecSection = co.SpecSection;
                s.Area = co.Area;
                s.BidPkg = co.BidPkg;
                s.AEBulletinNo = co.AEBulletinNo;
                s.Attention = co.Attention;
                s.ChangeToCompany = co.ChangeToCompany;
                s.ChangeToCompanyID = co.ChangeToCompanyID;
                s.ChangeFromCompany = co.ChangeFromCompany;
                s.ChangeFromCompanyID = co.ChangeFromCompanyID;
                s.ChangeSummary = co.ChangeSummary;
                s.ChangeDescription = co.ChangeDescription;
                s.HasAttachments = co.HasAttachments;
                s.DocID = co.DocID;
                s.Reason = co.Reason;
                s.Quote = co.Quote;
                s.Response = co.Response;
                s.FromContractor = co.FromContractor;
                s.FromContactID = co.FromContactID;
                s.ToContractor = co.ToContractor;
                s.ToContactID = co.ToContactID;
                s.Approved = co.Approved;
                s.DaysChanged = co.DaysChanged;
                s.Status = co.Status;
                _db.COs.Update(s);
                await _db.SaveChangesAsync();

                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = co.EntCode,
                    ItemID = co.ChangeOrderID,
                    Change = "UpdateCO- Update CO: " + JsonConvert.SerializeObject(co)
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
                    EntCode = co.EntCode,
                    ItemType = "PO",
                    ItemID = co.PoID,
                    Change = "PO -UpdatePO Error: " + ex.Message + " while updating: " + JsonConvert.SerializeObject(co)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }

        }

        [HttpDelete]
        [Route("DeleteCO")]
        public async Task<ActionResult<ChangeOrder>> DeleteCO(long id)
        {
            ChangeOrder co = new ChangeOrder();
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                co = await _db.COs.FindAsync(id);
                if (co == null)
                {
                    return NotFound();
                }

                _db.COs.Remove(co);
                await _db.SaveChangesAsync();


                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = co.EntCode,
                    ItemType = "CO",
                    ItemID = co.ChangeOrderID,
                    Change = "DeleteCO- Delete CO: " + JsonConvert.SerializeObject(co)
                };
                await _Logger.InsertActivityLog(log);
                return co;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = co.EntCode,
                    ItemType = "CO",
                    ItemID = co.ChangeOrderID,
                    Change = "CO -DeleteCO Error: " + ex.Message + " while deleting: " + JsonConvert.SerializeObject(co)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpGet]
        [Route("GetAccountNo")]
        public async Task<string> GetAccountNo(long proj)
        {
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                var acct = await _db.Budgets.Where(i => i.ProjectID == proj).Select(p => p.AccountNo).FirstOrDefaultAsync();
                return acct;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "AccountNo",
                    ItemID = proj,
                    Change = "PO -GetAccountNo Error: " + ex.Message + " while getting for project : " + proj
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

        [HttpGet]
        [Route("GetProjectsList")]
        public List<ProjectLookup> GetProjectList(string entcode)
        {
            try
            {
                ProjectController projcon = new ProjectController(HostingEnvironment, _db);
                var result = projcon.GetProjectLookups(entcode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        [HttpGet]
        [Route("GetContacts")]
        public async Task<List<Contact>> GetContacts(long contactid)
        {
            try
            {
                var result = await _db.Contacts.Where(i => i.ContactID == contactid).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }


    }
}