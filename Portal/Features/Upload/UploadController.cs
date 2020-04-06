using System;
using System.Collections.Generic;

using System.IO;
using System.Linq;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Mvc;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using System.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using Portal.API;
using Newtonsoft.Json;
using System.Security.Claims;

namespace Portal.Features.Upload {
    [Authorize]
    [Route("upload")]
    public class UploadController : Controller {
        public IHostingEnvironment HostingEnvironment { get; set; }

        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;

        public UploadController(IHostingEnvironment hostingEnvironment, SyvennDBContext dbContext) {
            HostingEnvironment = hostingEnvironment;
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        public ActionResult Index() {
            return View();
        }

        [Route("FilesRead")]
        public ActionResult FilesRead([DataSourceRequest] DataSourceRequest request) {

            var userFiles = _db.DocumentDbs.Select(f => new DocumentData() {
                DocID = f.DocID,
                Title = f.Name,
                ProjectID = f.ProjectID,
                Type = f.Type
            });

            return Json(userFiles.ToDataSourceResult(request));
        }

        [HttpPost]
        [Route("FilesDestroy")]
        public ActionResult FilesDestroy([DataSourceRequest] DataSourceRequest request, DocumentDb file) {
            if (file != null) {
                _db.DocumentDbs.Remove(_db.DocumentDbs.FirstOrDefault(f => f.DocID == file.DocID));
                _db.SaveChanges();
            }

            return Json(new[] { file }.ToDataSourceResult(request, ModelState));
        }

        public CurrentUser GetCurrentUser(HttpContext context)
        {
            try
            {
                currentUser = new CurrentUser();
                var principal = context.User.Identity as ClaimsIdentity;
                var login = principal.Claims.SingleOrDefault(c => c.Type == "email")?.Value;
                var name = principal.Claims.SingleOrDefault(c => c.Type == "name")?.Value;
                currentUser.UserEmail = login;
                currentUser.UserName = name;

                return currentUser;
            }
            catch (Exception ex)
            {
                Console.Write("GetCurrentUser", ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetCurrentUser")]
        public CurrentUser CheckCurrentUser()
        {
            try
            {
                if (currentUser == null)
                {
                    var user = GetCurrentUser(HttpContext);
                    return user;
                }
                return currentUser;
            }
            catch
            {
                return null;
            }
        }

        [Route("SaveAsync")]
        public async Task<ActionResult> SaveAsync(UploadData D, IEnumerable<IFormFile> files) {
            List<long> result = new List<long>();
            if (files != null) {
             
                try {
                    currentUser = CheckCurrentUser();
                    foreach (var file in files) {
                        MemoryStream target = new MemoryStream();
                        await file.CopyToAsync(target);
                        DocumentDb newdoc = new DocumentDb()
                        {
                            Name = Path.GetFileName(file.FileName),
                            Type = file.ContentType,
                            ProjectID = D.ProjectID,
                            Created = DateTime.Now,
                            CreatedBy = currentUser.UserEmail,                  
                            ItemType = D.ItemType,                       
                            ItemNo = D.ItemNo,                              
                            FileLength = target.Length
                        };

                        _db.DocumentDbs.Add(newdoc);
                        _db.SaveChanges();

                        DocFile newfile = new DocFile
                        {
                            DocID = newdoc.DocID,
                            FileData = target.ToArray()
                             
                        };
                        _db.DocFiles.Add(newfile);
                        _db.SaveChanges();
                        result.Add(newdoc.DocID);
                        
                   
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = currentUser.UserEmail,   
                            LogDate = DateTime.Now,
                            EntCode = D.EntCode,
                            ItemType = "DOCUMENT",
                            ItemID = newfile.DocID,
                            Change = "SaveFile - Doc : " + JsonConvert.SerializeObject(newdoc)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                  
                }
                catch (Exception ex) {
                    Console.Write("Upload Save Error: " + ex.Message);
                    return null;
                }
            }
            // Return an empty string to signify success
            return this.Json(result);
        }

        [Route("Download")]
        public ActionResult Download(long id)
        {
            var DocInfo = _db.DocumentDbs.FirstOrDefault(f => f.DocID == id);
            var file = _db.DocFiles.FirstOrDefault(f => f.DocID == id);
            return File(file.FileData.ToArray(), "application/octet-stream", DocInfo.Name);
        }

        [Route("GetExtensionFromContentType")]
        public string GetExtensionFromContentType(string conttype)
        {
            string[] parts = conttype.Split('/');
            return parts[parts.Length - 1];
        }

     
    }
}

