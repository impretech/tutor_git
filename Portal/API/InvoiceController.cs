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
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        public IHostingEnvironment HostingEnvironment { get; set; }
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;

        public InvoiceController(IHostingEnvironment hostingEnvironment, SyvennDBContext context)
        {
            HostingEnvironment = hostingEnvironment;
            _context = context;
            _Logger = new ActivityLogsController(_context);
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

                var ent = await _context.UserContacts.Where(i => i.UserEmail.ToLower() == login.ToLower()).Select(i => i.EntCode).FirstOrDefaultAsync();
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
        [Route("GetInvoices")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices(string entcode)
        {

            if (currentUser == null)
            {
                var err = await GetCurrentUser(HttpContext);
            }
            return await _context.Invoices.Where(i => i.EntCode == entcode).ToListAsync();
        }

        [HttpGet]
        [Route("GetInvoicebyID")]
        public async Task<InvoicesViewModel> GetInvoicebyID(long id)
        {

            if (currentUser == null)
            {
                var err = await GetCurrentUser(HttpContext);
            }
            InvoicesViewModel result = new InvoicesViewModel();
            try
            {
                var inv = await _context.Invoices.FindAsync(id);
                if (inv == null)
                {
                    return null;
                }
                result = await GetInvoiceVM(inv, inv.EntCode);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("GetInvoiceVM")]
        public async Task<InvoicesViewModel> GetInvoiceVM(Invoice I, string entcode)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }

                InvoicesViewModel vm = new InvoicesViewModel() { Inv = I };
                vm.Lookups = new List<Lookup>();
                vm.Lookups = await _context.Lookups.Where(p => (p.Module == "Invoice") && (p.EntCode == entcode)).OrderBy(p => p.Prompt).ToListAsync();

                vm.LineItems = new List<InvLine>();
                vm.LineItems = await _context.InvoiceLines.Where(p => p.InvoiceID == I.InvoiceID).OrderBy(p => p.Order).ToListAsync();

                vm.VendorAddress = new Location();
                vm.VendorAddress = await _context.Locations.Where(p => p.LocationID == I.VendorLocationID).FirstOrDefaultAsync();

                ProjectController PC = new ProjectController(HostingEnvironment, _context);
                vm.ProjectTitle = await PC.GetProjectTitlebyID(I.ProjectID, entcode);

                vm.Notes = new List<Note>();
                vm.Notes = await _context.Notes.Where(p => p.ItemType == "Invoice" && p.ItemNo == I.InvoiceID).ToListAsync();

                var docs = await _context.DocumentLinks.Where(p => p.ItemType == "Invoice" && p.ItemNo == I.InvoiceID).ToListAsync();
                foreach (DocumentLink r in docs)
                {
                    DocumentDb docdb = await _context.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                    vm.Documents.Add(docdb);
                }

                //vm.CurrentTotals = new BudCatSumTotals();

                //DepositController Dep = new DepositController(HostingEnvironment, _context);
                //var dep = await _context.Deposits.Where(i => i.BudgetID == I.BudgetID).SumAsync(p => p.Total);
                //vm.CurrentTotals.Deposits = dep;

                //vm.CurrentTotals.Commitments = 0;
                //vm.CurrentTotals.Pending = 0;
                //vm.CurrentTotals.ProjectID = I.ProjectID;

                return vm;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        [HttpGet]
        [Route("GetAttachDocs")]
        public async Task<List<DocCards>> GetAttachDocs(string entcode, long id)
        {
            try
            {
                DocLookup lookup = new DocLookup
                {
                    EntCode = entcode,
                    ItemType = "Invoice",
                    ItemID = id,
                };
                DocumentController docCon = new DocumentController(HostingEnvironment, _context);
                var result = await docCon.GetDocumentCards(lookup);
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetProjectsList")]
        public List<ProjectLookup> GetProjectList(string entcode)
        {
            try
            {
                ProjectController projcon = new ProjectController(HostingEnvironment, _context);
                var result = projcon.GetProjectLookups(entcode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        [HttpPut]
        [Route("UpdateInvoice")]
        public async Task<ActionResult<bool>> UpdateInvoice([FromBody]Invoice inv)
        {
            try
            {
                if (!(inv.InvoiceID > 0))
                {
                    return BadRequest();
                }

                Invoice s = await _context.Invoices.FindAsync(inv.InvoiceID);

                if (s == null)
                    return NotFound();

                s.AccountNo = inv.AccountNo;
                s.ApprovToPay = inv.ApprovToPay;
                s.EntCode = inv.EntCode;
                s.Paid = inv.Paid ?? DateTime.Now;
                if (inv.Received != null)
                    s.Received = inv.Received;
                s.PerComplete = inv.PerComplete;
                s.POId = inv.POId;
                s.ProjectID = inv.ProjectID;
                s.Status = inv.Status;
                s.QuoteCOID = inv.QuoteCOID;
                s.RequestBy = inv.RequestBy;
                s.ShipAddress1 = inv.ShipAddress1;
                s.ShipAddress2 = inv.ShipAddress2;
                s.ShipCity = inv.ShipCity;
                s.ShipState = inv.ShipState;
                s.ShipZip = inv.ShipZip;
                s.SpecialInstructions = inv.SpecialInstructions;
                s.Terms = inv.Terms;
                s.VendorContactID = inv.VendorContactID;
                if (inv.VendorDate != null)
                    s.VendorDate = inv.VendorDate;
                s.VendorID = inv.VendorID;
                s.VendorInvAmount = inv.VendorInvAmount;
                s.VendorInvNo = inv.VendorInvNo;
                s.VendorLocationID = inv.VendorLocationID;
                s.WorkComplete = inv.WorkComplete;
                s.WorkStart = inv.WorkStart;
                s.Writer = inv.Writer;
                s.VendorPOAmount = inv.VendorPOAmount;
                s.Services = inv.Services;
                s.Exempt = inv.Exempt;
                s.QuoteCO = inv.QuoteCO;
                s.ContractID = inv.ContractID;
                s.RefNo = inv.RefNo;
                s.VendorInvAmount = inv.VendorInvAmount;

                _context.Invoices.Update(s);
                await _context.SaveChangesAsync();

                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = inv.EntCode,
                    ItemType = "Invoice",
                    ItemID = inv.InvoiceID,
                    Change = "UpdateInvoice - Update Invoice: " + JsonConvert.SerializeObject(inv)
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }

        }

        [HttpPost]
        [Route("InsertInvoice")]
        public async Task<ActionResult<BudgetViewModel>> InsertInvoice([FromBody]Invoice inv)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                inv.Writer = currentUser.UserEmail;
                _context.Invoices.Add(inv);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getInvoicebyID", new { id = inv.InvoiceID }, inv);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        public async Task<ActionResult<Invoice>> DeleteInvoice(long id)
        {
            var Inv = await _context.Invoices.FindAsync(id);
            if (Inv == null)
            {
                return NotFound();
            }

            _context.Invoices.Remove(Inv);
            await _context.SaveChangesAsync();

            return Inv;
        }

        [HttpGet]
        [Route("getInvLinebyID")]
        public async Task<InvLine> getInvLinebyID(long id)
        {
            InvLine result = new InvLine();
            try
            {
                result = await _context.InvoiceLines.Where(i => i.InvLineID == id).FirstOrDefaultAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }


        [HttpPost]
        [Route("InsertInvLine")]
        public async Task<ActionResult<bool>> InsertInvLine([FromBody]InvLine invLine, string entcode)
        {
            // int i = 0;
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                _context.InvoiceLines.Add(invLine);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "InvLine",
                    ItemID = invLine.InvLineID,
                    Change = "InsertInvLine - Insert InvLine: " + JsonConvert.SerializeObject(invLine)
                };
                await _Logger.InsertActivityLog(log);


                return true;      //CreatedAtAction("getBudDetailbyID", new { id = dl.PoLineID }, dl);
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "InvLine",
                    ItemID = invLine.InvLineID,
                    Change = "InvLine -InsertInvLine Error: " + ex.Message + " while inserting: " + JsonConvert.SerializeObject(invLine)
                };
                await _Logger.InsertActivityLog(log);
                return false;
            }
        }

        [HttpPut]
        [Route("UpdateInvLine")]
        public async Task<ActionResult<bool>> UpdateInvLine([FromBody]InvLine invLine)
        {
            // int i = 0;
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {

                if (!(invLine.InvLineID > 0))
                {
                    return BadRequest();
                }

                InvLine s = await _context.InvoiceLines.FindAsync(invLine.InvLineID);

                if (s == null)
                    return NotFound();

                s.Code = invLine.Code;
                s.Cost = invLine.Cost;
                s.Description = invLine.Description;
                s.OnSched = invLine.OnSched;
                s.Order = invLine.Order;
                s.PerComplete = invLine.PerComplete;
                s.InvoiceID = invLine.InvoiceID;
                s.Price = invLine.Price;
                s.ProjectID = invLine.ProjectID;
                s.Unit = invLine.Unit;
                s.Quantity = invLine.Quantity;
                s.VendorPartNo = invLine.VendorPartNo;
                s.AmountComplete = invLine.AmountComplete;
                s.InvoiceToDate = invLine.InvoiceToDate;
                s.BalToInvoice = invLine.BalToInvoice;
                s.CurrentInvAmount = invLine.CurrentInvAmount;
                s.CurrentAmountApproved = invLine.CurrentAmountApproved;
                s.POBalance = invLine.POBalance;

                _context.InvoiceLines.Update(s);
                await _context.SaveChangesAsync();

                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "InvLine",
                    ItemID = invLine.InvoiceID,
                    Change = "UpdateInvLine - Update InvLine: " + JsonConvert.SerializeObject(invLine)
                };
                await _Logger.InsertActivityLog(log);

                return true;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "InvLine",
                    ItemID = invLine.InvoiceID,
                    Change = "InvLine -UpdateInvLine Error: " + ex.Message + " while updating: " + JsonConvert.SerializeObject(invLine)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpDelete]
        [Route("DeleteInvLine")]
        public async Task<ActionResult<InvLine>> DeleteInvLine(long id, string entcode)
        {
            InvLine inv = new InvLine();
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                inv = await _context.InvoiceLines.FindAsync(id);
                if (inv == null)
                {
                    return NotFound();
                }

                _context.InvoiceLines.Remove(inv);
                await _context.SaveChangesAsync();


                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "InvLine",
                    ItemID = inv.InvLineID,
                    Change = "DeleteInvLine- Delete InvLine: " + JsonConvert.SerializeObject(inv)
                };
                await _Logger.InsertActivityLog(log);
                return inv;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "InvLine",
                    ItemID = inv.InvLineID,
                    Change = "INV -DeleteInvLine Error: " + ex.Message + " while deleting: " + JsonConvert.SerializeObject(inv)
                };
                await _Logger.InsertActivityLog(log);
                return BadRequest();
            }
        }

        [HttpGet]
        [Route("GetInvLineCats")]
        public async Task<List<LineCode>> GetInvLineCats(long id)
        {
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            try
            {
                var cats = await _context.LineCodes.Where(i => i.ProjectID == id).OrderBy(i => i.Code).ToListAsync();
                return cats;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = entcode,
                    ItemType = "InvLineCat",
                    ItemID = id,
                    Change = "PO -GetInvLineCats Error: " + ex.Message + " while getting for project : " + id
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
                var acct = await _context.Invoices.Where(i => i.ProjectID == proj).Select(p => p.AccountNo).FirstOrDefaultAsync();
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
                    Change = "INV -GetAccountNo Error: " + ex.Message + " while getting for project : " + proj
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

        [HttpGet]
        [Route("GetVendorAddress")]
        public async Task<LocationViewModel> GetVendorAddress(long vendorid)
        {
            try
            {
                LocationsController LC = new LocationsController(_context);
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
                LocationsController LC = new LocationsController(_context);
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
        [Route("GetVendorContacts")]
        public async Task<List<VendorContact>> GetVendorContacts(long vendorid)
        {
            try
            {
                var result = await _context.VendorContacts.Where(i => i.VendorID == vendorid).ToListAsync();
                return result;
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
                var pos = await _context.POs.Where(i => i.ProjectID == projid).ToListAsync();
                return pos;
            }
            catch
            {
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
                var quotes = await _context.QuoteAwards.Where(i => i.ProjectID == id && i.AwardAmount > 0).ToListAsync();
                foreach (QuoteAward q in quotes)
                {
                    QuoteCOLookup quote = new QuoteCOLookup()
                    {
                        ID = "QUOTE-" + q.QuoteID,
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
                    Change = "INV -GetQuoteCOs Error: " + ex.Message + " while getting for project : " + id
                };
                await _Logger.InsertActivityLog(log);
                return null;
            }
        }

    }
}