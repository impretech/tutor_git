using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Portal.Data.Models;

namespace Portal.Data.Models
{
    public class CurrentUser
    {
        public string UserEmail { get; set; }
        public string UserName { get; set; }
        public string EntCode { get; set; }
        public Contact User { get; set; }
        public CurrentUser()
        {
            UserEmail = "TBD";
            UserName = "TBD";
            EntCode = "PRO1";
        }
    }
}
