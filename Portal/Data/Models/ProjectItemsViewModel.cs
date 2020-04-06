using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class ProjectItemsViewModel
    {
        public List<Budget> Estimates { get; set; }
        public List<Budget> Budgets { get; set; }
        public List<ContractViewModel> Contracts { get; set; }
        public List<ProposalViewModel> Proposals { get; set; }
        public List<ChangeOrder> COs { get; set; }
        public List<InvoiceStartupVM> Invoices { get; set; }
        public List<POViewModel> POs { get; set; }
        public List<Submittal> Subs { get; set; }
        public List<Deposit> Deposits { get; set; }
        public List<RFI> RFIs { get; set; }


        public ProjectItemsViewModel GetDefault(long projid)
        {
            //ProjectItemsViewModel result = new ProjectItemsViewModel();
            this.Estimates = new List<Budget>
            {
                new Budget().GetTempEstimate(projid)
            };
            this.Budgets = new List<Budget>
            {
                new Budget().GetTempBudget(projid)
            };
            this.Contracts = new List<ContractViewModel>
            {
                new ContractViewModel().getTempContract(projid)
            };
            this.Proposals = new List<ProposalViewModel>
            {
                new ProposalViewModel().getTemptProposal(projid)
            };
            this.COs = new List<ChangeOrder>
            {
                new ChangeOrder().getTempCO(projid)
            };
            this.Invoices = new List<InvoiceStartupVM>
            {
                new InvoiceStartupVM().GetTempInv1(projid),
                new InvoiceStartupVM().GetTempInv2(projid)
            };
            this.Deposits = new List<Deposit>
            {
                new Deposit().GetTempDeposit(projid)
            };
            this.Subs = new List<Submittal>()
            {
                new Submittal().getTempSubmittal(projid)
            };
            this.POs = new List<POViewModel>
            {
                new POViewModel().getTempPO(projid)
            };
            this.RFIs = new List<RFI>()
            {
                new RFI().getTempRFI(projid)
            };
            return this;
        }



    }

    public class ProjectItemLookup
    {
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public ProjectItemsViewModel ProjectItems { get; set; }
    }
}
