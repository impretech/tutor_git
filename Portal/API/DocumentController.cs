using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API {
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class DocumentController : Controller {

        public IHostingEnvironment HostingEnvironment { get; set; }

        private readonly SyvennDBContext _db;

        public DocumentController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext) {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
        }


        public IActionResult Index() {
            return View();
        }

        [HttpGet]
        [Route("GetFile")]
        public async Task<string> GetFile(long id) {
            try {
                var client = new ProjectServiceReference.ProjectsServiceClient();
                var response = await client.SyvennGetDocbyIDAsync("SY", id, "ledwards", "121ijujio12212");
                if (!response.StartsWith("ERR"))
                    return response;
                else
                    return null;
            }
            catch (Exception ex) {
                Console.WriteLine(ex.Message);
                return null;
            }
        }



        [HttpGet]
        [Route("GetDocsByUser")]
        public ActionResult<List<DocumentDb>> GetDocsbyUser(string user, int count) {
            try
            {
                List<DocumentDb> DocList = new List<DocumentDb>();

                var query = _db.DocumentDbs.Where(d => d.CreatedBy.ToLower() == user.ToLower())
                                .OrderByDescending(p => p.Created).Take(count);

                DocList = query.ToList();
                return DocList;
            }
            catch
            {
                return NoContent();
            }
        }

        [HttpGet]
        [Route("GetDocsByProject")]
        public async Task<ActionResult<DataSourceResult>> GetDocsbyProject(long projid, int count) {
            try
            {


                List<DocumentData> DocsList = new List<DocumentData>();
                List<DocumentDb> DocList = new List<DocumentDb>();

                if (count > 0)
                    DocList = await _db.DocumentDbs.Where(d => d.ProjectID == projid).OrderByDescending(p => p.Created).Take(count).ToListAsync();
                else
                    DocList = await _db.DocumentDbs.Where(d => d.ProjectID == projid).OrderByDescending(p => p.Created).ToListAsync();

                foreach (DocumentDb a in DocList)
                {
                    DocumentData ra = new DocumentData
                    {
                        Title = a.Name,
                        DocID = a.DocID,
                        Type = a.Type,
                        ProjectID = a.ProjectID,
                        ItemType = a.ItemType,
                        ItemNo = a.ItemNo,
                        FileLength = a.FileLength
                    };
                    DocsList.Add(ra);
                }

                DataSourceResult result = new DataSourceResult
                {
                    Data = DocsList,
                    Total = DocsList.Count()
                };

                return result;
            }
            catch
            {
                return NoContent();
            }
        }

        [HttpGet]
        [Route("GetDocsByLookup")]
        public async Task<List<DocumentDb>> GetDocsByLookup([FromBody]DocLookup lookup)
        {
            if (ModelState.IsValid && lookup != null)
            {
                try
                {
                    List<long> resDocIds = new List<long>();
                    resDocIds = await _db.DocumentDbs.Where(r => r.ItemType == lookup.ItemType && r.ItemNo == lookup.ItemID).Select(r => r.DocID).ToListAsync();
                    List<long> messageids =await _db.Messages.Where(r => r.ItemType == lookup.ItemType && r.ItemNo == lookup.ItemID).Select(r => r.MessageID).ToListAsync();
                    List<long> messDocs = await _db.DocumentDbs.Where(docs => messageids.Contains(docs.ItemNo) && docs.ItemType.ToUpper() == "EMAIL").Select(r => r.DocID).ToListAsync();
                    List<long> DocIDs = resDocIds.Union(messDocs).ToList();
                    List<DocumentDb> result =await _db.DocumentDbs.Where(d => DocIDs.Contains(d.DocID)).ToListAsync();
                    switch(lookup.ItemType.ToLower())
                    {
                        case "quote":
                            QuoteController qc = new QuoteController(HostingEnvironment, _db);
                            var qdocs = await qc.GetQuoteDocs2(lookup.ItemID);
                            result.AddRange(qdocs);
                            break;
                    }
                    result.Distinct();
                    return  result;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return null;
                }
            }
            else
            {
                return null;
            }

        }

        public async Task<List<long>> GetDocAttach(string type, long id)
        {
            try
            {
                var docids = await _db.DocumentLinks.Where(i => i.ItemType.ToLower() == type.ToLower() && i.ItemNo == id).Select(i => i.DocID).ToListAsync();
                return docids;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                    return null;
            }
        }

        [HttpPost]
        [Route("GetDocCardsByLookup")]
        public async Task<List<DocCards>> GetDocumentCards([FromBody]DocLookup lookup)
        {
            try
            {
                List<DocCards> result = new List<DocCards>();
                List<DocumentDb> docs = new List<DocumentDb>();
                docs = await GetDocsByLookup(lookup);
                foreach (DocumentDb d in docs)
                {
                  
                    var names = d.Name.Split('.');
                    if (names.Count() >= 2)
                    {
                        byte[] file;
                        switch (names[1].ToLower())
                        {
                            case "jpg":
                            case "jpeg":
                            case "png":
                                file = await _db.DocFiles.Where(i => i.DocID == d.DocID).Select(f => f.FileData).FirstOrDefaultAsync();
                                break;
                            case "pdf":
                                var path = $@".\wwwroot\images\filetypepng\pdf.png";
                                file = await System.IO.File.ReadAllBytesAsync(path);
                                break;
                            case "ppt":
                                var pathp = $@".\wwwroot\images\filetypepng\ppt.png";
                                file = await System.IO.File.ReadAllBytesAsync(pathp);
                                break;
                            case "txt":
                                var patht = $@".\wwwroot\images\filetypepng\txt.png";
                                file = await System.IO.File.ReadAllBytesAsync(patht);
                                break;
                            case "zip":
                                var pathz = $@".\wwwroot\images\filetypepng\zip.png";
                                file = await System.IO.File.ReadAllBytesAsync(pathz);
                                break;
                            case "docx":
                            case "doc":
                                var pathe = $@".\wwwroot\images\filetypepng\doc.png";
                                file = await System.IO.File.ReadAllBytesAsync(pathe);
                                break;
                            case "xlsx":
                            case "xls":
                                var pathx = $@".\wwwroot\images\filetypepng\xls.png";
                                file = await System.IO.File.ReadAllBytesAsync(pathx);
                                break;
                            default:
                                var pathd = $@".\wwwroot\images\filetypepng\file.png";
                                file = await System.IO.File.ReadAllBytesAsync(pathd);
                                break;

                        }
                        List<long> atttachs = new List<long>();
                        if (d.ItemType == "Email")
                            atttachs = await GetDocAttach("Email", d.ItemNo);

                        DocCards dc = new DocCards()
                        {
                            Image = file,
                            Created = d.Created,
                            CreatedBy = d.CreatedBy,
                            DocID = d.DocID,
                            FileLength = d.FileLength,
                            ItemNo = d.ItemNo,
                            ItemType = d.ItemType,
                            Name = d.Name,
                            ProjectID = d.ProjectID,
                            Type = d.Type,
                            Attachments = atttachs
                        };
                        result.Add(dc);
                    }
                   

                }
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
    }
}