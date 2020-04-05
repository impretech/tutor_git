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
using Task = Portal.Data.Models.Task;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class BudgetController : ControllerBase
    {
        public IHostingEnvironment HostingEnvironment { get; set; }
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;

        public BudgetController(IHostingEnvironment hostingEnvironment, SyvennDBContext context)
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

                var usr = await _context.UserContacts.Where(i => i.UserEmail.ToLower() == login.ToLower()).FirstOrDefaultAsync();
              //  var pm = await _context.Contacts.FindAsync(usr.ContactID);
              //  var ent = usr.EntCode;
               // currentUser.User = pm;
               // currentUser.EntCode = ent;

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
        public async Task<CurrentUser>CheckCurrentUser()
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

        // GET: api/Budgets
        [HttpGet]
        [Route("GetBudgets")]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets(string entcode)
        {

            if (currentUser == null)
            {
                var err = await GetCurrentUser(HttpContext);
            }
            return await _context.Budgets.Where(i => i.EntCode == entcode).ToListAsync();
        }

        // GET: api/Budgets/5
        [HttpGet]
        [Route("GetBudgetbyID")]
        public async Task<BudgetViewModel> GetBudgetbyID(long id)
        {

            if (currentUser == null)
            {
                var err = await GetCurrentUser(HttpContext);
            }
            BudgetViewModel result = new BudgetViewModel();
            try
            {
                var budget = await _context.Budgets.FindAsync(id);
                if (budget == null)
                {
                    return null;
                }
                result = await GetBudgetVM(budget, budget.EntCode);
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("GetBudgetVM")]
        public async Task<BudgetViewModel> GetBudgetVM(Budget B, string entcode)
        {
            try
            { 

            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            BudgetViewModel vm = new BudgetViewModel { Bud = B };
                vm.Lookups = new List<Lookup>();
                vm.Lookups = await _context.Lookups.Where(p => (p.Module == "Budget") && (p.EntCode == entcode)).OrderBy(p => p.Prompt).ToListAsync();
                vm.Details = new BudgetDetailsVM
                {
                    Categories = new List<BudgetCategory>()
                };
                vm.Details.Categories = await _context.BudgetCategories.Where(p => (p.BudgetID == B.BudgetID)).OrderBy(p => p.CatOrder).ToListAsync();
                vm.Details.BudDetails = new List<BudgetDetail>();
                foreach (BudgetCategory C in vm.Details.Categories)
                {
                    var dets = await _context.BudgetDetails.Where(p => p.BudCatID == C.BudCatID).OrderBy(p => p.DetailOrder).ToListAsync();
                    vm.Details.BudDetails.AddRange(dets);
                }

                ProjectController PC = new ProjectController(HostingEnvironment, _context);
                vm.ProjectTitle = await PC.GetProjectTitlebyID(B.BudgetID, entcode);

                vm.Contributors = new List<Contributor>();
                vm.Contributors = await _context.Contributors.Where(p => p.ItemType == "Budget" && p.ItemID == B.BudgetID).ToListAsync();

                vm.Notes = new List<Note>();
                vm.Notes = await _context.Notes.Where(p => p.ItemType == "Budget" && p.ItemNo == B.BudgetID).ToListAsync();

                //vm.Attachments = new List<BudgetDocs>();

                var docs = await _context.DocumentLinks.Where(p => p.ItemType=="Budget" && p.ItemNo == B.BudgetID).ToListAsync();
                foreach (DocumentLink r in docs)
                {
                    DocumentDb docdb = await _context.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                    vm.Documents.Add(docdb);
                }

                vm.CurrentTotals = new BudCatSumTotals();

                DepositController Dep = new DepositController(HostingEnvironment, _context);
                var dep = await _context.Deposits.Where(i => i.BudgetID == B.BudgetID).SumAsync(p => p.Total);
                vm.CurrentTotals.Deposits = dep;

                vm.CurrentTotals.Commitments = 0;
                vm.CurrentTotals.Pending = 0;
                vm.CurrentTotals.ProjectID = B.ProjectID;

                return vm;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetCatbyBudgetID")]
        public async Task<List<BudgetCategory>> GetCategoriesbyBudgetID(long id)
        {
            try
            {
                var result =  await _context.BudgetCategories.Where(p => (p.BudgetID == id)).OrderBy(p => p.CatOrder).ToListAsync();
                return result;
            }
            catch
            {
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
                    ItemType = "Budget",
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


        // PUT: api/Budget/GetProjectsList
        /// <summary>
        /// Get DocCards to display attach documents
        /// </summary>
        /// <param name="entcode"></param>
        /// <returns>ProjectLookup</returns>
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


        // PUT: api/Budget/GetContactsList
        /// <summary>
        /// Get DocCards to display attach documents
        /// </summary>
        /// <param name="entcode"></param>
        /// <returns>Contact</returns>
        [HttpGet]
        [Route("GetContactsList")]
        public async Task<ActionResult<List<Contact>>> GetContactsList(string entcode)
        {
            try
            {
                VendorController vendcon = new VendorController(_context);
                var result = await vendcon.GetContactsLookup(entcode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        // POST: api/Budget/UpdateBudget
        /// <summary>
        /// Update Budget
        /// </summary>
        /// <param name="bud"></param>
        /// <returns>bool</returns>
        [HttpPut]
        [Route("UpdateBudget")]
        public async Task<ActionResult<bool>> UpdateBudget([FromBody]Budget bud)
        {
            try
            {
                if (!(bud.BudgetID > 0))
                {
                    return BadRequest();
                }

                Budget s = await _context.Budgets.FindAsync(bud.BudgetID);

                if (s == null)
                    return NotFound();

                s.AccountNo = bud.AccountNo;
                s.AddendumNo = bud.AddendumNo;
                s.BudgetType = bud.BudgetType;
                s.DateEntered = bud.DateEntered;
                s.DatePublished = bud.DatePublished ?? DateTime.Now;
                s.DueDate = bud.DueDate ?? DateTime.Now;
                s.EntCode = bud.EntCode;
                s.Gsf = bud.Gsf;
                s.ProjectID = bud.ProjectID;
                s.Status = bud.Status;
                s.Writer = bud.Writer;
                s.Total = bud.Total;

                _context.Budgets.Update(s);
                await _context.SaveChangesAsync();

                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = bud.EntCode,
                    ItemType = "Budget",
                    ItemID = bud.BudgetID,
                    Change = "UpdateBudget - Update Budget: " + JsonConvert.SerializeObject(bud)
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


        // POST: api/Budget/InsertBudget
        /// <summary>
        /// Inserts new budget
        /// </summary>
        /// <param name="budget"></param>
        /// <returns>budgetid</returns>
        [HttpPost]
        [Route("InsertBudget")]
        public async Task<ActionResult<BudgetViewModel>> InsertBudget([FromBody]Budget budget)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                budget.Writer = currentUser.UserEmail;
                _context.Budgets.Add(budget);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getBudgetbyID", new { id = budget.BudgetID }, budget);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        // DELETE: api/Budget/DeleteBudget
        /// <summary>
        /// Deletes Budget
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Submital</returns>
        [HttpDelete]
        [Route("DeleteBudget")]
        public async Task<ActionResult<Budget>> DeleteBudget(long id)
        {
            var Budget = await _context.Budgets.FindAsync(id);
            if (Budget == null)
            {
                return NotFound();
            }

            _context.Budgets.Remove(Budget);
            await _context.SaveChangesAsync();

            return Budget;
        }

        // Get: api/Budget/getBudCatbyBudID
        /// <summary>
        /// Get Budget Categories by BudgetID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>BudgetCategory</returns>
        [HttpGet]
        [Route("getBudCatbyBudID")]
        public async Task<List<BudgetCategory>> getBudCatbyBudID(long id)
        {
            List<BudgetCategory> result = new List<BudgetCategory>();
            try
            {
                result = await _context.BudgetCategories.Where(i => i.BudgetID == id).OrderBy(p => p.CatOrder).ToListAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("getBudCatbyID")]
        public async Task<BudgetCategory> getBudCatbyID(long id)
        {
            BudgetCategory result = new BudgetCategory();
            try
            {
                result = await _context.BudgetCategories.Where(i => i.BudCatID == id).FirstOrDefaultAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("getBudDetailbyID")]
        public async Task<BudgetDetail> getBudDetailbyID(long id)
        {
            BudgetDetail result = new BudgetDetail();
            try
            {
                result = await _context.BudgetDetails.Where(i => i.BudgetDetailID == id).FirstOrDefaultAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("getBudDetailsbyCatID")]
        public async Task<List<BudgetDetail>> getBudDetailsbyCatID(long id)
        {
            List<BudgetDetail> result = new List<BudgetDetail>();
            try
            {
                result = await _context.BudgetDetails.Where(i => i.BudCatID == id).OrderBy(p => p.DetailOrder).ToListAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        // Get: api/Budget/getBudDetailsbyBudID
        /// <summary>
        /// Get Budget Details by BudgetID
        /// </summary>
        /// <param name="budid"></param>
        /// <returns>BudgetDetail</returns>
        [HttpGet]
        [Route("getBudDetailsbyBudID")]
        public async Task<List<BudgetDetail>> getBudDetailsbyBudID(long budid)
        {
            try
            {
                List<BudgetDetail> result = new List<BudgetDetail>();
                var cats = await getBudCatbyBudID(budid);
                foreach (BudgetCategory cat in cats)
                {
                    var dets = await getBudDetailsbyCatID(cat.BudCatID);
                    result.AddRange(dets);
                }
                return result;
            }
            catch
            {
                return null;
            }
        }

        // Get: api/Budget/GetContributorsbyBudID
        /// <summary>
        /// Get Budget Contributors by BudgetID
        /// </summary>
        /// <param name="budid"></param>
        /// <returns>Contributor</returns>
        [HttpGet]
        [Route("GetContributorsbyBudID")]
        public async Task<List<Contributor>> getContributorsbyBudID(long budid)
        {
            try
            {
                List<Contributor> result = new List<Contributor>();
                result = await _context.Contributors.Where(p => p.ItemType == "Budget" && p.ItemID == budid).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        private bool BudCatExists(long id)
        {
            return _context.BudgetCategories.Any(e => e.BudCatID == id);
        }

        private bool BudDetailExists(long id)
        {
            return _context.BudgetDetails.Any(e => e.BudgetDetailID == id);
        }


        // PUT: api/Budget/UpdateBudCat
        /// <summary>
        /// Update UpdateBudCat
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPut]
        [Route("UpdateBudCat")]
        public async Task<ActionResult<bool>> UpdateBudCat([FromBody]BudgetCategory dl)
        {
            try
            {
                if (!(dl.BudCatID > 0))
                {
                    return BadRequest();
                }

                BudgetCategory s = await _context.BudgetCategories.FindAsync(dl.BudCatID);

                if (s == null)
                    return NotFound();

                s.BudgetID = dl.BudgetID;
                s.Category = dl.Category;
                s.CatOrder = dl.CatOrder;
                s.Cost = dl.Cost;
                s.Weight = dl.Weight;

                _context.BudgetCategories.Update(s);
                await _context.SaveChangesAsync();
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "BudgetCategory",
                    ItemID = dl.BudCatID,
                    Change = "UpdateBudCat - Update Budget Category: " + JsonConvert.SerializeObject(dl)
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

        // PUT: api/Budget/UpdateBudDetail
        /// <summary>
        /// Update UpdateBudDetail
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPut]
        [Route("UpdateBudDetail")]
        public async Task<ActionResult<bool>> UpdateBudDetail( [FromBody]BudgetDetail dl)
        {
            try
            {
                if (!(dl.BudgetDetailID > 0))
                {
                    return BadRequest();
                }

                BudgetDetail s = await _context.BudgetDetails.FindAsync(dl.BudgetDetailID);

                if (s == null)
                    return NotFound();

                s.BudCatID = dl.BudCatID;
                s.Basis = dl.Basis;
                s.Code = dl.Code;
                s.DetailOrder = dl.DetailOrder;
                s.Item = dl.Item;
                s.Note = dl.Note;
                s.OnSched = dl.OnSched;
                s.Qty = dl.Qty;
                s.Rate = dl.Rate;
                s.Unit = dl.Unit;


                _context.BudgetDetails.Update(s);
                await _context.SaveChangesAsync();
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser =currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "BudgetDetail",
                    ItemID = dl.BudgetDetailID,
                    Change = "UpdateBudDetail - Update Budget Detail: " + JsonConvert.SerializeObject(dl)
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


        // POST: api/Budget/InsertBudCategory
        /// <summary>
        /// Inserts new Budget Category
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPost]
        [Route("InsertBudCategory")]
        public async Task<ActionResult<BudgetCategory>> InsertBudCategory([FromBody]BudgetCategory dl)
        {
            _context.BudgetCategories.Add(dl);
            await _context.SaveChangesAsync();
            return CreatedAtAction("getBudCatbyID", new { id = dl.BudCatID }, dl);
        }



        // POST: api/Budget/InsertBudDetail
        /// <summary>
        /// Inserts new Budget Detail
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPost]
        [Route("InsertBudDetail")]
        public async Task<ActionResult<BudgetCategory>> InsertBudDetail([FromBody]BudgetDetail dl)
        {
            _context.BudgetDetails.Add(dl);
            await _context.SaveChangesAsync();
            return CreatedAtAction("getBudDetailbyID", new { id = dl.BudgetDetailID }, dl);
        }

        // DELETE: api/Budget/DeleteBudgetCat
        /// <summary>
        /// Deletes Budget Category
        /// </summary>
        /// <param name="id"></param>
        /// <returns>DeleteBudgetCat</returns>
        [HttpDelete]
        [Route("DeleteBudgetCat")]
        public async Task<ActionResult<BudgetCategory>> DeleteBudgetCat(long id)
        {
            try
            {
                var BudgetCat = await _context.BudgetCategories.FindAsync(id);
                if (BudgetCat == null)
                {
                    return NotFound();
                }

                _context.BudgetCategories.Remove(BudgetCat);
                await _context.SaveChangesAsync();

                return BudgetCat;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return NotFound();
            }
        }

        // DELETE: api/Budget/DeleteBudgetDetail
        /// <summary>
        /// Deletes Budget Detail
        /// </summary>
        /// <param name="id"></param>
        /// <returns>DeleteBudgetDetail</returns>
        [HttpDelete]
        [Route("DeleteBudgetDetail")]
        public async Task<ActionResult<BudgetDetail>> DeleteBudgetDetail(long id)
        {
            try
            {
                var BudgetDet = await _context.BudgetDetails.FindAsync(id);
                if (BudgetDet == null)
                {
                    return NotFound();
                }

                _context.BudgetDetails.Remove(BudgetDet);
                await _context.SaveChangesAsync();

                return BudgetDet;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return NotFound();
            }
        }




        private bool BudgetExists(long id)
        {
            return _context.Budgets.Any(e => e.BudgetID == id);
        }


        // POST: api/Budget/InsertSubDocLink
        /// <summary>
        /// Inserts new InsertSubDocLink
        /// </summary>
        /// <param name="sublink"></param>
        /// <returns>InsertSubDocLinkID</returns>
        [HttpPost]
        [Route("InsertSubDocLink")]
        public async Task<ActionResult<BudgetViewModel>> InsertSubDocLink([FromBody]DocumentLink budlink)
        {
            try
            {
                _context.DocumentLinks.Add(budlink);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getDocLinkbyID", new { id = budlink.DocLinkID }, budlink);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }


        // PUT: api/Budget/getSubDocLinkbyID
        /// <summary>
        /// Get getSubDocLinkbyID by ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>BudgetDocLink</returns>
        [HttpGet]
        [Route("getDocLinkbyID")]
        public async Task<DocumentDb> getDocLinkbyID(long id)
        {
            try
            {
                var doclk = await _context.DocumentLinks.Where(i => i.DocLinkID == id).FirstOrDefaultAsync();
                var docdb = await _context.DocumentDbs.Where(i => i.DocID == doclk.DocID).FirstOrDefaultAsync();

                return docdb;
            }
            catch
            {
                return null;
            }

        }

        [HttpPost]
        [Route("insertContributor")]
        public async Task<Contributor> insertContributor(long contactid, long budgetid)
        {
            try
            {
                ContactLink cl = new ContactLink()
                {
                    ContactID = contactid,
                    ItemType = "Budget",
                    ItemID = budgetid,
                    Label = "Budget Contributor"
                };
                var temp =  _context.ContactLinks.Add(cl);
                await _context.SaveChangesAsync();

                var result = await _context.Contributors.Where(p => p.ContactLinkID == cl.ContactLinkID).FirstOrDefaultAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("deleteContributor")]
        public async Task<ContactLink> deleteContributor(long contactlinkid, long budgetid)
        {
            try
            {
                
                var cl = await _context.ContactLinks.Where(p => p.ContactLinkID == contactlinkid && p.ItemType == "Budget" && p.ItemID == budgetid).FirstOrDefaultAsync();
                 _context.ContactLinks.Remove(cl);
                var result = await _context.SaveChangesAsync();
                return cl;
            }
            catch
            {
                return null;
            }
        }


        [HttpGet]
        [Route("GetBudgetDefaults")]
        public async Task<List<BudgetDefault>> GetBudgetDefaults(string entcode)
        {
            try
            {
                return await _context.BudgetDefaults.Where(i => i.EntCode == entcode).ToListAsync();
            }
            catch
            {
                return null;
            }

        } 

        [HttpPost]
        [Route("CreateDefaultBudget")]
        public async Task<long> InsertDefaultBudget(long projectid, string entcode, long gsf)
        {
            try
            {
                var bud = await _context.Budgets.Where(b => b.ProjectID == projectid && b.EntCode == entcode).ToListAsync();

                if (bud.Count >=1)
                {
                    return bud[0].BudgetID;
                }

                Budget newbudget = new Budget()
                {
                    ProjectID = projectid,
                    EntCode = entcode,
                    Status = "Draft",
                    DateEntered = DateTime.Now,
                    BudgetType = "Estimated",
                    Classification = "Concept",
                    DueDate = DateTime.Now.AddDays(60),
                    Gsf = gsf
                };

                _context.Budgets.Add(newbudget);
                await _context.SaveChangesAsync();

                var budDef = _context.BudgetDefaults.Where(p => p.EntCode == entcode).OrderBy(c => c.Code).ToList();

                var cats = from BudgetDefault in budDef
                           where BudgetDefault.Summary == true
                           select BudgetDefault;
                int i = 0;
                foreach (BudgetDefault C in cats)
                {
                    i++;
                    BudgetCategory newcat = new BudgetCategory()
                    {
                        BudgetID = newbudget.BudgetID,
                        Category = C.Description,
                        CatOrder = i,
                        Cost = 0
                    };

                    _context.BudgetCategories.Add(newcat);
                    await _context.SaveChangesAsync();

                    var catDet = from BudgetDefault in budDef
                                 where BudgetDefault.Category == C.Category && BudgetDefault.Summary == false
                                 select BudgetDefault;

                    int order = 0;
                    foreach (BudgetDefault D in catDet)
                    {
                        order++;
                        BudgetDetail newdet = new BudgetDetail()
                        {
                            BudCatID = newcat.BudCatID,
                            Basis = "Estimate",
                            Code = D.Code,
                            DetailOrder = order,
                            Item = D.Description,
                            Note ="",
                             OnSched = false,
                              Qty =1,
                               Unit = "Each",
                               Rate = 0
                        };
                        _context.BudgetDetails.Add(newdet);
                    }
                    await _context.SaveChangesAsync();

                }
                return newbudget.BudgetID;
            }
            catch (Exception ex)
            {
                Console.Write("CreateDefaultBudget", ex.Message);
                return 0;
            }
        }

    }
}
