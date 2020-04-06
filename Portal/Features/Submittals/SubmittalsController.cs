using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.API;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;


namespace Portal.Features.Submittals
{
    [Authorize]
    [Route("submittals")]
    [ApiController]
    public class SubmittalsController : Controller
    {
        private readonly SyvennDBContext _db;
        public SubmittalsController(SyvennDBContext dbContext)
        {
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
                var submittals = await _db.Submittals.Where(i => i.EntCode == entcode).ToListAsync();

                return View("Index", submittals);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New(string entcode)
        {

            if (string.IsNullOrEmpty(entcode))
                entcode = "PRO1";  ///**************  Insert actual EntCode
            SubmittalViewModel submittal = new SubmittalViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "Submittal") && (p.EntCode == entcode)).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", submittal);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {
            var s = _db.Submittals.Where(i => i.SubmittalID == id).First();
            var attachments = new List<SubmittalDocs>();
            var docs = await _db.SubmittalDocLinks.Where(p => p.SubmittalID == s.SubmittalID).ToListAsync();
            foreach (SubmittalDocLink r in docs)
            {
                DocumentDb docdb = await _db.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                SubmittalDocs doc = new SubmittalDocs()
                {
                    Created = docdb.Created,
                    FileName = docdb.Name,
                    Writer = docdb.CreatedBy,
                    DocID = docdb.DocID,
                    SubmittalDocLinkID = r.SubmittalDocLinkID,
                    SubmittalID = r.SubmittalID,
                    Type = r.Type
                };
                attachments.Add(doc);
            }
            SubmittalViewModel submittal = new SubmittalViewModel()
            {
                Sub = s,
                ProjectTitle = _db.Project.Where(p => p.ProjectId == s.ProjectID).Select(p => p.Title).FirstOrDefault(),
                Lookups = await _db.Lookups.Where(p => (p.Module == "Submittal") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync(),
                Attachments = attachments,
                DistrLogs = await _db.DistributionLogs.Where(i => i.ItemType == "Submittal" && i.ItemID == id).ToListAsync(),
                Notes = await _db.Notes.Where(i => i.ItemType == "Submittal" && i.ItemNo == id).ToListAsync()
            };

            return View("AddEdit", submittal);
        }

    }
}