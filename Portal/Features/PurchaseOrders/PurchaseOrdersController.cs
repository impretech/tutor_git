using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.API;
using Portal.Data;
using Portal.Models;


namespace Portal.Features.PO
{
    [Route("PurchaseOrder")]
    [Authorize]
    public class PurchaseOrdersController : Controller
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public PurchaseOrdersController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index()
        {
            try
            {
                var purchaseOrders = await _db.vwPOVendors.OrderByDescending(i => i.PoID).ToListAsync();
              //  var purchaseOrders = await _db.POs.ToListAsync();
                return View("Index", purchaseOrders);
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
            PurchaseOrderViewModel po = new PurchaseOrderViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "PO") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", po);
        }


        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {
            POController api = new POController(HostingEnvironment, _db);
            PurchaseOrderViewModel PO = new PurchaseOrderViewModel();
            PO = await api.GetPObyID(id);

            return View("AddEdit", PO);
        }
    }
}