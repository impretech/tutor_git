using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class VendorViewModel
    {
        public class VendorsGrid
        {
            public long VendorID { get; set; }
            public string VendorName { get; set; }
            public string BusinessType { get; set; }
            public string WorkType { get; set; }
            public string Status { get; set; }
        }

        public Vendor vendor { get; set; }
        public List<ContactViewModel> Contacts { get; set; }
        public List<Location> Locations { get; set; }
        public List<Phone> PhoneNumbers { get; set; }
        public List<Lookup> Lookups { get; set; }

        public VendorViewModel()
        {
            this.vendor = new Vendor();
            this.Contacts = new List<ContactViewModel>();
            this.Locations = new List<Location>();
            this.PhoneNumbers = new List<Phone>();
            this.Lookups = new List<Lookup>();
        }
    }
}
