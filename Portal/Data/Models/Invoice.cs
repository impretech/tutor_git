using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Invoice
    {
        public long InvoiceID { get; set; }
        public long ProjectID { get; set; }
        public long VendorID { get; set; }
        public string VendorInvNo { get; set; }
        public DateTime Received { get; set; }
        public DateTime? Paid { get; set; }
        public DateTime VendorDate { get; set; }
        public string Status { get; set; }
        public decimal VendorInvAmount { get; set; }
        public decimal ApprovToPay { get; set; }
        public long  POId { get; set; }
        public string AccountNo { get; set; }
        public DateTime WorkStart { get; set; }
        public DateTime WorkComplete { get; set; }
        public long VendorContactID { get; set; }
        public string SpecialInstructions { get; set; }
        public string RequestBy { get; set; }
        public decimal PerComplete { get; set; }
        public long QuoteCOID { get; set; }
        public long VendorLocationID { get; set; }
        public string EntCode { get; set; }
        public string Writer { get; set; }
        public string ShipAddress1 { get; set; }
        public string ShipAddress2 { get; set; }
        public string ShipCity { get; set; }
        public string ShipState { get; set; }
        public string ShipZip { get; set; }
        public string Terms { get; set; }
        public decimal VendorPOAmount { get; set; }
        public string Services { get; set; }
        public string Exempt { get; set; }
        public string QuoteCO { get; set; }
        public long ContractID { get; set; }
        public string RefNo { get; set; }

    }

    public class InvLine
    {
        [Key]
        public long InvLineID { get; set; }
        public long InvoiceID { get; set; }
        public long ProjectID { get; set; }
        public int Order { get; set; }
        public string Code { get; set; }
        public decimal Price { get; set; }
        public decimal Cost { get; set; }
        public string VendorPartNo { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public int Quantity { get; set; }
        public bool OnSched { get; set; }
        public decimal PerComplete { get; set; }

        public decimal AmountComplete { get; set; }
        public decimal InvoiceToDate { get; set; }
        public decimal BalToInvoice { get; set; }
        public decimal CurrentInvAmount { get; set; }
        public decimal CurrentAmountApproved { get; set; }
        public decimal POBalance { get; set; }
    }

    //public class InvLineShow: InvLine
    //{

    //}

    public class InvoiceStartupVM : Invoice{
        public string VendorName { get; set; }
        public string ProjectTitle { get; set; }

        public InvoiceStartupVM GetTempInv1(long projid)
        {
            this.InvoiceID = 1001;
            this.ProjectID = projid;
            this.ProjectTitle = "Project 1";
            this.VendorName = "ProSys Inc";
            this.VendorID = 1001;
            this.VendorDate = DateTime.Now;
            this.VendorInvAmount = 12000M;
            this.VendorInvNo = "IV12-1212-11";
            this.Received = DateTime.Now;
            this.Status = "Awaiting Payment";
            return this;
        }

        public InvoiceStartupVM GetTempInv2(long projid)
        {
            this.InvoiceID = 1002;
            this.ProjectID = projid;
            this.ProjectTitle = "Project 2";
            this.VendorName = "Syvenn";
            this.VendorID = 1001;
            this.VendorDate = DateTime.Now;
            this.VendorInvAmount = 23000M;
            this.VendorInvNo = "P-12128";
            this.Received = DateTime.Now;
            this.Status = "Awaiting Payment";
            return this;
        }
    }
}
