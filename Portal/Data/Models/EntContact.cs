using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class EntContact
    {
        [Key]
        public long ContactID { get; set; }
        public string EntCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Title { get; set; }
        public string Company { get; set; }
        public string PreferredName { get; set; }
        public string ShowAsName { get; set; }
        public string PhoneNumber { get; set; }
        public string EmailAddress { get; set; }
        public long PhoneID { get; set; }
        public long EmailID { get; set; }
    }
}
