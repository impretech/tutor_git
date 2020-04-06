using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class CRM_Import
    {   [Key]
        public long CRM_ID { get; set; }
        public string CRM_Type { get; set; }
        public string AccountName { get; set; }
        public string Contract { get; set; }
        public string CreatedBy { get; set; }
        public string Description { get; set; }
        public string OpportunityName { get; set; }
        public string Type { get; set; }
        public string Territory { get; set; }
        public DateTime RequestedStart { get; set; }
        public DateTime Created { get; set; }
        public string SiteAddress1 { get; set; }
        public string SiteAddress2 { get; set; }
        public string SiteCity { get; set; }
        public string SiteState { get; set; }
        public string SiteZip { get; set; }
        public bool ProjectCreated { get; set; }
        public string OpportunityOwner { get; set; }
        public string OppID { get; set; }
        public string AccountID { get; set; }
        public string OwnerID { get; set; }
        public string OwnerPhone { get; set; }
        public string OwnerEmail { get; set; }

        public string Stage { get; set; }

        public bool isNew { get; set; }
    }
}
