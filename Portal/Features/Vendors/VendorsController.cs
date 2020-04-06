using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.API;
using Portal.Data;
using Portal.Models;

namespace Portal.Features.Vendors
{
    [Authorize]
    [Route("vendors")]
    public class VendorsController : Controller
    {
        private readonly SyvennDBContext _db;
        public VendorsController(SyvennDBContext dbContext)
        {
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index()
        {

            var vendors = await _db.Vendors
                //.Where(e => e.EntCode.ToUpper() == entcode.ToUpper())
                .Select(c => new VendorViewModel.VendorsGrid
                {
                    VendorID = c.VendorID,
                    VendorName = c.VendorName,
                    BusinessType = c.BusinessType,
                    WorkType = c.WorkType,
                    Status = c.Status
                }).ToListAsync();

            return View("Index", vendors);
        }

        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New()
        {
            VendorViewModel vendor = new VendorViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "Vendor") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", vendor);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {

            VendorController C = new VendorController(_db);
            VendorViewModel vendor = new VendorViewModel();
            vendor = await C.GetVendorVMbyID(id);

            return View("AddEdit", vendor);
        }

    }
}