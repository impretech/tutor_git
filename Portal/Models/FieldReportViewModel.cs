using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class FieldReportViewModel
    {
        public FieldReport FR { get; set; } = new FieldReport();
        public List<FRImage> Images { get; set; } = new List<FRImage>();
    }
}
