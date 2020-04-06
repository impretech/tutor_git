using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class ProjectFinBarData
    {
        public long ProjectID { get; set; }
        public decimal BudgetTot { get; set; }
        public decimal DepositTot { get; set; }
        public decimal POCommittedTot { get; set; }
        public decimal POPendingTot { get; set; }
        public decimal InvoiceTot { get; set; }
        public decimal InvoicePaidTot { get; set; }
    }
}
