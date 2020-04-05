using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuoteController : ControllerBase
    {
        public IHostingEnvironment HostingEnvironment { get; set; }
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;

        public QuoteController(IHostingEnvironment hostingEnvironment, SyvennDBContext context)
        {
            HostingEnvironment = hostingEnvironment;
            _context = context;
            _Logger = new ActivityLogsController(_context);
        }

        [HttpGet]
        [Route("getQuoteVM")]
        public async Task<QuoteViewModel> GetQuoteVM(long id, string entcode)
        {
            try
            {
                var attachments = new List<DocumentDb>();
                var docs = await _context.DocumentDbs.Where(i => i.ItemType == "Quote" && i.ItemNo == id).ToListAsync();
                var bids = await _context.QuoteBids.Where(p => p.QuoteID == id).ToListAsync();
                var bidList = await _context.QuoteBids.Where(p => p.QuoteID == id).Select(p => p.BidID).ToListAsync();
                List<QuoteBidSummary> BidSummary = new List<QuoteBidSummary>();

                foreach (QuoteBid b in bids)
                {
                    var alttot = await _context.QuoteBidAlts.Where(p => p.BidID == b.BidID && p.Selected == true).SumAsync(s => s.Amount);
                    var alts = await _context.QuoteBidAlts.Where(p => p.BidID == b.BidID).ToListAsync();
                    string version = "Original";
                    if (alts.Count > 0)
                    {
                        if (alts.Count == 1)
                        {
                            version = alts[0].Title;
                        }
                        else
                            version = "Multiple";
                    }
                    QuoteBidSummary bidsum = new QuoteBidSummary
                    {
                        BidID = b.BidID,
                        QuoteID = b.QuoteID,
                        VendorID = b.VendorID,
                        BaseBid = b.BaseBid,
                        BidBond = b.BidBond,
                        MWDBE = b.MWDBE,
                        Comment = b.Comment,
                        BidTot = b.BaseBid + alttot,
                        Version = version
                    };
                    BidSummary.Add(bidsum);
                }

                QuoteViewModel qvm = new QuoteViewModel
                {
                    quote = await _context.Quotes.Where(p => p.QuoteID == id).FirstOrDefaultAsync(),
                    Bids = BidSummary,
                    Addendums = await _context.QuoteAddendums.Where(p => p.QuoteID == id).ToListAsync(),
                    Alternatives = await _context.QuoteBidAlts.Where(item => bidList.Contains(item.BidID)).ToListAsync(),
                    AddendAck = await _context.QuoteBidAddendums.Where(item => bidList.Contains(item.BidID)).ToListAsync(),

                    Lookups = await _context.Lookups.Where(p => (p.Module == "Quote") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync(),
                    Notes = await _context.Notes.Where(i => i.ItemType == "Quote" && i.ItemNo == id).ToListAsync(),
                    Documents = docs,
                };
                return qvm;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        // GET: api/Deposits
        [HttpGet]
        [Route("GetQuotes")]
        public async Task<ActionResult<IEnumerable<Quote>>> GetQuotes(string entcode)
        {
            try
            {
                return await _context.Quotes.Where(i => i.EntCode == entcode).ToListAsync();
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuotebyID")]
        public async Task<QuoteViewModel> GetQuotebyID(long id)
        {
            QuoteViewModel result = new QuoteViewModel();
            try
            {
                var quote = await _context.Quotes.FindAsync(id);
                if (quote == null)
                {
                    return null;
                }
                result = await GetQuoteVM(id, quote.EntCode);
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetBidSumByQuoteID")]
        public async Task<List<QuoteBidSummary>> GetBidSumByQuoteID(long id)
        {
            try
            {
                List<QuoteBidSummary> result = new List<QuoteBidSummary>();
                var bids = await _context.QuoteBids.Where(p => (p.QuoteID == id)).ToListAsync();
                foreach (QuoteBid b in bids)
                {
                    var alttot = await _context.QuoteBidAlts.Where(p => p.BidID == b.BidID && p.Selected == true).SumAsync(s => s.Amount);
                    var alts = await _context.QuoteBidAlts.Where(p => p.BidID == b.BidID).ToListAsync();
                    string version = "Original";
                    if (alts.Count > 0)
                    {
                        if (alts.Count == 1)
                        {
                            version = alts[0].Title;
                        }
                        else
                            version = "Multiple";
                    }
                    QuoteBidSummary bidsum = new QuoteBidSummary
                    {
                        BidID = b.BidID,
                        QuoteID = b.QuoteID,
                        VendorID = b.VendorID,
                        BaseBid = b.BaseBid,
                        BidBond = b.BidBond,
                        MWDBE = b.MWDBE,
                        Comment = b.Comment,
                        BidTot =  b.BaseBid + alttot,
                        Version = version
                    };
                    result.Add(bidsum);
                }
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetBidSumByBidID")]
        public async Task<QuoteBidSummary> GetBidSumByBidID(long id)
        {
            try
            {
                var bid = await _context.QuoteBids.Where(p => (p.BidID == id)).FirstOrDefaultAsync();

                var alttot = await _context.QuoteBidAlts.Where(p => p.BidID == bid.BidID && p.Selected == true).SumAsync(s => s.Amount);
                var alts = await _context.QuoteBidAlts.Where(p => p.BidID == bid.BidID).ToListAsync();
                string version = "Original";
                if (alts.Count > 0)
                {
                    if (alts.Count == 1)
                    {
                        version = alts[0].Title;
                    }
                    else
                        version = "Multiple";
                }
                QuoteBidSummary bidsum = new QuoteBidSummary
                {
                    BidID = bid.BidID,
                    QuoteID = bid.QuoteID,
                    VendorID = bid.VendorID,
                    BaseBid = bid.BaseBid,
                    BidBond = bid.BidBond,
                    MWDBE = bid.MWDBE,
                    Comment = bid.Comment,
                    BidTot = bid.BaseBid + alttot,
                    Version = version
                };

                return bidsum;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteAddendumByQuoteID")]
        public async Task<List<QuoteAddendum>> GetQuoteAddendumByQuoteID(long id)
        {
            try
            {
                var result = await _context.QuoteAddendums.Where(p => (p.QuoteID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteAddendumByID")]
        public async Task<QuoteAddendum> GetQuoteAddendumByID(long id)
        {
            try
            {
                var result = await _context.QuoteAddendums.Where(p => (p.AddendumID == id)).FirstOrDefaultAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteBidDetailByQuoteID")]
        public async Task<List<QuoteBid>> GetQuoteBidDetailByQuoteID(long id)
        {
            try
            {
                var result = await _context.QuoteBids.Where(p => (p.QuoteID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteBidAltByBidID")]
        public async Task<List<QuoteBidAlt>> GetQuoteBidAltByBidID(long id)
        {
            try
            {
                var result = await _context.QuoteBidAlts.Where(p => (p.BidID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteBidAltByID")]
        public async Task<List<QuoteBidAlt>> GetQuoteBidAltByID(long id)
        {
            try
            {
                var result = await _context.QuoteBidAlts.Where(p => (p.BidAltID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteBidAddendumByBidID")]
        public async Task<List<QuoteBidAddendum>> GetQuoteBidAddendumByBidID(long id)
        {
            try
            {
                var result = await _context.QuoteBidAddendums.Where(p => (p.BidID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetQuoteBidAddendumByID")]
        public async Task<List<QuoteBidAddendum>> GetQuoteBidAddendumByID(long id)
        {
            try
            {
                var result = await _context.QuoteBidAddendums.Where(p => (p.BidAddendumID == id)).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [HttpPost]
        [Route("InsertQuote")]
        public async Task<ActionResult<QuoteViewModel>> InsertQuote([FromBody]Quote quote)
        {
            try
            {
                _context.Quotes.Add(quote);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetQuotebyID", new { id = quote.QuoteID }, quote);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }


        [HttpPost]
        [Route("InsertQuoteAddendum")]
        public async Task<ActionResult<QuoteAddendum>> InsertQuoteAddendum([FromBody]QuoteAddendum dl)
        {
            try
            {
                _context.QuoteAddendums.Add(dl);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetQuoteAddendumByID", new { id = dl.AddendumID }, dl);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("InsertQuoteBid")]
        public async Task<ActionResult<QuoteBidSummary>> InsertQuoteBid([FromBody]QuoteBid dl)
        {
            try
            {
                _context.QuoteBids.Add(dl);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetBidSumByBidID", new { id = dl.BidID }, dl);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("InsertQuoteBidAddendum")]
        public async Task<ActionResult<QuoteBidAddendum>> InsertQuoteBidAddendum([FromBody]QuoteBidAddendum dl)
        {
            try
            {
                _context.QuoteBidAddendums.Add(dl);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetQuoteBidAddendumByID", new { id = dl.AddendumID }, dl);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("InsertQuoteBidAlt")]
        public async Task<ActionResult<QuoteBidAlt>> InsertQuoteBidAlt([FromBody]QuoteBidAlt dl)
        {
            try
            {
                _context.QuoteBidAlts.Add(dl);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetQuoteBidAltByID", new { id = dl.BidAltID }, dl);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpPut]
        [Route("UpdateQuote")]
        public async Task<ActionResult<bool>> UpdateQuote([FromBody]Quote dl)
        {
            try
            {
                if (!(dl.QuoteID > 0))
                {
                    return BadRequest();
                }

                Quote s = await _context.Quotes.FindAsync(dl.QuoteID);

                if (s == null)
                    return NotFound();

                s.AcctNo = dl.AcctNo;
                s.AwardAmount = dl.AwardAmount;
                s.AwardedBidderID = dl.AwardedBidderID;
                s.BidIssue = dl.BidIssue;
                s.Budget = dl.Budget;
                s.ContractNo = dl.ContractNo;
                s.CreatedDate = dl.CreatedDate;
                s.Description = dl.Description;
                s.DueDate = dl.DueDate;
                s.EntCode = dl.EntCode;
                s.PONo = dl.PONo;
                s.PreBid = dl.PreBid;
                s.ProjectID = dl.ProjectID;
                s.QuoteID = dl.QuoteID;
                s.Status = dl.Status;
                s.TypeQuote = dl.TypeQuote;
                s.TypeWork = dl.TypeWork;
                s.WorkIndex = dl.WorkIndex;

                _context.Quotes.Update(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "Quote",
                    ItemID = dl.QuoteID,
                    Change = "UpdateQuote - Update Quote: " + JsonConvert.SerializeObject(dl)
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

        [HttpPut]
        [Route("UpdateQuoteAddendum")]
        public async Task<ActionResult<bool>> UpdateQuoteAddendum([FromBody]QuoteAddendum dl)
        {
            try
            {
                if (!(dl.AddendumID > 0))
                {
                    return BadRequest();
                }

                QuoteAddendum s = await _context.QuoteAddendums.FindAsync(dl.AddendumID);

                if (s == null)
                    return NotFound();

                s.Description = dl.Description;
                s.QuoteID = dl.QuoteID;
                s.Title = dl.Title;


                _context.QuoteAddendums.Update(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteAddendum",
                    ItemID = dl.AddendumID,
                    Change = "UpdateQuoteAddendum - Update QuoteAddendum: " + JsonConvert.SerializeObject(dl)
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

        [HttpPut]
        [Route("UpdateQuoteBid")]
        public async Task<ActionResult<bool>> UpdateQuoteBid([FromBody]QuoteBid dl)
        {
            try
            {
                if (!(dl.BidID > 0))
                {
                    return BadRequest();
                }

                QuoteBid s = await _context.QuoteBids.FindAsync(dl.BidID);

                if (s == null)
                    return NotFound();

                s.BaseBid = dl.BaseBid;
                s.BidBond = dl.BidBond;
                s.BidTot = dl.BidTot;
                s.Comment = dl.Comment;
                s.MWDBE = dl.MWDBE;
                s.QuoteID = dl.QuoteID;
                s.VendorID = dl.VendorID;


                _context.QuoteBids.Update(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteBid",
                    ItemID = dl.BidID,
                    Change = "UpdateQuoteBid - Update Quote Bid: " + JsonConvert.SerializeObject(dl)
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

        [HttpDelete]
        [Route("DeleteQuoteBid")]
        public async Task<ActionResult<QuoteBid>> DeleteQuoteBid(long id)
        {
            try
            {
                if (!(id> 0))
                {
                    return BadRequest();
                }

                QuoteBid s = await _context.QuoteBids.FindAsync(id);

                if (s == null)
                    return NotFound();

                var Alts = await _context.QuoteBidAlts.Where(i => i.BidID == id).ToListAsync();
                if (Alts != null && Alts.Count > 0)
                {
                    _context.QuoteBidAlts.RemoveRange(Alts);
                    await _context.SaveChangesAsync();
                }

                var Docs = await _context.DocumentDbs.Where(i => i.ItemType == "QuoteBid" && i.ItemNo == id).ToListAsync();
                if (Docs != null && Docs.Count > 0)
                {
                    _context.DocumentDbs.RemoveRange(Docs);
                    await _context.SaveChangesAsync();
                }

                var Adds = await _context.QuoteBidAddendums.Where(i => i.BidID ==id).ToListAsync();
                if (Adds != null && Adds.Count > 0)
                {
                    _context.QuoteBidAddendums.RemoveRange(Adds);
                    await _context.SaveChangesAsync();
                }

                _context.QuoteBids.Remove(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteBid",
                    ItemID = id,
                    Change = "DeleteQuoteBid - Delete Quote Bid: " + JsonConvert.SerializeObject(id)
                };
                await _Logger.InsertActivityLog(log);
                return s;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }
        }

        [HttpPut]
        [Route("UpdateQuoteBidAddendum")]
        public async Task<ActionResult<bool>> UpdateQuoteBidAddendum([FromBody]QuoteBidAddendum dl)
        {
            try
            {
                if (!(dl.AddendumID > 0))
                {
                    return BadRequest();
                }

                QuoteBidAddendum s = await _context.QuoteBidAddendums.FindAsync(dl.BidAddendumID);

                if (s == null)
                    return NotFound();

                s.Acknowledgement = dl.Acknowledgement;
                s.AddendumID = dl.AddendumID;
                s.BidID = dl.BidID;



                _context.QuoteBidAddendums.Update(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteBidAddendum",
                    ItemID = dl.BidAddendumID,
                    Change = "UpdateQuoteBidAddendum - Update QuoteBidAddendum: " + JsonConvert.SerializeObject(dl)
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

        [HttpPut]
        [Route("UpdateQuoteBidAlt")]
        public async Task<ActionResult<bool>> UpdateQuoteBidAlt([FromBody]QuoteBidAlt dl)
        {
            try
            {
                if (!(dl.BidAltID > 0))
                {
                    return BadRequest();
                }
                QuoteBidAlt s = await _context.QuoteBidAlts.FindAsync(dl.BidAltID);
                if (s == null)
                    return NotFound();
                s.Amount = dl.Amount;
                s.BidID = dl.BidID;
                s.Description = dl.Description;
                s.Selected = dl.Selected;
                s.Title = dl.Title;
                _context.QuoteBidAlts.Update(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteBidAlt",
                    ItemID = dl.BidAltID,
                    Change = "UpdateQuoteBidAlt - Update Bid Alternates: " + JsonConvert.SerializeObject(dl)
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

        [HttpDelete]
        [Route("DeleteQuoteBidAlt")]
        public async Task<ActionResult<QuoteBidAlt>> DeleteQuoteBidAlt([FromBody]long dl)
        {
            try
            {
                if (!(dl > 0))
                {
                    return BadRequest();
                }

                QuoteBidAlt s = await _context.QuoteBidAlts.FindAsync(dl);

                if (s == null)
                    return NotFound();


                _context.QuoteBidAlts.Remove(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteBidAlt",
                    ItemID = dl,
                    Change = "DeleteQuoteBidAlt - Delete Quote Bid Alternate: " + JsonConvert.SerializeObject(dl)
                };
                await _Logger.InsertActivityLog(log);
                return s;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }
        }

        [HttpDelete]
        [Route("DeleteQuoteAddendum")]
        public async Task<ActionResult<QuoteAddendum>> DeleteQuoteAddendum([FromBody]long dl)
        {
            try
            {
                if (!(dl > 0))
                {
                    return BadRequest();
                }

                QuoteAddendum s = await _context.QuoteAddendums.FindAsync(dl);

                if (s == null)
                    return NotFound();


                _context.QuoteAddendums.Remove(s);
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = dl.EntCode,
                    ItemType = "QuoteAddendum",
                    ItemID = dl,
                    Change = "DeleteQuoteAddendum - Delete Quote Addendum: " + JsonConvert.SerializeObject(dl)
                };
                await _Logger.InsertActivityLog(log);
                return s;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }
        }

        [HttpGet]
        [Route("GetVendorLookup")]
        public async Task<List<VendorLookup>> GetVendorLookup(string entcode)
        {
            try
            {
                var result = await _context.VendorLookups.Where(i => i.EntCode == entcode).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("InsertQuoteDocLink")]
        public async Task<ActionResult<QuoteViewModel>> InsertSubDocLink([FromBody]DocumentLink quotelink)
        {
            try
            {
                _context.DocumentLinks.Add(quotelink);
                await _context.SaveChangesAsync();
                return CreatedAtAction("getDocLinkbyID", new { id = quotelink.DocLinkID }, quotelink);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }

        }

        [HttpGet]
        [Route("getDocLinkbyID")]
        public async Task<DocumentDb> getDocLinkbyID(long id)
        {
            try
            {
                var doclk = await _context.DocumentLinks.Where(i => i.DocLinkID == id).FirstOrDefaultAsync();
                var docdb = await _context.DocumentDbs.Where(i => i.DocID == doclk.DocID).FirstOrDefaultAsync();

                return docdb;
            }
            catch
            {
                return null;
            }

        }

        [HttpGet]
        [Route("getQuoteAttDocs")]
        public async Task<List<DocumentDb>> GetDocAttach(string type, long id)
        {
            try
            {
                List<DocumentDb> result = new List<DocumentDb>();
                var docids = await _context.DocumentLinks.Where(i => i.ItemType.ToLower() == type.ToLower() && i.ItemNo == id).Select(i => i.DocID).ToListAsync();
                if (docids.Count > 0)
                    result = await _context.DocumentDbs.Where(i => docids.Contains(i.DocID)).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getQuoteDocs")]
        public async Task<List<QuoteDoc>> GetQuoteDocs(long quoteid)
        {
            try
            {
                List<QuoteDoc> result = new List<QuoteDoc>();
                var addendIds= await _context.QuoteAddendums.Where(i => i.QuoteID == quoteid).Select(i => i.AddendumID).ToListAsync();
                foreach (long aid in addendIds)
                {
                    var addenddocs = await GetDocAttach("QuoteAddendum", aid);
                    var adds = Convert2QDoc(addenddocs, "QuoteAddendum", aid);
                    result.AddRange(adds);
                }

                var bidids = await _context.QuoteBids.Where(i => i.QuoteID == quoteid).Select(i => i.BidID).ToListAsync();
                foreach (long bid in bidids)
                {
                    var biddocs = await GetDocAttach("QuoteBid", bid);
                    var adds = Convert2QDoc(biddocs, "QuoteBid", bid);
                    result.AddRange(adds);
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getQuoteDocs2")]
        public async Task<List<DocumentDb>> GetQuoteDocs2(long quoteid)
        {
            try
            {
                List<DocumentDb> result = new List<DocumentDb>();
                var addendIds = await _context.QuoteAddendums.Where(i => i.QuoteID == quoteid).Select(i => i.AddendumID).ToListAsync();
                foreach (long aid in addendIds)
                {
                    var addenddocs = await GetDocAttach("QuoteAddendum", aid);
                    result.AddRange(addenddocs);
                }

                var bidids = await _context.QuoteBids.Where(i => i.QuoteID == quoteid).Select(i => i.BidID).ToListAsync();
                foreach (long bid in bidids)
                {
                    var biddocs = await GetDocAttach("QuoteBid", bid);
                    result.AddRange(biddocs);
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        public List<QuoteDoc> Convert2QDoc (List<DocumentDb> doc, string type, long id)
        {
            try
            {
                List<QuoteDoc> result = new List<QuoteDoc>();
                foreach (DocumentDb d in doc)
                {
                    QuoteDoc qdoc = new QuoteDoc()
                    {
                        Created = d.Created,
                        DocID = d.DocID,
                        FileLength = d.FileLength,
                        DocType = type,
                        CreatedBy = d.CreatedBy,
                        ItemNo = d.ItemNo,
                        ItemType = d.ItemType,
                        LinkID = id,
                        Name = d.Name,
                        ProjectID = d.ProjectID,
                        Type = d.Type
                    };
                    result.Add(qdoc);
                }
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }


        [HttpGet]
        [Route("GetAttachDocs")]
        public async Task<List<DocCards>> GetAttachDocs(string entcode, long id)
        {
            try
            {
                DocLookup lookup = new DocLookup
                {
                    EntCode = entcode,
                    ItemType = "Quote",
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

        [HttpGet]
        [Route("GetProjectBudget")]
        public async Task<decimal> GetProjectBudget(string entcode, long projid)
        {
            try
            {
                var budget =await _context.Budgets.Where(i => i.EntCode == entcode && i.ProjectID == projid).SumAsync(i => i.Total);
                return budget;
            }
            catch
            {
                return 0;
            }
        }

    }
}