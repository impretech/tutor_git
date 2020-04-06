using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Submittal
    {
        [Key]
        public long SubmittalID { get; set; }
        public long ProjectID { get; set; }
        public string Classification { get; set; }
        public string Summary { get; set; }
        public string Category { get; set; }
        public string SubmittalNo { get; set; }
        public DateTime? PublishedDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string Specification { get; set; }
        public string FromName { get; set; }
        public string FromCompany { get; set; }
        public string Description { get; set; }
        public string RecToName { get; set; }
        public string RecToCompany { get; set; }
        public string RecSummary { get; set; }
        public string ReviewerSubmittalNo { get; set; }
        public string RevName { get; set; }
        public string RevCompany { get; set; }
        public string Status { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public DateTime? ReviewedDateSent { get; set; }
        public string RecDetail { get; set; }
        public string Attachments { get; set; }
        public string EntCode { get; set; }

        public Submittal getTempSubmittal(long proj)
        {
            //this.Attachments = new List<SubmittalDocLink>();
            //this.Lookups = new List<Lookup>();
            //this.Sub = new Submittal();
            //this.DistrLogs = new List<DistributionLog>();

            this.SubmittalID = 1005;
            this.RecToName = "L Edwards";
            this.ProjectID = 1002;
            this.FromName = "Lester Edwards";
            this.FromCompany = "ProSys Inc";
            this.RecToName = "Vince Jordon";
            this.SubmittalNo = "RT2-1212-11";
            this.RevName = "Troy Wilson";
            this.Status = "PENDING";
            this.DueDate = DateTime.Now;
            this.PublishedDate = DateTime.Now;
            this.Description = "This is a recommendation";
            this.RecDetail = "This is a submittal for testing";
            this.Summary = "This is a recommendation";
            this.Category = "TBD";
            this.Classification = "TBD";
            this.ReviewedDate = DateTime.Now;
            this.EntCode = "PRO1";
            this.ReviewedDateSent = DateTime.Now.AddDays(-2);
            return this;
        }
    }

    public class SubmittalDocLink
    {
        [Key]
        public long SubmittalDocLinkID { get; set; }
        public long SubmittalID { get; set; }
        public long DocID { get; set; }
        public string Type { get; set; }   // Type: Description or Recommendation
     
    }


    public class SubmittalDocs: SubmittalDocLink
    {
        public string FileName { get; set; }
        public string Writer { get; set; }
        public DateTime? Created { get; set; }

    }

}
