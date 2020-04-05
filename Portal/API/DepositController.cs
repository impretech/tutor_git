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
using static Portal.Models.DepositViewModel;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class DepositController : ControllerBase
    {
        public IHostingEnvironment HostingEnvironment { get; set; }
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;

        public DepositController(IHostingEnvironment hostingEnvironment, SyvennDBContext context)
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

        // GET: api/Deposits
        [HttpGet]
        [Route("GetDeposits")]
        public async Task<ActionResult<IEnumerable<Deposit>>> GetBudgets(string entcode)
        {
            try
            {
                return await _context.Deposits.Where(i => i.EntCode == entcode).ToListAsync();
            }
            catch
            {
                return null;
            }
        }

        // GET: api/Deposits/5
        [HttpGet]
        [Route("GetDepositbyID")]
        public async Task<DepositViewModel> GetDepositbyID(long id)
        {
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }
            DepositViewModel result = new DepositViewModel();
            try
            {
                var deposit = await _context.Deposits.FindAsync(id);
                if (deposit == null)
                {
                    return null;
                }
                result = await GetDepositVM(deposit, deposit.EntCode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        [HttpGet]
        [Route("GetDepositVM")]
        public async Task<DepositViewModel> GetDepositVM(Deposit B, string entcode)
        {
            try
            {
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                DepositViewModel vm = new DepositViewModel { Dep = B };
                vm.Lookups = new List<Lookup>();
                vm.Lookups = await _context.Lookups.Where(p => (p.Module == "Deposit") && (p.EntCode == entcode)).OrderBy(p => p.Prompt).ToListAsync();
                vm.Details = new DepositDetailsVM();
                vm.CurrentTotals = new DepCatSumTotals();
                vm.Details.Categories = new List<GroupedDepositCategory>();
                vm.Details.DepDetails = new List<GroupedDepositDetail>();
                if (B.BudgetID > 0)
                {
                    var cats = await _context.BudgetCategories.Where(p => (p.BudgetID == B.BudgetID)).ToListAsync();
                    foreach (BudgetCategory c in cats)
                    {
                        GroupedDepositCategory GC = new GroupedDepositCategory();
                        var dc = await _context.DepositCategories.Where(p => p.BudCatID == c.BudCatID && p.DepositID == B.DepositID).FirstOrDefaultAsync();


                        if (dc != null)
                        {
                            GC = new GroupedDepositCategory()
                            {
                                BudCatID = c.BudCatID,
                                DepCatID = dc.DepCatID,
                                DepositID = dc.DepositID,
                                BudgetID = c.BudgetID,
                                Category = c.Category,
                                CatOrder = c.CatOrder,
                                Cost = c.Cost,
                                Deposit = dc.Deposit,
                                Weight = c.Weight,
                                CurrentFunding = dc.CurrentFunding,
                                AvailableBudget = dc.AvailableBudget,
                               
                            };
                            vm.Details.Categories.Add(GC);
                        }
                        else
                        {
                            decimal avail = 0;
                            decimal funds = 0;

                            DepositCatSum catsum = new DepositCatSum();
                            catsum = await _context.DepositCatSums.Where(p => p.BudCatID == c.BudCatID).FirstAsync();
                            if (catsum != null)
                            {
                                avail = catsum.BudgetTot - catsum.DepositTot;
                                funds = catsum.DepositTot;
                            }
                            else
                            {
                                BudgetCategory  budsum = new BudgetCategory();
                                budsum = await _context.BudgetCategories.Where(b => b.BudCatID == c.BudCatID).FirstOrDefaultAsync();
                                if (budsum!= null)
                                {
                                    avail = budsum.Cost;
                                    funds = 0;
                                }
                            }
                          

                            BudgetCategory temp =await  _context.BudgetCategories.Where(b => b.BudCatID == c.BudCatID).FirstOrDefaultAsync();
                            DepositCategory newcat = new DepositCategory()
                            {
                                BudCatID = c.BudCatID,
                                Deposit = 0,
                                DepositID = B.DepositID,
                                AvailableBudget = avail,
                                CurrentFunding = funds
                            };
                            _context.DepositCategories.Add(newcat);
                            await _context.SaveChangesAsync();

                            GC = new GroupedDepositCategory()
                            {
                                BudCatID = c.BudCatID,
                                DepCatID = newcat.DepCatID,
                                DepositID = newcat.DepositID,
                                BudgetID = c.BudgetID,
                                Category = c.Category,
                                CatOrder = c.CatOrder,
                                Cost = c.Cost,
                                Deposit = newcat.Deposit,
                                Weight = c.Weight,
                                AvailableBudget = avail,
                                CurrentFunding = 0
                            };
                            
                            vm.Details.Categories.Add(GC);
                        }

                        var buddetails = await _context.BudgetDetails.Where(p => p.BudCatID == c.BudCatID).ToListAsync();
                        foreach (BudgetDetail d in buddetails)
                        {
                            var dets = await _context.DepositDetails.Where(p => p.BudgetDetailID == d.BudgetDetailID && p.DepositID == B.DepositID).FirstOrDefaultAsync();
                            GroupedDepositDetail GD = new GroupedDepositDetail();
                            if (dets != null)
                            {
                                GD = new GroupedDepositDetail()
                                {
                                    Basis = d.Basis,
                                    BudCatID = d.BudCatID,
                                    BudgetDetailID = d.BudgetDetailID,
                                    Code = d.Code,
                                    Deposit = dets.Deposit,
                                    DepositDetailID = dets.DepositDetailID,
                                    DepositID = B.DepositID,
                                    DetailOrder = d.DetailOrder,
                                    Item = d.Item,
                                    Note = d.Note,
                                    OnSched = d.OnSched,
                                    Qty = d.Qty,
                                    Rate = d.Rate,
                                    Unit = d.Unit,
                                    CurrentFunding = dets.CurrentFunding,
                                    Budget = dets.Budget
                                };
                                vm.Details.DepDetails.Add(GD);
                            }
                            else
                            {
                                var detsum = await _context.BudgetDetails.Where(i => i.BudgetDetailID == d.BudgetDetailID).FirstOrDefaultAsync();
                                //var detsum = await _context.DepsoitDetLineSums.Where(i => i.BudgetDetailID == d.BudgetDetailID).FirstOrDefaultAsync();
                                DepositDetail det2 = new DepositDetail()
                                {
                                    BudCatID = d.BudCatID,
                                    BudgetDetailID = d.BudgetDetailID,
                                    Deposit = 0,
                                    Budget = detsum.Qty * detsum.Rate,
                                    CurrentFunding = 0,
                                    LtdPurchasing = 0

                                };
                                _context.DepositDetails.Add(det2);
                                await _context.SaveChangesAsync();
                                GD = new GroupedDepositDetail()
                                {
                                    Basis = d.Basis,
                                    BudCatID = d.BudCatID,
                                    BudgetDetailID = d.BudgetDetailID,
                                    Code = d.Code,
                                    Deposit = det2.Deposit,
                                    DepositID = B.DepositID,
                                    DepositDetailID = det2.DepositDetailID,
                                    DetailOrder = d.DetailOrder,
                                    Item = d.Item,
                                    Note = d.Note,
                                    OnSched = d.OnSched,
                                    Qty = d.Qty,
                                    Rate = d.Rate,
                                    Unit = d.Unit,
                                    Budget = detsum.Qty * detsum.Rate, //detsum.LineBudgetTotal,
                                    CurrentFunding = 0, //detsum.LineDepositTotal,
                                    LtdPurchasing =0 // detsum.LineDepositTotal
                                };
                                vm.Details.DepDetails.Add(GD);
                            }
                        }

                    }
                }

                ProjectController PC = new ProjectController(HostingEnvironment, _context);
                vm.ProjectTitle = await PC.GetProjectTitlebyID(B.BudgetID, entcode);

                vm.Contributors = new List<Contributor>();
                vm.Contributors = await _context.Contributors.Where(p => p.ItemType == "Deposit" && p.ItemID == B.DepositID).ToListAsync();

                vm.Notes = new List<Note>();
                vm.Notes = await _context.Notes.Where(p => p.ItemType == "Deposit" && p.ItemNo == B.DepositID).ToListAsync();

                var docs = await _context.DocumentLinks.Where(p => p.ItemType == "Deposit" && p.ItemNo == B.DepositID).ToListAsync();
                foreach (DocumentLink r in docs)
                {
                    DocumentDb docdb = await _context.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                    vm.Documents.Add(docdb);
                }
                vm.CurrentTotals = GetDepositTotals(B);

                return vm;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        public DepCatSumTotals GetDepositTotals(Deposit B)
        {
            DepCatSumTotals result = new DepCatSumTotals() {
                Commitments = 0,
                Deposits = 0,
                Pending = 0
            };

            if (B != null)
            {
                //************************* Test Data/ Replace in production
                result = new DepCatSumTotals()
                {
                    Commitments = 0,
                    Deposits = 20000,
                    Pending = 3500
                };
                return result;
            }  
            return result;
        }

        [HttpGet]
        [Route("GetCatbyDepositID")]
        public async Task<List<DepositCategory>> GetCategoriesbyDepositID(long id)
        {
            try
            {
                var result = await _context.DepositCategories.Where(p => (p.DepositID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetCategoriesbyBudgetID")]
        public async Task<List<DepositCategory>> GetCategoriesbyBudgetID(long id)
        {
            try
            {
                var cats = await _context.BudgetCategories.Where(c => c.BudgetID == id).Select(c => c.BudCatID).ToListAsync();
                var result = await _context.DepositCategories.Where(p => cats.Contains(p.BudCatID)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetCatByBudget")]
        public async Task<List<GroupedDepositCategory>> GetCatByBudget(long budgetid, long depositid)
        {
            if (budgetid > 0)
            {
                try
                {
                    List<GroupedDepositCategory> result = new List<GroupedDepositCategory>();
                    var cats = await _context.BudgetCategories.Where(p => (p.BudgetID == budgetid)).ToListAsync();
                    foreach (BudgetCategory c in cats)
                    {
                        GroupedDepositCategory GC = new GroupedDepositCategory();
                        var dc = await _context.DepositCategories.Where(p => p.BudCatID == c.BudCatID && p.DepositID== depositid).FirstOrDefaultAsync();
                        if (dc != null)
                        {
                            GC = new GroupedDepositCategory()
                            {
                                BudCatID = c.BudCatID,
                                DepCatID = dc.DepCatID,
                                DepositID = dc.DepositID,
                                BudgetID = c.BudgetID,
                                Category = c.Category,
                                CatOrder = c.CatOrder,
                                Cost = c.Cost,
                                Deposit = dc.Deposit,
                                Weight = c.Weight,
                                CurrentFunding = dc.CurrentFunding,
                                AvailableBudget = dc.AvailableBudget,
                            };
                            result.Add(GC);
                        }
                        else
                        {
                            var catsum = await _context.DepositCatSums.Where(p => p.BudCatID == c.BudCatID).FirstOrDefaultAsync();
                            var curfund = await _context.DepositDetails.Where(i => i.BudCatID == c.BudCatID && i.DepositID != depositid).SumAsync(i => i.Deposit);
                            if (catsum != null)
                            {
                                DepositCategory newcat = new DepositCategory()
                                {
                                    BudCatID = c.BudCatID,
                                    Deposit = 0,
                                    DepositID = depositid,
                                    AvailableBudget = catsum.BudgetTot - curfund, //catsum.DepositTot,
                                    CurrentFunding = curfund, //catsum.DepositTot

                                };
                                // _context.DepositCategories.Add(newcat);
                                // await _context.SaveChangesAsync();

                                GC = new GroupedDepositCategory()
                                {
                                    BudCatID = c.BudCatID,
                                    DepCatID = newcat.DepCatID,
                                    DepositID = newcat.DepositID,
                                    BudgetID = c.BudgetID,
                                    Category = c.Category,
                                    CatOrder = c.CatOrder,
                                    Cost = c.Cost,
                                    Deposit = newcat.Deposit,
                                    Weight = c.Weight,
                                    CurrentFunding = curfund, //catsum.DepositTot,
                                    AvailableBudget = catsum.BudgetTot - curfund  //catsum.DepositTot
                                };
                                result.Add(GC);
                            }
                            else
                            {
                                decimal avail = 0;
                                decimal funds = 0;

                                BudgetCategory budsum = new BudgetCategory();
                                budsum = await _context.BudgetCategories.Where(b => b.BudCatID == c.BudCatID).FirstOrDefaultAsync();
                                if (budsum != null)
                                {
                                    avail = budsum.Cost;
                                    funds = 0;
                                }
                                
                                DepositCategory newcat = new DepositCategory()
                                {
                                    BudCatID = c.BudCatID,
                                    Deposit = 0,
                                    DepositID = depositid,
                                    AvailableBudget = avail,
                                    CurrentFunding = funds
                                };
                                //_context.DepositCategories.Add(newcat);
                                //await _context.SaveChangesAsync();

                                GC = new GroupedDepositCategory()
                                {
                                    BudCatID = c.BudCatID,
                                    DepCatID = newcat.DepCatID,
                                    DepositID = newcat.DepositID,
                                    BudgetID = c.BudgetID,
                                    Category = c.Category,
                                    CatOrder = c.CatOrder,
                                    Cost = c.Cost,
                                    Deposit = newcat.Deposit,
                                    Weight = c.Weight,
                                    AvailableBudget = avail,
                                    CurrentFunding = 0
                                };
                                result.Add(GC);
                                // vm.Details.Categories.Add(GC);
                            }
                     
                        }
                       // result.Add(GC);
                    }
                    return result;
                }
                catch (Exception ex)
                {
                    Console.Write(ex.Message);
                    return null;
                }
            }
            else
                return null;
        }

        [HttpGet]
        [Route("GetDepBudDetails")]
        public async Task<List<GroupedDepositDetail>> GetDepBudDetails(long budgetid, long depositid)
        {
            if (budgetid > 0)
            {
                try
                {
                    List<GroupedDepositDetail> result = new List<GroupedDepositDetail>();
                    if (depositid > 0)
                    {
                        var detList = await _context.DepositDetails.Where(i =>  i.DepositID == depositid).ToListAsync();
                        foreach (DepositDetail d in detList)
                        {
                            GroupedDepositDetail GD = new GroupedDepositDetail();
                            var buddetail = await _context.BudgetDetails.Where(i => i.BudgetDetailID == d.BudgetDetailID).FirstOrDefaultAsync();
                            if (buddetail != null && depositid > 0)
                            {
                                GD = new GroupedDepositDetail()
                                {
                                    Basis = buddetail.Basis,
                                    BudCatID = buddetail.BudCatID,
                                    BudgetDetailID = d.BudgetDetailID,
                                    Code = buddetail.Code,
                                    Deposit = d.Deposit,
                                    DepositDetailID = d.DepositDetailID,
                                    DetailOrder = buddetail.DetailOrder,
                                    Item = buddetail.Item,
                                    Note = buddetail.Note,
                                    OnSched = buddetail.OnSched,
                                    Qty = buddetail.Qty,
                                    Rate = buddetail.Rate,
                                    Unit = buddetail.Unit,
                                    Budget = d.Budget,
                                    CurrentFunding = d.CurrentFunding,
                                    LtdPurchasing = d.LtdPurchasing,
                                    DepositID = depositid,
                                    DepCatID = d.DepCatID
                                };
                                result.Add(GD);
                            }
                        }
                    }
                    else
                    {
                        var cats = await _context.BudgetCategories.Where(p => (p.BudgetID == budgetid)).ToListAsync();
                        foreach (BudgetCategory C in cats)
                        {
                            var buddetails = await _context.BudgetDetails.Where(p => p.BudCatID == C.BudCatID).ToListAsync();
                            foreach (BudgetDetail d in buddetails)
                            {
                                GroupedDepositDetail GD = new GroupedDepositDetail();


                                    var curfund = await _context.DepositDetails.Where(i => i.BudgetDetailID == d.BudgetDetailID && i.DepositID != depositid).SumAsync(i => i.Deposit);
                                   // var depcat = await _context.DepositCategories.Where(i => i.BudCatID == d.BudCatID && i.DepositID == depositid).FirstOrDefaultAsync();

                                    var ltdpurch = 0;
                                    if (curfund > 0)    //(detsum != null)
                                    {
                                        DepositDetail det2 = new DepositDetail()
                                        {
                                            BudCatID = d.BudCatID,
                                            BudgetDetailID = d.BudgetDetailID,
                                            Deposit = 0,
                                            Budget = d.Rate * d.Qty,  //detsum.LineBudgetTotal,
                                            CurrentFunding = curfund, //detsum.LineDepositTotal,
                                            LtdPurchasing = ltdpurch, //detsum.LineDepositTotal,
                                            DepositID = 0, //depositid,
                                            DepCatID = 0, //depcat.DepCatID

                                        };
                                        //_context.DepositDetails.Add(det2);
                                        //await _context.SaveChangesAsync();
                                        GD = new GroupedDepositDetail()
                                        {
                                            Basis = d.Basis,
                                            BudCatID = d.BudCatID,
                                            BudgetDetailID = d.BudgetDetailID,
                                            Code = d.Code,
                                            Deposit = det2.Deposit,
                                            DepositDetailID = det2.DepositDetailID,
                                            DetailOrder = d.DetailOrder,
                                            Item = d.Item,
                                            Note = d.Note,
                                            OnSched = d.OnSched,
                                            Qty = d.Qty,
                                            Rate = d.Rate,
                                            Unit = d.Unit,
                                            Budget = d.Rate * d.Qty, //detsum.LineBudgetTotal,
                                            CurrentFunding = curfund, //detsum.LineDepositTotal,
                                            LtdPurchasing = ltdpurch,
                                            DepositID = 0, //depositid,
                                            DepCatID = 0 //depcat.DepCatID
                                        };
                                        result.Add(GD);
                                    }
                                    else
                                    {
                                        DepositDetail det2 = new DepositDetail()
                                        {
                                            BudCatID = d.BudCatID,
                                            BudgetDetailID = d.BudgetDetailID,
                                            Deposit = 0,
                                            Budget = d.Qty * d.Rate,
                                            CurrentFunding = 0,
                                            LtdPurchasing = 0,
                                            DepositID = 0, //depositid,
                                            DepCatID = 0 //depcat.DepCatID
                                        };
                                        //_context.DepositDetails.Add(det2);
                                        //await _context.SaveChangesAsync();
                                        GD = new GroupedDepositDetail()
                                        {
                                            Basis = d.Basis,
                                            BudCatID = d.BudCatID,
                                            BudgetDetailID = d.BudgetDetailID,
                                            Code = d.Code,
                                            Deposit = det2.Deposit,
                                            DepositDetailID = det2.DepositDetailID,
                                            DetailOrder = d.DetailOrder,
                                            Item = d.Item,
                                            Note = d.Note,
                                            OnSched = d.OnSched,
                                            Qty = d.Qty,
                                            Rate = d.Rate,
                                            Unit = d.Unit,
                                            Budget = d.Qty * d.Rate,
                                            CurrentFunding = 0,
                                            LtdPurchasing = 0,
                                            DepositID = 0, //depositid,
                                            DepCatID = 0 //depcat.DepCatID
                                        };
                                        result.Add(GD);
                                    }
                                
                            }
                        }
                    }
                 

                    return result;
                }
                catch (Exception ex)
                {
                    Console.Write(ex.Message);
                    return null;
                }
            }
            return null;
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
                    ItemType = "Deposit",
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

        // POST: api/Budget/UpdateDeposit
        /// <summary>
        /// Update Deposit
        /// </summary>
        /// <param name="dep"></param>
        /// <returns>bool</returns>
        [HttpPut]
        [Route("UpdateDeposit")]
        public async Task<ActionResult<bool>> UpdateDeposit([FromBody]Deposit dep)
        {
            try
            {
                if (!(dep.DepositID > 0))
                {
                    return BadRequest();
                }

                Deposit s = await _context.Deposits.FindAsync(dep.DepositID);

                if (s == null)
                    return NotFound();

                s.Addendum = dep.Addendum;
                s.BudgetID = dep.BudgetID;
                s.DepositDate = dep.DepositDate;
                s.DepositID = dep.DepositID;
                s.DepositType = dep.DepositType;
                s.Description = dep.Description;
                s.EntCode = dep.EntCode;
                s.FundingSource = dep.FundingSource;
                s.ProjectID = dep.ProjectID;
                s.FundingType = dep.FundingType;
                s.Reason = dep.Reason;
                s.Status = dep.Status;
                s.Total = dep.Total;
                s.UseType = dep.UseType;

                _context.Deposits.Update(s);
                await _context.SaveChangesAsync();
                if (currentUser == null)
                {
                    var user = await GetCurrentUser(HttpContext);
                }
                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserEmail,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = dep.EntCode,
                    ItemType = "Deposit",
                    ItemID = dep.DepositID,
                    Change = "UpdateBudget - Update Budget: " + JsonConvert.SerializeObject(dep)
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


        // POST: api/Budget/InsertDeposit
        /// <summary>
        /// Inserts new budget
        /// </summary>
        /// <param name="deposit"></param>
        /// <returns>depositid</returns>
        [HttpPost]
        [Route("InsertDeposit")]
        public async Task<ActionResult<DepositViewModel>> InsertDeposit([FromBody]Deposit deposit)
        {
            try
            {
                
                _context.Deposits.Add(deposit);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getDepositbyID", new { id = deposit.DepositID }, deposit);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        // DELETE: api/Budget/DeleteDeposit
        /// <summary>
        /// Deletes Deposit
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Deposit</returns>
        [HttpDelete]
        [Route("DeleteDeposit")]
        public async Task<ActionResult<Deposit>> DeleteDeposit(long id)
        {
            var deposit = await _context.Deposits.FindAsync(id);
            if (deposit == null)
            {
                return NotFound();
            }

            _context.Deposits.Remove(deposit);
            await _context.SaveChangesAsync();

            return deposit;
        }

        // Get: api/Budget/getDepCatbyDepID
        /// <summary>
        /// Get Budget Categories by DepositID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>DepositCategory</returns>
        [HttpGet]
        [Route("getDepCatbyDepID")]
        public async Task<List<DepositCategory>> getDepCatbyDepID(long id)
        {
            List<DepositCategory> result = new List<DepositCategory>();
            try
            {
                result = await _context.DepositCategories.Where(i => i.DepositID == id).ToListAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("getDepCatbyID")]
        public async Task<DepositCategory> getDepCatbyID(long id)
        {
            DepositCategory result = new DepositCategory();
            try
            {
                result = await _context.DepositCategories.Where(i => i.DepCatID == id).FirstOrDefaultAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("getDepDetailbyID")]
        public async Task<DepositDetail> getDepDetailbyID(long id)
        {
            DepositDetail result = new DepositDetail();
            try
            {
                result = await _context.DepositDetails.Where(i => i.DepositDetailID == id).FirstOrDefaultAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        [HttpGet]
        [Route("getDepDetailsbyCatID")]
        public async Task<List<DepositDetail>> getDepDetailsbyCatID(long id)
        {
            List<DepositDetail> result = new List<DepositDetail>();
            try
            {
                result = await _context.DepositDetails.Where(i => i.BudCatID == id).ToListAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        // Get: api/Budget/getDepDetailsbyDepID
        /// <summary>
        /// Get Deposit Details by BudgetID
        /// </summary>
        /// <param name="depid"></param>
        /// <returns>DepositDetail</returns>
        [HttpGet]
        [Route("getDepDetailsbyDepID")]
        public async Task<List<DepositDetail>> getBudDetailsbyBudID(long depid)
        {
            try
            {
                List<DepositDetail> result = new List<DepositDetail>();
                var cats = await getDepCatbyDepID(depid);
                foreach (DepositCategory cat in cats)
                {
                    var dets = await getDepDetailsbyCatID(cat.BudCatID);
                    result.AddRange(dets);
                }
                return result;
            }
            catch
            {
                return null;
            }
        }

        // Get: api/Budget/GetContributorsbyDepID
        /// <summary>
        /// Get Budget Contributors by DepositID
        /// </summary>
        /// <param name="depid"></param>
        /// <returns>Contributor</returns>
        [HttpGet]
        [Route("GetContributorsbyDepID")]
        public async Task<List<Contributor>> getContributorsbyDepID(long depid)
        {
            try
            {
                List<Contributor> result = new List<Contributor>();
                result = await _context.Contributors.Where(p => p.ItemType == "Deposit" && p.ItemID == depid).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }


        private bool DepCatExists(long id)
        {
            return _context.DepositCategories.Any(e => e.DepCatID == id);
        }

        private bool DepDetailExists(long id)
        {
            return _context.DepositDetails.Any(e => e.DepositDetailID == id);
        }

        // PUT: api/Deposit/UpdateDepCat
        /// <summary>
        /// Update UpdateDepCat
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPut]
        [Route("UpdateDepCat")]
        public async Task<ActionResult<bool>> UpdateDepCat([FromBody]DepositCategory dl)
        {
            try
            {
                if (!(dl.DepCatID > 0))
                {
                    return BadRequest();
                }

                DepositCategory s = await _context.DepositCategories.FindAsync(dl.DepCatID);

                if (s == null)
                    return NotFound();

                s.AvailableBudget = dl.AvailableBudget;
                s.BudCatID = dl.BudCatID;
                s.CurrentFunding = dl.CurrentFunding;
                s.DepositID = dl.DepositID;
                s.Deposit = dl.Deposit;
                s.BudgetID = dl.BudgetID;

                _context.DepositCategories.Update(s);
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
                    ItemType = "DepositCategory",
                    ItemID = dl.DepCatID,
                    Change = "UpdateDepCat - Update Deposit Category: " + JsonConvert.SerializeObject(dl)
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

        // PUT: api/Deposit/UpdateDepDetail
        /// <summary>
        /// Update UpdateDepDetail
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPut]
        [Route("UpdateDepDetail")]
        public async Task<ActionResult<bool>> UpdateDepDetail([FromBody]DepositDetail dl)
        {
            try
            {
                if (!(dl.DepositDetailID > 0))
                {
                    return BadRequest();
                }

                DepositDetail s = await _context.DepositDetails.FindAsync(dl.DepositDetailID);

                if (s == null)
                    return NotFound();

                s.Budget = dl.Budget;
                s.BudCatID = dl.BudCatID;
                s.BudgetDetailID = dl.BudgetDetailID;
                s.CurrentFunding = dl.CurrentFunding;
                s.Deposit = dl.Deposit;
                s.LtdPurchasing = dl.LtdPurchasing;
                s.DepCatID = dl.DepCatID;
                if (s.DepositID== 0)
                    s.DepositID = dl.DepositID;
               

                _context.DepositDetails.Update(s);
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
                    ItemType = "DepositDetail",
                    ItemID = dl.DepositDetailID,
                    Change = "UpdateDepDetail - Update Deposit Detail: " + JsonConvert.SerializeObject(dl)
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

        // POST: api/Deposit/InsertDepCategory
        /// <summary>
        /// Inserts new Deposit Category
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPost]
        [Route("InsertDepCategory")]
        public async Task<ActionResult<DepositCategory>> InsertDepCategory([FromBody]DepositCategory dl)
        {
            try
            {
                _context.DepositCategories.Add(dl);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getDepCatbyID", new { id = dl.DepCatID }, dl);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }



        // POST: api/Deposit/InsertDepDetail
        /// <summary>
        /// Inserts new Deposit Detail
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPost]
        [Route("InsertDepDetail")]
        public async Task<ActionResult<DepositDetail>> InsertDepDetail([FromBody]DepositDetail dl)
        {
            _context.DepositDetails.Add(dl);
            await _context.SaveChangesAsync();
            return CreatedAtAction("getDepDetailbyID", new { id = dl.DepositDetailID }, dl);
        }


        private bool DepositExists(long id)
        {
            return _context.Deposits.Any(e => e.DepositID == id);
        }

        // POST: api/Budget/InsertSubDocLink
        /// <summary>
        /// Inserts new InsertSubDocLink
        /// </summary>
        /// <param name="sublink"></param>
        /// <returns>InsertSubDocLinkID</returns>
        [HttpPost]
        [Route("InsertSubDocLink")]
        public async Task<ActionResult<DepositViewModel>> InsertSubDocLink([FromBody]DocumentLink budlink)
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
        public async Task<Contributor> insertContributor(long contactid, long depositid)
        {
            try
            {
                ContactLink cl = new ContactLink()
                {
                    ContactID = contactid,
                    ItemType = "Deposit",
                    ItemID = depositid,
                    Label = "Deposit Contributor"
                };
                var temp = _context.ContactLinks.Add(cl);
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
        public async Task<ContactLink> deleteContributor(long contactlinkid, long depositid)
        {
            try
            {

                var cl = await _context.ContactLinks.Where(p => p.ContactLinkID == contactlinkid && p.ItemType == "Deposit" && p.ItemID == depositid).FirstOrDefaultAsync();
                _context.ContactLinks.Remove(cl);
                var result = await _context.SaveChangesAsync();
                return cl;
            }
            catch
            {
                return null;
            }
        }


        // PUT: api/Deposit/GetBudgetsList
        /// <summary>
        /// Get DocCards to display attach documents, id = ProjectID
        /// </summary>
        /// <param name="entcode"></param>
        /// <returns>Budgets</returns>
        [HttpGet]
        [Route("GetBudgetsList")]
        public async Task<ActionResult<List<Budget>>> GetBudgetsList(long id, string entcode)
        {
            try
            {

                var result = await _context.Budgets.Where(i => i.ProjectID == id && i.EntCode==entcode).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpDelete]
        [Route("DeleteDepositCat")]
        public async Task<ActionResult<DepositCategory>> DeleteDepositCat(long id)
        {
            var deposit = await _context.DepositCategories.FindAsync(id);
            if (deposit == null)
            {
                return NotFound();
            }

            _context.DepositCategories.Remove(deposit);
            await _context.SaveChangesAsync();

            return deposit;
        }

        [HttpDelete]
        [Route("DeleteDepositDet")]
        public async Task<ActionResult<DepositDetail>> DeleteDepositDet(long id)
        {
            var deposit = await _context.DepositDetails.FindAsync(id);
            if (deposit == null)
            {
                return NotFound();
            }

            _context.DepositDetails.Remove(deposit);
            await _context.SaveChangesAsync();

            return deposit;
        }

        [HttpDelete]
        [Route("DeleteDepositCatAndDet")]
        public async Task<ActionResult<bool>> DeleteDepositCatAndDet(long id)
        {
            try
            {
                var depositdet = await _context.DepositDetails.Where(i => i.DepositID == id).ToListAsync();
                if (depositdet != null)
                {
                    _context.DepositDetails.RemoveRange(depositdet);
                }

                var depositcat = await _context.DepositCategories.Where(i => i.DepositID == id).ToListAsync();
                if (depositcat != null)
                {
                    _context.DepositCategories.RemoveRange(depositcat);
                }

                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }




    }
}