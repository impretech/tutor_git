using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class RFI
    {
        [Key]
        public long RFI_ID { get; set; }
        public long ProjectID { get; set; }
        public string Writer { get; set; }
        public long PrevRFI_ID { get; set; }
        public string Requester { get; set; }
        public string Request { get; set; }
        public string RequesterCompany { get; set; }
        public string RequestSummary { get; set; }
        public string Status { get; set; }
        public DateTime DateCreated { get; set; }
        public string SenderRFINo { get; set; }
        public string Classification { get; set; }
        public string Category { get; set; }
        public DateTime DatePublished { get; set; }
        public DateTime DateDue { get; set; }
        public string ToName { get; set; }
        public string ToCompany { get; set; }
        public string Confirmation { get; set; }
        public string EntCode { get; set; }
        public string Action { get; set; }
        public string Attachments { get; set; }

        public RFI getTempRFI(long projid)
        {
            this.ProjectID = projid;
            this.Requester = "L Edwards";
            this.RequesterCompany = "Syvenn Inc";
            this.RequestSummary = "RFI Request Summary";
            this.Status = "Pending";
            this.ToCompany = "Prosys Inc";
            this.ToName = "V Jordon";
            this.Writer = "L Edwards";
            this.SenderRFINo = "PS-RFI-123";
            this.RFI_ID = 1001;
            this.Request = "this is the full request for the new RFI";
            this.DateCreated = DateTime.Now.AddDays(-3);
            this.DatePublished = DateTime.Now.AddDays(1);
            this.Category = "Design";
            
            return this;
        }
    }

    public class RFIEmail
    {
        [Key]
        public long RFIEmailID { get; set; }
        public long RFI_ID { get; set; }
        public string Writer { get; set; }
        public DateTime DateRec { get; set; }
        public string Body { get; set; }
    }

    public class RFIResponse
    {
        [Key]
        public long RFIResponseID { get; set; }
        public long RFI_ID { get; set; }
        public long RFIEmailID { get; set; }
        public string FromName { get; set; }
        public bool IsAnswer { get; set; }
        public string Response { get; set; }
        public string Company { get; set; }
        public string CompanyCode { get; set; }
        public DateTime ResponseDate { get; set; }
        public string Type { get; set; }
        public long VendorID { get; set; }
    }

    public class RFILookup
    {
        [Key]
        public long RFI_ID { get; set; }
        public long ProjectID { get; set; }
        public string ProjectTitle { get; set; }
        public string Writer { get; set; }
        public string Requester { get; set; }
        public string RequesterCompany { get; set; }
        public string RequestSummary { get; set; }
        public string EntCode { get; set; }
        public string Status { get; set; }
        public string SenderRFINo { get; set; }
    }

    public class RFIDocLink
    {
        [Key]
        public long RFIDocLinkID { get; set; }
        public long RFI_ID { get; set; }
        public long DocID { get; set; }
        public string Type { get; set; }
        public long ItemID { get; set; }
    }

    public class RFIDocs: RFIDocLink
    {
        public string FileName { get; set; }
        public string Writer { get; set; }
        public DateTime? Created { get; set; }
    }
}
