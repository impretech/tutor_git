using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
    public class PhonesController : ControllerBase
    {
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;

        public PhonesController(SyvennDBContext context)
        {
            _context = context;
            _Logger = new ActivityLogsController(_context);
        }

        // GET: api/Phones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Phone>>> GetPhones()
        {
            return await _context.Phones.ToListAsync();
        }

        // GET: api/Phones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Phone>> GetPhone(long id)
        {
            var phone = await _context.Phones.FindAsync(id);

            if (phone == null)
            {
                return NotFound();
            }

            return phone;
        }

        // PUT: api/Phones/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhone(long id, Phone phone)
        {
            if (id != phone.PhoneID)
            {
                return BadRequest();
            }

            _context.Entry(phone).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                  //  EntCode = entcode,
                    ItemType = "PHONE",
                    ItemID = phone.PhoneID,
                    Change = "PutPhone - Phone : " + JsonConvert.SerializeObject(phone)
                };
                await _Logger.InsertActivityLog(log);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhoneExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Phones
        [HttpPost]
        public async Task<ActionResult<Phone>> PostPhone(Phone phone)
        {

            _context.Phones.Add(phone);
            await _context.SaveChangesAsync();
            await _context.SaveChangesAsync();
            ActivityLog log = new ActivityLog
            {
                LogUser = "L. Edwards",   //Replace with actual user login or email
                LogDate = DateTime.Now,
                //  EntCode = entcode,
                ItemType = "PHONE",
                ItemID = phone.PhoneID,
                Change = "PostPhone - Phone : " + JsonConvert.SerializeObject(phone)
            };
            await _Logger.InsertActivityLog(log);
            return CreatedAtAction("GetPhone", new { id = phone.PhoneID }, phone);
        }

        // DELETE: api/Phones/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Phone>> DeletePhone(long id)
        {
            var phone = await _context.Phones.FindAsync(id);
            if (phone == null)
            {
                return NotFound();
            }

            _context.Phones.Remove(phone);
            await _context.SaveChangesAsync();

            await _context.SaveChangesAsync();
            ActivityLog log = new ActivityLog
            {
                LogUser = "L. Edwards",   //Replace with actual user login or email
                LogDate = DateTime.Now,
                //  EntCode = entcode,
                ItemType = "PHONE",
                ItemID = phone.PhoneID,
                Change = "DeletePhone - Phone : " + JsonConvert.SerializeObject(phone)
            };
            await _Logger.InsertActivityLog(log);
            return phone;
        }

        private bool PhoneExists(long id)
        {
            return _context.Phones.Any(e => e.PhoneID == id);
        }

        [HttpGet]
        [Route("GetPhonesbyType")]
        public async Task<ActionResult<DataSourceResult>> GetPhonesbyType(string type, long c)
        {
            try
            {
                List<Phone> Phones = new List<Phone>();
                if (type.ToUpper() == "CONTACT")
                {
                    var PhoneIds = await _context.ContactLinks.Where(i => i.ContactID == c && i.ItemType.ToUpper() == "PHONE").Select(i => i.ItemID).ToListAsync();
                    Phones = await _context.Phones.Where(i => PhoneIds.Contains(i.PhoneID)).ToListAsync();
                  
                }
                else if (type.ToUpper() == "VENDOR")
                {
                    var PhoneIds = await _context.VendorLinks.Where(i => i.VendorID == c && i.ItemType.ToUpper() == "PHONE").Select(i => i.ItemID).ToListAsync();
                    Phones = await _context.Phones.Where(i => PhoneIds.Contains(i.PhoneID)).ToListAsync();
                }
                List<PhoneViewModel> evm = new List<PhoneViewModel>();
                foreach (Phone e in Phones)
                {
                    PhoneViewModel newe = new PhoneViewModel()
                    {
                        ParentID = c,
                        ParentType = type.ToUpper(),
                        PhoneID = e.PhoneID,
                        PhoneNumber = e.PhoneNumber,
                        isPrimary = e.isPrimary,
                        Label = e.Label
                    };
                    evm.Add(newe);
                }

                DataSourceResult result = new DataSourceResult
                {
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

        [HttpGet]
        [Route("GetPhonesbyContactID")]
        public async Task<ActionResult<DataSourceResult>> GetPhonesbyContactID(long c)
        {
            try
            {
                var PhoneIds = await _context.ContactLinks.Where(i => i.ContactID == c && i.ItemType.ToUpper() == "PHONE").Select(i => i.ItemID).ToListAsync();
                var Phones = await _context.Phones.Where(i => PhoneIds.Contains(i.PhoneID)).ToListAsync();
                List<PhoneViewModel> evm = new List<PhoneViewModel>();
                foreach (Phone e in Phones)
                {
                    PhoneViewModel newe = new PhoneViewModel()
                    {
                        ParentID = c,
                        ParentType = "CONTACT",
                        PhoneID = e.PhoneID,
                        PhoneNumber = e.PhoneNumber,
                        isPrimary = e.isPrimary,
                        Label = e.Label
                    };
                    evm.Add(newe);
                }

                DataSourceResult result = new DataSourceResult
                {
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
        public async Task<ActionResult> UpdatePhoneVM(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<PhoneViewModel> p)
        {
            if (p != null && ModelState.IsValid)
            {
                try
                {
                    foreach (var phone in p)
                    {
                        Phone update = new Phone
                        {
                            PhoneID = phone.PhoneID,
                            PhoneNumber = phone.PhoneNumber,
                            isPrimary = phone.isPrimary,
                            Label = phone.Label
                        };
                        var result = _context.Phones.Update(update);
                        await _context.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "PHONE",
                            ItemID = phone.PhoneID,
                            Change = "UpdatePhoneVM: " + JsonConvert.SerializeObject(p)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                    return Ok(p.ToDataSourceResult(request, ModelState));
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
        public async Task<ActionResult> CreatePhoneVM(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<PhoneViewModel> phones)
        {
            if (phones != null && ModelState.IsValid)
            {
                try
                {
                    foreach (var p in phones)
                    {
                        Phone update = new Phone
                        {
                            // update.EmailID = e.EmailID;
                            PhoneNumber = p.PhoneNumber,
                            isPrimary = p.isPrimary,
                            Label = p.Label
                        };
                        var result = _context.Phones.Add(update);
                        await _context.SaveChangesAsync();
                        p.PhoneID = update.PhoneID;

                        switch (p.ParentType)
                        {
                            case "CONTACT":
                                ContactLink cl = new ContactLink() { ContactID = p.ParentID, ItemID = update.PhoneID, ItemType = "PHONE" };
                                await _context.ContactLinks.AddAsync(cl);
                                break;
                            case "TBD":  //for later use
                                break;
                        }
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "PHONE",
                            ItemID = p.PhoneID,
                            Change = "CeatePhoneVM: " + JsonConvert.SerializeObject(p)
                        };
                        await _Logger.InsertActivityLog(log);

                    }

                    return Ok(phones.ToDataSourceResult(request, ModelState));
                }
                catch
                {
                    return BadRequest();
                }
            }

            return BadRequest();

        }

    }
}