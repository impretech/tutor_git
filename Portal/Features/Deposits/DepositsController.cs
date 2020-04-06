using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Models;
using Portal.API;

namespace Portal.Features.Deposits
{
    [Route("deposits")]
    [Authorize]
    public class DepositsController : Controller
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public DepositsController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index(string entcode)
        {

            try
            {
                if (string.IsNullOrEmpty(entcode))
                    entcode = "PRO1";  ///**************  Insert actual EntCode
                var deposits = await _db.DepositViews.Where(i => i.EntCode == entcode).ToListAsync();

                return View("Index", deposits);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New()
        {
            DepositViewModel cvm = new DepositViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "Deposit") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", cvm);
        }



        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {
            DepositController C = new DepositController(HostingEnvironment, _db);
            DepositViewModel deposit = new DepositViewModel();
            deposit = await C.GetDepositbyID(id);

            return View("AddEdit", deposit);
        }


    }
}