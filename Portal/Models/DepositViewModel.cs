using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class DepositViewModel
    {
        public Deposit Dep { get; set; }
        public DepositDetailsVM Details { get; set; }
        public string ProjectTitle { get; set; }
        public DepCatSumTotals CurrentTotals { get; set; }
        public List<Contributor> Contributors { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }
        public List<DocumentDb> Documents { get; set; }

        public DepositViewModel()
        {
            this.Dep = new Deposit();
            this.ProjectTitle = string.Empty;
            this.Lookups = new List<Lookup>();
            this.Details = new DepositDetailsVM();
            this.Notes = new List<Note>();
            this.Contributors = new List<Contributor>();
            this.Documents = new List<DocumentDb>();
            this.CurrentTotals = new DepCatSumTotals
            {

                //****  Added temp data to display -  Remove in Production **************************************
                Deposits = 15000.00M,
                Commitments = 7500.00M,
                Pending = 3500.00M
            };
            //***********************************************************************************************
        }


        public class GroupedDepositCategory : BudgetCategory
        {
            [Key]
            public long DepCatID { get; set; }
            public long DepositID { get; set; }
            public decimal Deposit { get; set; }
            public decimal CurrentFunding { get; set; }
            public decimal AvailableBudget { get; set; }
          
        }

        public class GroupedDepositDetail: BudgetDetail
        {
            [Key]
            public long DepositDetailID { get; set; }
            public decimal Deposit { get; set; }
            public decimal CurrentFunding { get; set; }
            public decimal Budget { get; set; }
            public decimal LtdPurchasing { get; set; }
            public long DepositID { get; set; }
            public long DepCatID { get; set; }

        }
    }
}
