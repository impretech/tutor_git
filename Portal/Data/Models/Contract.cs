using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Contract
    {
        [Key]
        public long ContractID { get; set; }
        public long ProjectID { get; set; }
        public long VendorID { get; set; }
        public string AccountNo { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public string Writer { get; set; }
        public DateTime Written { get; set; }
        public string Status { get; set; }
        public string BondSecured { get; set; }
        public string PoNo { get; set; }
        public string PoReq { get; set; }
        public string Bond { get; set; }
        public string Insurance { get; set; }
        public string EntCode { get; set; }
        public string VendorName { get; set; }
        public string QuoteDescription { get; set; }
        public long QuoteID { get; set; }

    
    }

    public class ContractViewModel 
    {
        public string ProjectTitle { get; set; }
        public List<DocumentDb> Documents { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }
        public Contract contract { get; set; }

        public ContractViewModel getTempContract(long projid)
        {
            this.contract = new Contract
            {
                ContractID = 1001,
                ProjectID = projid,
                VendorID = 1002,
                AccountNo = "TBD",
                Amount = 340000.0M,
                Description = "Initial contract for building on new hospital tower",
                Writer = "L Edwards",
                Written = DateTime.Now,
                Status = "Complete",
                BondSecured = "yes",
                PoNo = "PO1212",
                PoReq = "Req1212",
                Bond = "TBD",
                Insurance = "Mutual of Omaha",
                VendorName = "ProSys Inc"
            };
            this.ProjectTitle = "Project 3";
            return this;
        }
    }
}
