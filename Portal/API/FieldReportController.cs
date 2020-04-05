using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class FieldReportController : Controller
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;

        public FieldReportController(SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        public async Task<CurrentUser> GetCurrentUser(HttpContext context)
        {
            try
            {
                currentUser = new CurrentUser();
                var principal = context.User.Identity as ClaimsIdentity;
                var login = principal.Claims.SingleOrDefault(c => c.Type == "email")?.Value;
                var name = principal.Claims.SingleOrDefault(c => c.Type == "name")?.Value;
                currentUser.UserEmail = login;
                currentUser.UserName = name;

                var ent = await _db.UserContacts.Where(i => i.UserEmail.ToLower() == login.ToLower()).Select(i => i.EntCode).FirstOrDefaultAsync();
                currentUser.EntCode = ent;

                return currentUser;
            }
            catch (Exception ex)
            {
                Console.Write("GetCurrentUser", ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getFieldReport")]
        public async Task<FieldReportViewModel> GetFieldReport(long frid)
        {
            try
            {
                FieldReportViewModel FRVM = new FieldReportViewModel();
                FRVM.FR = await _db.FieldReports.Where(d => d.FReportID == frid).FirstOrDefaultAsync();
                FRVM.Images = await _db.FRImages.Where(d => d.FReportID == frid).ToListAsync();
                return FRVM;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getFieldReportsbyProj")]
        public async Task<List<FieldReportViewModel>> getFieldReportsbyProj(long projid)
        {
            List<FieldReportViewModel> result = new List<FieldReportViewModel>();
            try
            {
                var frids = await _db.FieldReports.Where(d => d.ProjectID == projid).Select(d => d.FReportID).ToListAsync();
                foreach (long f in frids)
                {
                    FieldReportViewModel FRVM = new FieldReportViewModel();
                    FRVM.FR = await _db.FieldReports.Where(d => d.FReportID == f).FirstOrDefaultAsync();
                    FRVM.Images = await _db.FRImages.Where(d => d.FReportID == f).ToListAsync();
                    result.Add(FRVM);
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
        [Route("GetImageFile")]
        public async Task<byte[]> GetImageFile(long docid)
        {
            try
            {
                byte[] Image = await _db.DocFiles.Where(d => d.DocID == docid).Select(d => d.FileData).FirstOrDefaultAsync();
                return Image;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

    }
}