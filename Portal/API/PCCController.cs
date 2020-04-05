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
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Portal.API {
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PCCController : ControllerBase {
        private readonly List<decimal> ScoreWeight = new List<decimal> { 40, 20, 20, 20 };
        private CurrentUser currentUser; // = new CurrentUser();

        private readonly SyvennDBContext _db;
        public PCCController(SyvennDBContext dbContext) {
            _db = dbContext;
            //  var result = GetCurrentUser(HttpContext);
            //  currentUser = user;
           // GanttSeeder.Seed(_db);
        }

        public async  Task<bool> GetCurrentUser(HttpContext context)
        {
            try
            {
                currentUser = new CurrentUser();
                var principal = context.User.Identity as ClaimsIdentity;
                var login = principal.Claims.SingleOrDefault(c => c.Type == "email")?.Value;
                var name = principal.Claims.SingleOrDefault(c => c.Type == "name")?.Value;
                currentUser.UserEmail = login;
                currentUser.UserName = name;

                var ent =await _db.UserContacts.Where(i => i.UserEmail.ToLower() == login.ToLower()).Select(i => i.EntCode).FirstOrDefaultAsync();
                currentUser.EntCode = ent;

                return true;
            }
            catch (Exception ex)
            {
                Console.Write("GetCurrentUser", ex.Message);
                return false;
            }
        }

        public async Task<CurrentUser> GetUserbyContext(HttpContext context)
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

        [HttpPost]
        [Route("getAlertsData")]
        public async Task<ActionResult<DataSourceResult>> GetAlertsData(DataSourceRequest request) {
            var alerts = new List<ProjectControlCenter.AlertsTableViewModel>();
            var result = await GetCurrentUser(HttpContext);
            try
            {
                var pccData = await _db.PCCSummary.Where(p => p.EntCode == "PRO1").ToListAsync();
                alerts = GetAlertsfromPCCSummary(pccData);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
            }
            return alerts.ToDataSourceResult(request);
        }

        [HttpPost]
        [Route("getPortfolioData")]
        public async Task<ActionResult<DataSourceResult>> GetPortfolioData(DataSourceRequest request) {

            if (currentUser == null)
            {
                bool err = await GetCurrentUser(HttpContext);
            }

            var portfolios = await _db.PCCSummary
                                    .Where(p => p.EntCode == "PRO1")
                                    .Select(x => new ProjectControlCenter.PortfolioTableViewModel {
                                        ProjectId = x.ProjectId,
                                        Title = x.Title,
                                        Description = x.Description,
                                        Phase = x.Phase,
                                        Status = x.Status
                                    }).ToListAsync();

            return portfolios.ToDataSourceResult(request);
        }

        [HttpPost]
        [Route("getRecentActivityData")]
        public async Task<ActionResult<DataSourceResult>> GetRecentActivityData( DataSourceRequest request) {

            var recentyActivities = new List<ProjectControlCenter.RecentActivityTableViewModel>();
            try
            {
                var Activities = await _db.ActivityLogs.Where(p => p.EntCode == "PRO1").ToListAsync();
                foreach (ActivityLog a in Activities)
                {
                    var ra = new ProjectControlCenter.RecentActivityTableViewModel
                    {
                        Date = a.LogDate,
                        User = a.LogUser,
                        Change = a.Change
                    };
                    recentyActivities.Add(ra);
                }
                //var team = await _db.ProjectTeamDetails.Where(p => p.ProjectID == 1001).ToListAsync();
                //Console.Write(team.Count());
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
            }
            return recentyActivities.ToDataSourceResult(request);
        }

        [HttpGet]
        [Route("getProjectHealthChartData")]
        public async Task<ActionResult<DonutChartDetails>> GetProjectHealthChartData(string projects) {
            try
            {
                DonutChartDetails result = new DonutChartDetails
                {
                    Items = new List<DonutChartData>()
                };

                if (projects == null)
                {
                    var summary = await _db.PCCSummary.Where(p => p.EntCode == "PRO1").ToListAsync();
                    result.Items = GetAlertScores(summary);
                    result.Score = GetAverageScore(summary);
                    result.Title = "Project Health (" + summary.Count + ")";
                }
                else
                {
                    var stringArray = projects.Split(',').ToList<string>();
                    long[] idList = stringArray.Select(long.Parse).ToArray();
                    var summary = await _db.PCCSummary.Where(p => p.EntCode == "PRO1" && idList.Contains(p.ProjectId)).ToListAsync();
                    result.Items = GetAlertScores(summary);
                    result.Score = GetAverageScore(summary);
                    result.Title = "Project Health (" + summary.Count + ")";
                }
                return result;
            }
            catch
            {
                return NoContent();
            }
        }

        public decimal GetAverageScore(List<PCCSummary> summary)
        {
            try
            {
                decimal result = 0;
                decimal tot = 0;
                foreach (PCCSummary a in summary)
                {
                    tot += GetWeightedScore(a);
                }
                result = Math.Round(tot / summary.Count, 2);
                return result;
            }
            catch
            {
                return 0;
            }
        }

        [HttpGet]
        [Route("getProjectbyPhaseChartData")]
        public async Task<ActionResult<List<DonutChartData>>> GetProjectbyPhaseChartData() {
            try
            {
                var summary = await _db.PCCSummary.Where(p => p.EntCode == "PRO1").ToListAsync();
                var phaseData = new List<DonutChartData>();
                var projectsPerPhase = from p in summary
                                       group p by p.Phase into phaseGroup
                                       select new
                                       {
                                           Phase = phaseGroup.Key,
                                           Count = phaseGroup.Count()
                                       };
                int mycount = summary.Count();
                foreach (var p in projectsPerPhase)
                {
                    decimal per = ((p.Count * 100) / mycount);
                    var d = new DonutChartData() { Category = p.Phase, Value = per };
                    phaseData.Add(d);
                }
                return phaseData;
            }
            catch
            {
                return NoContent();
            }
        }

        [HttpGet]
        [Route("getProjectByStatusChartData")]
        public async Task<ActionResult<List<DonutChartData>>> GetProjectByStatusChartData() {
            var statusData = new List<DonutChartData>();
            try
            {
                var summary = await _db.PCCSummary.Where(p => p.EntCode == "PRO1").ToListAsync();

                var projectPerStatus = from p in summary
                                       group p by p.Status into statusGroup
                                       select new
                                       {
                                           Status = statusGroup.Key,
                                           Count = statusGroup.Count()
                                       };
                int mycount = summary.Count();
                foreach (var p in projectPerStatus)
                {
                    decimal per = ((p.Count * 100) / mycount);
                    var d = new DonutChartData() { Category = p.Status, Value = per };
                    statusData.Add(d);
                }


            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
            }
            return statusData;
        }

        private List<ProjectControlCenter.AlertsTableViewModel> GetAlertsfromPCCSummary(List<PCCSummary> Summary) {
            try
            {
                var AllProjects = from a in Summary
                                  select new ProjectControlCenter.AlertsTableViewModel
                                  {
                                      ProjectId = a.ProjectId,
                                      Title = a.Title,
                                      //Date = a.AlertDate ?? DateTime.Now,
                                      //Alerts = a.AlertDescription,
                                      Category = a.GetAlertCategory(),
                                      Resp = a.Resp,
                                      Score = GetWeightedScore(a),
                                      Health = a.GetHealth(GetWeightedScore(a)),
                                      AlertBudget = a.GetAlertText(a.AlertBudget > 0),
                                      AlertBuyout = a.GetAlertText(a.AlertBuyout > 0),
                                      AlertDocuments = a.GetAlertText(a.AlertDocuments > 0),
                                      AlertMilestone = a.GetAlertText(a.AlertMilestone > 0),
                                  };

                var result = AllProjects.Where(a => a.Score <= 90);

                return result.ToList();
            }
            catch
            {
                return null;
            }
        }

        private decimal GetWeightedScore(PCCSummary a) {
            decimal result = 100;

            if (a.AlertBudget > 0)
                result -= ScoreWeight[0];
            if (a.AlertBuyout > 0)
                result -= ScoreWeight[1];
            if (a.AlertMilestone > 0)
                result -= ScoreWeight[2];
            if (a.AlertDocuments > 0)
                result -= ScoreWeight[3];

            return result;
        }

        public async Task<decimal> GetWeightedScorebyID(long id)
        {
            try
            {

                var a = await _db.PCCSummary.Where(p => p.ProjectId == id).FirstOrDefaultAsync();
                return GetWeightedScore(a);
            }
            catch
            {
                return 0;
            }
        }

        private List<DonutChartData> GetAlertScores(List<PCCSummary> Summary) {
            try
            {
                List<DonutChartData> results = new List<DonutChartData>();
                DonutChartData BudgetValue = new DonutChartData
                {
                    Category = "Budget Alert",
                    Value = 0
                };

                DonutChartData BuyoutValue = new DonutChartData
                {
                    Category = "Buyout Alert",
                    Value = 0
                };

                DonutChartData MilestoneValue = new DonutChartData
                {
                    Category = "Milestone Alert",
                    Value = 0
                };

                DonutChartData DocumentValue = new DonutChartData
                {
                    Category = "Document Alert",
                    Value = 0
                };

                DonutChartData HealthyValue = new DonutChartData
                {
                    Category = "Healthy",
                    Value = 0
                };

                foreach (PCCSummary a in Summary)
                {
                    if (a.AlertBudget == 0)
                        BudgetValue.Value += ScoreWeight[0];
                    if (a.AlertBuyout == 0)
                        BuyoutValue.Value += ScoreWeight[1];
                    if (a.AlertMilestone == 0)
                        MilestoneValue.Value += ScoreWeight[2];
                    if (a.AlertDocuments == 0)
                        DocumentValue.Value += ScoreWeight[3];

                    if (!(a.AlertBudget == 0 || a.AlertBuyout == 0 || a.AlertMilestone == 0 || a.AlertDocuments == 0))
                        HealthyValue.Value += 100;
                }

                decimal tot = BudgetValue.Value + BuyoutValue.Value + MilestoneValue.Value + DocumentValue.Value + HealthyValue.Value;

                BudgetValue.Value = Math.Round((BudgetValue.Value / tot) * 100, 2);
                BuyoutValue.Value = Math.Round((BuyoutValue.Value / tot) * 100, 2);
                MilestoneValue.Value = Math.Round((MilestoneValue.Value / tot) * 100, 2);
                DocumentValue.Value = Math.Round((DocumentValue.Value / tot) * 100, 2);
                HealthyValue.Value = Math.Round((HealthyValue.Value / tot) * 100, 2);

                results.Add(BudgetValue);
                results.Add(BuyoutValue);
                results.Add(MilestoneValue);
                results.Add(DocumentValue);
                results.Add(HealthyValue);

                return results;
            }
            catch
            {
                return null;
            }
        }

         
       

        [HttpGet]
        [Route("GetActiveMapLocations")]
        public async Task<List<LocationLookup>> GetActiveMapLocations(string status = null, string search = null )
        {
            var user = await GetUserbyContext(HttpContext); 
          
            List<LocationLookup> result = new List<LocationLookup>();
            try
            { 

                var locs = await _db.ProjectLocations.Where(d => d.Status != "Complete").ToListAsync();

                int i = 1; 
                foreach (ProjectLocationLookup p in locs)
                {
                    LocationLookup L = new LocationLookup();



                    L.AddCity = p.AddCity;
                    L.Address1 = p.Address1;
                    L.Address2 = p.Address2;
                    L.AddState = p.AddState;
                    L.AddZip = p.AddZip;
                    L.Description = p.Description;
                    L.Duration = p.Duration;
                    L.EntCode = p.EntCode;
                    L.isPrimary = p.isPrimary;
                    L.Label = p.Label;
                    L.Latitude = p.Latitude;
                    L.LocationID = p.LocationID;
                    L.Longitude = p.Longitude;
                    L.Phase = p.Phase;
                    L.PM = p.PM;
                    L.ProjectID = p.ProjectID;
                    L.StartDate = p.StartDate;
                    L.Status = p.Status;
                    L.Title = p.Title;
                   // L.LocationCityState = p.AddCity + ' ' + p.AddState;
                  //s  L.Rowid = i - 1;

                    if (i % 5 == 0)
                    { 
                        L.Statuscode = "red";
                    }
                    else if (i % 2 == 0)
                    {
                        L.Statuscode = "yellow";
                    }
                    else
                    {
                        L.Statuscode = "green";
                    } 
                    result.Add(L);
                    i++;
                    
                }

                if (!string.IsNullOrEmpty(status))
                {
                    status = status.ToLower();
                    result = result.Where(x => x.Statuscode == status).ToList();
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    result = result.Where(x => x.Title.ToString().Contains(search) || x.AddCity.ToLower().Contains(search)
                       || x.Description.ToLower().Contains(search) || x.Address1.ToLower().Contains(search) || x.AddState.ToLower().Contains(search)).ToList();
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
        [Route("GetAllLayers")]
        public async Task<List<HeatMapLayer>> GetAllLayers()
        {
            try
            {
                var result = await _db.HeatMapLayers.ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetLayers")]
        public async Task<List<HeatMapLayer>> GetLayers(string ent)
        {
            try
            {
                var result = await _db.HeatMapLayers.Where(d => d.EntCode == ent).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        [HttpGet]
        [Route("GetLayerData")]

        public async Task<List<HeatMapData>> GetLayerData()
        {
            try
            {
                var result = await _db.HeatMapDatas.ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }
    }
}