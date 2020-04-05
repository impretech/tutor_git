using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class BudgetViewModel
    {
        public Budget Bud { get; set; }
        public BudgetDetailsVM Details {get; set;}
        public string ProjectTitle { get; set; }
        public  BudCatSumTotals CurrentTotals { get; set; }
        public List<Contributor> Contributors { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }
        public List<DocumentDb> Documents { get; set; }


        public BudgetViewModel()
        {
            this.Bud = new Budget();
            this.ProjectTitle = string.Empty;
            this.Lookups = new List<Lookup>();
            this.Details = new BudgetDetailsVM();
            this.Notes = new List<Note>();
            this.Contributors = new List<Contributor>();
            this.Documents = new List<DocumentDb>();
            this.CurrentTotals = new BudCatSumTotals
            {

                //****  Added temp data to display -  Remove in Production **************************************
                Deposits = 0.00M,
                Commitments = 0.00M,
                Pending = 0.00M
            };
            //***********************************************************************************************
            Contributor A = new Contributor
            {
                ContactID = 1001,
                ContactLinkID = 1001,
                FirstName = "Lester",
                LastName = "Edwards",
                ItemID = 1001,
                ItemType = "Budget",
                ShowAsName = "L. Edwards",
                Title = "IT Director",
                Label = "PM"
            };
            Contributors.Add(A);

            Contributor B = new Contributor
            {
                ContactID = 1002,
                ContactLinkID = 1002,
                FirstName = "Vince",
                LastName = "Jordon",
                ItemID = 1001,
                ItemType = "Budget",
                ShowAsName = "V. Jordon",
                Title = "Owner",
                Label = "Boss"
            };
            Contributors.Add(B);
        }
    }

    
}
