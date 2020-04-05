using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.API;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;


namespace Portal.Features.Quotes
{
    [Authorize]
    [Route("quotes")]
    public class QuotesController : Controller
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public QuotesController(IHostingEnvironment hostingEnvironment, SyvennDBContext dBContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dBContext;
        }

        [HttpGet]
        [Route("")]
        public ActionResult Index() ///(string ent)
        {
            try
            {
                var quotes = _db.QuoteLookups.Where(p => p.EntCode == "PRO1").ToList();
                return View("Index", quotes);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [Route("new")]
        [HttpGet]
        public IActionResult New()//(string ent)
        {
            var QVM = new QuoteViewModel
            {
                quote = new Data.Models.Quote(),
                Addendums = new List<QuoteAddendum>(),
                Alternatives = new List<QuoteBidAlt>(),
                AddendAck = new List<QuoteBidAddendum>(),
                Notes = new List<Note>(),
                Documents = new List<DocumentDb>(),
                Lookups = _db.Lookups.Where(p => (p.Module == "Quote") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToList()
            };

            return View("AddEdit", QVM);
        }


        [Route("{id}")]
        [HttpGet]
        public async  Task<IActionResult> Edit(long id) //, string ent)
        {
            try
            {

                QuoteViewModel qvm = new QuoteViewModel();
                QuoteController quote = new QuoteController(HostingEnvironment, _db);

                qvm = await quote.GetQuoteVM(id, "PRO1");

                return View("AddEdit", qvm);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

       



    }
}