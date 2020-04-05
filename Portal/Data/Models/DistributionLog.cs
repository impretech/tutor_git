using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class DistributionLog
    {
        [Key]
        public long DistributionLogID { get; set; }
        public string Activity { get; set; }
        public long MessageID { get; set; }
        public long FromContactID { get; set; }
        public string FromName { get; set; }
        public string FromCompany { get; set; }
        public DateTime DateSent { get; set; }
        public long ToContactID { get; set; }
        public string ToName { get; set; }
        public string ToCompany { get; set; }
        public DateTime DateReceived { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }

    }
}
