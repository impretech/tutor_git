using System.ComponentModel.DataAnnotations;

namespace Portal.Data.Models
{
    public partial class Email
    {
        [Key]
        public long EmailID { get; set; }
        public string Label { get; set; }
        public string EmailAddress { get; set; }
        public bool isPrimary { get; set; }
    }

    public class EmailLookup
    {
        [Key]
        public long ContactLinkID { get; set; }
        public string Label { get; set; }
        public string ItemType { get; set; }
        public string Service { get; set; }
        public string EmailAddress { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ShowAsName { get; set; }
        public string UserName { get; set; }
    }
}
