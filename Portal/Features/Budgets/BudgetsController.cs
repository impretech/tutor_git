using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Portal.Data;
using Portal.Models;
using Portal.API;
using System.Net;
using System;
using Microsoft.AspNetCore.Hosting;
using Portal.Data.Models;

namespace Portal.Features.Budgets {
    [Route("budgets")]
    [Authorize]
    public class BudgetsController : Controller {

        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public BudgetsController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext) {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index(string entcode) {

            try
            {
                if (string.IsNullOrEmpty(entcode))
                    entcode = "PRO1";  ///**************  Insert actual EntCode
                var budgets = await _db.Budgets.Where(i => i.EntCode == entcode).ToListAsync();

                List<BudgetLookup> budlist = new List<BudgetLookup>();
                foreach (Budget b in budgets)
                {
                    string title =await  GetProjectTitlebyID(b.ProjectID, b.EntCode);
                    BudgetLookup newbud = new BudgetLookup()
                    {
                        ProjectTitle = title,
                        AccountNo = b.AccountNo,
                        AddendumNo = b.AddendumNo,
                        BudgetID = b.BudgetID,
                        BudgetType = b.BudgetType,
                        Classification = b.Classification,
                        DateEntered = b.DateEntered,
                        DatePublished = b.DatePublished,
                        DueDate = b.DueDate,
                        EntCode = b.EntCode,
                        Gsf = b.Gsf,
                        ProjectDate = b.ProjectDate,
                        ProjectID = b.ProjectID,
                        Status = b.Status,
                        Total = b.Total,
                        Writer = b.Writer
                    };
                    budlist.Add(newbud);
                }

                return View("Index", budlist);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
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


        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New()
        {
            BudgetViewModel cvm = new BudgetViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "Budget") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", cvm);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {
            BudgetController C = new BudgetController(HostingEnvironment, _db);
            BudgetViewModel budget = new BudgetViewModel();
            budget= await C.GetBudgetbyID(id);

            return View("AddEdit", budget);
        }

    }
}
