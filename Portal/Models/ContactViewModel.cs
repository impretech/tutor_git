using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class ContactViewModel
    {
        public class ContactsGrid {
            public long ContactID { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string JobTitle { get; set; }
            public string Company { get; set; }
        }

        public Contact contact { get; set; }
        public List<EmailViewModel> Emails { get; set; }
        public List<Location> Locations { get; set; }
        public List<Phone> PhoneNumbers { get; set; }
        public List<ContactRole> ContactRoles { get; set; }
        public List<Lookup> Lookups { get; set; }
        public string Mode { get; set; }

        public ContactViewModel()
        {
            this.contact = new Contact();
            this.Emails = new List<EmailViewModel>();
            this.Locations = new List<Location>();
            this.PhoneNumbers = new List<Phone>();
            this.ContactRoles = new List<ContactRole>();
            this.Lookups = new List<Lookup>();
            this.Mode = "New";
        }
    }
}
