using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class MilestoneTask
    {
        [Key]
        public long MilestoneTaskID { get; set; }
        public long MilestoneID { get; set; }
        public string Task { get; set; }
        public int Order { get; set; }
    }
}
