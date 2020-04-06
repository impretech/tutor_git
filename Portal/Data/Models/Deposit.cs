using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Deposit
    {
        [Key]
        public long DepositID { get; set; }
        public long ProjectID { get; set; }
        public DateTime DepositDate { get; set; }
        public string DepositType { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public decimal Total { get; set; }
        public long BudgetID { get; set; }
        public int Addendum { get; set; }
        public string FundingSource { get; set; }
        public string FundingType { get; set;}
        public string UseType { get; set; }
        public string EntCode { get; set; }



        public Deposit GetTempDeposit(long projid)
        {
            this.DepositID = 1001;
            this.ProjectID = projid;
            this.DepositDate = DateTime.Now;
            this.DepositType ="CAPITAL";
            this.Reason = "Estimate Error";
            this.Status = "Complete";
            this.Description = "TBD";
            this.Total = 980045.67M;
            return this;
        }
    }

    public class DepositView
    {
        [Key]
        public long DepositID { get; set; }
        public long ProjectID { get; set; }
        public DateTime DepositDate { get; set; }
        public string DepositType { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public decimal Total { get; set; }
        public long BudgetID { get; set; }
        public int Addendum { get; set; }
        public string FundingSource { get; set; }
        public string FundingType { get; set; }
        public string UseType { get; set; }
        public string EntCode { get; set; }
        public string ProjectTitle { get; set; } 
    }

    public class DepositCategory
    {
        [Key]
        public long DepCatID { get; set; }
        public long BudCatID { get; set; }
        public long DepositID { get; set; }
        public decimal Deposit { get; set; }
        public decimal CurrentFunding { get; set; }
        public decimal AvailableBudget { get; set; }
        public long BudgetID { get; set; }
    }

    public class DepositCatSum
    {
        [Key]
        public long BudCatID { get; set; }
        public string Category { get; set; }
        public decimal BudgetTot { get; set; }
        public decimal DepositTot { get; set; }
    }

    public class DepositDetail
    {
        [Key]
        public long DepositDetailID { get; set; }
        public long BudgetDetailID { get; set; }
        public long BudCatID { get; set; }
        public decimal Deposit { get; set; }
        public decimal Budget { get; set; }
        public decimal CurrentFunding { get; set; }
        public decimal LtdPurchasing { get; set; }
        public long DepositID { get; set; }
        public long DepCatID { get; set; }
    }

    public class DepsoitDetLineSum
    {
        [Key]
        public long DepositDetailID { get; set; }
        public long ProjectID { get; set; }
        public long DepositID { get; set; }
        public long BudgetDetailID { get; set; }
        public decimal LineBudgetTotal { get; set; }
        public decimal LineDepositTotal { get; set; }
    }

    public class DepCatSumTotals
    {
        [Key]
        public long ProjectID { get; set; }
        public decimal Deposits { get; set; }
        public decimal Commitments { get; set; }
        public decimal Pending { get; set; }
    }
}
