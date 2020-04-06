using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class ChangeOrder
    {
        public long ChangeOrderID { get; set; }
        public long ProjectID { get; set; }
        public string AccountNo { get; set; }
        public string CSIIndex { get; set; }
        public long PoID { get; set; }
        public long RFIID { get; set; }
        public string SpecSection { get; set; }
        public string Area { get; set; }
        public string BidPkg { get; set; }
        public string AEBulletinNo { get; set; }
        public string Attention { get; set; }
        public string ChangeToCompany { get; set; }
        public long ChangeToCompanyID { get; set; }
        public string ChangeFromCompany { get; set; }
        public string ChangeFromCompanyID { get; set; }
        public string ChangeSummary { get; set; }
        public string ChangeDescription { get; set; }
        public bool HasAttachments { get; set; }
        public long DocID { get; set; }
        public string Reason { get; set; }
        public string Response { get; set; }
        public decimal Quote { get; set; }
        public decimal Estimate { get; set; }
        public string FromContractor { get; set; }
        public long FromContactID { get; set; }
        public string ToContractor { get; set; }
        public long ToContactID { get; set; }
        public DateTime? Approved { get; set; }
        public int DaysChanged { get; set; }
        public string Status { get; set; }
        public string EntCode { get; set; }

        public ChangeOrder getTempCO(long projid)
        {
            this.ProjectID = projid;
            this.ChangeOrderID = 1001;
            this.AccountNo = "TBD";
            this.CSIIndex = "1600";
            this.PoID = 1001;
            this.HasAttachments = false;
            this.Reason = "Change had to be made";
            this.DaysChanged = 4;
            this.Quote = 12000M;
            this.Estimate = 11000M;
            this.ToContractor = "L Edwards";
            this.FromContractor = "V Jordon";
            this.Response="Aggreed change has to be made";
            this.ChangeToCompany = "ProSys Inc";
            this.ChangeFromCompany = "Syvenn Inc";
            this.ChangeSummary = "Temp Change Summary";
            this.ChangeDescription = "This is the full change description";
            this.Attention = "V Jordon";
            this.Approved = DateTime.Now.AddDays(-3);
            this.Status = "Pending";
            this.EntCode = "PRO1";
            return this;
        }
    }
}
