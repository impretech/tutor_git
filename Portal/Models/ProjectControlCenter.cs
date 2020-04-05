using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models {
    public class ProjectControlCenter {
        public class AlertsTableViewModel {
            public long ProjectId { get; set; }
            public string Title { get; set; }
            public DateTime Date { get; set; }
            public string Category { get; set; }
            public string Alerts { get; set; }
            public string Resp { get; set; }
            public string Health { get; set; }
            public string AlertBudget { get; set; }
            public string AlertBuyout { get; set; }
            public string AlertMilestone { get; set; }
            public string AlertDocuments { get; set; }
            public decimal Score { get; set; }
        }

        public class PortfolioTableViewModel {
            public long ProjectId { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Phase { get; set; }
            public string Status { get; set; }
            public string ProjectNo { get; set; }
        }

        public class RecentActivityTableViewModel {
            public DateTime Date { get; set; }
            public string User { get; set; }
            public string Change { get; set; }
        }
    }
}
