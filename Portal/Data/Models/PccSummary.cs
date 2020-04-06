using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Portal.Data.Models
{
    public partial class PCCSummary
    {
        [Key]
        //public long Id { get; set; }
        public long ProjectId { get; set; }
        public string ProjectNo { get; set; }
        public string Title { get; set; }
        public string Resp { get; set; }
        public string OwnerEmail { get; set; }
        public string EntCode { get; set; }
        public string Description { get; set; }
        public string Phase { get; set; }
        public string Status { get; set; }
        public int AlertBudget { get; set; }
        public int AlertBuyout { get; set; }
        public int AlertMilestone { get; set; }
        public int AlertDocuments { get; set; }
        //public DateTime? AlertDate { get; set; }
        //public string AlertDescription { get; set; }
        //public DateTime? StartDate { get; set; }
        //public DateTime? EndDate { get; set; }
        public decimal FinBudget { get; set; }
        public decimal FinCommitted { get; set; }
        public decimal FinPaid { get; set; }
        public int DocRfi { get; set; }
        public int DocCo { get; set; }
        public int DocInv { get; set; }

        public string GetAlertCategory()
        {
            if (this.AlertBudget > 0)
                return "Budget";
            if (this.AlertBuyout > 0)
                return "Buyout";
            if (this.AlertDocuments > 0)
                return "Document";
            if (this.AlertMilestone > 0)
                return "Milestone";
            return "";
        }

        public string GetAlertText(bool alert)
        {
            if (alert)
                return "Alert";
            return "Ok";
        }

        public string GetHealth(decimal score)
        {
            if (score >= 76)
                return "green";
            if (score >= 51)
                return "yellow";
            else
                return "red";
        }


        public int Score()
        {
            int score = 0;
            if (this.AlertBudget > 0)
                score += 25;
            if (this.AlertBuyout > 0)
                score += 25;
            if (this.AlertDocuments > 0)
                score += 25;
            if (this.AlertMilestone > 0)
                score += 25;

            return score;
        }
    }



}

