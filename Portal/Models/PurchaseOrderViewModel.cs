using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class PurchaseOrderViewModel
    {
        public PO Po { get; set; }
        public string ProjectTitle { get; set; }
        public List<POGroup> POGroups { get; set; }
        public List<POLineVM> LineItems { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }
        public List<DocumentDb> Documents { get; set; }
        public string VendorName { get; set; }
        public decimal TotalEx { get; set; }
        public decimal OriginalPO { get; set; }
        public decimal AmtInvToDate { get; set;}
        public decimal Balance { get; set; }

        public PurchaseOrderViewModel()
        {
            this.Po = new PO();
            this.ProjectTitle = string.Empty;
            this.LineItems = new List<POLineVM>();
            this.POGroups = new List<POGroup>();
            this.Lookups = new List<Lookup>();
            this.Notes = new List<Note>();
            this.Documents = new List<DocumentDb>();
            this.TotalEx = 0;
            this.OriginalPO = 0;
            this.AmtInvToDate = 0;
            this.Balance = 0;
        }
    }
}
