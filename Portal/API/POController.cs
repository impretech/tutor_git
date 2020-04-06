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
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class POController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        public IHostingEnvironment HostingEnvironment { get; set; }
        private CurrentUser currentUser;

        public POController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
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
        [Route("GetCurrentUser")]
        public async Task<CurrentUser> CheckCurrentUser()
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                    return user;
                }
                return currentUser;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetPObyID")]
        public async Task<PurchaseOrderViewModel> GetPObyID(long id)
        {
            try
            {
                PurchaseOrderViewModel pvm = new PurchaseOrderViewModel();
                var po = await _db.POs.Where(i => i.PoID == id).FirstOrDefaultAsync();
                pvm = await GetPODetails(po);
                return pvm;
            }
            catch
            {
                return null;
            }
        }

        public async Task<PurchaseOrderViewModel> GetPODetails(PO c)
        {
            try
            {
                PurchaseOrderViewModel pm = new PurchaseOrderViewModel { Po = c };
                pm.Lookups = new List<Lookup>();
                pm.Lookups = await _db.Lookups.Where(p => (p.Module == "PO") && (p.EntCode == c.EntCode)).OrderBy(p => p.Prompt).ToListAsync();
                ProjectController PC = new ProjectController(HostingEnvironment, _db);
                pm.ProjectTitle = await PC.GetProjectTitlebyID(c.ProjectID, c.EntCode);

                pm.Notes = new List<Note>();
                pm.Notes = await _db.Notes.Where(p => p.ItemType == "PO" && p.ItemNo == c.PoID).ToListAsync();

                pm.LineItems = new List<POLineVM>();
                pm.LineItems = await GetLineDetails(c.ProjectID, c.PoID, c.EntCode);

                pm.VendorName = await _db.Vendors.Where(p => p.VendorID == c.VendorID).Select(p => p.VendorName).FirstOrDefaultAsync();
                pm.POGroups = await GetPOGroups(c.PoID);
                var docs = await _db.DocumentLinks.Where(p => p.ItemType == "PO" && p.ItemNo == c.PoID).ToListAsync();
                foreach (DocumentLink r in docs)
                {
                    DocumentDb docdb = await _db.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                    pm.Documents.Add(docdb);
                }
                return pm;
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

        public async Task<List<POLineVM>> GetLineDetails(long projectid, long poid, string entcode)
        {
            List<POLineVM> result = new List<POLineVM>();
            try
            {

                var lines = await _db.POLines.Where(p => p.PoID == poid).OrderBy(p => p.Order).ToListAsync();
                var codes = await _db.LineCodes.Where(x => x.ProjectID == projectid).ToListAsync();
                int order = 1;
                foreach (POLine p in lines)
                {
                    string descr = string.Empty;
                    string cat = string.Empty;
                    string code = string.Empty;
                    if (p.Code != null && p.Code != string.Empty && p.Code.Length >= 3)
                    {
                        var linecode = codes.Where(c => c.Code == p.Code).FirstOrDefault();
                        descr = linecode.Description;
                        cat = linecode.Category;
                        code = p.Code;
                    }
                    POLineVM newline = new POLineVM()
                    {
                        AvailFunds = p.AvailFunds,
                        CatDescription = descr,
                        Category = cat,
                        Code = code,
                        Cost = p.Cost,
                        Description = p.Description,
                        FundBalance = p.AvailFunds - p.Cost,
                        OnSched = p.OnSched,
                        Order = order,
                        PerComplete = p.PerComplete,
                        PoID = p.PoID,
                        PoLineID = p.PoLineID,
                        Price = p.Price,
                        ProjectID = p.ProjectID,
                        Quantity = p.Quantity,
                        RequiredByDate = p.RequiredByDate,
                        Unit = p.Unit,
                        VendDelvDate = p.VendDelvDate,
                        VendorPartNo = p.VendorPartNo,
                        POGroupID = p.POGroupID
                    };
                    result.Add(newline);
                    order++;
                }
                return result;
            }
            catch (Exception ex)
            {
                currentUser = await GetCurrentUser(HttpContext);
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "PO",
                    ItemID = poid,
                    Change = "PO -GetLineDetails: " + ex.Message
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }


        [HttpPost]
        [Route("InsertPO")]
        public async Task<ActionResult<PO>> InsertPO([FromBody]PO po)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                po.Writer = currentUser.UserEmail;
                _db.POs.Add(po);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = po.EntCode,
                    ItemType = "PO",
                    ItemID = po.PoID,
                    Change = "InsertPO - Insert PO: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return CreatedAtAction("GetPObyID", new { id = po.PoID }, po);
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = po.EntCode,
                    ItemType = "PO",
                    ItemID = po.PoID,
                    Change = "PO -InsertPO Error: " + ex.Message + " while inserting: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }

        }

        [HttpPut]
        [Route("UpdatePO")]
        public async Task<ActionResult<bool>> UpdatePO([FromBody]PO po)
        {
            try
            {
                if (!(po.PoID > 0))
                {
                    return BadRequest();
                }

                PO s = await _db.POs.FindAsync(po.PoID);

                if (s == null)
                    return NotFound();

                s.AccountNo = po.AccountNo;
                s.ContractID = po.ContractID;
                s.EntCode = po.EntCode;
                s.PODate = po.PODate;
                s.VendorPOAmount = po.VendorPOAmount;
                s.PerComplete = po.PerComplete;
                s.ProjectID = po.ProjectID;
                s.Status = po.Status;
                s.Writer = po.Writer;
                s.Total = po.Total;
                s.QuoteCO = po.QuoteCO;
                s.QuoteCOID = po.QuoteCOID;
                s.ReqNo = po.ReqNo;
                s.RequestedBy = po.RequestedBy;
                s.Service = po.Service;
                s.ShipToLocationID = po.ShipToLocationID;
                s.Terms = po.Terms;
                s.Total = po.Total;
                s.Type = po.Type;
                s.VendorContactID = po.VendorContactID;
                s.VendorID = po.VendorID;
                s.VendorLocationID = po.VendorLocationID;
                s.VendorPO = po.VendorPO;
                s.WorkCompleteDate = po.WorkCompleteDate;
                s.WorkStartDate = po.WorkStartDate;
                s.Writer = po.Writer;
                s.TaxAmount = po.TaxAmount;
                s.ShippingAmount = po.ShippingAmount;
                s.PerComplete = po.PerComplete;
                s.Exempt = po.Exempt;

                _db.POs.Update(s);
                await _db.SaveChangesAsync();

                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = po.EntCode,
                    ItemType = "PO",
                    ItemID = po.PoID,
                    Change = "UpdatePO- Update PO: " + JsonConvert.SerializeObject(po)
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
                    EntCode = po.EntCode,
                    ItemType = "PO",
                    ItemID = po.PoID,
                    Change = "PO -UpdatePO Error: " + ex.Message + " while updating: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }

        }

        [HttpDelete]
        [Route("DeletePO")]
        public async Task<ActionResult<PO>> DeletePO(long id)
        {
            PO po = new PO();
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                po = await _db.POs.FindAsync(id);
                if (po == null)
                {
                    return NotFound();
                }

                _db.POs.Remove(po);
                await _db.SaveChangesAsync();


                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = po.EntCode,
                    ItemType = "PO",
                    ItemID = po.PoID,
                    Change = "DeletePO- Delete PO: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return po;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = po.EntCode,
                    ItemType = "PO",
                    ItemID = po.PoID,
                    Change = "PO -DeletePO Error: " + ex.Message + " while deleting: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpGet]
        [Route("getPOLinebyID")]
        public async Task<POLineVM> getPOLinebyID(long id, long projectid)
        {
            POLine result = new POLine();
            try
            {
                var lines = await _db.POLines.Where(p => p.PoLineID == id).ToListAsync();
                var codes = await _db.LineCodes.Where(x => x.ProjectID == projectid).ToListAsync();


                foreach (POLine p in lines)
                {
                    string descr = string.Empty;
                    string cat = string.Empty;
                    string code = string.Empty;
                    if (p.Code != null && p.Code != string.Empty && p.Code.Length >= 3)
                    {
                        var linecode = codes.Where(c => c.Code == p.Code).FirstOrDefault();
                        descr = linecode.Description;
                        cat = linecode.Category;
                        code = p.Code;
                    }

                    POLineVM newline = new POLineVM()
                    {
                        AvailFunds = p.AvailFunds,
                        CatDescription = descr,
                        Category = cat,
                        Code = code,
                        Cost = p.Cost,
                        Description = p.Description,
                        FundBalance = p.AvailFunds - p.Cost,
                        OnSched = p.OnSched,
                        Order = p.Order,
                        PerComplete = p.PerComplete,
                        PoID = p.PoID,
                        PoLineID = p.PoLineID,
                        Price = p.Price,
                        ProjectID = p.ProjectID,
                        Quantity = p.Quantity,
                        RequiredByDate = p.RequiredByDate,
                        Unit = p.Unit,
                        VendDelvDate = p.VendDelvDate,
                        VendorPartNo = p.VendorPartNo
                    };
                    return newline;
                }

            }
            catch
            {
                return null;
            }
            return null;
        }

        [HttpPost]
        [Route("InsertPOLine")]
        public async Task<ActionResult<POLineVM>> InsertPOLine([FromBody]POLineVM poLine, string entcode)
        {
            // int i = 0;
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                _db.POLines.Add(poLine as POLine);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "POLine",
                    ItemID = poLine.PoLineID,
                    Change = "InsertPOLine - Insert POLine: " + JsonConvert.SerializeObject(poLine)
                };
                await _Logger.InsertActivityLog(log);

                return CreatedAtAction("getPOLinebyID", new { id = poLine.PoLineID, projectid = poLine.ProjectID }, poLine);
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "POLine",
                    ItemID = poLine.PoLineID,
                    Change = "POLine -InsertPOLine Error: " + ex.Message + " while inserting: " + JsonConvert.SerializeObject(poLine)
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }


        [HttpPut]
        [Route("UpdatePOLine")]
        public async Task<ActionResult<bool>> UpdatePOLine([FromBody]POLineVM poLine)
        {
            // int i = 0;
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {

                if (!(poLine.PoLineID > 0))
                {
                    return BadRequest();
                }

                POLine s = await _db.POLines.FindAsync(poLine.PoLineID);

                if (s == null)
                    return NotFound();
                s.AvailFunds = poLine.AvailFunds;
                s.Code = poLine.Code;
                s.Cost = poLine.Cost;
                s.Description = poLine.Description;
                s.OnSched = poLine.OnSched;
                s.Order = poLine.Order;
                s.PerComplete = poLine.PerComplete;
                s.PoID = poLine.PoID;
                s.PoLineID = poLine.PoLineID;
                s.Price = poLine.Price;
                s.ProjectID = poLine.ProjectID;
                s.Quantity = poLine.Quantity;
                s.RequiredByDate = poLine.RequiredByDate;
                s.Unit = poLine.Unit;
                s.VendDelvDate = poLine.VendDelvDate;
                s.VendorPartNo = poLine.VendorPartNo;

                _db.POLines.Update(s);
                await _db.SaveChangesAsync();

                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "POLine",
                    ItemID = poLine.PoLineID,
                    Change = "UpdatePOLine - Update POLine: " + JsonConvert.SerializeObject(poLine)
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
                    // EntCode = entcode,
                    ItemType = "POLine",
                    ItemID = poLine.PoLineID,
                    Change = "POLine -UpdatePOLine Error: " + ex.Message + " while updating: " + JsonConvert.SerializeObject(poLine)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }


        [HttpDelete]
        [Route("DeletePOLine")]
        public async Task<ActionResult<POLine>> DeletePOLine(long id, string entcode)
        {
            POLine po = new POLine();
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                po = await _db.POLines.FindAsync(id);
                if (po == null)
                {
                    return NotFound();
                }

                _db.POLines.Remove(po);
                await _db.SaveChangesAsync();


                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "POLine",
                    ItemID = po.PoLineID,
                    Change = "DeletePOLine- Delete POLine: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return po;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "POLine",
                    ItemID = po.PoLineID,
                    Change = "PO -DeletePOLine Error: " + ex.Message + " while deleting: " + JsonConvert.SerializeObject(po)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpGet]
        [Route("GetPOLineCats")]
        public async Task<List<LineCode>> GetPOLineCats(long id)
        {
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                var cats = await _db.LineCodes.Where(i => i.ProjectID == id).OrderBy(i => i.Code).ToListAsync();
                return cats;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "POLineCat",
                    ItemID = id,
                    Change = "PO -GetPOLineCats Error: " + ex.Message + " while getting for project : " + id
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteCOs")]
        public async Task<List<QuoteCOLookup>> GetQuoteCOs(long id)
        {
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                List<QuoteCOLookup> result = new List<QuoteCOLookup>();
                var quotes = await _db.QuoteAwards.Where(i => i.ProjectID == id && i.AwardAmount > 0).ToListAsync();
                foreach (QuoteAward q in quotes)
                {
                    QuoteCOLookup quote = new QuoteCOLookup()
                    {
                        ID = "Q-" + q.QuoteID,
                        ItemType = "QUOTE",
                        ItemID = q.QuoteID,
                        VendorID = q.VendorID,
                        Vendor = q.VendorName,
                        Amount = q.AwardAmount,
                        ContractNo = q.ContractNo,
                        PhoneID = q.PhoneID,
                        PhoneLabel = q.PhoneLabel,
                        PhoneNumber = q.PhoneNumber,
                        LocationID = q.LocationID,
                        LocationLabel = q.LocationLabel,
                        Address1 = q.Address1,
                        Address2 = q.Address2,
                        AddCity = q.AddCity,
                        AddState = q.AddState,
                        AddZip = q.AddZip,
                        Description = q.Description,
                        ListItem = "QUOTE-" + q.QuoteID + " " + q.VendorName + " " + q.AwardAmount.ToString("c")
                    };
                    result.Add(quote);
                }

                ///************************************  Add Change Orders to List ****************************************************************//
                //var cos = await _db.COs.Where(i => i.ProjectID == id).ToListAsync();
                //foreach(CO c in cos)
                //{

                //}

                return result;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "QuoteCOLookup",
                    ItemID = id,
                    Change = "PO -GetQuoteCOs Error: " + ex.Message + " while getting for project : " + id
                };
                await _Logger.InsertActivityLog(log);
                return null;
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
        [Route("GetVendorAddress")]
        public async Task<LocationViewModel> GetVendorAddress(long vendorid)
        {
            try
            {
                LocationsController LC = new LocationsController(_db);
                var list = await LC.GetLocation4Grid(vendorid, "Vendor");
                var loc = list.Where(i => i.isPrimary).FirstOrDefault();
                return loc;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetProjectAddress")]
        public async Task<LocationViewModel> GetProjectAddress(long projectid)
        {
            try
            {
                LocationsController LC = new LocationsController(_db);
                var list = await LC.GetLocation4Grid(projectid, "PROJECT");
                var loc = list.Where(i => i.isPrimary).FirstOrDefault();
                return loc;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetVendorContactName")]
        public async Task<string> GetVendorName(long vendorcontactid)
        {
            try
            {
                var contact = await _db.Contacts.Where(i => i.ContactID == vendorcontactid).FirstOrDefaultAsync();
                return contact.Username;
            }
            catch
            {
                return null;
            }
        }


        [HttpGet]
        [Route("GetPOsbyProject")]
        public async Task<List<PO>> GetPOsbyProject(long projid)
        {
            try
            {
                var pos = await _db.POs.Where(i => i.ProjectID == projid).ToListAsync();
                return pos;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetVendorContacts")]
        public async Task<List<VendorContact>> GetVendorContacts(long vendorid)
        {
            try
            {
                var result = await _db.VendorContacts.Where(i => i.VendorID == vendorid).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetPOGroups")]
        public async Task<List<POGroup>> GetPOGroups(long poid)
        {
            try
            {
                var result = await _db.POGroups.Where(i => i.PoID == poid).OrderBy(i => i.Order).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog()
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "POGroup",
                    ItemID = poid,
                    Change = "POGroup -GetPOGroups Error: " + ex.Message + " while getting for PO : " + poid
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

        [HttpPut]
        [Route("InsertPOGroup")]
        public async Task<ActionResult<POGroup>> InsertPOGroup([FromBody]POGroup grp)
        {
            try
            {
                grp.ItemDate = DateTime.Now;
                _db.POGroups.Add(grp);
                await _db.SaveChangesAsync();
                return CreatedAtAction("GetPOGroupbyID", new { id = grp.POGroupID }, grp);
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog()
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "POGroup",
                    ItemID = grp.PoID,
                    Change = "POGroup -InsertPOGroup Error: " + ex.Message + " while getting for POGroup : " + JsonConvert.SerializeObject(grp)
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

        [HttpGet]
        [Route("GetPOGroupbyID")]
        public async Task<POGroup> GetPOGroupbyID(long id)
        {
            try
            {
                var pog = await _db.POGroups.Where(i => i.POGroupID == id).FirstOrDefaultAsync();

                return pog;
            }
            catch
            {
                return null;
            }
        }

        [HttpPut]
        [Route("UpdatePOGroup")]
        public async Task<ActionResult<bool>> UpdatePOGroup([FromBody]POGroup pog)
        {
            // int i = 0;
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {

                if (!(pog.POGroupID > 0))
                {
                    return BadRequest();
                }

                POGroup s = await _db.POGroups.FindAsync(pog.POGroupID);
                if (s == null)
                    return NotFound();
                s.ApprovDate = pog.ApprovDate;
                s.EnteredDate = pog.EnteredDate;
                s.ItemID = pog.ItemID;
                s.ItemType = pog.ItemType;
                s.Order = pog.Order;
                s.Status = pog.Status;
                s.Type = pog.Type;
                s.PoID = pog.PoID;
                s.POGroupID = pog.POGroupID;

                _db.POGroups.Update(s);
                await _db.SaveChangesAsync();

                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "POGroup",
                    ItemID = pog.POGroupID,
                    Change = "UpdatePOGroup - Update POGroup: " + JsonConvert.SerializeObject(pog)
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
                    // EntCode = entcode,
                    ItemType = "POGroup",
                    ItemID = pog.POGroupID,
                    Change = "POGroup -POGroup Error: " + ex.Message + " while updating: " + JsonConvert.SerializeObject(pog)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpPut]
        [Route("UpdatePOGroups")]
        public async Task<ActionResult<bool>> UpdatePOGroups([FromBody]List<POGroup> pogs)
        {
            int i = 0;
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                foreach (POGroup pog in pogs)
                {
                    if (!(pog.POGroupID > 0))
                    {
                        return BadRequest();
                    }

                    POGroup s = await _db.POGroups.FindAsync(pog.POGroupID);
                    if (s == null)
                        return NotFound();
                    s.ApprovDate = pog.ApprovDate;
                    s.EnteredDate = pog.EnteredDate;
                    s.ItemID = pog.ItemID;
                    s.ItemType = pog.ItemType;
                    s.Order = pog.Order;
                    s.Status = pog.Status;
                    s.Type = pog.Type;
                    s.PoID = pog.PoID;
                    s.POGroupID = pog.POGroupID;

                    _db.POGroups.Update(s);
                    await _db.SaveChangesAsync();

                    i++;
                    ActivityLog log = new ActivityLog
                    {
                        LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                        LogDate = DateTime.Now,
                        // EntCode = dl.EntCode,
                        ItemType = "POGroup",
                        ItemID = pog.POGroupID,
                        Change = "UpdatePOGroup - Update POGroup: " + JsonConvert.SerializeObject(pog)
                    };
                    await _Logger.InsertActivityLog(log);
                }

                return true;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "POGroup",
                    ItemID = pogs[i].POGroupID,
                    Change = "POGroup -POGroup Error: " + ex.Message + " while updating: " + JsonConvert.SerializeObject(pogs[i])
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpDelete]
        [Route("DeletePOGroup")]
        public async Task<ActionResult<POGroup>> DeletePOGroup(long id)
        {
            POGroup pog = new POGroup();
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                pog = await _db.POGroups.FindAsync(id);
                if (pog == null)
                {
                    return NotFound();
                }

                _db.POGroups.Remove(pog);
                await _db.SaveChangesAsync();


                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    ItemType = "POgroup",
                    ItemID = pog.POGroupID,
                    Change = "DeletePOgroup- Delete POGroup: " + JsonConvert.SerializeObject(pog)
                };
                await _Logger.InsertActivityLog(log);
                return pog;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    ItemType = "POGroup",
                    ItemID = pog.POGroupID,
                    Change = "POGroup -DeletePOGroup Error: " + ex.Message + " while deleting: " + JsonConvert.SerializeObject(pog)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpGet]
        [Route("GetLastPOGroup")]
        public async Task<ActionResult<POGroup>> GetLastPOGroup(long poid)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                var id = await _db.POGroups.Where(i => i.PoID == poid).MaxAsync(i => i.POGroupID);
               var result =await _db.POGroups.Where(i => i.POGroupID == id).FirstOrDefaultAsync();
                return result;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    ItemType = "PO",
                    ItemID = poid,
                    Change = "POGroup -GetLastPOGroup Error: " + ex.Message + " while geting last POGroup for PO: " + JsonConvert.SerializeObject(poid)
                };
                await _Logger.InsertActivityLog(log);
                return null;

            }
        }

        [HttpGet]
        [Route("GetLastPOGroupID")]
        public async Task<ActionResult<long>> GetLastPOGroupID(long poid)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                var id = await _db.POGroups.Where(i => i.PoID == poid).MaxAsync(i => i.POGroupID);
                //var result = await _db.POGroups.Where(i => i.POGroupID == id).FirstOrDefaultAsync();
                return id;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    ItemType = "PO",
                    ItemID = poid,
                    Change = "POGroup -GetLastPOGroupID Error: " + ex.Message + " while geting last POGroup for PO: " + JsonConvert.SerializeObject(poid)
                };
                await _Logger.InsertActivityLog(log);
                return 0;

            }
        }

    }
}