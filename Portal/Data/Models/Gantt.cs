using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Task
    {
        [Key]
        public long Id { get; set; }
        public long ProjectID { get; set; }
        public DateTime StartDate { get; set; }
        public string Text { get; set; }
        public int Duration { get; set; }
        public int SortOrder { get; set; }
        public long? ParentId { get; set; }
        public string Type { get; set; }    // Get Values from Lookup (Project, TaskType) "task", "project", "milestone"
        public decimal Progress { get; set; }
        public bool Readonly { get; set; }
        public bool Editable { get; set; }
        public int WT { get; set; }
    }


    public class Link
    {
        [Key]
        public long Id { get; set; }
        public long SourceTaskId { get; set; }
        public long TargetTaskId { get; set; }
        public string Type { get; set; }        // Get Values from Lookup (Project, TaskLinkType)  "0" - finish to start, "1" - start to start, "2" - finish to finish, "3" - start to finish
        public int Lag { get; set; }
        public bool Readonly { get; set; }
        public bool Editable { get; set; }
        public long ProjectID { get; set; }
    }
}
