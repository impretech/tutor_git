using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class ProjectMilestone
    {
        [Key]
        public long ProjectMilestoneID { get; set; }
        public long ProjectID { get; set; }
        public long MilestoneID { get; set; }
        public string Milestone { get; set; }
        public int Order { get; set; }
        public int DurationWKs { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int WT { get; set; }
    }
}
