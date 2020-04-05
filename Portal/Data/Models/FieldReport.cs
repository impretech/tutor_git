using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class FieldReport
    {
        [Key]
        public long FReportID { get; set; }
        public long ProjectID { get; set; }
        public DateTime ReportDate { get; set; }
        public string Weather { get; set; }
        public int Temp { get; set; }
        public string Writer { get; set; }
        public string Description { get; set; }
    
    }

    public class FRImage
    {
        [Key]
        public long FRImageID { get; set; }
        public long FReportID { get; set; }
        public long? DocID { get; set; }
    }
}
