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
    public class VendorController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;

        public VendorController(SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        [HttpGet]
        [Route("GetVendorsByEnt")]
        public async Task<ActionResult<List<Models.VendorViewModel>>> GetVendorsByUser(string entcode)
        {
            try
            {
                List<VendorViewModel> result = new List<VendorViewModel>();
                var vendors = await  _db.Vendors.Where(i => i.EntCode == entcode).ToListAsync();
                foreach (Vendor v in vendors)
                {
                    VendorViewModel vm = new VendorViewModel();
                    vm = await GetVendorDetails(v);
                    result.Add(vm);
                }
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetVendorByID")]
        public async Task<ActionResult<Models.VendorViewModel>> GetVendorByID(long id)
        {
            try
            {
                VendorViewModel result = new VendorViewModel();
                var vendor = await _db.Vendors.Where(i => i.VendorID == id).FirstOrDefaultAsync();
                result = await GetVendorDetails(vendor);
                return result;
            }
            catch
            {
                return null;
            }
        }

        
        [HttpPost]
        [Route("InsertVendor")]
        public async Task<ActionResult<long>> InsertNewVendor(Vendor v)
        {
            try
            {
                var result = _db.Vendors.Add(v);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                     EntCode = v.EntCode,
                    ItemType = "VENDOR",
                    ItemID = v.VendorID,
                    Change = "InsertVendor - Vendor : " + JsonConvert.SerializeObject(v)
                };
                await _Logger.InsertActivityLog(log);
                return v.VendorID;
            }
            catch
            {
                return 0;
            }
        }


        [HttpPost]
        [Route("InsertVendorDetails")]
        public async Task<ActionResult<bool>> InsertVendorDetails(VendorViewModel vm)
        {
            try
            {
                ContactController contactcontroller = new ContactController(_db);

                foreach (ContactViewModel c in vm.Contacts)
                {
                    var result = contactcontroller.UpdateContact(c);
                }

                foreach (Location L in vm.Locations)
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
                            Change = "InsertVendorLocation - Location : " + JsonConvert.SerializeObject(L)
                        };
                        await _Logger.InsertActivityLog(log);
                        var cl = await InsertLinkedItem(vm.vendor.VendorID, "LOCATION", L.LocationID, vm.vendor.EntCode);
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
                            Change = "UpdateVendorLocation - Location : " + JsonConvert.SerializeObject(L)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                }

                foreach (Phone P in vm.PhoneNumbers)
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
                            Change = "InsertVendorPhone - Phone : " + JsonConvert.SerializeObject(P)
                        };
                        await _Logger.InsertActivityLog(log);
                        var cl = InsertLinkedItem(vm.vendor.VendorID, "Phone", P.PhoneID, vm.vendor.EntCode);
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
                            Change = "UpdateVendorPhone - Phone : " + JsonConvert.SerializeObject(P)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                }

                return true;
            }
            catch
            {
                return null;
            }
        }

        public async Task<long> InsertLinkedItem(long vendorid, string type, long itemid, string entcode)
        {
            try
            {
                VendorLink newlink = new VendorLink
                {
                    VendorID = vendorid,
                    ItemType = type.ToUpper(),
                    ItemID = itemid,
                    EntCode = entcode
                };
                var result = _db.VendorLinks.Add(newlink);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = entcode,
                    ItemType = "CONTACTLINK",
                    ItemID = newlink.VendorLinkID,
                    Change = "InsertVendorLink- Link : " + JsonConvert.SerializeObject(newlink)
                };
                await _Logger.InsertActivityLog(log);
                return newlink.VendorLinkID;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<VendorViewModel> GetVendorDetails(Vendor v)
        {
            try
            {
                VendorViewModel vm = new VendorViewModel { vendor = v };
                var LocationIds = GetLinkedItems(v.VendorID, "LOCATION");
                vm.Locations = await _db.Locations.Where(e => LocationIds.Contains(e.LocationID)).ToListAsync();
                var PhoneIds = GetLinkedItems(v.VendorID, "PHONE");
                vm.PhoneNumbers = await _db.Phones.Where(e => PhoneIds.Contains(e.PhoneID)).ToListAsync();
                vm.Lookups = new List<Lookup>();
                vm.Lookups = await _db.Lookups.Where(p => (p.Module == "Vendor") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync();
                var ContactIds = GetLinkedItems(v.VendorID, "CONTACT");
                vm.Contacts = new List<ContactViewModel>();
                foreach(long c in ContactIds)
                {
                    ContactViewModel cm = new ContactViewModel();
                    var contact = await _db.Contacts.Where(i => i.ContactID == c).FirstOrDefaultAsync();
                    cm = await GetContactDetails(contact);
                    vm.Contacts.Add(cm);
                }
                return vm;
            }
            catch
            {
                return null;
            }
        }

        public List<long> GetLinkedItems(long vendorid, string type)
        {
            try
            {
                var result = _db.VendorLinks.Where(i => i.VendorID == vendorid && i.ItemType.ToUpper() == type).Select(p => p.ItemID).ToList();
                return result;
            }
            catch
            {
                return null;
            }
        }

        public async Task<ContactViewModel> GetContactDetails(Contact c)
        {
            try
            {
                ContactViewModel cm = new ContactViewModel { contact = c };
                var LocationIds = GetContactLinkedItems(c.ContactID, "LOCATION");
                cm.Locations = await _db.Locations.Where(e => LocationIds.Contains(e.LocationID)).ToListAsync();
                var PhoneIds = GetContactLinkedItems(c.ContactID, "PHONE");
                cm.PhoneNumbers = await _db.Phones.Where(e => PhoneIds.Contains(e.PhoneID)).ToListAsync();
                var EmailIds = GetContactLinkedItems(c.ContactID, "EMAIL");
                cm.Emails = new List<EmailViewModel>();
                var emails = await _db.Emails.Where(e => EmailIds.Contains(e.EmailID)).ToListAsync();
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
                return cm;
            }
            catch
            {
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


        public async Task<VendorViewModel> GetVendorVMbyID(long id)
        {
            try
            {
                VendorViewModel cvm = new VendorViewModel();
                var vendor = await _db.Vendors.Where(i => i.VendorID == id).FirstOrDefaultAsync();
                cvm = await GetVendorDetails(vendor);
                return cvm;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetContactbyVendorID")]
        public async Task<ActionResult<DataSourceResult>> GetContactbyVendorID(long c)
        {
            try
            {
               // List<VendorContact> vcl = new List<VendorContact>();
                var vcl = await _db.VendorContacts.Where(i => i.VendorID == c).Distinct().ToListAsync();

                DataSourceResult result = new DataSourceResult
                {
                    Data = vcl,
                    Total = vcl.Count()
                };
                return result;
            }
            catch
            {
                return null;
            }
        }



        public async Task<VendorContact> GetVendorContact(long vendorid, long contactid)
        {
            try
            {
                var result =await _db.VendorContacts.Where(i => i.VendorID == vendorid && i.ContactID == contactid).FirstOrDefaultAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("NewVendorLink")]
        public async Task<ActionResult<VendorContact>> CreateVendorLink([FromBody]BasicVendorContact b)
        {
            try
            {
                VendorLink vl = new VendorLink()
                {
                    VendorID = b.VendorID,
                    ItemType = "CONTACT",
                    ItemID = b.ContactID,
                    EntCode = b.EntCode
                };

                _db.VendorLinks.Add(vl);
                var result2 = await _db.SaveChangesAsync();

                var result3 = await GetVendorContact(vl.VendorID, vl.ItemID);
                return result3;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("CreateBasicVendorContact")]
        public async Task<ActionResult<VendorContact>> CreateBasicVendorContact([FromBody]BasicVendorContact b)
        {
            try
            {
                string[] temp = b.ShowAs.Split(' ');
                Contact newcon = new Contact()
                {
                    ShowAsName = b.ShowAs,
                    Company = b.VendorName,
                    FirstName = temp[0],
                    LastName = temp[temp.Count() - 1],
                    EntCode = b.EntCode
                };

                _db.Contacts.Add(newcon);
                var result = await _db.SaveChangesAsync();

                VendorLink vl = new VendorLink()
                {
                    VendorID = b.VendorID,
                    ItemType = "CONTACT",
                    ItemID = newcon.ContactID,
                    EntCode = b.EntCode
                };

                _db.VendorLinks.Add(vl);
                var result2 = await _db.SaveChangesAsync();

                var result3 = await GetVendorContact(vl.VendorID, vl.ItemID);

                ActivityLog log = new ActivityLog
                {
                    LogUser =  b.Writer,   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = b.EntCode,
                    ItemType = "VendorContact",
                    ItemID = vl.VendorLinkID,
                    Change = "CreateBasicVendorContact- Link : " + JsonConvert.SerializeObject(vl)
                };
                await _Logger.InsertActivityLog(log);
                return result3;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("CreateVendorContact")]
        public async Task<ActionResult> CreateVendorContact(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<VendorContact> vcs)
        {
            if (vcs != null && ModelState.IsValid)
            {
                try
                {
                    foreach(VendorContact c in vcs)
                    {
                        VendorLink link = new VendorLink
                        {
                            VendorID = c.VendorID,
                            EntCode = c.EntCode,
                            ItemType = "CONTACT",
                            ItemID = c.ContactID
                        };

                        var result = _db.VendorLinks.Add(link);
                    }
                    await _db.SaveChangesAsync();
                }
                catch
                {
                    return BadRequest();
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("RemoveVendorContact")]
        public async Task<ActionResult<bool>> RemoveVendorContact([FromBody] VendorContact vc)
        {
            try
            {
                var vl = await _db.VendorLinks.Where(p => p.VendorID == vc.VendorID && p.ItemID == vc.ContactID && p.ItemType == "CONTACT").FirstOrDefaultAsync();
                _db.VendorLinks.Remove(vl);
                var result =await _db.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        [HttpGet]
        [Route("GetContactsLookup")]
        public async Task<ActionResult<List<Contact>>> GetContactsLookup(string e)
        {
            try
            {
                var result = await _db.Contacts.Where(x => x.EntCode == e).OrderBy(x => x.ShowAsName).ToListAsync();
                return result;
            }
            catch
            {   
                return null;
            }
        }

        [HttpPost]
        [Route("RemoveVendorContactbyID")]
        public async Task<ActionResult<bool>> RemoveVendorContactbyID(long c)
        {
            try
            {
                var vl = await _db.VendorLinks.Where(p => p.VendorLinkID == c).FirstOrDefaultAsync();
                _db.VendorLinks.Remove(vl);
                var result = await _db.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        [HttpPost]
        [Route("UpdateOnlyVendor")]
        public async Task<long> UpdateOnlyVendor([FromBody] Vendor C)
        {
            try
            {
                var r = _db.Vendors.Update(C);
                await _db.SaveChangesAsync();
                return C.VendorID;
            }
            catch
            {
                return 0;
            }
        }


    }
}