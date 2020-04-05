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

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class SubmittalController : ControllerBase
    {
        public IHostingEnvironment HostingEnvironment { get; set; }
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;

        public SubmittalController(IHostingEnvironment hostingEnvironment, SyvennDBContext context)
        {
            HostingEnvironment = hostingEnvironment;
            _context = context;
            _Logger = new ActivityLogsController(_context);
        }

        //GET: api/Submittal/GetSubmittals
        // <summary>
       // Get all submittal
        // </summary>
        /// <returns>List<Submital></returns>
        [HttpGet]
        [Route("GetSubmittals")]
        public async Task<ActionResult<IEnumerable<Submittal>>> GetSubmittals(string entcode)
        {
            return await _context.Submittals.Where(i => i.EntCode == entcode).ToListAsync();
        }

        // GET: api/Submittal/getSubmittalbyID
        /// <summary>
        /// Get submittal
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Submital</returns>
        [HttpGet]
        [Route("getSubmittalbyID")]
        public async Task<ActionResult<SubmittalViewModel>> GetSubmittalbyID(long id)
        {
            SubmittalViewModel result = new SubmittalViewModel();
            try
            {
                var submittal = await _context.Submittals.FindAsync(id);
                result = await GetSubmittalVM(submittal, "PRO1");
            }
            catch
            {
                return null;
            }
          
            return result;
        }

        public async Task<SubmittalViewModel> GetSubmittalVM(Submittal S, string entcode)
        {
            try
            {
                SubmittalViewModel vm = new SubmittalViewModel { Sub = S };
                vm.Lookups = new List<Lookup>();
                vm.Lookups = await _context.Lookups.Where(p => (p.Module == "Submittal") && (p.EntCode == entcode)).OrderBy(p => p.Prompt).ToListAsync();
                vm.Attachments = new List<SubmittalDocs>();
                var docs = await _context.SubmittalDocLinks.Where(p => p.SubmittalID == S.SubmittalID).ToListAsync();
                foreach (SubmittalDocLink r in docs)
                {
                    DocumentDb docdb = await _context.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
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
                    vm.Attachments.Add(doc);
                }
                vm.DistrLogs = new List<DistributionLog>();
                vm.DistrLogs = await _context.DistributionLogs.Where(p => p.ItemType == "Submittal" && p.ItemID == S.SubmittalID).ToListAsync();
                return vm;
            }
            catch
            {
                return null;
            }
        }

        // PUT: api/Submittal/GetAttachDocs
        /// <summary>
        /// Get DocCards to display attach documents
        /// </summary>
        /// <param name="entcode"></param>
        ///  /// <param name="id"></param>
        /// <returns>SubmitalID</returns>
        [HttpGet]
        [Route("GetAttachDocs")]
        public async Task<List<DocCards>> GetAttachDocs(string entcode, long id)
        {
            try
            {
                DocLookup lookup = new DocLookup
                {
                    EntCode = entcode,
                    ItemType = "Submittal",
                    ItemID = id,
                };
                DocumentController docCon = new DocumentController(HostingEnvironment, _context);
                var result = await docCon.GetDocumentCards(lookup);
                return result;
            }
            catch
            {
                return null;
            }
        }


        // PUT: api/Submittal/GetProjectsList
        /// <summary>
        /// Get DocCards to display attach documents
        /// </summary>
        /// <param name="entcode"></param>
        /// <returns>ProjectLookup</returns>
        [HttpGet]
        [Route("GetProjectsList")]
        public List<ProjectLookup> GetProjectList(string entcode)
        {
            try
            {
                ProjectController projcon = new ProjectController(HostingEnvironment, _context);
                var result =  projcon.GetProjectLookups(entcode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }


        // PUT: api/Submittal/GetContactsList
        /// <summary>
        /// Get DocCards to display attach documents
        /// </summary>
        /// <param name="entcode"></param>
        /// <returns>Contact</returns>
        [HttpGet]
        [Route("GetContactsList")]
        public async Task<ActionResult<List<Contact>>> GetContactsList(string entcode)
        {
            try
            {
                VendorController vendcon = new VendorController(_context);
                var result = await vendcon.GetContactsLookup(entcode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        // POST: api/Submittal/UpdateSubmittal
        /// <summary>
        /// Update new submittal
        /// </summary>
        /// <param name="sub"></param>
        /// <returns>bool</returns>
        [HttpPut]
        [Route("UpdateSubmittal")]
        public async Task<ActionResult<bool>> UpdateSubmittal([FromBody]Submittal sub)
        {
            try
            {
                if (!(sub.SubmittalID > 0))
                {
                    return BadRequest();
                }

                Submittal s = await _context.Submittals.FindAsync(sub.SubmittalID);

                if (s == null)
                    return NotFound();

                s.SubmittalNo = sub.SubmittalNo;
                s.Summary = sub.Summary;
                s.Attachments = sub.Attachments;
                s.Category = sub.Category;
                s.Classification = sub.Classification;
                s.Description = sub.Description;
                DateTime upTime = sub.DueDate ?? DateTime.Now;
                if (upTime.Year > 1970)
                    s.DueDate = upTime;
                s.EntCode = sub.EntCode;
                s.FromCompany = sub.FromCompany;
                s.FromName = sub.FromName;
                s.ProjectID = sub.ProjectID;
                DateTime pubTime = sub.PublishedDate ?? DateTime.Now;
                if (pubTime.Year > 1970)
                    s.PublishedDate = pubTime;
                s.RecDetail = sub.RecDetail;
                s.RecSummary = sub.RecSummary;
                s.RecToCompany = sub.RecToCompany;
                s.RecToName = sub.RecToName;
                s.RevCompany = sub.RevCompany;
                DateTime revTime = sub.ReviewedDate ?? DateTime.Now;
                if (revTime.Year > 1970)
                    s.ReviewedDate = revTime;
                DateTime rdTime = sub.ReviewedDateSent ?? DateTime.Now;
                if (rdTime.Year > 1970)
                    s.ReviewedDateSent = rdTime;
                s.ReviewerSubmittalNo = sub.ReviewerSubmittalNo;
                s.RevName = sub.RevName;
                s.Specification = sub.Specification;
                s.Status = sub.Status;
                s.SubmittalID = sub.SubmittalID;
                _context.Submittals.Update(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = sub.EntCode,
                    ItemType = "Submittal",
                    ItemID = sub.SubmittalID,
                    Change = "UpdateSubmittal - Update Submittal: " + JsonConvert.SerializeObject(sub)
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }
            
        }

        // POST: api/Submittal/InsertSubmittal
        /// <summary>
        /// Inserts new submittal
        /// </summary>
        /// <param name="submittal"></param>
        /// <returns>submittalid</returns>
        [HttpPost]
        [Route("InsertSubmittal")]
        public async Task<ActionResult<SubmittalViewModel>> InsertSubmittal([FromBody]Submittal submittal)
        {
            try
            {
                _context.Submittals.Add(submittal);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getSubmittalbyID", new { id = submittal.SubmittalID }, submittal);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
           
        }

        // DELETE: api/Submittal/DeleteSubmittal
        /// <summary>
        /// Deletes submittal
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Submital</returns>
        [HttpDelete]
        [Route("DeleteSubmittal")]
        public async Task<ActionResult<Submittal>> DeleteSubmittal(long id)
        {
            var submittal = await _context.Submittals.FindAsync(id);
            if (submittal == null)
            {
                return NotFound();
            }

            _context.Submittals.Remove(submittal);
            await _context.SaveChangesAsync();

            return submittal;
        }

        private bool SubmittalExists(long id)
        {
            return _context.Submittals.Any(e => e.SubmittalID == id);
        }


        private bool DistrLogExists(long id)
        {
            return _context.DistributionLogs.Any(e => e.DistributionLogID == id);
        }

        // PUT: api/Submittal/getDistrLogbyID
        /// <summary>
        /// Get Distribution Log by ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>DistributionLog</returns>
        [HttpGet]
        [Route("getDistrLogbyID")]
        public async Task<ActionResult<DistributionLog>> getDistrLogbyID(long id)
        {
            DistributionLog result = new DistributionLog();
            try
            {
                 result = await _context.DistributionLogs.FindAsync(id);
            }
            catch
            {
                return null;
            }
            return result;
        }

        // PUT: api/Submittal/getDistrLogbySubID
        /// <summary>
        /// Get Distribution Log by ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>DistributionLog</returns>
        [HttpGet]
        [Route("getDistrLogbySubID")]
        public async Task<List<DistributionLog>> getDistrLogbySubID(long id)
        {
           List<DistributionLog> result = new List<DistributionLog>();
            try
            {
                result = await _context.DistributionLogs.Where(i => i.ItemType == "Submittal" && i.ItemID == id).ToListAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        // PUT: api/Submittal/UpdateDistrLog
        /// <summary>
        /// Update Distribution Log
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPut]
        [Route("UpdateDistrLog")]
        public async Task<IActionResult> UpdateDistrLog([FromBody]long id, [FromBody]DistributionLog dl)
        {
            if (id != dl.DistributionLogID)
            {
                return BadRequest();
            }
            _context.Entry(dl).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DistrLogExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        // POST: api/Submittal/InsertDistrLog
        /// <summary>
        /// Inserts new Distribution Log
        /// </summary>
        /// <param name="dl"></param>
        /// <returns>DistributionLogID</returns>
        [HttpPost]
        [Route("InsertDistrLog")]
        public async Task<ActionResult<DistributionLog>> InsertSubmittal([FromBody]DistributionLog dl)
        {
            _context.DistributionLogs.Add(dl);
            await _context.SaveChangesAsync();
            return CreatedAtAction("getDistrLogbyID", new { id = dl.DistributionLogID }, dl);
        }


        // POST: api/Submittal/DeleteDistrLog
        /// <summary>
        /// Delete Distribution Log
        /// </summary>
        /// <param name="id"></param>
        /// <returns>DistributionLog</returns>
        [HttpDelete]
        [Route("DeleteDistrLog")]
        public async Task<ActionResult<DistributionLog>> DeleteDistrLog(long id)
        {
            var dl = await _context.DistributionLogs.FindAsync(id);
            if (dl == null)
            {
                return NotFound();
            }

            _context.DistributionLogs.Remove(dl);
            await _context.SaveChangesAsync();

            return dl;
        }

        // POST: api/Submittal/InsertSubDocLink
        /// <summary>
        /// Inserts new InsertSubDocLink
        /// </summary>
        /// <param name="sublink"></param>
        /// <returns>InsertSubDocLinkID</returns>
        [HttpPost]
        [Route("InsertSubDocLink")]
        public async Task<ActionResult<SubmittalViewModel>> InsertSubDocLink([FromBody]SubmittalDocLink sublink)
        {
            try
            {
                _context.SubmittalDocLinks.Add(sublink);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getSubDocLinkbyID", new { id = sublink.SubmittalDocLinkID }, sublink);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }


        // PUT: api/Submittal/getSubDocLinkbyID
        /// <summary>
        /// Get getSubDocLinkbyID by ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>SubmittalDocLink</returns>
        [HttpGet]
        [Route("getSubDocLinkbyID")]
        public async Task<SubmittalDocs> getSubDocLinkbyID(long id)
        {
            try
            {
                var subdoc = await _context.SubmittalDocLinks.Where(i => i.SubmittalDocLinkID == id).FirstOrDefaultAsync();
                var docdb = await _context.DocumentDbs.Where(i => i.DocID == subdoc.DocID).FirstOrDefaultAsync();
                SubmittalDocs result = new SubmittalDocs()
                {
                    Created = docdb.Created,
                    FileName = docdb.Name,
                    Writer = docdb.CreatedBy,
                    DocID = docdb.DocID,
                    SubmittalDocLinkID = subdoc.SubmittalDocLinkID,
                    SubmittalID = subdoc.SubmittalID,
                    Type = subdoc.Type
                };
                 return result;
            }
            catch
            {
                return null;
            }
           
        }

        // DELETE: api/Submittal/DeleteSubDocLink
        /// <summary>
        /// Deletes SubmittalDocLink
        /// </summary>
        /// <param name="id"></param>
        /// <returns>SubmittalDocLink</returns>
        [HttpDelete]
        [Route("DeleteSubDocLink")]
        public async Task<ActionResult<SubmittalDocLink>> DeleteSubmittalDocLink(long id)
        {
            var submittal = await _context.SubmittalDocLinks.FindAsync(id);
            if (submittal == null)
            {
                return NotFound();
            }

            _context.SubmittalDocLinks.Remove(submittal);
            await _context.SaveChangesAsync();

            return submittal;
        }


    }
}
