using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using Portal.API;
using Portal.Features.Upload;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Net.Http;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;
        // private readonly ProjectItemsViewModel ProjectItems;

        public ProjectController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
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
        [Route("getProjectDataByProjectId")]
        public async Task<ActionResult<Models.ProjectDetails>> GetProjectDataByProjectId(long projectId)
        {
            try
            {
                if (currentUser == null)
                {
                    var err = await GetCurrentUser(HttpContext);
                }
                ProjectDetails projectDetail = new ProjectDetails
                {
                    Project = new Project()
                };
                projectDetail.Project = await _db.Project.Where(p => p.ProjectId == projectId).FirstOrDefaultAsync();
                projectDetail.LastNote = new Note();
                projectDetail.LastNote = await _db.Notes.Where(p => p.ProjectID == projectId).OrderByDescending(p => p.Created).FirstOrDefaultAsync();
                projectDetail.Score = 0;

                PCCController pcc = new PCCController(_db);
                projectDetail.Score = await pcc.GetWeightedScorebyID(projectId);


                projectDetail.BudgetData = new BudgetSummary
                {
                    Budgeted = 1300000.00m,
                    Committed = 678000.00m,
                    Paid = 507000.00m,
                    ProjectId = projectId
                };

                projectDetail.SchedData = new ScheduleSummary
                {
                    ProjectId = projectId,
                    Start = DateTime.Now,
                    End = DateTime.Now.AddDays(45),
                    ComplPerc = 67.25m
                };
                projectDetail.FinBarData = GetFinBarSampleData(123);
                //DocumentController doc = new DocumentController(hostingEnvironment, _db);
                //string url = await doc.GetFile(7);

                return projectDetail;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return null;
            }
        }

        private ProjectFinBarData GetFinBarSampleData(long projid)
        {
            ProjectFinBarData projectFinBarData = new ProjectFinBarData()
            {
                ProjectID = projid,
                BudgetTot = 2234456.20M,
                DepositTot = 1942020.00M,
                POCommittedTot = 1120450.00M,
                POPendingTot = 340581.00M,
                InvoiceTot = 980761.24M,
                InvoicePaidTot = 760263.29M
            };
            return projectFinBarData;
        }

        [HttpGet]
        [Route("GetProjectTeam")]
        public async Task<ActionResult<List<ProjectTeamDetail>>> GetProjectTeam(long projid)
        {
            try
            {
                var team = await _db.ProjectTeamDetails.Where(p => p.ProjectID == projid).ToListAsync();
                return team;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetContactsbyEntCode")]
        public async Task<ActionResult<DataSourceResult>> GetContactbyVendorID(string e)
        {
            try
            {
                // List<VendorContact> vcl = new List<VendorContact>();
                var vcl = await _db.Contacts.Where(i => i.EntCode == e).Distinct().ToListAsync();

                DataSourceResult result = new DataSourceResult
                {
                    Data = vcl,
                    Total = vcl.Count()
                };
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("AddToProjectTeam")]
        public async Task<ActionResult<ProjectTeam>> AddProjectTeam([FromBody]ProjectTeam Team)
        {
            try
            {
                _db.ProjectTeams.Add(Team);
                var result = await _db.SaveChangesAsync();
                //var team = await _db.ProjectTeamDetails.Where(p => p.ProjectTeamID == Team.ProjectTeamID).FirstOrDefaultAsync();
                return Team;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("RemoveFromProjectTeam")]
        public async Task<ActionResult<bool>> RemoveFromProjectTeam([FromBody]ProjectTeam Team)
        {
            try
            {
                _db.ProjectTeams.Remove(Team);
                var result = await _db.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        [HttpGet]
        [Route("GetProjectitems")]
        public ActionResult<ProjectItemsViewModel> GetProjectItems(long projid)
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

        [HttpPost]
        [Route("GetProjectItemDetails")]
        public ActionResult<List<DetailItems>> GetProjectItemDetails([FromBody]ProjectItemLookup look)
        {
            try
            {
                ProjectItemsViewModel ProjectItems = new ProjectItemsViewModel();
                ProjectItems = look.ProjectItems;

                List<DetailItems> details = new List<DetailItems>();
                switch (look.ItemType.ToLower())
                {
                    case "estimate":
                        Budget e = new Budget();
                        e = ProjectItems.Estimates.Where(i => i.BudgetID == look.ItemID).FirstOrDefault();
                        details = GetEstimatePreview(e);
                        break;

                    case "budget":
                        Budget b = new Budget();
                        b = ProjectItems.Estimates.Where(i => i.BudgetID == look.ItemID).FirstOrDefault();
                        details = GetBudgetPreview(b);
                        break;

                    case "contract":
                        ContractViewModel c = new ContractViewModel();
                        c = ProjectItems.Contracts.Where(i => i.contract.ContractID == look.ItemID).FirstOrDefault();
                        details = GetContractPreview(c);
                        break;
                    case "proposal":
                        ProposalViewModel p = new ProposalViewModel();
                        p = ProjectItems.Proposals.Where(i => i.ProposalID == look.ItemID).FirstOrDefault();
                        details = GetProprosalPreview(p);
                        break;
                    case "co":
                        ChangeOrder co = new ChangeOrder();
                        co = ProjectItems.COs.Where(i => i.ChangeOrderID == look.ItemID).FirstOrDefault();
                        details = GetCOPreview(co);
                        break;
                    case "invoice":
                        InvoiceStartupVM inv = new InvoiceStartupVM();
                        inv = ProjectItems.Invoices.Where(i => i.InvoiceID == look.ItemID).FirstOrDefault();
                        details = GetInvoicePreview(inv);
                        break;
                    case "pos":
                        POViewModel po = new POViewModel();
                        po = ProjectItems.POs.Where(i => i.PoID == look.ItemID).FirstOrDefault();
                        details = GetPOPreview(po);
                        break;
                    case "subs":
                        Submittal sub = new Submittal();
                        sub = ProjectItems.Subs.Where(i => i.SubmittalID == look.ItemID).FirstOrDefault();
                        details = GetSubPreview(sub);
                        break;
                    case "deposit":
                        Deposit dep = new Deposit();
                        dep = ProjectItems.Deposits.Where(i => i.DepositID == look.ItemID).FirstOrDefault();
                        details = GetDepositPreview(dep);
                        break;
                    case "rfi":
                        RFI rfi = new RFI();
                        rfi = ProjectItems.RFIs.Where(i => i.RFI_ID == look.ItemID).FirstOrDefault();
                        details = GetRFIPreview(rfi);
                        break;
                }

                return details;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        private List<DetailItems> GetBudgetPreview(Budget b)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "BudgetID",
                Value = b.BudgetID.ToString()
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Date Entered",
                Value = b.DateEntered.ToShortDateString()
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Account No",
                Value = b.AccountNo
            };
            details.Add(di2);

            //di2 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Budget Type",
                Value = b.BudgetType
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = b.Status
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "GSF",
                Value = b.Gsf.ToString()
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Total",
                Value = String.Format("{0:C}", b.Total)
            };
            details.Add(di2);

            return details;
        }

        private List<DetailItems> GetEstimatePreview(Budget b)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "EstimateID",
                Value = b.BudgetID.ToString()
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Date Entered",
                Value = b.DateEntered.ToShortDateString()
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Account No",
                Value = b.AccountNo
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Budget Type",
                Value = b.BudgetType
            };
            details.Add(di2);

            //di2 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = b.Status
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "GSF",
                Value = b.Gsf.ToString()
            };
            details.Add(di2);

            di2 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Total",
                Value = String.Format("{0:C}", b.Total)
            };
            details.Add(di2);

            return details;
        }

        private List<DetailItems> GetContractPreview(ContractViewModel c)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "ContractID",
                Value = c.contract.ContractID.ToString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Date Written",
                Value = c.contract.Written.ToShortDateString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "PO#",
                Value = c.contract.PoNo
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor",
                Value = c.contract.VendorName
            };

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Description",
                Value = c.contract.Description
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = c.contract.Status
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Amount",
                Value = String.Format("{0:C}", c.contract.Amount)
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Total",
                Value = String.Format("{0:C}", c.contract.Amount)
            };
            details.Add(di3);
            return details;
        }

        private List<DetailItems> GetProprosalPreview(ProposalViewModel p)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "ProposalID",
                Value = p.ProposalID.ToString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Type",
                Value = p.Type
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor",
                Value = p.VendorName
            };

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor PO#",
                Value = p.VendorPropNo
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Work Type",
                Value = p.WorkType
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Bid Due",
                Value = p.BidDue.ToShortDateString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Bid Issue",
                Value = p.BidIssue.ToShortDateString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Awarded Amount",
                Value = String.Format("{0:C}", p.AwardedAmount)
            };
            details.Add(di3);
            return details;
        }

        private List<DetailItems> GetCOPreview(ChangeOrder c)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "ChangeOrderId",
                Value = c.ChangeOrderID.ToString()
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);


            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Summary",
                Value = c.ChangeSummary
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Description",
                Value = c.ChangeDescription
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "From Company",
                Value = c.ChangeFromCompany
            };

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "To",
                Value = c.ToContractor
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "From",
                Value = c.FromContractor
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "From Company",
                Value = c.ChangeFromCompany
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Quote",
                Value = String.Format("{0:C}", c.Quote)
            };
            details.Add(di3);
            return details;
        }

        private List<DetailItems> GetInvoicePreview(InvoiceStartupVM i)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "InvoiceId",
                Value = i.InvoiceID.ToString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor",
                Value = i.VendorName
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor Inv #",
                Value = i.VendorInvNo
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);




            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Recieved",
                Value = i.Received.ToShortDateString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = i.Status
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Amount",
                Value = String.Format("{0:C}", i.VendorInvAmount)
            };
            details.Add(di3);
            return details;
        }

        private List<DetailItems> GetPOPreview(POViewModel i)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "POId",
                Value = i.PoID.ToString()
            };
            details.Add(di3);



            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor",
                Value = i.ToCompany
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Attention",
                Value = i.Attention
            };
            details.Add(di3);



            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "ContractID",
                Value = i.ContractID.ToString()
            };
            details.Add(di3);


            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Change Order Summary",
                Value = i.ChangeOrderSummary
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = i.Status
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Amount",
                Value = String.Format("{0:C}", i.Amount)
            };
            details.Add(di3);
            return details;
        }

        private List<DetailItems> GetSubPreview(Submittal i)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "SubmittalId",
                Value = i.SubmittalID.ToString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Vendor",
                Value = i.FromCompany
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Sender Submittal #",
                Value = i.SubmittalNo
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "To",
                Value = i.RecToName
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Description",
                Value = i.Description
            };
            details.Add(di3);


            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Recommendation",
                Value = i.RecDetail
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);


            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Reviewer",
                Value = i.RevName
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = i.Status
            };
            details.Add(di3);

            return details;
        }

        private List<DetailItems> GetDepositPreview(Deposit i)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "DepositId",
                Value = i.DepositID.ToString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Date",
                Value = i.DepositDate.ToShortDateString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Type",
                Value = i.DepositType
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Reason",
                Value = i.Reason
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Description",
                Value = i.Description
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Total",
                Value = String.Format("{0:C}", i.Total)
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = i.Status
            };
            details.Add(di3);

            return details;
        }

        private List<DetailItems> GetRFIPreview(RFI i)
        {
            List<DetailItems> details = new List<DetailItems>();
            var di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "RFI Id",
                Value = i.RFI_ID.ToString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Date",
                Value = i.DateCreated.ToShortDateString()
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Writer",
                Value = i.Writer
            };
            details.Add(di3);

            //di3 = new DetailItems()
            //{
            //    DisplayType = "Spacer",
            //    Property = "",
            //    Value = ""
            //};
            //details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Summary",
                Value = i.RequestSummary
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "TextArea",
                Property = "Request",
                Value = i.Request
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Spacer",
                Property = "",
                Value = ""
            };
            details.Add(di3);

            di3 = new DetailItems()
            {
                DisplayType = "Label",
                Property = "Status",
                Value = i.Status
            };
            details.Add(di3);

            return details;
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

        [HttpPut]
        [Route("UpdateProject")]
        public async Task<IActionResult> UpdateProject([FromBody] Project project)
        {

            if (!(project.ProjectId > 0))
            {
                return BadRequest();
            }

            Project p = await _db.Project.FindAsync(project.ProjectId);

            if (p == null)
                return NotFound();

            if (p.Status != project.Status)
            {
                if (p.OppID.Length > 1)
                {
                    var CRM_Import = await _db.CRM_Imports.Where(i => i.OppID == p.OppID).FirstOrDefaultAsync();
                    SF_Note newnote = new SF_Note()
                    {
                        Body = "Syvenn project status has been updated to: " + project.Status,
                        Title = "Syvenn Project Status Update",
                        CreatedById = CRM_Import.OwnerID,
                        OppId = CRM_Import.OppID,
                        OwnerId = CRM_Import.OwnerID,
                        ParentId = CRM_Import.OppID
                    };

                    var client = new HttpClient
                    {
                        BaseAddress = new Uri("http://saleforce-connect-ebik.us-e2.cloudhub.io/")
                    };
                    HttpResponseMessage response = await client.PostAsJsonAsync("updatestatus", newnote);
                }
            }
            p.ProjectNo = project.ProjectNo;
            p.Title = project.Title;
            p.Site = project.Site;
            p.Client = project.Client;
            p.CapitalNo = project.CapitalNo;
            p.DateReceived = project.DateReceived;
            p.Description = project.Description;
            p.Gsf = project.Gsf;
            p.Requestor = project.Requestor;
            p.Phase = project.Phase;
            p.Status = project.Status;
            p.TypeArea = project.TypeArea;
            p.TypeConstruction = project.TypeConstruction;
            p.PMId = project.PMId;
            p.Holder = project.Holder;
            p.StartDate = project.StartDate;
            p.Duration = project.Duration;
            p.Value = project.Value;
            p.PMonSite = project.PMonSite;

            _db.Project.Update(p);
            await _db.SaveChangesAsync();
            if (currentUser == null)
            {
                var user = await GetCurrentUser(HttpContext);
            }

            ActivityLog log = new ActivityLog
            {
                LogUser = currentUser.UserName,   //Replace with actual user login or email
                LogDate = DateTime.Now,
                EntCode = project.EntCode,
                ItemType = "PROJECT",
                ItemID = project.ProjectId,
                Change = "UpdateProject - Update Project: " + JsonConvert.SerializeObject(project)
            };
            await _Logger.InsertActivityLog(log);

            return NoContent();
        }



        [HttpPost]
        [Route("PostProject")]
        public async Task<ActionResult<ActivityLog>> PostProject([FromBody]Project project)
        {
            try
            {
                if (currentUser == null)
                {
                    var User = await GetCurrentUser(HttpContext);
                }

                project.EntCode = currentUser.EntCode;
                project.OwnerEmail = currentUser.UserEmail;

                _db.Project.Add(project);
                await _db.SaveChangesAsync();

                BudgetController budgetController = new BudgetController(HostingEnvironment, _db);
                await budgetController.InsertDefaultBudget(project.ProjectId, project.EntCode, project.Gsf);

                ActivityLog log = new ActivityLog
                {
                    LogUser = currentUser.UserName,        //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = project.EntCode,
                    ItemType = "PROJECT",
                    ItemID = project.ProjectId,
                    Change = "PostProject - Insert new project || " + project.Title + " Project: " + JsonConvert.SerializeObject(project)
                };
                await _Logger.InsertActivityLog(log);


                return CreatedAtAction("PostProject", new { id = project.ProjectId }, project);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        private bool ProjectExists(long id)
        {
            return _db.Project.Any(e => e.ProjectId == id);
        }

        public async Task<string> GetEntCodebyProjID(long id)
        {
            return await _db.Project.Where(i => i.ProjectId == id).Select(p => p.EntCode).FirstOrDefaultAsync();
        }



        [HttpPost]
        [Route("CreateBasicVendorContact")]
        public async Task<ActionResult<Contact>> CreateBasicVendorContact([FromBody]BasicVendorContact b)
        {
            try
            {
                string[] temp = b.ShowAs.Split(' ');
                Contact newcon = new Contact()
                {
                    ShowAsName = b.ShowAs,
                    Company = b.VendorName,
                    FirstName = temp[0],
                    LastName = temp[temp.Count() - 1],
                    EntCode = b.EntCode
                };

                _db.Contacts.Add(newcon);
                var result = await _db.SaveChangesAsync();


                ActivityLog log = new ActivityLog
                {
                    LogUser = b.Writer,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = b.EntCode,
                    ItemType = "Contact",
                    ItemID = newcon.ContactID,
                    Change = "CreateBasicVendorContact- Link : " + JsonConvert.SerializeObject(b)
                };
                await _Logger.InsertActivityLog(log);

                return newcon;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("RemoveTeamContactbyID")]
        public async Task<ActionResult<bool>> RemoveTeamContactbyID(long c)
        {
            try
            {
                var vl = await _db.ProjectTeams.Where(p => p.ProjectTeamID == c).FirstOrDefaultAsync();
                _db.ProjectTeams.Remove(vl);
                var result = await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public List<ProjectLookup> GetProjectLookups(string entcode)
        {
            try
            {
                List<ProjectLookup> result = new List<ProjectLookup>();
                if (ModelState.IsValid && entcode != null)
                {
                    var projects = _db.Project.Where(c => c.EntCode.ToUpper() == entcode.ToUpper()).ToList();
                    if (projects != null && projects.Count > 0)
                    {
                        foreach (Project p in projects)
                        {
                            ProjectLookup L = new ProjectLookup()
                            {
                                EntCode = p.EntCode,
                                ProjectId = p.ProjectId,
                                ProjectNo = p.ProjectNo,
                                Title = p.Title
                            };
                            result.Add(L);
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


        [HttpPost]
        [Route("DefaultBudgets")]
        public async Task<bool> DefaultBudgets(string entcode)
        {
            try
            {
                var projects = await _db.Project.Where(p => p.EntCode == entcode).ToListAsync();
                foreach (Project p in projects)
                {
                    if (!_db.Budgets.Any(b => b.ProjectID == p.ProjectId))
                    {
                        BudgetController budgetController = new BudgetController(HostingEnvironment, _db);
                        await budgetController.InsertDefaultBudget(p.ProjectId, p.EntCode, p.Gsf);
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.Write("Error DefaultBudgets: ", ex.Message);
                return false;
            }
        }

        [HttpGet]
        [Route("GetMilstoneDefaults")]
        public async Task<List<ProjectMilestone>> GetMilstoneDefaults(string type, long projid)
        {
            try
            {
                var defs = await _db.MilestoneDefaults.Where(d => d.Type.ToUpper() == type.ToUpper()).OrderBy(d => d.Order).ToListAsync();
                var results = await InsertProjectMilestone(projid, defs);
                return results;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("InsertProjectMilestone")]
        public async Task<List<ProjectMilestone>> InsertProjectMilestone(long projid, List<MilestoneDefault> milestones)
        {
            List<ProjectMilestone> result = new List<ProjectMilestone>();
            try
            {
                DateTime start = DateTime.Now;
                DateTime end = start;
                foreach (MilestoneDefault m in milestones)
                {
                    end = start.AddDays(7 * m.DurationWKs);
                    ProjectMilestone P = new ProjectMilestone()
                    {
                        ProjectID = projid,
                        MilestoneID = m.MilestoneID,
                        Milestone = m.Milestone,
                        DurationWKs = m.DurationWKs,
                        Order = m.Order,
                        WT = m.WT,
                        StartDate = start,
                        EndDate = end
                    };
                    start = end.AddDays(1);
                    _db.ProjectMilestones.Add(P);
                    await _db.SaveChangesAsync();
                    result.Add(P);
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }

        [HttpPut]
        [Route("UpdateProjectMilestones")]
        public async Task<bool> UpdateProjectMilestones([FromBody]List<ProjectMilestone> MS)
        {
            try
            {
                _db.ProjectMilestones.UpdateRange(MS);
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return false;
            }
        }

        [HttpGet]
        [Route("GetProjectMilestones")]
        public async Task<List<ProjectMilestone>> GetProjectMilestones(long projid)
        {
            try
            {
                var result = await _db.ProjectMilestones.Where(p => p.ProjectID == projid).OrderBy(d => d.Order).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("IsScheduleCreated")]
        public async Task<bool> IsScheduleCreated(long projid)
        {
            try
            {
                var count =await _db.Schedules.Where(d => d.ProjectID == projid).CountAsync();
                if (count > 0)
                    return true;
                else
                    return false;
            }
            catch
            {
                return false;
            }
        }

        [HttpGet]
        [Route("IsProjectNoDuplicate")]
        public async Task<bool> IsProjectNoDuplicate(string projectno, string entcode)
        {
            try
            {
                var dup = await _db.Project.Where(d => d.ProjectNo.ToUpper() == projectno.ToUpper() && d.EntCode == entcode).CountAsync();
                if (dup > 0)
                    return true;
                else
                    return false;
            }
            catch
            {
                return false;
            }
        }

        [HttpGet]
        [Route("IsProjectTitleDuplicate")]
        public async Task<bool> IsProjectTitleDuplicate(string title, string entcode)
        {
            try
            {
                var dup = await _db.Project.Where(d => d.Title.ToUpper() == title.ToUpper() && d.EntCode == entcode).CountAsync();
                if (dup > 0)
                    return true;
                else
                    return false;
            }
            catch
            {
                return false;
            }
        }



        [HttpPost]
        [Route("DefaultSchedule")]
        public async Task<bool> DefaultSchedule(string type, long projid, DateTime start)
        {
            try
            {
                if (type == string.Empty)
                    type = "Security";
                int s = 1;
                DateTime current = start;
                var proj = await _db.Project.Where(i => i.ProjectId == projid).FirstOrDefaultAsync();
                List<Link> links = new List<Link>();

                var milestones = await _db.ProjectMilestones.Where(d => d.ProjectID == projid).OrderBy(d => d.Order).ToListAsync();

                if (milestones.Count == 0)
                {
                    milestones = await GetMilstoneDefaults(type, projid);
                }

                int weeks = (from x in milestones select x.DurationWKs).Sum();

                var closeout = (from x in milestones select x).Where(d => d.Milestone == "Close-Out").FirstOrDefault();
                weeks = weeks - closeout.DurationWKs;

                Schedule newschedule = new Schedule()
                {
                    ProjectID = proj.ProjectId,
                    CreatedBy = proj.CreatedBy,
                    SalesPerson = proj.Requestor,
                    SalesforceID = "TBD",
                    EntCode = proj.EntCode,
                    EstimatedStart = start,
                    InstallDate = start.AddDays(weeks * 7),
                    Status = "Assign PM",
                    RequestedStart = start
                };
                _db.Schedules.Add(newschedule);

                bool result = await UpdatePM(newschedule);

                foreach (ProjectMilestone M in milestones)
                {
                    Data.Models.Task ms = new Data.Models.Task()
                    {
                        Text = M.Milestone,
                        StartDate = M.StartDate,
                        Duration = (M.DurationWKs * 7),
                        Progress = 0m,
                        ProjectID = projid,
                        ParentId = null,
                        Editable = true,
                        Readonly = false,
                        Type = "project",
                        SortOrder = s,
                        WT = M.WT,
                    };
                    s++;
                    _db.Tasks.Add(ms);
                    await _db.SaveChangesAsync();

                    var milestonetask = await _db.MilestoneTasks.Where(d => d.MilestoneID == M.MilestoneID).OrderBy(d => d.Order).ToListAsync();
                    long prevtaskid = 0;
                    int dur = 0;
                    if (milestonetask.Count > 0)
                        dur = (ms.Duration / milestonetask.Count);
                    foreach (MilestoneTask T in milestonetask)
                    {
                        Data.Models.Task mt = new Data.Models.Task()
                        {
                            Text = T.Task,
                            StartDate = current,
                            Duration = dur,
                            Progress = 0m,
                            ProjectID = projid,
                            ParentId = ms.Id,
                            Editable = true,
                            Readonly = false,
                            Type = "task",
                            SortOrder = s,
                            WT = M.WT,
                        };
                        s++;
                        _db.Tasks.Add(mt);
                        await _db.SaveChangesAsync();
                        current = current.AddDays(dur);
                        if (prevtaskid > 0)
                        {
                            Link teamlink = new Link() { SourceTaskId = prevtaskid, TargetTaskId = mt.Id, Type = "0", ProjectID = projid };
                            links.Add(teamlink);
                        }
                        prevtaskid = mt.Id;
                    }

                }
                links.ForEach(p => _db.Links.Add(p));
                await _db.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.Write("Default Schedule Error: " + ex.Message);
                return false;
            }
        }


        public async Task<bool> UpdatePM(Schedule s)
        {
            try
            {
                var pmid = await _db.Project.Where(i => i.ProjectId == s.ProjectID).Select(i => i.PMId).FirstOrDefaultAsync();
                var pm = await _db.ProjectMgrs.Where(i => i.PMId == pmid).Select(i => i.UserId).FirstOrDefaultAsync();
                s.CreatedBy = pm;
                _db.Schedules.Update(s);
                await _db.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        [HttpPost]
        [Route("AssignPM")]
        public async Task<bool> AssignPM(long projId, long PMId)
        {
            try
            {
                var project = await _db.Project.FirstOrDefaultAsync(x => x.ProjectId == projId);
                project.PMId = PMId;
                _db.Project.Update(project);
                var result = await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }

        [HttpPost]
        [Route("UnAssignPm")]
        public async Task<bool> UnAssignPm(long projId, long PMId = 0)
        {
            try
            {
                var project = await _db.Project.FirstOrDefaultAsync(x => x.ProjectId == projId);
                project.PMId = 0;
                _db.Project.Update(project);
                var result = await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }


        [HttpGet]
        [Route("GetPMName")]
        public async Task<string> GetPMName(long pmid, string type)
        {
            try
            {
                var pm = await _db.ProjectMgrs.Where(d => d.PMId == pmid).FirstOrDefaultAsync();

                if (type.ToUpper() == "FULL")
                    return pm.Name;
                else
                    return pm.UserId;
            }
            catch
            {
                return "None";
            }
        }

        [HttpGet]
        [Route("GetHolderName")]
        public async Task<string> GetHolderName(long contactid, string type)
        {
            try
            {
                var pm = await _db.Contacts.Where(d => d.ContactID == contactid).FirstOrDefaultAsync();

                if (type.ToUpper() == "FULL")
                    return pm.PreferredName;
                else
                    return pm.Username;
            }
            catch
            {
                return "None";
            }
        }


        [HttpGet("incomplete-projects")]
        public async Task<List<ProjectVM>> GetIncompleteProjects()
        {
            try
            {
                var inCompleteProjects = await _db.Project.Where(i => i.Status != "Complete").ToListAsync();
                var incompleteProjectLists = new List<ProjectVM>();
                foreach (var incompleteProject in inCompleteProjects)
                {
                    var incompleteProj = new ProjectVM();
                    incompleteProj.ProjectId = incompleteProject.ProjectId;
                    incompleteProj.Title = incompleteProject.Title;
                    incompleteProj.PMId = incompleteProject.PMId;
                    incompleteProj.Type = incompleteProject.TypeConstruction;
                    var budget = _db.Budgets.FirstOrDefault(x => x.ProjectID == incompleteProject.ProjectId);
                    if (budget != null)
                        incompleteProj.TotalExtValue = budget.Total.ToString("C");

                    var pm = await _db.ProjectMgrs.FirstOrDefaultAsync(x => x.PMId == incompleteProject.PMId);
                    if (pm != null)
                        incompleteProj.PMName = pm.Name;

                    var startDate = await _db.Tasks.Where(x => x.ProjectID == incompleteProject.ProjectId && x.Type == "task").OrderBy(x => x.StartDate).Select(x => x.StartDate).FirstOrDefaultAsync();
                    var endTask = await _db.Tasks.Where(x => x.ProjectID == incompleteProject.ProjectId && x.Type == "task").OrderByDescending(x => x.StartDate).FirstOrDefaultAsync();
                    if (startDate != DateTime.MinValue)
                    {
                        incompleteProj.StartDate = startDate.ToString("MM-dd-yyyy");
                        if (endTask != null)
                        {
                            incompleteProj.EndDate = endTask.StartDate.AddDays(endTask.Duration - 1).ToString("MM-dd-yyyy");
                        }
                    }


                    incompleteProj.Tasks = GetProjectTasks((int)incompleteProject.ProjectId);

                    incompleteProjectLists.Add(incompleteProj);
                }

                return incompleteProjectLists;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        private List<ProjectTask> GetProjectTasks(int projectId)
        {
            var tasks = (from x in _db.Tasks
                         join y in _db.Project on x.ProjectID equals y.ProjectId
                         where x.ProjectID == projectId && x.Type == "task"
                         orderby x.StartDate
                         select new ProjectTask { Id = x.Id, ProjectId = x.ProjectID, Title=x.Text, ProjectTitle = y.Title, StartDate = x.StartDate, Duration = x.Duration, WT = x.WT }).ToList();

            return GetProjectTasksForCharts(tasks);
        }

        private List<ProjectTask> GetProjectTasksForCharts(List<ProjectTask> tasks,DateTime? endDate=null)
        {
            var finalTasks = new List<ProjectTask>();
            foreach (var t in tasks.OrderBy(x => x.StartDate))
            {
                var startTask = new ProjectTask() { Id = t.Id, ProjectId = t.ProjectId, Title=t.Title, ProjectTitle = t.ProjectTitle, Date = t.StartDate, StartDate = t.StartDate, Duration = t.Duration, WT = t.WT };

                // Get the task which exactly overlap this task
                var exactlyOverlappinpTasks = tasks.Where(x => x.Id != t.Id &&
                                                                   (x.StartDate == startTask.Date || x.EndDate == startTask.Date)).ToList();

                foreach (var tsk in exactlyOverlappinpTasks)
                {
                    startTask.WT += tsk.WT;
                }

                var enclosingTasks = tasks.Where(x => x.Id != t.Id &&
                                                          startTask.Date > x.StartDate && startTask.Date < x.EndDate).ToList();

                foreach (var tsk in enclosingTasks)
                {
                    startTask.WT += tsk.WT;
                }

                finalTasks.Add(startTask);

                // We dont add final task if the start and end date is the same
                if (startTask.StartDate != startTask.EndDate)
                {
                    ProjectTask endTask = null;
                    if (endDate!=null && t.EndDate > endDate) // if this end task goes out of the given end date, then set the end date to the given end date
                        endTask = new ProjectTask() { Id = t.Id, ProjectId = t.ProjectId, Title = t.Title, ProjectTitle = t.ProjectTitle, Date = endDate.Value, StartDate = t.StartDate, Duration = t.Duration, WT = t.WT };
                    else
                        endTask = new ProjectTask() { Id = t.Id, ProjectId = t.ProjectId, Title = t.Title, ProjectTitle = t.ProjectTitle, Date = t.EndDate, StartDate = t.StartDate, Duration = t.Duration, WT = t.WT };

                    // Get the task which exactly overlap this task
                    exactlyOverlappinpTasks = tasks.Where(x => x.Id != t.Id &&
                                                                (x.StartDate == endTask.Date || x.EndDate == endTask.Date)).ToList();

                    foreach (var tsk in exactlyOverlappinpTasks)
                    {
                        endTask.WT += tsk.WT;
                    }

                    enclosingTasks = tasks.Where(x => x.Id != t.Id &&
                                                              endTask.Date > x.StartDate && endTask.Date < x.EndDate).ToList();

                    foreach (var tsk in enclosingTasks)
                    {
                        endTask.WT += tsk.WT;
                    }

                    finalTasks.Add(endTask);
                }
            }
            //
            return finalTasks.Distinct(new ProjectTaskEqualityComparer()).OrderBy(x=>x.Date).ToList();
        }

        [HttpGet]
        [Route("skills")]
        public List<SkillsetVM> GetSkillSets()
        {
            try
            {

                var skills = (from x in _db.Skillsets
                              select new SkillsetVM { Name = x.Skill, Id = x.SkillsetId }).ToList();

                return skills;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return new List<SkillsetVM>();
            }
        }

        [HttpGet]
        [Route("locations")]
        public List<object> GetLocations()
        {
            try
            {
                var locations = new List<object>
                {
                    new { name = "Texas" , id= 1 },
                    new { name = "New York" , id= 2 },
                    new { name = "Los Angeles" , id= 3 },
                    new { name = "Chicago" , id= 4 }
                };

                return locations;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return new List<object>();
            }
        }

        [HttpGet("pm-suggestions")]
        public async Task<List<ProjectManagerVM>> GetPMSuggestions(int projectId, string skillFilters = null, string locationFilter = null)
        {
            try
            {
                var locationFilters = (locationFilter ?? "").Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => long.Parse(x)).ToList();
                var skillSetFilters = (skillFilters?? "").Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => int.Parse(x)).ToList();

                var prject = await _db.Project.FirstOrDefaultAsync(x => x.ProjectId == projectId);

                if (skillSetFilters == null || skillSetFilters.Count == 0)
                {
                    //skillSetFilters = await _db.ProjectSkillsets.Where(x => x.ProjectID == projectId).Select(x => x.SkillsetId).ToListAsync();
                }

                if (locationFilters == null || locationFilters.Count == 0)
                {
                    locationFilters = await _db.LocationLinks.Where(x => x.ItemID == projectId && x.ItemType == "Project").Select(x => x.LocationID).ToListAsync();
                }

                var pms = from x in _db.ProjectMgrs
                          join y in _db.PMSkillSets
                          on x.PMId equals y.PMId
                          where x.Status == "Active"
                          group y by x.PMId into z
                          select z;
                var selectedPms = new List<long>();
                foreach (var pm in pms)
                {
                    if (skillSetFilters.Count > 0)
                    {
                        if (skillSetFilters.All(x => pm.Any(z => z.SkillsetId == x)))
                        {
                            selectedPms.Add(pm.Key);
                        }
                    }
                    else // If no filters specified, then we need to add all the PMs
                    {
                        selectedPms.Add(pm.Key);
                    }
                }

                if(prject.PMId<1)  // Current project's PM will always be returned
                {
                    selectedPms.Insert(0,prject.PMId);
                }
                else // If he is already there, move it to first position
                {
                    selectedPms.Remove(prject.PMId);
                    selectedPms.Insert(0, prject.PMId);
                }

                var pmList = await (from x in _db.ProjectMgrs
                                    where selectedPms.Contains(x.PMId)
                                    select new ProjectManagerVM()
                                    {
                                        PMId = x.PMId,
                                        Name = x.Name
                                    }).ToListAsync();

                var firstTask = _db.Tasks.Where(x => x.ProjectID == projectId && x.Type == "task").OrderBy(x => x.StartDate).FirstOrDefault();
                if (firstTask == null) // No tasks defined, just return the list of pms without any work load data
                    return pmList;

                var lastTask = _db.Tasks.Where(x => x.ProjectID == projectId && x.Type == "task").ToList().OrderByDescending(x => x.StartDate.AddDays(x.Duration-1)).FirstOrDefault();

                foreach (var pm in pmList)
                {
                    pm.AssignedProjectTasks = GetPMProjectTasksInTimeRange(pm.PMId, firstTask.StartDate, lastTask.StartDate.AddDays(lastTask.Duration-1));                   
                    pm.MergedProjectTasks = MergeTasksWithProjectTasks(projectId, pm.AssignedProjectTasks, pm.PMId, firstTask.StartDate, lastTask.StartDate.AddDays(lastTask.Duration-1));                                   
                }

                return pmList;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        private List<ProjectTask> MergeTasksWithProjectTasks(int projectId, List<ProjectTask> tasksToMerge,long pmId,DateTime startDate,DateTime endDate)
        {
            var pmTasks = (from p in _db.Project
                                  join gt in _db.Tasks on p.ProjectId equals gt.ProjectID
                                  where p.PMId == pmId && p.Status != "Complete"
                                  && gt.Type == "task" && gt.StartDate >= startDate && gt.StartDate <= endDate
                                  orderby gt.StartDate
                                  select new ProjectTask { Id = gt.Id, ProjectId = p.ProjectId, Title = gt.Text, ProjectTitle = p.Title, StartDate = gt.StartDate, Duration = gt.Duration, WT = gt.WT }).ToList();

            var projectTasks = (from p in _db.Project
                                join gt in _db.Tasks on p.ProjectId equals gt.ProjectID
                                where p.ProjectId == projectId
                                && gt.Type == "task"
                                orderby gt.StartDate
                                select new ProjectTask { Id = gt.Id, ProjectId = p.ProjectId, Title=gt.Text, ProjectTitle = p.Title, StartDate = gt.StartDate, Duration = gt.Duration, WT = gt.WT }).ToList();

            projectTasks.AddRange(pmTasks);

            return GetProjectTasksForCharts(projectTasks,endDate);
        }

        private List<ProjectTask> GetPMProjectTasksInTimeRange(long pmId, DateTime startDate, DateTime endDate)
        {
            var pmProjectTasks = (from p in _db.Project
                                  join gt in _db.Tasks on p.ProjectId equals gt.ProjectID
                                  where p.PMId == pmId && p.Status != "Complete"
                                  && gt.Type == "task" && gt.StartDate >= startDate && gt.StartDate <= endDate
                                  orderby gt.StartDate
                                  select new ProjectTask { Id = gt.Id, ProjectId = p.ProjectId, Title=gt.Text, ProjectTitle = p.Title, StartDate = gt.StartDate, Duration = gt.Duration, WT = gt.WT }).ToList();
            return GetProjectTasksForCharts(pmProjectTasks, endDate);            
        }

        [HttpGet]
        [Route("GetDocumentSummary")]
        public async Task<List<DocumentSummary>> GetDocumentSummaries(long projid, string entcode)
        {
            try
            {
                List<DocumentSummary> result = new List<DocumentSummary>();
                
                result =await  GetDocSumDummyData(projid);
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetFinancialSummary")]
        public List<FinancialSummary> GetFinancialSummaries(long projid, string entcode)
        {
            try
            {
                List<FinancialSummary> result = new List<FinancialSummary>();

                result = GetFinSumDummyData();

                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetScheduleSummary")]
        public async Task<List<MilestoneSummary>> GetMilestoneSummaries(long projid, string entcode)
        {
            try
            {
                List<MilestoneSummary> result = new List<MilestoneSummary>();

                result = await GetMilestoneData(projid);
                if (result.Count == 0)
                    result = GetMilSumDummyData();

                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetSummaryDetail")]
        public List<SummaryDetail> GetSummaryDetails(string itemtype, string status = null, string search = null)
        {
            try
            {
                List<SummaryDetail> result = this.GetSumDetDummyData();
                if (!string.IsNullOrEmpty(itemtype))
                {
                    result = result.Where(x => x.ItemType == itemtype).ToList();
                }

                if (!string.IsNullOrEmpty(status))
                {
                    status = status.ToLower();
                    result = result.Where(x => x.Status == status).ToList();
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    result = result.Where(x => x.ItemNo.ToString().Contains(search) || x.ItemType.ToLower().Contains(search)
                                || x.Summary.ToLower().Contains(search) || x.Status.ToLower().Contains(search) || x.AlertType.ToLower().Contains(search)).ToList();
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        public async Task<List<DocumentSummary>> GetDocSumDummyData(long projid)
        {
            List<DocumentSummary> result = new List<DocumentSummary>();
            List<Message> actions = new List<Message>();
            List<PO> pos = new List<PO>();
            List<FieldReport> frs = new List<FieldReport>();

            try
            {
                actions = await _db.Messages.Where(d => d.Type == "Action" && d.ProjectID == projid).ToListAsync();
                if (actions.Count > 0)
                {
                    var pendlist = (from p in actions where p.Status.ToLower() == "pending" select p);
                    int pend = pendlist.Count();
                    int critical = actions.Count(d => d.Status.ToLower() == "pending" && DateTime.Now > d.DueDate);
                    int complete = actions.Count() - pend;
                    string status = "green";
                    if (critical > 0)
                    {
                        var alerts = actions.Where(d => d.Status.ToLower() == "pending" && DateTime.Now > d.DueDate).ToList();
                        foreach (Message m in alerts)
                        {
                            double diff = ( DateTime.Now - m.DueDate).TotalDays;
                            if (diff > 7)
                            {
                                status = "red";
                                break;
                            }
                            else
                                status = "yellow";
                        }
                    }
                    DocumentSummary ds1 = new DocumentSummary()
                    {
                        Item = "Actions",
                        Pending = pend,
                        Critical = critical,
                        Status = status,
                        Complete = complete
                    };
                    result.Add(ds1);
                }
                else
                {
                    DocumentSummary ds1 = new DocumentSummary()
                    {
                        Item = "Actions",
                        Pending = 5,
                        Critical = 4,
                        Status = "green",
                        Complete = 4
                    };
                    result.Add(ds1);
                }

                DocumentSummary ds2 = new DocumentSummary()
                {
                    Item = "Change Orders",
                    Pending = 12,
                    Critical = 0,
                    Status = "green",
                    Complete = 4
                };
                result.Add(ds2);

                DocumentSummary ds3 = new DocumentSummary()
                {
                    Item = "Contracts",
                    Pending = 5,
                    Critical = 4,
                    Status = "green",
                    Complete = 4
                };
                result.Add(ds3);

                DocumentSummary ds4 = new DocumentSummary()
                {
                    Item = "Deposits",
                    Pending = 12,
                    Critical = 1,
                    Status = "green",
                    Complete = 4
                };
                result.Add(ds4);

                DocumentSummary ds5 = new DocumentSummary()
                {
                    Item = "Invoices",
                    Pending = 5,
                    Critical = 2,
                    Status = "green",
                    Complete = 4
                };
                result.Add(ds5);

                pos = await _db.POs.Where(d =>  d.ProjectID == projid).ToListAsync();
                if (pos.Count > 0)
                {
                    var pendlist = (from p in pos where p.Status.ToLower() == "pending" select p);
                    int pend = pendlist.Count();
                    int critical = 0;
                    int complete = 0;
                   // int critical = pos.Count(d => d.Status.ToLower() == "pending" && DateTime.Now > d.WorkStartDate);
                    //int complete = pos.Count() - pend;
                    string status = "green";
                    if (critical > 0)
                    {
                        var alerts = pos.Where(d => d.Status.ToLower() == "pending" && DateTime.Now > d.WorkStartDate).ToList();
                        foreach (PO m in pos)
                        {
                           // double diff = (DateTime.Now - m.WorkStartDate).TotalDays;
                            if (m.ShippingAmount >= 2)
                            {
                                status = "red";
                                critical++;
                            }
                            else if (m.ShippingAmount >= 1)
                                status = "yellow";
                        }
                        complete = pend - critical;
                    }
                    DocumentSummary ds6 = new DocumentSummary()
                    {
                        Item = "Purchase Orders",
                        Pending = pend,
                        Critical = critical,
                        Status = status,
                        Complete = complete
                    };
                    result.Add(ds6);
                }
                else
                {
                    DocumentSummary ds6 = new DocumentSummary()
                    {
                        Item = "Purchase Orders",
                        Pending = 12,
                        Critical = 1,
                        Status = "green",
                        Complete = 4
                    };
                    result.Add(ds6);
                }

                DocumentSummary ds7 = new DocumentSummary()
                {
                    Item = "Quotes",
                    Pending = 8,
                    Critical = 3,
                    Status = "green",
                    Complete = 4
                };
                result.Add(ds7);

                DocumentSummary ds8 = new DocumentSummary()
                {
                    Item = "RFIs",
                    Pending = 3,
                    Critical = 0,
                    Status = "green",
                    Complete = 2
                };
                result.Add(ds8);

                DocumentSummary ds9 = new DocumentSummary()
                {
                    Item = "Submittals",
                    Pending = 3,
                    Critical = 0,
                    Status = "green",
                    Complete = 4
                };
                result.Add(ds9);

                frs = await _db.FieldReports.Where(d => d.ProjectID == projid).ToListAsync();
                if (frs.Count > 0)
                {
                    DocumentSummary ds10 = new DocumentSummary()
                    {
                        Item = "Field Reports",
                        Pending = 0,
                        Critical = 0,
                        Status = "green",
                        Complete = frs.Count()
                    };
                    result.Add(ds10);
                }
                else
                { 
                    DocumentSummary ds10 = new DocumentSummary()
                    {
                        Item = "Field Reports",
                        Pending = 0,
                        Critical = 0,
                        Status = "green",
                        Complete = 4
                    };
                    result.Add(ds10);
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        public List<FinancialSummary> GetFinSumDummyData()
        {
            List<FinancialSummary> result = new List<FinancialSummary>();

            FinancialSummary fs1 = new FinancialSummary()
            {
                Item = "Budget",
                Amount = 1000000.00M,
                Usage = 100,
                Status = "green"
            };
            result.Add(fs1);

            FinancialSummary fs2 = new FinancialSummary()
            {
                Item = "Committed",
                Amount = 1000000.00M,
                Usage = 25,
                Status = "green"
            };
            result.Add(fs2);

            FinancialSummary fs3 = new FinancialSummary()
            {
                Item = "Pending CO",
                Amount = 1000000.00M,
                Usage = 17,
                Status = "red"
            };
            result.Add(fs3);

            FinancialSummary fs4 = new FinancialSummary()
            {
                Item = "Bal to Commit",
                Amount = 1000000.00M,
                Usage = 15,
                Status = "green"
            };
            result.Add(fs4);

            FinancialSummary fs5 = new FinancialSummary()
            {
                Item = "Paid",
                Amount = 1000000.00M,
                Usage = 10,
                Status = "green"
            };
            result.Add(fs5);


            FinancialSummary fs6 = new FinancialSummary()
            {
                Item = "Bal to Pay",
                Amount = 1000000000.00M,
                Usage = 15,
                Status = "green"
            };
            result.Add(fs6);

            return result;
        }

        public List<MilestoneSummary> GetMilSumDummyData()
        {
            List<MilestoneSummary> result = new List<MilestoneSummary>();

            MilestoneSummary ms1 = new MilestoneSummary()
            {
                Milestone = "Assign",
                Start = new DateTime(2020, 02, 24),
                End = new DateTime(2020, 02, 24),
                Target = 100,
                Actual = 100,
                Status = "green"
            };
            result.Add(ms1);

            MilestoneSummary ms2 = new MilestoneSummary()
            {
                Milestone = "Design",
                Start = new DateTime(2020, 02, 24),
                End = new DateTime(2020, 02, 24),
                Target = 100,
                Actual = 100,
                Status = "green"
            };
            result.Add(ms2);

            MilestoneSummary ms3 = new MilestoneSummary()
            {
                Milestone = "Pre-Installation",
                Start = new DateTime(2020, 02, 24),
                End = new DateTime(2020, 02, 24),
                Target = 100,
                Actual = 100,
                Status = "green"
            };
            result.Add(ms3);

            MilestoneSummary ms4 = new MilestoneSummary()
            {
                Milestone = "Installation",
                Start = new DateTime(2020, 02, 24),
                End = new DateTime(2020, 02, 24),
                Target = 25,
                Actual = 10,
                Status = "green"
            };
            result.Add(ms4);

            MilestoneSummary ms5 = new MilestoneSummary()
            {
                Milestone = "Close-Out",
                Start = new DateTime(2020, 02, 24),
                End = new DateTime(2020, 02, 24),
                Target = 0,
                Actual = 0,
                Status = "green"
            };
            result.Add(ms5);

            return result;
        }

        public List<SummaryDetail> GetSumDetDummyData()
        {
            List<SummaryDetail> result = new List<SummaryDetail>();

            SummaryDetail sd1 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Actions",
                ItemNo = 1000,
                Summary = "Action 1 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Status = "red"
            };
            result.Add(sd1);

            SummaryDetail sd2 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Actions",
                ItemNo = 1001,
                Summary = "Action 2 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Status = "red"
            };
            result.Add(sd2);

            SummaryDetail sd3 = new SummaryDetail()
            {
                Order = 3,
                ItemType = "Actions",
                ItemNo = 1002,
                Summary = "Action 3 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Status = "red"
            };
            result.Add(sd3);

            SummaryDetail sd4 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Change Orders",
                ItemNo = 1001,
                Summary = "Change Order 1 Summary",
                DueDate = new DateTime(2020, 2, 14),
                RecievedDate = new DateTime(2020,1,15),
                AlertType = "Over Due",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd4);

            SummaryDetail sd5 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Change Orders",
                ItemNo = 1001,
                Summary = "Change Order 10 Summary",
                DueDate = new DateTime(2020, 2, 14),
                RecievedDate = new DateTime(2020, 1, 15),
                AlertType = "Over Due",
                Vendor = "Syvenn",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd5);

            SummaryDetail sd6 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Change Orders",
                ItemNo = 1002,
                Summary = "Change Order 2 Summary",
                DueDate = new DateTime(2020, 2, 14),
                RecievedDate = new DateTime(2020, 2, 1),
                AlertType = "Over Due",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd6);

            SummaryDetail sd7 = new SummaryDetail()
            {
                Order = 3,
                ItemType = "Change Orders",
                ItemNo = 1003,
                Summary = "Change Order 3 Summary",
                DueDate = new DateTime(2020, 2, 14),
                RecievedDate = new DateTime(2020, 1, 24),
                AlertType = "Over Due",
                Vendor = "JCI",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd7);

            SummaryDetail sd8 = new SummaryDetail()
            {
                Order = 4,
                ItemType = "Change Orders",
                ItemNo = 1004,
                Summary = "Change Order 4 Summary",
                DueDate = new DateTime(2020, 2, 14),
                RecievedDate = new DateTime(2020, 1, 28),
                AlertType = "Over Due",
                Vendor = "FEMA",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd8);

            SummaryDetail sd9 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Contracts",
                ItemNo = 1001,
                Summary = "Contracts 4 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd9);

            SummaryDetail sd10 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Contracts",
                ItemNo = 1002,
                Summary = "Contracts 2 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "Syvenn",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd10);

            SummaryDetail sd11 = new SummaryDetail()
            {
                Order = 3,
                ItemType = "Contracts",
                ItemNo = 1003,
                Summary = "Contracts 3 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "JCI",
                Amount = 10000.00M,
                Status = "red"
            };
            result.Add(sd11);

            SummaryDetail sd12 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Deposits",
                ItemNo = 1001,
                Summary = "Deposits 1 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd12);

            SummaryDetail sd13 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Deposits",
                ItemNo = 1002,
                Summary = "Deposits 2 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "Syvenn",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd13);

            SummaryDetail sd14 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Deposits",
                ItemNo = 1002,
                Summary = "Deposits 2 Summary",
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "JCI",
                Amount = 1000.00M,
                Status = "red"
            };
            result.Add(sd14);

            SummaryDetail sd15 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Invoices",
                ItemNo = 1001,
                Summary = "Invoices 1 Summary",
                RecievedDate = new DateTime(2020, 1, 15),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd15);

            SummaryDetail sd16 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Invoices",
                ItemNo = 1002,
                Summary = "Invoices 2 Summary",
                RecievedDate = new DateTime(2020, 2, 10),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "Over Due",
                Vendor = "Syvenn",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd16);

            SummaryDetail sd17 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Purchase Order",
                ItemNo = 1001,
                Summary = "Purchase Order 1 Summary",
                RecievedDate = new DateTime(2020, 1, 15),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "JCI",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd17);

            SummaryDetail sd18 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Purchase Order",
                ItemNo = 1002,
                Summary = "Purchase Order 2 Summary",
                RecievedDate = new DateTime(2020, 1, 20),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "FEMA",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd18);

            SummaryDetail sd19 = new SummaryDetail()
            {
                Order = 3,
                ItemType = "Purchase Order",
                ItemNo = 1003,
                Summary = "Purchase Order 3 Summary",
                RecievedDate = new DateTime(2020, 1, 21),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd19);

            SummaryDetail sd20 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Quotes",
                ItemNo = 1001,
                Summary = "Quote 1 Summary",
                RecievedDate = new DateTime(2020, 1, 15),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd19);

            SummaryDetail sd21 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "RFI",
                ItemNo = 1001,
                Summary = "RFI 1 Summary",
                RecievedDate = new DateTime(2020, 1, 30),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "JCI",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd21);

            SummaryDetail sd22 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "RFI",
                ItemNo = 1002,
                Summary = "RFI 2 Summary",
                RecievedDate = new DateTime(2020, 1, 10),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd22);

            SummaryDetail sd23 = new SummaryDetail()
            {
                Order = 1,
                ItemType = "Submittal",
                ItemNo = 1001,
                Summary = "Submittal 1 Summary",
                RecievedDate = new DateTime(2020, 1, 15),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "ProSys",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd23);

            SummaryDetail sd24 = new SummaryDetail()
            {
                Order = 2,
                ItemType = "Submittal",
                ItemNo = 1003,
                Summary = "Submittal 1 Summary",
                RecievedDate = new DateTime(2020, 1, 20),
                DueDate = new DateTime(2020, 2, 14),
                AlertType = "NA",
                Vendor = "Syvenn",
                Amount = 1000.00M,
                Status = "green"
            };
            result.Add(sd24);

            return result;
        }

        [HttpGet]
        [Route("GetNameFromEmail")]
        public async Task<string> GetNameFromEmail(string email)
        {
            try
            {
                var result = await _db.EmailLookups.Where(d => d.EmailAddress.ToLower() == email.ToLower()).Select(d => d.ShowAsName).FirstOrDefaultAsync();
                return result;
            }
            catch
            {
                return email;
            }
        }

        [HttpGet]
        [Route("GetActionDetailData")]
        public async Task<List<ActionSumDetails>> GetActionDetailData(long projid)
        {
            List<ActionSumDetails> result = new List<ActionSumDetails>();
            try
            {
                var actions = await _db.Messages.Where(d => d.Type == "Action" && d.ProjectID == projid).ToListAsync();
                int order = 1;

                foreach (Message a in actions)
                {
                    string status = "green";
                    string alerttype = "NA";

                    double diff = (DateTime.Now - a.DueDate).TotalDays;
                    if (diff > 7 && a.Status == "Pending")
                    {
                        status = "red";
                        alerttype = "Not Ordered";
                    }
                    else if (diff > 0 && a.Status == "Pending")
                    {
                        status = "yellow";
                        alerttype = "Not Ordered";
                    }


                    ActionSumDetails temp = new ActionSumDetails()
                    {
                        Order = order,
                        ItemID = a.ItemNo,
                        ItemType = a.ItemType,
                        Action = a.ActionType,
                        From = await GetNameFromEmail(a.EmailFrom),
                        TO = await GetNameFromEmail(a.EmailTo),
                        Instructions = a.EmailBody,
                        DateSent = a.DateRec,
                        DueDate = a.DueDate,
                        AlertType = alerttype,
                        Status = status,
                        MessageID = a.MessageID
                    };
                    order++;
                    result.Add(temp);
                    
                    if (actions.Count < 1)
                    {
                        ActionSumDetails A1 = new ActionSumDetails()
                        {
                            ItemID = 10331,
                            ItemType = "PO",
                            Action = "AWT Order",
                            From = "Vince Jordon",
                            TO = "Lester Edwards",
                            Instructions = "TBD",
                            DateSent = new DateTime(2020, 2, 22),
                            DueDate = new DateTime(2020, 5, 2),
                            AlertType = "Not Ordered",
                            Status = "green",
                            MessageID = 1000
                        };

                        result.Add(A1);

                        ActionSumDetails A2 = new ActionSumDetails()
                        {
                            ItemID = 10333,
                            ItemType = "PO",
                            Action = "AWT Response",
                            From = "Vince Jordon",
                            TO = "Lester Edwards",
                            Instructions = "TBD",
                            DateSent = new DateTime(2020, 2, 22),
                            DueDate = new DateTime(2020, 5, 2),
                            AlertType = "Not Ordered",
                            Status = "green",
                            MessageID = 1001
                        };
                        result.Add(A2);
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

        public async Task<string> GetVendorName(long venid)
        {
            try
            {
                string result = await _db.Vendors.Where(d => d.VendorID == venid).Select(s => s.VendorName).FirstOrDefaultAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }


        [HttpGet]
        [Route("GetFieldReportsDetails")]
        public async Task<List<FieldReportViewModel>> GetFieldReportsDetails(long projid)
        {
            try
            {
                FieldReportController frcontroller = new FieldReportController(_db);

                var fr = await frcontroller.getFieldReportsbyProj(projid);
                return fr;
            }
            catch
            {
                return null;
            }
        }


        [HttpGet]
        [Route("GetPOSumDetails")]
        public async Task<List<POSumDetails>> GetPOSumDetails(long projid)
        {
            try
            {
                List<POSumDetails> result = new List<POSumDetails>();
                List<long> POIds = new List<long>();
                var POs = await _db.POs.Where(d => d.ProjectID == projid).ToListAsync();
                POIds = await _db.POs.Where(d => d.ProjectID == projid).Select(p => p.PoID).ToListAsync();
                var POLines = await _db.POLines.Where(d => POIds.Contains(d.PoID)).ToListAsync();
                int order = 1;
                foreach (POLine p in POLines)
                {
                    PO PO1 = new PO();
                    PO1 = POs.Where(d => d.PoID == p.PoID).FirstOrDefault();
                    string status = "green";
                    double diff = 0;
                    string vendorpo = "NA";
                    string alerttype = "Not Ordered";
                    if (p.OrderDate == null)
                    {
                        diff = (DateTime.Now - p.RequiredByDate).TotalDays;
                        if (diff < 14)
                        {
                            status = "red";
                        }
                        else if (diff < 30)
                        {
                            status = "yellow";
                        }
                    }
                    else
                    {
                        diff = (p.RequiredByDate - (DateTime)p.OrderDate).TotalDays;
                        vendorpo = PO1.VendorPO;
                        alerttype = "NA";
                    }

            

                    POSumDetails temp = new POSumDetails()
                    {
                        Order = order,
                        ItemID = p.PoID,
                        PoID = p.PoID,
                        POLineItemID = p.PoLineID,
                        ItemType = "POLineItem",
                        ItemPartNo = p.VendorPartNo,
                        Qty = p.Quantity,
                        Description = p.Description,
                        Vendor = await GetVendorName(PO1.VendorID),
                        PONo = vendorpo,
                        Amount = p.Cost,
                        PODate = PO1.PODate,
                        OrderDate = p.OrderDate,
                        OrderBy = p.RequiredByDate.AddDays(-14),
                        DueDate = p.RequiredByDate,
                        AlertType = alerttype,
                        Status = status,

                    };
                    result.Add(temp);
                    order++;
                }

                if (POs.Count < 1)
                {
                    POSumDetails A1 = new POSumDetails()
                    {
                        ItemID = 10331,
                        PoID = 1001,
                        POLineItemID = 1003,
                        ItemType = "PO",
                        ItemPartNo = "124-PA-20",
                        Qty = 3,
                        Description = "Mag Locks",
                        Vendor = "ProSys Inc",
                        PONo = "TBD",
                        Amount = 50000000.00M,
                        OrderBy = new DateTime(2020, 2, 20),
                        OrderDate = new DateTime(2020, 2, 22),
                        DueDate = new DateTime(2020, 5, 2),
                        AlertType = "Not Ordered",
                        Status = "red"
                    };
                    result.Add(A1);

                    POSumDetails A2 = new POSumDetails()
                    {
                        ItemID = 10333,
                        PoID = 1001,
                        POLineItemID = 1004,
                        ItemType = "PO",
                        ItemPartNo = "124-PA-40",
                        Qty = 6,
                        Description = "Cameras",
                        Vendor = "ProSys Inc",
                        PONo = "TBD",
                        Amount = 20000000.00M,
                        OrderBy = new DateTime(2020, 2, 20),
                        OrderDate = new DateTime(2020, 2, 22),
                        DueDate = new DateTime(2020, 5, 2),
                        AlertType = "Not Ordered",
                        Status = "green"
                    };
                    result.Add(A2);
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetTrackingData")]
        public async Task<List<ShipTracking>> GetTrackingData(long POLineID)
        {
            List<ShipTracking> result = new List<ShipTracking>();
            try
            {
                var POLine = await _db.POLines.Where(d => d.PoLineID == POLineID).FirstOrDefaultAsync();
                if (POLine.OrderDate != null)
                {
                    result = await _db.ShipTrackings.Where(d => d.POLineItemID == POLineID).ToListAsync();

                    if (result.Count <= 0)
                        result = GetTrackingDummy(POLineID);
                }
                return result;
            }
            catch
            {
                return null;
            }
        }

        public List<ShipTracking> GetTrackingDummy(long POLineID)
        {
            List<ShipTracking> result = new List<ShipTracking>();
            if (POLineID == 1154)
            {
                ShipTracking Track = new ShipTracking()
                {
                    ItemID = 10331,
                    ItemType = "PO",
                    POLineItemID = 1003,
                    Qty = 3,
                    ShipVendor = "UPS",
                    TrackingID = 1000,
                    TrackingNo = "1ZW76B3HD4",
                    Status = "On the way"
                };
                result.Add(Track);
            }

            else if (POLineID == 1004)
            {
                ShipTracking Track = new ShipTracking()
                {
                    ItemID = 10331,
                    ItemType = "PO",
                    POLineItemID = 1003,
                    Qty = 3,
                    ShipVendor = "FdEx",
                    TrackingID = 1001,
                    TrackingNo = "1ZW2323I776HD4",
                    Status = "Arriving Tomorrow"
                };
                result.Add(Track);

                ShipTracking Track2 = new ShipTracking()
                {
                    ItemID = 10331,
                    ItemType = "PO",
                    POLineItemID = 1003,
                    Qty = 3,
                    ShipVendor = "UPS",
                    TrackingID = 1002,
                    TrackingNo = "1ZW2326B3HD4",
                    Status = "Arriving Tomorrow"
                };
                result.Add(Track2);
            }
            else
            {
                ShipTracking Track2 = new ShipTracking()
                {
                    ItemID = 10331,
                    ItemType = "PO",
                    POLineItemID = 1003,
                    Qty = 3,
                    ShipVendor = "UPS",
                    TrackingID = 1002,
                    TrackingNo = "1ZW2367823eHD4",
                    Status = "Arriving Friday"
                };
                result.Add(Track2);
            }
            return result;
        }

        public async Task<List<MilestoneSummary>> GetMilestoneData(long projid)
        {
            List<MilestoneSummary> result = new List<MilestoneSummary>();
            var MS = await _db.Tasks.Where(d => d.ProjectID == projid && d.Type == "project").OrderBy(d => d.SortOrder).ToListAsync();

            foreach (Data.Models.Task t in MS)
            {
                DateTime End = t.StartDate.AddDays(t.Duration);
                String Status = "green";
                //  Status = GetScheduleAlert(End, t.Progress);
                MilestoneSummary miles = new MilestoneSummary()
                {
                    Milestone = t.Text,
                    Start = t.StartDate,
                    End = End,
                    TaskID = t.Id,
                    Actual = 100,
                    Target = 100,
                    Status = Status
                };
                result.Add(miles);
            }
            return result;
        }

        [HttpGet]
        [Route("GetFinancialDetails")]
        public async Task<List<FinancialDetail>> GetFinancialDetails(string type, long projid, string status = null, string search = null)
        {
            List<FinancialDetail> result = new List<FinancialDetail>();
            try
            {
                switch (type.ToUpper())
                {
                    case "BUDGET":
                        //long budgetid = await _db.Budgets.Where(d => d.ProjectID == projid).Select(d => d.BudgetID).FirstOrDefaultAsync();
                        //var cats = await _db.BudgetCategories.Where(d => d.BudgetID == budgetid).ToListAsync();
                        //foreach (BudgetCategory c in cats)
                        //{
                        //    FinancialDetail f = new FinancialDetail()
                        //    {
                        //        Item = c.Category,
                        //        ItemType = "BudCategory",
                        //        ItemNo = c.BudCatID,
                        //        Order = c.CatOrder,
                        //        Amount = c.Cost,
                        //        Code = c.BudCatID.ToString(),
                        //        Vendor = "",
                        //        Status = "green"
                        //    };
                        //    result.Add(f);
                        //}
                        var test = await GetBudgetDetailData(projid);
                        if (result.Count == 0)
                        {
                            result = GetDummyBudgetDetails();
                        }
                        break;
                    case "COMMITTED":
                        List<long> pos = await _db.POs.Where(d => d.ProjectID == projid && d.Status == "Complete").Select(d => d.PoID).ToListAsync();
                        var committs = await _db.POLines.Where(item => pos.Contains(item.PoID)).ToListAsync();
                        foreach (POLine p in committs)
                        {
                            long venid = await _db.POs.Where(d => d.PoID == p.PoID).Select(d => d.VendorID).FirstOrDefaultAsync();
                            string vendor = await _db.Vendors.Where(d => d.VendorID == venid).Select(d => d.VendorName).FirstOrDefaultAsync();
                            string Status = "green";
                            if (p.Cost > p.AvailFunds)
                                Status = "red";
                            else if (p.Cost == p.AvailFunds)
                                Status = "yellow";


                            FinancialDetail f = new FinancialDetail()
                            {
                                Item = p.Description,
                                ItemType = "PO Line Item",
                                ItemNo = p.PoLineID,
                                Order = p.Order,
                                Amount = p.Cost,
                                Code = p.Code,
                                Vendor = vendor,
                                Status = Status,
                                POCO = "PO",
                                POCOId = p.PoID
                            };
                            result.Add(f);
                        }

                        if (result.Count == 0)
                            result = GetDummyCommittedDetails();
                        break;

                    case "PENDING CO":
                        if (result.Count == 0)
                            result = GetDummyCommittedDetails();
                        break;

                    case "BAL TO COMMIT":
                        if (result.Count == 0)
                            result = GetDummyCommittedDetails();
                        break;

                    case "PAID":
                        if (result.Count == 0)
                            result = GetDummyCommittedDetails();
                        break;

                    case "BAL TO PAY":
                        if (result.Count == 0)
                            result = GetDummyCommittedDetails();
                        break;
                }

                if (!string.IsNullOrEmpty(status))
                {
                    status = status.ToLower();
                    result = result.Where(x => x.Status == status).ToList();
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    result = result.Where(x => x.Amount.ToString().Contains(search) || x.Code.Contains(search) || x.Item.ToLower().Contains(search)
                        || x.ItemNo.ToString().Contains(search) || x.ItemType.ToLower().Contains(search) || x.Order.ToString().Contains(search)
                        || x.Vendor.ToLower().Contains(search)).ToList();
                }

                return result;
            }
            catch
            {
                return null;
            }
        }


        [HttpGet]
        [Route("GetBudgetDetailData")]
        public async Task<List<BudgetSumDetail>> GetBudgetDetailData(long projid, string status = null, string search = null)
        {
            try
            {
                List<BudgetSumDetail> result = new List<BudgetSumDetail>();
                var LCs = await _db.LineCodes.Where(d => d.ProjectID == projid && d.BudgetTot > 0).OrderBy(d => d.Code).ToListAsync();
                foreach (LineCode l in LCs)
                {
                    string Status = GetBudgetAlert(l);
                    BudgetSumDetail temp = new BudgetSumDetail()
                    {
                        AvailFunds = l.AvailFunds,
                        BudgetDetailID = l.BudgetDetailID,
                        BudgetTot = l.BudgetTot,
                        Category = l.Category,
                        Code = l.Code,
                        DepositTot = l.DepositTot,
                        Description = l.Description,
                        ProjectID = l.ProjectID,
                        Status = Status
                    };

                    result.Add(temp);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    status = status.ToLower();
                    result = result.Where(x => x.Status == status).ToList();
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    result = result.Where(x => x.Category.ToLower().ToString().Contains(search) || x.Code.Contains(search) || x.Description.ToLower().Contains(search)
                        || x.BudgetTot.ToString().Contains(search) || x.DepositTot.ToString().Contains(search) || x.AvailFunds.ToString().Contains(search)).ToList();
                }
                return result;
            }
            catch
            {
                return null;
            }
        }

        public string GetBudgetAlert(LineCode LC)
        {

            string Status = "green";

            if (LC.AvailFunds < (LC.DepositTot * .05M))
                Status = "red";
            else if (LC.AvailFunds < (LC.DepositTot * .15M))
                Status = "yellow";

            return Status;
        }

        public List<FinancialDetail> GetDummyBudgetDetails()
        {
            List<FinancialDetail> result = new List<FinancialDetail>();
            FinancialDetail F1 = new FinancialDetail()
            {
                Item = "Planning",
                ItemType = "BudCategory",
                ItemNo = 1001,
                Order = 1,
                Amount = 14000,
                Code = "1001",
                Vendor = ""
            };
            result.Add(F1);

            FinancialDetail F2 = new FinancialDetail()
            {
                Item = "Design",
                ItemType = "BudCategory",
                ItemNo = 1002,
                Order = 1,
                Amount = 14000,
                Code = "1002",
                Vendor = ""
            };
            result.Add(F2);

            return result;
        }


        public List<FinancialDetail> GetDummyCommittedDetails()
        {
            List<FinancialDetail> result = new List<FinancialDetail>();
            FinancialDetail F1 = new FinancialDetail()
            {
                Item = "Design Staffing",
                ItemType = "PO Line Item",
                ItemNo = 1001,
                Order = 1,
                Amount = 14000,
                Code = "A01",
                Vendor = "ProSysInc",
                Status = "green",
                POCO = "PO",
                POCOId = 1001

            };
            result.Add(F1);

            FinancialDetail F2 = new FinancialDetail()
            {
                Item = "Project Management",
                ItemType = "PO Line Item",
                ItemNo = 1002,
                Order = 1,
                Amount = 14000,
                Code = "A02",
                Vendor = "Syvenn",
                Status = "red",
                POCO = "PO",
                POCOId = 1002
            };
            result.Add(F2);

            return result;
        }


        [HttpGet]
        [Route("GetScheduleDetails")]
        public async Task<List<ScheduleDetail>> GetScheduleDetails(long taskid, string status = null, string search = null)
        {
            List<ScheduleDetail> result = new List<ScheduleDetail>();
            try
            {
                var proj = await _db.Tasks.Where(d => d.Id == taskid).FirstOrDefaultAsync();

                string Status = "green";
                DateTime End = proj.StartDate.AddDays(proj.Duration);
                // Status = GetScheduleAlert(End, proj.Progress);

                ScheduleDetail summary = new ScheduleDetail()
                {
                    TaskID = taskid,
                    Order = 0,
                    Start = proj.StartDate,
                    End = End,
                    Task = proj.Text,
                    Type = proj.Type,
                    Status = Status
                };
                // result.Add(summary);
                var subitems = await _db.Tasks.Where(d => d.ParentId == taskid).ToListAsync();
                foreach (Data.Models.Task t in subitems)
                {
                    string alertStatus = "green";
                    DateTime enddate = t.StartDate.AddDays(t.Duration);
                    alertStatus = GetScheduleAlert(enddate, t.Progress);

                    ScheduleDetail item = new ScheduleDetail()
                    {
                        TaskID = t.Id,
                        Order = t.SortOrder,
                        Start = t.StartDate,
                        End = enddate,
                        Task = t.Text,
                        Type = t.Type,
                        Status = alertStatus
                    };
                    result.Add(item);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    status = status.ToLower();
                    result = result.Where(x => x.Status == status).ToList();
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    result = result.Where(x => x.Order.ToString().Contains(search) || x.Task.ToLower().Contains(search)
                        || x.Type.ToLower().Contains(search)).ToList();
                }

                return result;
            }
            catch
            {
                return null;
            }
        }

        public string GetScheduleAlert(DateTime End, decimal progress)
        {

            string Status = "green";
            if (progress < 100 && End > DateTime.Now)
                Status = "red";
            else if (progress < 100 && End.AddDays(-10) > DateTime.Now)
                Status = "yellow";

            return Status;
        }


        [HttpGet]
        [Route("GetAlertHistory")]
        public List<AlertLookup> GetAlertHistory(string itemtype, long itemno)
        {
            List<AlertLookup> result = new List<AlertLookup>();

            try
            {
                if (itemtype.ToUpper() == "POLINEITEM" && itemno == 1154)
                {
                    AlertLookup AL = new AlertLookup()
                    {
                        ItemType = itemtype,
                        AlertDate = DateTime.Now,
                        AlertID = 1000,
                        Type = "Task Over Due",
                        Description = "Item Not Ordered",
                        Impact = "Install Delay",
                        Recommendation = "Generate order & Expedite",
                        ItemID = 1154
                    };
                    result.Add(AL);
                }
                else if (itemtype.ToUpper() == "Action" && itemno == 1004)
                {
                    AlertLookup a1 = new AlertLookup()
                    {
                        ItemType = itemtype,
                        AlertDate = DateTime.Now,
                        AlertID = 1001,
                        Type = "Task Over Due",
                        Description = "Item Not Ordered",
                        Impact = "Install Delay",
                        Recommendation = "Generate order & Expedite",
                        ItemID = 1003
                    };
                    result.Add(a1);
                }
                else
                {
                    AlertLookup AL = new AlertLookup()
                    {
                        ItemType = itemtype,
                        AlertDate = DateTime.Now,
                        AlertID = 1000,
                        Type = "Task Over Due",
                        Description = "Item Not Ordered",
                        Impact = "Install Delay",
                        Recommendation = "Generate order & Expedite",
                        ItemID = itemno
                    };

                    result.Add(AL);

                }
                return result;
            }
            catch
            {
                return null;
            }
        }
    }
}
