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
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;

        public ContactController(SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        [HttpGet]
        [Route("GetContactbyID")]
        public async Task<ActionResult<ContactViewModel>> GetContactbyID(long id)
        {
            try
            {
                ContactViewModel cvm = new ContactViewModel();
                var contact = await _db.Contacts.Where(i => i.ContactID == id).FirstOrDefaultAsync();
                cvm = await GetContactDetails(contact);
                return cvm;
            }
            catch
            {
                return null;
            }
        }

        public async Task<ContactViewModel> GetContactVMbyID(long id)
        {
            try
            {
                ContactViewModel cvm = new ContactViewModel();
                var contact = await _db.Contacts.Where(i => i.ContactID == id).FirstOrDefaultAsync();
                cvm = await GetContactDetails(contact);
                return cvm;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetContactbyEnt")]
        public async Task<ActionResult<List<ContactViewModel>>> GetContactbyID(string entcode)
        {
            try
            {
                List<ContactViewModel> result = new List<ContactViewModel>();
                var contacts = await _db.Contacts.Where(i => i.EntCode == entcode).ToListAsync();
                foreach (Contact c in contacts)
                {
                    ContactViewModel cvm = new ContactViewModel();
                    cvm = await GetContactDetails(c);
                    result.Add(cvm);
                }
              
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("InsertContact")]
        public async Task<bool> InsertContact([FromBody] ContactViewModel C)
        {
            try
            {
                var r = _db.Contacts.Add(C.contact);
                await _db.SaveChangesAsync();

                bool result = await UpdateContactDetails(C);
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    //  EntCode = entcode,
                    ItemType = "CONTACT",
                    ItemID = C.contact.ContactID,
                    Change = "InsertContact - Contact : " + JsonConvert.SerializeObject(C.contact)
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<ActionResult<ContactViewModel>> GetContactID(long id)
        {
            try
            {
                ContactViewModel cvm = new ContactViewModel();
                var contact = await _db.Contacts.Where(i => i.ContactID == id).FirstOrDefaultAsync();
                cvm = await GetContactDetails(contact);
                return cvm;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("UpdateOnlyContact")]
        public async Task<long> UpdateOnlyContact([FromBody] Contact C)
        {
            try
            {
                var r = _db.Contacts.Update(C);
                await _db.SaveChangesAsync();
                return C.ContactID;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<bool> UpdateContact(ContactViewModel C)
        {
            try
            {
                var r =  _db.Contacts.Update(C.contact);
                await _db.SaveChangesAsync();
                bool result = await UpdateContactDetails(C);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateContactDetails(ContactViewModel cm)
        {
            try
            {

                foreach (Location L in cm.Locations)
                {
                    if (L.LocationID == 0)
                    {
                        var r = _db.Locations.Add(L);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "LOCATION",
                            ItemID = L.LocationID,
                            Change = "InsertContactLocation - Location : " + JsonConvert.SerializeObject(L)
                        };
                        await _Logger.InsertActivityLog(log);
                        var cl = await InsertLinkedItem(cm.contact.ContactID, "LOCATION", L.LocationID, cm.contact.EntCode);
                    }
                    else
                    {
                        var r = _db.Locations.Update(L);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "LOCATION",
                            ItemID = L.LocationID,
                            Change = "UpdateContactLocation - Location : " + JsonConvert.SerializeObject(L)
                        };
                    }
                }

                foreach (Phone P in cm.PhoneNumbers)
                {
                    if (P.PhoneID == 0)
                    {
                        var r = _db.Phones.Add(P);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "PHONE",
                            ItemID = P.PhoneID,
                            Change = "InsertContactPhone - Phone : " + JsonConvert.SerializeObject(P)
                        };
                        await _Logger.InsertActivityLog(log);
                        var cl = InsertLinkedItem(cm.contact.ContactID, "Phone", P.PhoneID, cm.contact.EntCode);
                    }
                    else
                    {
                        var r = _db.Phones.Update(P);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "PHONE",
                            ItemID = P.PhoneID,
                            Change = "UpdateContactPhone - Phone : " + JsonConvert.SerializeObject(P)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                }

                foreach (Email P in cm.Emails)
                {
                    if (P.EmailID == 0)
                    {
                        var r = _db.Emails.Add(P);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "EMAIL",
                            ItemID = P.EmailID,
                            Change = "InsertContactEmail: " + JsonConvert.SerializeObject(P)
                        };
                        await _Logger.InsertActivityLog(log);
                        var cl = InsertLinkedItem(cm.contact.ContactID, "Email", P.EmailID, cm.contact.EntCode);
                    }
                    else
                    {
                        var r = _db.Emails.Update(P);
                        await _db.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "EMAIL",
                            ItemID = P.EmailID,
                            Change = "UpdateContactEmail: " + JsonConvert.SerializeObject(P)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<long> InsertLinkedItem(long vendorid, string type, long itemid, string entcode)
        {
            try
            {
                ContactLink newlink = new ContactLink
                {
                    ContactID = vendorid,
                    ItemType = type.ToUpper(),
                    ItemID = itemid,
                
                };
                var result = _db.ContactLinks.Add(newlink);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "CONTACTLINK",
                    ItemID = newlink.ContactLinkID,
                    Change = "InsertContactLink- Link : " + JsonConvert.SerializeObject(newlink)
                };
                await _Logger.InsertActivityLog(log);
                return newlink.ContactLinkID;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<ContactViewModel> GetContactDetails(Contact c)
        {
            try
            {
                ContactViewModel cm = new ContactViewModel { contact = c };
                List<long> LocationIds = GetContactLinkedItems(c.ContactID, "LOCATION");
                cm.Locations = await _db.Locations.Where(e => LocationIds.Contains(e.LocationID)).ToListAsync();
                var PhoneIds = GetContactLinkedItems(c.ContactID, "PHONE");
                cm.PhoneNumbers = await _db.Phones.Where(e => PhoneIds.Contains(e.PhoneID)).ToListAsync();
                var EmailIds = GetContactLinkedItems(c.ContactID, "EMAIL");
                cm.ContactRoles = new List<ContactRole>();
                cm.ContactRoles =  await _db.ContactRoles.Where(e => e.ContactID == c.ContactID).ToListAsync();
                cm.Emails = new List<EmailViewModel>();
                var emails= await _db.Emails.Where(e => EmailIds.Contains(e.EmailID)).ToListAsync();
                foreach (Email e in emails)
                {
                    EmailViewModel evm = new EmailViewModel
                    {
                        ParentID = c.ContactID,
                        ParentType = "CONTACT",
                        EmailID = e.EmailID,
                        EmailAddress = e.EmailAddress,
                        Label = e.Label,
                        isPrimary = e.isPrimary
                    };
                    cm.Emails.Add(evm);
                }
                cm.Mode = "Update";
                return cm;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        public List<long> GetContactLinkedItems(long contactid, string type)
        {
            try
            {
                var result = _db.ContactLinks.Where(i => i.ContactID == contactid && i.ItemType.ToUpper() == type).Select(p => p.ItemID).ToList();
                return result;
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<VendorLookup>> GetVendorList(string entcode)
        {
            try
            {
                var result =await _db.VendorLookups.Where(i => i.EntCode == entcode).ToListAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetVendorsByEnt")]
        public async Task<ActionResult<List<Vendor>>> GetVendorsByEnt(string e)
        {
            try
            {
                var vendors = await _db.Vendors.Where(i => i.EntCode == e).ToListAsync();
                return vendors;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("CreateNewVendor")]
        public async Task<ActionResult<Vendor>> CreateNewVendor(string c, string e)
        {
            try
            {
                Vendor newven = new Vendor()
                {
                    VendorName = c,
                    EntCode = e,
                    Status = "Pending"
                };
                _db.Vendors.Add(newven);
                var result = await _db.SaveChangesAsync();
                return newven;

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
    }
}