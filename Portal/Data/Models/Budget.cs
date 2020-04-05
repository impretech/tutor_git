using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Budget
    {
        [Key]
        public long BudgetID { get; set; }
        public long ProjectID { get; set; }
        public string AccountNo { get; set; }
        public DateTime DateEntered { get; set; }
        public string BudgetType { get; set; }
        public string Status { get; set; }
        public long Gsf { get; set; }
        public decimal Total { get; set; }
        public DateTime? DatePublished { get; set; }
        public DateTime? DueDate { get; set; }
        public int AddendumNo { get; set; }
        public string Writer { get; set; }
        public string EntCode { get; set; }
        public DateTime? ProjectDate { get; set; }
        public string Classification { get; set; }

        public Budget GetTempBudget(long projid)
        {
            this.BudgetID = 1001;
            this.ProjectID = projid;
            this.AccountNo = "TBD";
            this.DateEntered = DateTime.Now;
            this.BudgetType = "Capitol";
            this.Status = "Pending";
            this.Gsf = 12000;
            this.Total = 1200345.67M;
            return this;
        }

        public Budget GetTempEstimate(long projid)
        {
            this.BudgetID = 1001;
            this.ProjectID = projid;
            this.AccountNo = "TBD";
            this.DateEntered = DateTime.Now;
            this.BudgetType = "Estimate";
            this.Status = "Complete";
            this.Gsf = 12000;
            this.Total = 980045.67M;
            return this;
        }
    }

    public class BudgetCategory
    {
        [Key]
        public long BudCatID { get; set; }
        public long BudgetID { get; set; }
        public string Category { get; set; }
        public decimal Cost { get; set; }
        public int CatOrder { get; set; }
        public int Weight { get; set; }
    }

    public class BudgetDetail
    {
        [Key]
        public long BudgetDetailID { get; set; }
        public long BudCatID { get; set; }
        public string Item { get; set; }
        public string Code { get; set; }
        public string Basis { get; set; }
        public int Qty { get; set; }
        public string Unit { get; set; }
        public decimal Rate { get; set; }
        public string Note { get; set; }
        public bool OnSched { get; set; }
        public int DetailOrder { get; set; }
     
    }

    public class BudCatSumTotals
    {
        [Key]
        public long ProjectID { get; set; }
        public decimal Deposits { get; set; }
        public decimal Commitments { get; set; }
        public decimal Pending { get; set; }
    }

    public class BudgetDefault
    {
        public int ID { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public bool Summary { get; set; }
        public char Category { get; set; }
        public string EntCode { get; set; }
    }

    public class BudgetLookup : Budget
    {
        public string ProjectTitle { get; set; }
    }

}
