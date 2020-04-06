using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Portal.Data;
using Portal.Data.Models;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Portal.Models;
using Microsoft.AspNetCore.Hosting;
using Portal.Features.RFIs;
using Portal.Features.Projects;
using System.Net.Mail;
using Portal.Helpers;
using Microsoft.AspNetCore.Builder;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class MessageController : Controller
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;
        private CurrentUser currentUser;

        public MessageController(SyvennDBContext dbContext)
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
        [Route("getUnreadedMessages")]
        public async Task<ActionResult<int>> getUnreadedUMsg()
        {
            int id = 0;
            if (currentUser == null)
            {
                //await new ExceptionMiddleware(new RequestDelegate(new HttpContext().Session)).InvokeAsync(HttpContext);
                if (currentUser == null)
                {
                    currentUser = await GetCurrentUser(HttpContext);
                }
            }
            try
            {
                id = await _db.Messages.Where(d => d.EmailTo.ToLower().Contains(currentUser.UserEmail.ToLower()) && !d.IsRead).CountAsync();

                return id;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }
            

        [HttpGet]
        [Route("getMessageByUser")]
        public async Task<ActionResult<List<Message>>> getMessageByUser(string user, int count, bool cleanseHTML=false)
        {

            List<Message> MessList = new List<Message>();
            if (currentUser == null)
            {
                currentUser = await GetCurrentUser(HttpContext);
            }
            try
            {
                var query = _db.Messages.Where(d => d.EmailTo.ToLower().Contains(currentUser.UserEmail.ToLower()))
                           .OrderByDescending(p => p.DateRec).Take(count);
                MessList = query.ToList();

                if (cleanseHTML) {
                    foreach (var msg in MessList) {
                        if (!string.IsNullOrWhiteSpace(msg.EmailBody)) {
                            msg.EmailBody = Regex.Replace(msg.EmailBody, "<.*?>", string.Empty);
                            //msg.EmailBody = msg.EmailBody.Replace("\r\n", string.Empty);  //Ask lester about removing linefeeds
                        }
                    }
                }

                foreach (Message m in MessList)
                {
                    string[] names = m.UserID.Split(' ');
                    foreach (string n in names)
                    {
                        m.Initial += n.Substring(0, 1);
                    }
                }

                return MessList;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getUnreadMessageByUser")]
        public async Task<ActionResult<List<Message>>> getUnreadMessageByUser(string user, bool cleanseHTML = false)
        {

            List<Message> MessList = new List<Message>();
            if (currentUser == null)
            {
                currentUser = await GetCurrentUser(HttpContext);
            }
            try
            {
                var query = _db.Messages.Where(d => d.EmailTo.ToLower().Contains(currentUser.UserEmail.ToLower()) && !d.IsRead)
                           .OrderByDescending(p => p.DateRec);
                MessList = query.ToList();

                if (cleanseHTML)
                {
                    foreach (var msg in MessList)
                    {
                        if (!string.IsNullOrWhiteSpace(msg.EmailBody))
                        {
                            msg.EmailBody = Regex.Replace(msg.EmailBody, "<.*?>", string.Empty);
                            //msg.EmailBody = msg.EmailBody.Replace("\r\n", string.Empty);  //Ask lester about removing linefeeds
                        }
                    }
                }

                foreach (Message m in MessList)
                {
                    string[] names = m.UserID.Split(' ');
                    foreach (string n in names)
                    {
                        m.Initial += n.Substring(0, 1);
                    }
                }

                return MessList;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getMessageByID")]
        public ActionResult<Message> getMessageByID(int messid)
        {
            Message message = new Message();
            try
            {
                message = _db.Messages.Where(d => d.MessageID == messid)
                           .OrderByDescending(p => p.DateRec).FirstOrDefault();

                    string[] names = message.UserID.Split(' ');
                    foreach (string n in names)
                    {
                        message.Initial += n.Substring(0, 1);
                    }
                return message;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getMessagesByItemAll")]
        public async Task<ActionResult<Message>> getAllMessages(string item,long itemNo,long projectId)
        {
            MessagingViewModel mod = new MessagingViewModel();
            var str = string.Empty;
            if (item == "RFI")
            {
                mod = await new RFIsController(null, _db).getData(projectId, itemNo);
                str = "~/Features/RFIs/_message.cshtml";
            }
            else
            {
                mod = await new ProjectsController(_db).getData(projectId);
                str = "~/Features/Projects/_message.cshtml";
            }
            return PartialView(str, mod);
        }

        [HttpGet]
        [Route("getMessageByItem")]
        public List<Message> getMessageByItem(string item, long itemno, int count, bool cleanseHTML = false)
        {
            // int test = getMessageTotByItem(item, itemno);
            count = 200;
            List<Message> MessList = new List<Message>();
            try
            {
                if (item.ToLower() == "rfi")
                    count = 200;  //20;

                if (item == "Project")
                {
                    var query = _db.Messages.Where(d => d.ProjectID == itemno)
                               .Select(x => new Message
                               {
                                   ParentId = x.ReplyMessageID == 0 ? x.MessageID : x.ReplyMessageID,
                                   DateRec = x.DateRec,
                                   SchedID = x.SchedID,
                                   DueDate = x.DueDate,
                                   EmailBcc = x.EmailBcc,
                                   Initial = x.Initial,
                                   EmailBody = x.EmailBody,
                                   EmailFrom = x.EmailFrom,
                                   EmailSubject = x.EmailSubject,
                                   EmailCC = x.EmailCC,
                                   EmailTo = x.EmailTo,
                                   FromCompany = x.FromCompany,
                                   IsDismissed = x.IsDismissed,
                                   ItemNo = x.ItemNo,
                                   ItemType = x.ItemType,
                                   ReplyMessageID = x.ReplyMessageID,
                                   MessageID = x.MessageID,
                                   OnSched = x.OnSched,
                                   ProjectID = x.ProjectID,
                                   Status = x.Status,
                                   ToCompany = x.ToCompany,
                                   Type = x.Type,
                                   UserID = x.UserID,
                                   IsRead =x.IsRead,
                                   ActionType = x.ActionType
                               })
                               .OrderByDescending(p => p.ParentId).ThenBy(x => x.ReplyMessageID).ThenByDescending(x => x.DateRec).Take(count);
                    MessList = query.ToList();
                }
                else
                {
                    var query = _db.Messages.Where(d => d.ItemType.ToUpper() == item.ToUpper() && d.ItemNo == itemno)
                        .Select(x => new Message
                        {
                            ParentId = x.ReplyMessageID == 0 ? x.MessageID : x.ReplyMessageID,
                            DateRec = x.DateRec,
                            SchedID = x.SchedID,
                            DueDate = x.DueDate,
                            EmailBcc = x.EmailBcc,
                            EmailBody = x.EmailBody,
                            EmailFrom = x.EmailFrom,
                            EmailSubject = x.EmailSubject,
                            EmailCC = x.EmailCC,
                            EmailTo = x.EmailTo,
                            Initial = x.Initial,
                            FromCompany = x.FromCompany,
                            IsDismissed = x.IsDismissed,
                            ItemNo = x.ItemNo,
                            ItemType = x.ItemType,
                            ReplyMessageID = x.ReplyMessageID,
                            MessageID = x.MessageID,
                            OnSched = x.OnSched,
                            ProjectID = x.ProjectID,
                            Status = x.Status,
                            ToCompany = x.ToCompany,
                            Type = x.Type,
                            UserID = x.UserID,
                            IsRead = x.IsRead,
                            ActionType = x.ActionType
                        })
                               .OrderByDescending(p => p.ParentId).ThenBy(x=>x.ReplyMessageID).ThenByDescending(x=>x.DateRec).Take(count);
                    MessList = query.ToList();
                }

                if (cleanseHTML)
                {
                    foreach (var msg in MessList)
                    {
                        if (!string.IsNullOrWhiteSpace(msg.EmailBody))
                        {
                            msg.EmailBody = Regex.Replace(msg.EmailBody, "<.*?>", string.Empty);
                            //msg.EmailBody = msg.EmailBody.Replace("\r\n", string.Empty);  //Ask lester about removing linefeeds
                        }
                    }
                }
                foreach (Message m in MessList)
                {
                    string[] names = m.UserID.Split(' ');
                    if (names.Length >= 2)
                        foreach (string n in names)
                        {
                            m.Initial += n.Substring(0, 1);
                        }
                    else
                    {
                        m.Initial = m.EmailFrom.Substring(0, 2);
                    }
                
               

                }
                return MessList;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getMessageTotByItem")]
        public int getMessageTotByItem(string item, long itemno)
        {
            try
            {
                int tot = _db.Messages.Where(d => d.ItemType == item && d.ItemNo == itemno).Count();
                return tot;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return 0;
            }
        }

        [HttpGet]
        [Route("getMessageNotifyCountbyEmail")]
        public async Task<int> getMessageNotifyCountbyEmail(string email)
        {
            try
            {
                if(email=="undefined" || currentUser==null)
                {
                    currentUser = await GetCurrentUser(HttpContext);
                    email = currentUser.UserEmail;
                }
                int tot = _db.Messages.Where(d => d.EmailTo.ToLower() == email.ToLower() && d.IsRead == false).Count();
                return tot;
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                return 0;
            }
        }

        [HttpPost]
        [Route("InsertMessage")]
        public async Task<ActionResult<Message>> InsertMessage([FromBody]Message mess)
        {
            try
            {
                MessagingViewModel mod = new MessagingViewModel();
                if (currentUser == null)
                {
                    currentUser = await GetCurrentUser(HttpContext);
                }
                mess.DateRec = mess.DateRec;
                mess.DueDate = mess.DueDate;
                mess.EmailFrom = currentUser.UserEmail;

                if (mess.list != null)
                {
                    mess.HasAttachments = mess.list.Count > 0 ? true : false;
                }

                if (mess.Type == null)
                    mess.Type = "Email";

                if (mess.ReplyMessageID > 0)
                    mess.IsRead = true;

                mess.UserID = currentUser.UserName;
                _db.Messages.Add(mess);
                await _db.SaveChangesAsync();

                if (mess.ReplyMessageID > 0)
                {
                    var parentmess = await _db.Messages.Where(d => d.MessageID == mess.ReplyMessageID).FirstOrDefaultAsync();
                    if (parentmess != null)
                    {
                        parentmess.IsRead = true;
                        _db.Messages.Update(parentmess);
                        await _db.SaveChangesAsync();
                    }
                }
                if (mess.list != null)
                {
                    foreach (var tmp in mess.list)
                    {
                        /*var doc = await _db.DocumentDbs.FindAsync(tmp);
                        doc.ItemNo = mess.MessageID;

                        _db.Entry(doc).State = EntityState.Modified;*/

                        var docLinks = await _db.DocumentLinks.Where(x => x.DocID == tmp).FirstOrDefaultAsync();
                        docLinks.ItemNo = mess.MessageID;

                        _db.Entry(docLinks).State = EntityState.Modified;

                    }
                }
                await _db.SaveChangesAsync();
                /* if (mess.EmailTo.Contains('@'))
                 {
                     string subject = string.Empty;
                     if (mess.EmailSubject != null && mess.EmailSubject.Length >= 10)
                         subject = mess.EmailSubject;
                     else
                         subject = "Syvenn Message: " + mess.ItemType + ": " + mess.ItemNo + " from: " + mess.UserID;

                     string body = mess.EmailBody + "\r\n" + "\r\n";
                    body = body + "------ Please do not remove this unique tracking ID -------" + Environment.NewLine;
                    body = body + "<<" + mess.ItemType.ToUpper() + ":" + mess.ItemNo + "-" + mess.MessageID + ">>";
                     bool result = SendMail(subject, body, mess.EmailTo, mess.EmailFrom, true);
                 }*/
                var str = string.Empty;


                if (mess.Type == "Action" && mess.IsRead == false && mess.ReplyMessageID == 0)
                {
                    var proj =await _db.Project.Where(d => d.ProjectId == mess.ProjectID).FirstOrDefaultAsync();
                    var emailid = await _db.Emails.Where(d => d.EmailAddress.ToLower() == mess.EmailTo.ToLower()).Select(d => d.EmailID).FirstAsync();
                    var contactid = await _db.ContactLinks.Where(d => d.ItemType == "Email" && d.ItemID == emailid).Select(d => d.ContactID).FirstAsync();
                    proj.Holder = contactid;
                    _db.Update(proj);
                    await _db.SaveChangesAsync();
                }

                if (mess.ItemType=="RFI")
                {
                    mod = await new RFIsController(null, _db).getData(mess.ProjectID,mess.ItemNo);
                    str = "~/Features/RFIs/_message.cshtml";
                }
                else
                {
                    mod = await new ProjectsController(_db).getData(mess.ProjectID);
                    str = "~/Features/Projects/_message.cshtml";
                }
                return PartialView(str,mod);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpPut]
        [Route("UpdateMessage")]
        public async Task<ActionResult<long>> UpdateMesage([FromBody]Message updmess)
        {
            try
            {
                if (!(updmess.MessageID > 0))
                {
                    return BadRequest();
                }
                var Mess = await _db.Messages.FindAsync(updmess.MessageID);
                if (Mess == null)
                    return NotFound();
                Mess.DateRec = updmess.DateRec;
                Mess.DueDate = updmess.DueDate;
                Mess.EmailCC = updmess.EmailCC;
                Mess.EmailBody = updmess.EmailBody;
                Mess.EmailSubject = updmess.EmailSubject;
                if (!updmess.EmailTo.Contains('@'))
                {
                    var email = await _db.EmailLookups.Where(d => d.ShowAsName.ToLower() == updmess.EmailTo.ToLower() || d.UserName.ToLower() == updmess.EmailTo.ToLower()).FirstOrDefaultAsync();
                    updmess.EmailTo = email.EmailAddress;
                }
                Mess.EmailTo = updmess.EmailTo;
                Mess.ItemType = updmess.ItemType;
                Mess.ItemNo = updmess.ItemNo;
                Mess.ProjectID = updmess.ProjectID;
                Mess.ReplyMessageID = updmess.ReplyMessageID;
                Mess.SchedID = updmess.SchedID;
                Mess.Type = Mess.Type;
                Mess.IsRead = updmess.IsRead;
                _db.Messages.Update(Mess);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = Mess.UserID,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = Mess.EntCode,
                    ItemType = "UpdateMesage",
                    ItemID = Mess.MessageID,
                    Change = "UpdateMesage - Update Message: " + JsonConvert.SerializeObject(Mess)
                };
                await _Logger.InsertActivityLog(log);
                return Mess.MessageID;
            }
            catch (Exception ex)
            {
                ActivityLog log = new ActivityLog
                {
                    LogUser = updmess.UserID,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    // EntCode = Mess.EntCode,
                    ItemType = "UpdateMesage",
                    ItemID = updmess.MessageID,
                    Change = "Error UpdateMesage - Update Message: " + ex.Message + "   Input: " + JsonConvert.SerializeObject(updmess)
                };
                return null;
            }
        }

        [HttpPost]
        [Route("InsertMessageDocLink")]
        public async Task<ActionResult<Message>> InsertMessageDocLink([FromBody]DocumentLink messlink)
        {
            try
            {
                messlink.ItemType = "Message";
                _db.DocumentLinks.Add(messlink);
                await _db.SaveChangesAsync();
                return CreatedAtAction("getDocLinkbyID", new { id = messlink.DocLinkID }, messlink);
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
                var doclk = await _db.DocumentLinks.Where(i => i.DocLinkID == id).FirstOrDefaultAsync();
                var docdb = await _db.DocumentDbs.Where(i => i.DocID == doclk.DocID).FirstOrDefaultAsync();

                return docdb;
            }
            catch
            {
                return null;
            }

        }

        [HttpGet]
        [Route("getMessAttDocs")]
        public async Task<List<DocumentDb>> GetDocAttach(string type, long id)
        {
            try
            {
                List<DocumentDb> result = new List<DocumentDb>();
                var docids = await _db.DocumentLinks.Where(i => i.ItemType.ToLower() == type.ToLower() && i.ItemNo == id).Select(i => i.DocID).ToListAsync();
                if (docids.Count > 0)
                    result = await _db.DocumentDbs.Where(i => docids.Contains(i.DocID)).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("getMessageDoc")]
        public List<DocumentDb> getMessageDoc(long messid,string type)
        {
            try
            {
                List<DocumentDb> result = new List<DocumentDb>();
                var docids = _db.DocumentLinks.Where(i => i.ItemType.ToLower() == "message" && i.ItemNo == messid).Select(i => i.DocID).ToList();
                if (docids.Count > 0)
                    result = _db.DocumentDbs.Where(i => docids.Contains(i.DocID) && i.ItemType.ToLower()==type.ToLower().ToString()).ToList();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        public List<DocumentDb> GetDocAttachPrivate(string type, long id)
        {
            try
            {
                List<DocumentDb> result = new List<DocumentDb>();
                var docids = _db.DocumentLinks.Where(i => i.ItemType.ToLower() == type.ToLower() && i.ItemNo == id).Select(i => i.DocID).ToList();
                if (docids.Count > 0)
                    result = _db.DocumentDbs.Where(i => docids.Contains(i.DocID)).ToList();
                return result;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        private static bool SendMail(string subject, string body, string email, string sender, bool AddBCC)
        {
            try
            {
                System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage();
                string[] Mail = email.Split(';');

                foreach (string e in Mail)
                {
                    message.To.Add(e);
                }
                message.Subject = subject;
                message.Body = body;
                message.From = new MailAddress(sender);   //"DocPortal@prosysusa.com");

                if (AddBCC)
                    message.Bcc.Add("ledwards@prosysusa.com");

                SmtpClient smtpClient = new SmtpClient("prosysusa-com.outbound1-us.mailanyone.net");
                smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtpClient.Send(message);
                smtpClient = null;
                message.Dispose();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write("SendMail", ex.Message);
                // this.WriteToFile("SendMail Error:  " + ex.Message + ex.StackTrace);
                return false;
            }

        }



    }
}