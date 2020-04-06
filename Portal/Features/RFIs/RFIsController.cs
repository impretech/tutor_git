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
using Portal.Models.Extensions;

namespace Portal.Features.RFIs
{
    [Authorize]
    [Route("rfis")]
    public class RFIsController : Controller
    {
        private readonly SyvennDBContext _db;
        public IHostingEnvironment HostingEnvironment { get; set; }

        public RFIsController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext)
        {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public ActionResult Index() ///(string ent)
        {
            var rfis =   _db.RFILookups.Where(p => p.EntCode == "PRO1").ToList();
            return View("Index", rfis);
        }

        [Route("new")]
        [HttpGet]
        public IActionResult New()//(string ent)
        {
            var rfiVM = new RFIViewModel
            {
                rFI = new Data.Models.RFI(),
                Responses = new List<RFIResponse>(),
                Notes = new List<Note>(),
                Attachments = new List<RFIDocs>(),
                Lookups = _db.Lookups.Where(p => (p.Module == "RFI") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToList(),
                MessagingData = null
            };
            
            return View("AddEdit", rfiVM);
        }

        public async Task<MessagingViewModel> getData(long id,long itemId) //, string ent)
        {
            try
            {
                var attachments = new List<RFIDocs>();

                var rFI = _db.RFIs.Where(p => p.RFI_ID == id).FirstOrDefault();

                var teams = _db.ProjectTeamDetails.Where(p => p.ProjectID == id);
                var messageTypes = _db.Lookups.Where(x => x.Prompt == "MessType" && x.Module == "RFI").ToList(); //_db.MessageTypes.ToList();
                var todoTasks = _db.Tasks.Where(t => t.ProjectID == id).ToList();
                var projectMessages = _db.ProjectMessages.Where(m => m.ProjectID == id).ToList();
                var messages = new MessageController(_db).getMessageByItem("RFI", itemId, 10, false);// _db.Messages.Where(x => x.ProjectID == rfivm.rFI.ProjectID).ToList();

                foreach (var pn in messages)
                {
                    pn.DocumentDb = await new MessageController(_db).GetDocAttach("message", pn.MessageID);
                }

                MessagingViewModel MessagingData = new MessagingViewModel()
                {
                    MessagingTypes = messageTypes.Select(t => new LookupModel()
                    {
                        Id = t.LookupID,
                        Name = t.Value
                    }).ToList(),

                    ProjectTeamEmails = teams.Select(t => new newLookupModel()
                    {
                        Id = t.ContactID,
                        param = t.EmailAddress,
                        Name = $"{t.FirstName} {t.LastName}"
                    }).ToList(),

                    Tasks = todoTasks.Select(t => new LookupModel()
                    {
                        Id = t.Id,
                        Name = t.Text
                    }).ToList(),

                    ProjectMessages = messages.Select(m => m.ToMessageViewModel()).ToList(),
                    projectId = id,
                    rfiId = id
                };

                //DocumentController docon = new DocumentController(HostingEnvironment, _db);
                //DocLookup docLookup = new DocLookup()
                //{
                //    ItemType = "RFI",
                //    ItemID = id,
                //    EntCode = "PRO1"   //*********  Pass in Actual Entity Code ****************************
                //};
                //rfivm.Attachments = await docon.GetDocumentCards(docLookup);

                return MessagingData;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> EditAsync(long id) //, string ent)
        {
            try
            {
                var attachments = new List<RFIDocs>();
                var docs = _db.RFIDocLinks.Where(p => p.RFI_ID == id).ToList();

                foreach (RFIDocLink r in docs)
                {
                    DocumentDb docdb =  _db.DocumentDbs.Where(i => i.DocID == r.DocID).FirstOrDefault();
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
                    attachments.Add(doc);
                }

                RFIViewModel rfivm = new RFIViewModel
                {
                    rFI = _db.RFIs.Where(p => p.RFI_ID == id).FirstOrDefault(),
                    Lookups = _db.Lookups.Where(p => (p.Module == "RFI") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToList(),
                    Responses = _db.RFIResponses.Where(p => p.RFI_ID == id).OrderByDescending(p => p.RFI_ID).ToList(),
                    Notes = _db.Notes.Where(i => i.ItemType == "RFI" && i.ItemNo == id).ToList(),
                    Attachments = attachments
                };
                var teams = _db.ProjectTeamDetails.Where(p => p.ProjectID == rfivm.rFI.ProjectID);
                var messageTypes = _db.Lookups.Where(x => x.Prompt == "MessType" && x.Module == "RFI").ToList(); //_db.MessageTypes.ToList();
                var todoTasks = _db.Tasks.Where(t => t.ProjectID == rfivm.rFI.ProjectID).ToList();
                var projectMessages = _db.ProjectMessages.Where(m => m.ProjectID == rfivm.rFI.ProjectID).ToList();
                var messages = new MessageController(_db).getMessageByItem("RFI", id, 10, false);// _db.Messages.Where(x => x.ProjectID == rfivm.rFI.ProjectID).ToList();

                foreach(var pn in messages)
                {
                    pn.DocumentDb = await new MessageController(_db).GetDocAttach("message", pn.MessageID);
                    pn.DocumentDb.AddRange(await new MessageController(_db).GetDocAttach("RFI", pn.MessageID));
                }

                rfivm.MessagingData = new MessagingViewModel()
                {
                    MessagingTypes = messageTypes.Select(t => new LookupModel()
                    {
                        Id = t.LookupID,
                        Name = t.Value
                    }).ToList(),

                    ProjectTeamEmails = teams.Select(t => new newLookupModel()
                    {
                        Id = t.ContactID,
                        param = t.EmailAddress,
                        Name = $"{t.FirstName} {t.LastName}"
                    }).ToList(),

                    Tasks = todoTasks.Select(t => new LookupModel()
                    {
                        Id = t.Id,
                        Name = t.Text
                    }).ToList(),

                    ProjectMessages = messages.Select(m => m.ToMessageViewModel()).ToList(),
                    projectId = rfivm.rFI.ProjectID,
                    rfiId = id
                };

                //DocumentController docon = new DocumentController(HostingEnvironment, _db);
                //DocLookup docLookup = new DocLookup()
                //{
                //    ItemType = "RFI",
                //    ItemID = id,
                //    EntCode = "PRO1"   //*********  Pass in Actual Entity Code ****************************
                //};
                //rfivm.Attachments = await docon.GetDocumentCards(docLookup);

                return View("AddEdit", rfivm);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

    }
}