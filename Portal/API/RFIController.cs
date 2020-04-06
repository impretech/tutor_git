using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class RFIController : ControllerBase
    {
        private readonly SyvennDBContext _context;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public RFIController(IHostingEnvironment hostingEnvironment, SyvennDBContext context)
        {
            HostingEnvironment = hostingEnvironment;
            _context = context;
        }

        // GET: api/RFIs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RFI>>> GetRFIs()
        {
            return await _context.RFIs.ToListAsync();
        }

        [HttpGet]
        [Route("GetRFIsByEnt")]
        public async Task<ActionResult<List<RFILookup>>> GetRFIsByEnt(string entcode)
        {
            try
            {
                List<RFILookup> result = new List<RFILookup>();
                var rfils = await _context.RFILookups.Where(i => i.EntCode == entcode).ToListAsync();
                return rfils;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("getRFIbyID")]
        public async Task<ActionResult<RFI>> GetRFI(long id)
        {
            var rFI = await _context.RFIs.FindAsync(id);

            if (rFI == null)
            {
                return NotFound();
            }

            return rFI;
        }

        // PUT: api/RFIs/5
        [HttpPut]
        [Route("UpdateRFI")]
        public async Task<ActionResult<bool>> PutRFI([FromBody]RFI rFI)
        {
            try
            {
                if (!(rFI.RFI_ID > 0))
                {
                    return BadRequest();
                }

                RFI r = await _context.RFIs.FindAsync(rFI.RFI_ID);

                if (r == null)
                    return NotFound();

                r.Action = rFI.Action;
                r.Attachments = rFI.Attachments;
                r.Category = rFI.Category;
                r.Classification = rFI.Classification;
                r.Confirmation = rFI.Confirmation;
                r.DateCreated = rFI.DateCreated;
                r.DateDue = rFI.DateDue;
                r.DatePublished = rFI.DatePublished;
                r.EntCode = rFI.EntCode;
                r.PrevRFI_ID = rFI.PrevRFI_ID;
                r.ProjectID = rFI.ProjectID;
                r.Request = rFI.Request;
                r.Requester = rFI.Requester;
                r.RequesterCompany = rFI.RequesterCompany;
                r.RequestSummary = rFI.RequestSummary;
                r.SenderRFINo = rFI.SenderRFINo;
                r.Status = rFI.Status;
                r.ToCompany = rFI.ToCompany;
                r.ToName = rFI.ToName;
                r.Writer = rFI.Writer;
                
                _context.RFIs.Update(r);
                await _context.SaveChangesAsync();
                //ActivityLog log = new ActivityLog
                //{
                //    LogUser = "L. Edwards",   //Replace with actual user login or email
                //    LogDate = DateTime.Now,
                //    EntCode = r.EntCode,
                //    ItemType = "RFI",
                //    ItemID = r.RFI_ID,
                //    Change = "UpdateRFI - Update RFI: " + JsonConvert.SerializeObject(rFI)
                //};
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest(); 
            }
        }

        // POST: api/RFIs
        [HttpPost]
        [Route("PostRFI")]
        public async Task<ActionResult<RFI>> PostRFI([FromBody]RFI rFI)
        {
            try
            {
                rFI.DateCreated = DateTime.Now;
                _context.RFIs.Add(rFI);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetRFI", new { id = rFI.RFI_ID }, rFI);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        // DELETE: api/RFIs/5
        [HttpDelete]
        [Route("DeleteRFI")]
        public async Task<ActionResult<RFI>> DeleteRFI(long id)
        {
            var rFI = await _context.RFIs.FindAsync(id);
            if (rFI == null)
            {
                return NotFound();
            }

            _context.RFIs.Remove(rFI);
            await _context.SaveChangesAsync();

            return rFI;
        }

        [HttpPost]
        [Route("GetCompany")]
        public Vendor GetRFICompany(string e)
        {
            if (ModelState.IsValid && e != null)
            {
                try
                {
                    Vendor comp = _context.Vendors.Where(v => v.CompanyCode.ToLower() == e.ToLower()).FirstOrDefault();
                    return comp;
                }
                catch (Exception ex)
                {
                    Console.Write(ex.Message);
                    return null;
                }
            }
            else
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetCompanybyEmail")]
        public Vendor GetCompanyByEmail(string e)
        {
            if (ModelState.IsValid && e != null)
            {
                string[] emailparts = e.Split('@');
                if (emailparts.Length >= 2)
                {
                    string domain = emailparts[1];
                    try
                    {
                        Vendor comp = _context.Vendors.Where(v => v.Domain.ToLower() == domain.ToLower()).FirstOrDefault();
                        if (comp!= null)
                            return comp;
                        else
                        {
                            Vendor newcomp = new Vendor() { VendorName = emailparts[1] };
                            return newcomp;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.Write(ex.Message);
                        return null;
                    }
                }
                return null;
            }
            else
            {
                return null;
            }
        }

        [HttpPost]
        [Route("GetUserbyEmail")]
        public EmailLookup GetEmailUser([FromBody]string ea)
        {
            if (ModelState.IsValid && ea != null)
            {
                try
                {
                    string[] emailparts = ea.Split('@');
                    var result = _context.EmailLookups.Where(r => r.EmailAddress.Trim().ToLower().Replace(".", "") == ea.Trim().ToLower().Replace(".", "")).FirstOrDefault();
                    if (result == null)
                    {
                        EmailLookup e = new EmailLookup()
                        {
                            EmailAddress = ea,
                            ShowAsName = emailparts[0],
                            UserName = emailparts[0]
                        };
                        return e;
                    }
                    return result;
                }
                catch (Exception ex)
                {
                    Console.Write( ex.Message);
                    return null;
                }
            }
            else
            {
                return null;
            }

        }

        private bool RFIExists(long id)
        {
            return _context.RFIs.Any(e => e.RFI_ID == id);
        }

        public List<ProjectLookup> GetProjectLookups(string entcode)
        {
            try
            {
                List<ProjectLookup> result = new List<ProjectLookup>();
                if (ModelState.IsValid && entcode != null)
                {
                    var projects = _context.Project.Where(c => c.EntCode.ToUpper() == entcode.ToUpper()).ToList();
                    if (projects != null && projects.Count > 0)
                    {
                        foreach (Project p in projects)
                        {
                            ProjectLookup L = new ProjectLookup()
                            {
                                EntCode = p.EntCode,
                                ProjectId = p.ProjectId,
                                ProjectNo = p.ProjectNo,
                                Title = p.Title
                            };
                            result.Add(L);
                        }
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        //****************************************  RFI Responses *******************************************************

        [HttpGet]
        [Route("getRFIAllResponsebyRFIID")]
        public async Task<ActionResult<List<RFIResponse>>> getRFIAllResponsebyRFIID(long id)
        {
            var rFIresps = await _context.RFIResponses.Where(c => c.RFI_ID == id).ToListAsync();

            if (rFIresps == null)
            {
                return NotFound();
            }

            return rFIresps;
        }


        [HttpGet]
        [Route("getRFIResponsebyID")]
        public async Task<ActionResult<RFIResponse>> GetRFIResponse(long id)
        {
            var rFI = await _context.RFIResponses.FindAsync(id);

            if (rFI == null)
            {
                return NotFound();
            }

            return rFI;
        }

        // PUT: api/RFIs/5
        [HttpPut]
        [Route("UpdateRFIResponse")]
        public async Task<ActionResult<bool>> PutRFIResponse([FromBody]RFIResponse rFIResp)
        {
            try
            {
                if (!(rFIResp.RFIResponseID > 0))
                {
                    return BadRequest();
                }

                RFIResponse r = await _context.RFIResponses.FindAsync(rFIResp.RFIResponseID);

                if (r == null)
                    return NotFound();

                r.Company = rFIResp.Company;
                r.CompanyCode = rFIResp.CompanyCode;
                r.FromName = rFIResp.FromName;
                r.IsAnswer = rFIResp.IsAnswer;
                r.Response = rFIResp.Response;
                r.ResponseDate = rFIResp.ResponseDate;
                r.RFIEmailID = rFIResp.RFIEmailID;
                r.RFI_ID = rFIResp.RFI_ID;
                r.Type = rFIResp.Type;
                r.VendorID = rFIResp.VendorID;
                _context.RFIResponses.Update(r);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }
        }

        private bool RFIResponseExists(long id)
        {
            return _context.RFIResponses.Any(e => e.RFIResponseID == id);
        }

        // POST: api/RFIs
        [HttpPost]
        [Route("PostRFIResponse")]
        public async Task<ActionResult<RFIResponse>> PostRFIResponse([FromBody]RFIResponse rFIresp)
        {
            try
            {
                _context.RFIResponses.Add(rFIresp);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetRFIResponse", new { id = rFIresp.RFIResponseID }, rFIresp);
            }
            catch (Exception ex)
            {
                Console.Write("PostRFIResponse Error", ex.Message);
                return BadRequest();
            }
        }

        // DELETE: api/RFIs/5
        [HttpDelete]
        [Route("DeleteRFIResponse")]
        public async Task<ActionResult<RFIResponse>> DeleteRFIResponse(long id)
        {
            var rFIresp = await _context.RFIResponses.FindAsync(id);
            if (rFIresp == null)
            {
                return NotFound();
            }

            _context.RFIResponses.Remove(rFIresp);
            await _context.SaveChangesAsync();

            return rFIresp;
        }

        //*****************************************   End RFIResponse ******************************************************************

        // PUT: api/RFIs/GetContactsList
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

        // PUT: api/RFIs/GetProjectsList
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
                var result = projcon.GetProjectLookups(entcode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        // PUT: api/RFIs/GetAttachDocs
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
                    ItemType = "RFI",
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

        //********************************   RFIDocLin ********************************************************************************
        // POST: api/rfi/InsertRFIDocLink
        /// <summary>
        /// Inserts new InsertRFIDocLink
        /// </summary>
        /// <param name="rfilink"></param>
        /// <returns>InsertRFIDocLinkID</returns>
        [HttpPost]
        [Route("InsertRFIDocLink")]
        public async Task<ActionResult<RFIDocLink>> InsertSubDocLink([FromBody]RFIDocLink rfilink)
        {
            try
            {
                _context.RFIDocLinks.Add(rfilink);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getRFIDocLinkbyID", new { id = rfilink.RFIDocLinkID }, rfilink);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }


        // GET: api/rfi/getRFIDocLinkbyID
        /// <summary>
        /// Get getRFIDocLinkbyID by ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>getRFIDocLinkbyID</returns>
        [HttpGet]
        [Route("getRFIDocLinkbyID")]
        public async Task<RFIDocLink> getRFIDocLinkbyID(long id)
        {
            RFIDocLink result = new RFIDocLink();
            try
            {
                result = await _context.RFIDocLinks.Where(i => i.RFIDocLinkID == id).FirstOrDefaultAsync();
            }
            catch
            {
                return null;
            }
            return result;
        }

        // GET: api/rfi/getRFIDocLinkbyRFIID
        /// <summary>
        /// Get getRFIDocLinkbyID by ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns>getRFIDocLinkbyRFIID</returns>
        [HttpGet]
        [Route("getRFIDocLinkbyRFIID")]
        public async Task<List<RFIDocs>> getRFIDocLinkbyRFIID(long id)
        {
            List<RFIDocs> result = new List<RFIDocs>();
            try
            {
                var rfilinks = await _context.RFIDocLinks.Where(i => i.RFI_ID == id).ToListAsync();
                foreach (RFIDocLink r in rfilinks)
                {
                    DocumentDb docdb = await _context.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefaultAsync();
                    RFIDocs doc = new RFIDocs()
                    {
                        Created = docdb.Created,
                        FileName = docdb.Name,
                        Writer = docdb.CreatedBy,
                        DocID = docdb.DocID,
                        RFIDocLinkID = r.RFIDocLinkID,
                        RFI_ID = r.RFI_ID,
                        Type = r.Type,
                        ItemID = r.ItemID
                    };
                    result.Add(doc);
                }
            }
            catch
            {
                return null;
            }
            return result;
        }


        // DELETE: api/rfi/DeleteSubDocLink
        /// <summary>
        /// Deletes RFIDocLink
        /// </summary>
        /// <param name="id"></param>
        /// <returns>RFIDocLink</returns>
        [HttpDelete]
        [Route("DeleteRFIDocLink")]
        public async Task<ActionResult<RFIDocLink>> DeleteRFIDocLink(long id)
        {
            var rfi = await _context.RFIDocLinks.FindAsync(id);
            if (rfi == null)
            {
                return NotFound();
            }

            _context.RFIDocLinks.Remove(rfi);
            await _context.SaveChangesAsync();

            return rfi;
        }

    }
}
