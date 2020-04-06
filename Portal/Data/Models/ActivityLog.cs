using System;
using System.ComponentModel.DataAnnotations;

namespace Portal.Data.Models
{
    public partial class ActivityLog
    {
        [Key]
        public long ActivityLogID { get; set; }
        public DateTime LogDate { get; set; }
        public string LogUser { get; set; }
        public string Change { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string EntCode { get; set; }
    }
}
