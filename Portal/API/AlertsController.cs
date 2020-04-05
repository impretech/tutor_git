using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using Microsoft.AspNetCore.Authorization;

namespace Portal.API {

    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class AlertsController : ControllerBase {
        private readonly SyvennDBContext _db;
        public AlertsController(SyvennDBContext dbContext) {
            _db = dbContext;
        }

        [HttpGet]
        [Route("getAlertsByProjectId")]
        public async Task<ActionResult<AlertsData>> GetAlertsByProjectId(long projectId) {
            ///Todo: Get alert data from database by id
            ///
            try {
                var AlertDbData = await _db.Alerts.Where(p => p.ProjectId == projectId).ToListAsync();

                List<AlertDetail> budgetAlerts = (from p in AlertDbData
                                                  where p.AlertType == "Budget"
                                                  select p).ToList();

                var alerts = new AlertsData();

                for (int i = 0; i < budgetAlerts.Count(); i++) {
                    Alert a = new Alert();
                    a = createAlert("Budget", budgetAlerts[i]) ;
                    a.Details = budgetAlerts[i];
                    alerts.BudgetAlerts.Add(a);
                }


                List<AlertDetail> milestoneAlerts = (from p in AlertDbData
                                                     where p.AlertType == "Milestone"
                                                     select p).ToList();

                for (int i = 0; i < milestoneAlerts.Count(); i++) {
                    Alert a = new Alert();
                    a = createAlert("Milestone", milestoneAlerts[i]) ;
                    a.Details = milestoneAlerts[i];
                    alerts.MilestoneAlerts.Add(a);
                }

                List<AlertDetail> buyoutAlerts = (from p in AlertDbData
                                                  where p.AlertType == "Buyout"
                                                  select p).ToList();

                for (int i = 0; i < buyoutAlerts.Count(); i++) {
                    Alert a = new Alert();
                    a =  createAlert("Buyout", buyoutAlerts[i]) ;
                    a.Details = buyoutAlerts[i];
                    alerts.BuyoutAlerts.Add(a);
                }

                List<AlertDetail> documentAlerts = (from p in AlertDbData
                                                    where p.AlertType == "Document"
                                                    select p).ToList();

                for (int i = 0; i < documentAlerts.Count(); i++) {
                    Alert a = new Alert();
                    a =  createAlert("Document", documentAlerts[i]) ;
                    a.Details = documentAlerts[i];
                    alerts.DocumentAlerts.Add(a);
                }

                return alerts;
            }
            catch (Exception ex) {
                Console.Write(ex);
            }
            return null;
        }

        private Alert createAlert(string type, AlertDetail b)
        {
            Alert a = new Alert
            {
                Title = type + " AlertID #" + b.AlertId.ToString(),
                SubTitle =b.Stage + " - " + b.Condition,
                Details = new AlertDetail()
            };
            return a;
        }
    }
}
