using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Proposal
    {
        public long ProposalID { get; set; }
        public long ProjectID { get; set; }
        public string Type { get; set; }
        public DateTime PreBid { get; set; }
        public DateTime BidDue { get; set; }
        public DateTime BidIssue { get; set; }
        public string WorkType { get; set; }
        public string VendorPropNo { get; set; }
        public int Alternates { get; set; }
        public int Addenda { get; set; }
        public string AwardVendor { get; set; }
        public long VendorID { get; set; }
        public decimal AwardedAmount { get; set; }
        public string Status { get; set; }

    }

    public class ProposalViewModel : Proposal
    {
        public string VendorName { get; set; }
        public string ProjectTitle { get; set; }
        public ProposalViewModel getTemptProposal(long projid)
        {
            this.ProposalID = 1004;
            this.ProjectID = projid;
            this.Type = "Quote";
            this.PreBid = DateTime.Now;
            this.BidDue = DateTime.Now.AddDays(3);
            this.BidIssue = DateTime.Now.AddDays(1);
            this.WorkType = "TBD";
            this.VendorPropNo = "P10128-110";
            this.Alternates = 0;
            this.Addenda = 0;
            this.AwardVendor = "ProSys Inc";
            this.VendorID = 1001;
            this.AwardedAmount = 320000M;
            this.Status = "Pending";
            this.VendorName = "Syvenn";
            this.ProjectTitle = "Project Test";
            return this;
        }
    }
}
