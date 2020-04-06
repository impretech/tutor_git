using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public partial class Vendor
    {
        [Key]
        public long VendorID { get; set; }
        public string VendorName { get; set; }
        public string Domain { get; set; }
        public string License { get; set; }
        public string BusinessType { get; set; }
        public bool isUnion { get; set; }
        public string Status { get; set; }
        public bool isMBE { get; set; }
        public bool isSBE { get; set; }
        public bool isWBE { get; set; }
        public bool isVA { get; set; }
        public string COI { get; set; }
        public DateTime? COIExp { get; set; }
        public string WorkType { get; set; }
        public string W9 { get; set; }
        public string ClassStatus { get; set; }
        public DateTime? ClassExp { get; set; }
        public string EntCode { get; set; }
        public string Note { get; set; }
        public string CompanyCode { get; set; }
    }

    public partial class VendorLink
    {
        [Key]
        public long VendorLinkID { get; set; }
        public long VendorID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string EntCode { get; set; }
    }

    public partial class VendorLookup
    {
        [Key]
        public long VendorID { get; set; }
        public string VendorName { get; set; }
        public long PhoneID { get; set; }
        public string PhoneLabel { get; set; }
        public string PhoneNumber { get; set; }
        public long LocationID { get; set; }
        public string LocationLabel { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string AddCity { get; set; }
        public string AddState { get; set; }
        public string AddZip { get; set; }
        public string EntCode { get; set; }

    }

    public partial class VendorContact
    {
        [Key]
        public long VendorLinkID { get; set; }
        public long VendorID { get; set; }
        public string VendorName { get; set; }
        public string EntCode { get; set; }
        public long ContactID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Title { get; set; }
        public string Company { get; set; }
        public string PreferredName { get; set; }
        public string ShowAsName { get; set; }
        public string PhoneNumber { get; set; }
        public string EmailAddress { get; set; }


    }

    public partial class BasicVendorContact
    {
        public long VendorID { get; set; }
        public string VendorName { get; set; }
        public string ShowAs { get; set; }
        public string Writer { get; set; }
        public string EntCode { get; set; }
        public long ContactID { get; set; }
    }


}
