using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class SF_Note
    {
        public string OwnerId { get; set; }
        public string ParentId { get; set; }
        public string CreatedById { get; set; }
        public string OppId { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
    }
}
