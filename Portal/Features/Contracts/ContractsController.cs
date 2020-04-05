using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Models;
using Portal.API;
using System.Net;
using Portal.Data.Models;

namespace Portal.Features.Contracts
{
    [Authorize]
    [Route("contracts")]
    public class ContractsController : Controller
    {
        private readonly SyvennDBContext _db;
        public ContractsController(SyvennDBContext dbContext)
        {
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index()
        {

            // TODO query not complete, test only
            var contracts = await _db.Contracts.Where(p => p.EntCode == "PRO1")
               .ToListAsync();

            return View("Index", contracts);
        }

        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New()
        {
            ContractViewModel cvm = new ContractViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "Contract") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", cvm);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {
            ContractController C = new ContractController(_db);
            ContractViewModel contract = new ContractViewModel();
            contract = await C.GetContractVMbyID(id);

            return View("AddEdit", contract);
        }

    }
}