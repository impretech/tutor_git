using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Schedule
    {
        [Key]
        public long SchedID { get; set; }
        public long ProjectID { get; set; }
        public string CreatedBy { get; set; }
        public string SalesPerson { get; set; }
        public string SalesPersonEmail { get; set; }
        public string SalesforceID { get; set; }
        public DateTime? EstimatedStart { get; set; }
        public DateTime? RequestedStart { get; set; }
        public DateTime? MaterialsDelivery { get; set; }
        public DateTime? InstallDate {get; set;}
        public string EntCode { get; set; }
        public string Status { get; set; }
    }

    public class ScheduleVM : Schedule
    {
        public string ProjectTitle { get; set; }
    }
}
