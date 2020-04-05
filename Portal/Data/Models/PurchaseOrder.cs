using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class PurchaseOrder
    {
        [Key]
        public long PoID { get; set; }
        public long ProjectID { get; set; }
        public long ContractID { get; set; }
        public string BidPkg { get; set; }
        public string CSIIndex { get; set; }
        public long ChangeOrderID { get; set; }
        public string AccountNo { get; set; }
        public string Attention { get; set; }
        public string ToCompany { get; set; }
        public bool HasAttachments { get; set; }
        public string WorkSummary { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int DaysChanged { get; set; }
        public string SubAccountNo { get; set; }
        public DateTime Start { get; set; }
        public DateTime Complete { get; set; }
        public decimal PerComplete { get; set; }
        public decimal Amount { get; set; }
        public decimal AmountInv { get; set; }
        public string BidPhase { get; set; }
        public decimal Retainage { get; set; }
        public string Writer { get; set; }
        public string Type { get; set; }
    }

    public class POViewModel:PurchaseOrder
    {
        public string ProjectTitle { get; set; }
        public string ChangeOrderSummary { get; set; }
        public string CSIDesr { get; set; }

        public POViewModel getTempPO(long proj)
        {
            this.PoID = 1001;
            this.ProjectID = 1001;
            this.ProjectTitle = "Project 1 - Test";
            this.CSIIndex = "10011";
            this.CSIDesr = "Dry Wall";
            this.ContractID = 1003;
            this.ChangeOrderID = 1004;
            this.AccountNo = "101-105151";
            this.SubAccountNo = "TBD";
            this.DaysChanged = 3;
            this.Status = "COMPLETE";
            this.Start = DateTime.Now.AddDays(-2);
            this.Complete = DateTime.Now;
            this.PerComplete = 68;
            this.Amount = 59500.0M;
            this.AmountInv = 55500.0M;
            this.BidPhase = "TBD";
            this.Writer = "L Edwards";
            this.Type = "TBD";
            this.Attention = "V Jordon";
            this.ToCompany = "ProSys Inc";
            return this;
        }
    }


    public class PO {
        [Key]
        public long PoID { get; set; }
        public long ProjectID { get; set; }
        public string VendorPO { get; set; }
        public string AccountNo { get; set; }
        public DateTime PODate { get; set; }
        public string RequestedBy { get; set; }
        public string ReqNo { get; set; }
        public string Service { get; set; }
        public string Type { get; set; }
        public string QuoteCO { get; set; }
        public long QuoteCOID { get; set; }
        public long ContractID { get; set; }
        public DateTime WorkStartDate { get; set; }
        public DateTime WorkCompleteDate { get; set; }
        public string Terms { get; set; }
        public decimal VendorPOAmount { get; set; }
        public long VendorID { get; set; }
        public long VendorContactID { get; set; }
        public long VendorLocationID { get; set; }
        public string Status { get; set; }
        public decimal PerComplete { get; set; }
        public long ShipToLocationID { get; set; }
        public decimal Total { get; set; }
        public string EntCode { get; set; }
        public string Writer { get; set; }
        public string ShipAddress1 { get; set; }
        public string ShipAddress2 { get; set; }
        public string ShipCity { get; set; }
        public string ShipState  { get; set; }
        public string ShipZip { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public string SpecialInstruction { get; set; }
        public string Exempt { get; set; }
    }

    [NotMapped]
    public class vwPOVendor
    {
        [Key]
        public long PoID { get; set; }
        public long ProjectID { get; set; }
        public string VendorPO { get; set; }
        public string AccountNo { get; set; }
        public DateTime PODate { get; set; }
        public string RequestedBy { get; set; }
        public string ReqNo { get; set; }
        public string Service { get; set; }
        public string Type { get; set; }
        public string OriginalPO { get; set; }
        public string QuoteCO { get; set; }
        public long QuoteCOID { get; set; }
        public long ContractID { get; set; }
        public DateTime WorkStartDate { get; set; }
        public DateTime WorkCompleteDate { get; set; }
        public string Terms { get; set; }
        public decimal VendorPOAmount { get; set; }
        public long VendorID { get; set; }
        public long VendorContactID { get; set; }
        public long VendorLocationID { get; set; }
        public string Status { get; set; }
        public decimal PerComplete { get; set; }
        public long ShipToLocationID { get; set; }
        public decimal Total { get; set; }
        public string EntCode { get; set; }
        public string Writer { get; set; }
        public string ShipAddress1 { get; set; }
        public string ShipAddress2 { get; set; }
        public string ShipCity { get; set; }
        public string ShipState { get; set; }
        public string ShipZip { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public string SpecialInstruction { get; set; }
        public string VendorName { get; set; }
        public string ProjectTitle { get; set; }
        public string Exempt { get; set; }
    }

    public class POLine
    {
        [Key]
        public long PoLineID { get; set; }
        public long PoID { get; set; }
        public long ProjectID { get; set; }
        public int Order { get; set; }
        public string Code { get; set; }
        public decimal AvailFunds { get; set; }
        public decimal Price { get; set; }
        public decimal Cost { get; set; }
        public string VendorPartNo { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public int Quantity { get; set; }
        public DateTime VendDelvDate { get; set; }
        public DateTime RequiredByDate { get; set; }
        public bool OnSched { get; set; }
        [DataType("decimal(5 ,2")]
        public decimal PerComplete { get; set; }
        public long POGroupID { get; set; }
        public DateTime? OrderDate { get; set; }
    }

    public class POGroup
    {
        [Key]
        public long POGroupID { get; set; }
        public long PoID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string Type { get; set; }
        public int Order { get; set; }
        public string Status { get; set; }
        public DateTime EnteredDate { get; set; }
        public DateTime ApprovDate { get; set; }
        public DateTime ItemDate { get; set; }
    }

    public class POLineVM: POLine
    {
        public string Category { get; set; }
        public string CatDescription { get; set; }
        public decimal FundBalance { get; set; }
    }

    public class  LineCode
    {
        [Key]
        public long BudgetDetailID { get; set; }
        //[Key, Column(Order =1 )]
        public long ProjectID { get; set; }
        //[Key, Column(Order = 2)]
        public string Code { get; set; }
        //[Key, Column(Order = 3)]
        
        public long BudCatID { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public decimal DepositTot { get; set; }
        public decimal BudgetTot { get; set; }
        public decimal AvailFunds { get; set; }
    }

    public class QuoteAward
    {
        [Key]
        public long QuoteID { get; set; }
        public  long ProjectID { get; set; }
        public string Status { get; set; }
        public long VendorID { get; set; }
        public string VendorName { get; set; }
        public decimal AwardAmount { get; set; }
        public long ContractNo { get; set; }
        public long PhoneID { get; set; }
        public string PhoneLabel { get; set; }
        public string PhoneNumber { get; set; }
        public long LocationID { get; set; }
        public string LocationLabel { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string AddCity { get; set; }
        public string AddState { get; set; }
        public string AddZip { get; set; }
        public string Description { get; set; }
    }

    public class  QuoteCOLookup
    {
        public string ID { get; set; }
        public string ItemType { get; set; }
        public long  ItemID { get; set; }
        public long VendorID { get; set; }
        public string Vendor { get; set; }
        public decimal Amount { get; set; }
        public long ContractNo { get; set; }
        public long PhoneID { get; set; }
        public string PhoneLabel { get; set; }
        public string PhoneNumber { get; set; }
        public long LocationID { get; set; }
        public string LocationLabel { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string AddCity { get; set; }
        public string AddState { get; set; }
        public string AddZip { get; set; }
        public string Description { get; set; }
        public string ListItem { get; set; }
    }

}
