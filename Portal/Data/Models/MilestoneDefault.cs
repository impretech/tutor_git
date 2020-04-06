using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class MilestoneDefault
    {
        [Key]
        public long MilestoneID { get; set; }
        public string Type { get; set; }
        public string Milestone { get; set; }
        public int Order { get; set; }
        public int DurationWKs { get; set; }
        public int WT { get; set; }
    }
}
