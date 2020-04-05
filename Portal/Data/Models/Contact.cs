using System;
using System.ComponentModel.DataAnnotations;

namespace Portal.Data.Models
{
    public partial class Contact
    {
        [Key]
        public long ContactID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string JobTitle { get; set; }
        public string Company { get; set; }
        public long VendorID { get; set; }
        public string Username { get; set; }
        public string Dept { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public DateTime? DOB { get; set; }
        public string EntCode { get; set; }
        public string MiddleName { get; set; }
        public string PreferredName  { get; set; }
        public string ShowAsName { get; set; }
        public string Note { get; set; }
        public string URL { get; set; }

    }

    public partial class ContactLink
    {
        [Key]
        public long ContactLinkID { get; set; }
        public string Label { get; set; }
        public long ContactID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
    }

    public partial class ContactRole
    {
        [Key]
        public long ProjectTeamID { get; set; }
        public long ContactID { get; set; }
        public string Role { get; set; }
        public string EntCode { get; set; }
        public long ProjectID { get; set; }
        public string ProjectNo { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Phase { get; set; }
        public string Status { get; set; }
        public long Gsf { get; set; }
    }

    public partial class Contributor
    {
        [Key]
        public long ContactLinkID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public long ContactID { get; set; }
        public string Title { get; set; }
        public string Label { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string ShowAsName { get; set; }
    }
}
