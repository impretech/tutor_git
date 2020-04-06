using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class ProjectVM
    {
        public long ProjectId { get; set; }
        public string Title { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public long PMId { get; set; }
        public string PMName { get; set; }
        public string Type { get; set; }
        /// <summary>
        /// Formatted Total Ext Value
        /// </summary>
        public string TotalExtValue { get; set; }
        public List<ProjectTask> Tasks { get; set; }
    }
}
