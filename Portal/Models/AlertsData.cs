using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models {
    public class AlertsData {
        public List<Alert> BudgetAlerts { get; set; } = new List<Alert>();
        public List<Alert> BuyoutAlerts { get; set; } = new List<Alert>();
        public List<Alert> MilestoneAlerts { get; set; } = new List<Alert>();
        public List<Alert> DocumentAlerts { get; set; } = new List<Alert>();
    }

    public class Alert {
        public string Title { get; set; }
        public string SubTitle { get; set; }
        public AlertDetail Details { get; set; }
    }

    public class AlertDetail {
        [Key]
        public long AlertId { get; set; }
        public DateTime Date { get; set; }
        public string AlertType { get; set; }
        public string Stage { get; set; }
        public string NodeId { get; set; }
        public string NodeDescription { get; set; }
        public string Condition { get; set; }
        public string Recommendation { get; set; }
        public long ProjectId { get; set; }
    }
}
