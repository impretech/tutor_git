using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using Portal.API;
using Portal.Features.Upload;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;


namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;

        public EmailController(SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        [HttpGet]
        [Route("GetEmailbyID")]
        public ActionResult<Email> GetEmailByID(long id)
        {
            try
            {
                var result =  _db.Emails.Where(i => i.EmailID == id).FirstOrDefault();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetEmailsbyContactID")]
        public async Task<ActionResult<DataSourceResult>> GetEmailsbyContactID(long c)
        {
            try
            {
                var EmailIds = await _db.ContactLinks.Where(i => i.ContactID == c && i.ItemType.ToUpper() == "EMAIL").Select(i => i.ItemID).ToListAsync();
                var Emails = await _db.Emails.Where(i => EmailIds.Contains(i.EmailID)).ToListAsync();
                List<EmailViewModel> evm = new List<EmailViewModel>();
                foreach (Email e in Emails)
                {
                    EmailViewModel newe = new EmailViewModel()
                    {
                        ParentID = c,
                        ParentType = "CONTACT",
                        EmailID = e.EmailID,
                        EmailAddress = e.EmailAddress,
                        isPrimary = e.isPrimary,
                        Label = e.Label
                    };
                    evm.Add(newe);
                }

                DataSourceResult result = new DataSourceResult {
                    Data = evm,
                    Total = evm.Count()
                };


                return result;      //Emails;
            }
            catch
            {
                return null;
            }
        }

      [HttpPost]
      [Route("Update")]
      public async Task<ActionResult> UpdateEmailVM(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<EmailViewModel> e)
        {
            if (e != null && ModelState.IsValid)
            {
                try
                {
                    foreach(var email in e) {
                        Email update = new Email
                        {
                            EmailID = email.EmailID,
                            EmailAddress = email.EmailAddress,
                            isPrimary = email.isPrimary,
                            Label = email.Label
                        };
                        var result = _db.Emails.Update(update);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "EMAIL",
                            ItemID = email.EmailID,
                            Change = "UpdateEmailVM: " + JsonConvert.SerializeObject(e)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                    return Ok(e.ToDataSourceResult(request, ModelState));
                }
                catch
                {
                    return BadRequest();
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("Create")]
        public async Task<ActionResult> CreateEmailVM(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<EmailViewModel> emails)
        {
            if (emails != null && ModelState.IsValid)
            {
                try
                {
                    foreach (var e in emails)
                    {
                        Email update = new Email
                        {
                            // update.EmailID = e.EmailID;
                            EmailAddress = e.EmailAddress,
                            isPrimary = e.isPrimary,
                            Label = e.Label
                        };
                        var result = _db.Emails.Add(update);
                        await _db.SaveChangesAsync();
                        e.EmailID = update.EmailID;

                        switch (e.ParentType)
                        {
                            case "CONTACT":
                                ContactLink cl = new ContactLink() { ContactID = e.ParentID, ItemID = update.EmailID, ItemType = "EMAIL" };
                                await _db.ContactLinks.AddAsync(cl);
                                break;
                            case "TBD":  //for later use
                                break;
                        }
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "EMAIL",
                            ItemID = e.EmailID,
                            Change = "CeateEmailVM: " + JsonConvert.SerializeObject(e)
                        };
                        await _Logger.InsertActivityLog(log);
                    
                    }

                    return Ok(emails.ToDataSourceResult(request, ModelState));
                }
                catch
                {
                    return BadRequest();
                }
            }

            return BadRequest();     
         
        }

        [HttpPost]
      [Route("UpdateEmail")]
      public async Task<ActionResult<bool>> UpdateEmail(Email e)
        {
            try
            {
                var res =  _db.Emails.Update(e);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    //  EntCode = entcode,
                    ItemType = "EMAIL",
                    ItemID = e.EmailID,
                    Change = "UpdateEmail: " + JsonConvert.SerializeObject(e)
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch
            {
                return false;
            }

        }
       
        [HttpPost]
        [Route("InsertEmail")]
        public async Task<ActionResult<long>> InsertEmail(Email e)
        {
            try
            {
                var res = await _db.Emails.AddAsync(e);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    //  EntCode = entcode,
                    ItemType = "EMAIL",
                    ItemID = e.EmailID,
                    Change = "InsertEmail: " + JsonConvert.SerializeObject(e)
                };
                await _Logger.InsertActivityLog(log);
                return e.EmailID;
            }
            catch
            {
                return 0;
            }
        }

        [HttpPost]
        [Route("DeleteEmail")]
        public async Task<ActionResult<bool>> DeleteEmail(Email e)
        {
            try
            {
                var res = _db.Emails.Remove(e);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    //  EntCode = entcode,
                    ItemType = "EMAIL",
                    ItemID = e.EmailID,
                    Change = "DeleteEmail: " + JsonConvert.SerializeObject(e)
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch
            {
                return false;
            }
        }


    }
}