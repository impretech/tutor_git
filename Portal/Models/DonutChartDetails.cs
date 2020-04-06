using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class DonutChartDetails
    {
        public string Title { get; set; }
        public decimal Score { get; set; }
        public List<DonutChartData> Items { get; set; }
    }
}
