using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class ProjectMessage
    {
        public long Id { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public DateTime SendDate { get; set; }
        public string Message { get; set; }
        public long ProjectID { get; set; }
        public string Type { get; set; }
    }
}
