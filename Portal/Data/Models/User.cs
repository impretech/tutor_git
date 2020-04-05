using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Data.Models {
    public class User : BaseEntity {
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }

    public class UserContact
    {
        public long UserContactID { get; set; }
        public string UserEmail { get; set; }
        public string EntCode { get; set; }
        public long ContactID { get; set; }
    }
}
