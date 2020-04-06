using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Models;
using Portal.API;
using System.Net;

namespace Portal.Features.Projects {
    [Authorize]
    [Route("contacts")]
    public class ContactsController : Controller {

        private readonly SyvennDBContext _db;
        public ContactsController(SyvennDBContext dbContext) {
            _db = dbContext;
        }

        [HttpGet]
        [Route("")]
        public async Task<IActionResult> Index() {

            // TODO query not complete, test only
            var contacts = await _db.Contacts
                //.Where(p => p.EntCode == "PRO1")
                .Select(c => new Models.ContactViewModel.ContactsGrid
                {
                    ContactID = c.ContactID,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Company = c.Company,
                    JobTitle = c.JobTitle
                }).ToListAsync();

            return View("Index", contacts);
        }

        [Route("new")]
        [HttpGet]
        public async Task<IActionResult> New()
        {
            ContactViewModel cvm = new ContactViewModel
            {
                Lookups = await _db.Lookups.Where(p => (p.Module == "Contact") && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToListAsync()
            };
            return View("AddEdit", cvm);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> Edit(long id)
        {
            ContactController C = new ContactController(_db);
            ContactViewModel contact = new ContactViewModel();
            contact= await C.GetContactVMbyID(id);

            return View("AddEdit", contact);
        }

    }
}
