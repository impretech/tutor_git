using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models {
    public partial class Project {
        [Key]
        public long ProjectId { get; set; }
        public string ProjectNo { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Site { get; set; }
        public string CapitalNo { get; set; }
        public string CustID { get; set; }
        public string Phase { get; set; }
        public string Status { get; set; }
        public DateTime DateReceived { get; set; }
        public string FY { get; set; }
        public string TypeArea { get; set; }
        public string TypeConstruction { get; set; }
        public string SmartID { get; set; }
        public string SmartLinkRead { get; set; }
        public string SmartLinkEdit { get; set; }
        public string Requestor { get; set; }
        public string ImpactItem { get; set; }
        public DateTime? ImpactDate { get; set; }
        public long Gsf { get; set; }
        public string CreatedBy { get; set; }
        public string EntCode { get; set; }
        public string OwnerEmail { get; set; }
        public string Client { get; set; }
        public string OppID { get; set; }
        public long PMId { get; set; }
        public long Holder { get; set; }
        public DateTime? StartDate { get; set; }
        public int Duration { get; set; }
        public decimal Value { get; set; }
        public bool PMonSite { get; set; }
     }

    public class ProjectSkillsetLink
    {
        [Key]
        public int Id { get; set; }
        public int ProjectID { get; set; }
        public int SkillsetId { get; set; }
    }

    public class ProjectLookup
    {
        public long ProjectId { get; set; }
        public string ProjectNo { get; set; }
        public string Title { get; set; }
        public string EntCode { get; set; }
        public string ShowAs { get
                {
                return this.Title + " (" + this.ProjectNo +  ") " + this.ProjectId;
               } }
    }

}
