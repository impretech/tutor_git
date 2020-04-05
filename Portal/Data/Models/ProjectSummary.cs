using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class DocumentSummary
    {
        public string Item { get; set; }
        public int Pending { get; set; }
        public int Critical { get; set; }
        public string Status { get; set; }
        public int Complete { get; set; }
    }

    public class FinancialSummary
    {
        public string Item { get; set; }
        public decimal Amount { get; set; }
        public int Usage { get; set; }
        public string Status { get; set; }
    }

    public class MilestoneSummary
    {
        public long TaskID { get; set; }
        public string Milestone { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int Target { get; set; }
        public int Actual { get; set; }
        public string Status { get; set; }
    }

    public class SummaryDetail
    {
        public string ItemType { get; set; }
        public long ItemNo { get; set; }
        public string Summary { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime RecievedDate { get; set; }
        public string AlertType { get; set; }
        public int Order { get; set; }
        public string Status { get; set; }
        public string Vendor { get; set; }
        public decimal Amount { get; set; }
    }

    public class FinancialDetail
    {
        public int Order { get; set; }
        public string Code { get; set; }
        public string Item { get; set; }
        public string ItemType { get; set; }
        public long ItemNo { get; set; }
        public decimal Amount { get; set; }
        public string Vendor { get; set; }
        public string Status { get; set; }
        public string POCO { get; set; }
        public long POCOId { get; set; }
    }


    public class ScheduleDetail
    {
        public long TaskID { get; set; }
        public int Order { get; set; }
        public string Task { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
    }

    public class BudgetSumDetail
    {
        public long BudgetDetailID { get; set; }
        public string Code { get; set; }
        public long ProjectID { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public Decimal DepositTot { get; set; }
        public Decimal BudgetTot { get; set; }
        //public Decimal POTot { get; set; }
        public Decimal AvailFunds { get; set; }
        public string Status { get; set; }
    }

    public class ActionSumDetails
    {
        public int Order { get; set; }
        public long ActionID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string Action { get; set; }
        public string From { get; set; }
        public string TO { get; set; }
        public string Instructions { get; set; }
        public DateTime DateSent { get; set; }
        public DateTime DueDate { get; set; }
        public string AlertType { get; set;}
        public string Status { get; set; }
        public long MessageID { get; set; }
    }

    public class POSumDetails
    {
        public int Order { get; set; }
        public long PoID { get; set; }
        public long POLineItemID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string ItemPartNo { get; set; }
        public int Qty { get; set; }
        public string Description { get; set; }
        public string Vendor { get; set; }
        public string PONo { get; set; }
        public decimal Amount { get; set; }
        public DateTime? OrderDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? OrderBy { get; set; }
        public string AlertType {get; set;}
        public string Status { get; set; }
        public DateTime? PODate { get; set; }

    }

    public class ShipTracking
    {
        [Key]
        public long TrackingID { get; set; }
        public long POLineItemID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string ShipVendor { get; set; }
        public string TrackingNo { get; set; }
        public int Qty { get; set; }
        public string Status { get; set; }

    }

    public class AlertLookup
    {
        public long AlertID { get; set;}
        public string ItemType { get; set; }
        public long ItemID { get; set; }
        public string Description { get; set; }
        public string Impact { get; set; }
        public string Recommendation { get; set; }
        public DateTime AlertDate { get; set; }
        public string Status { get; set; }
        public string User { get; set; }
        public string Type { get; set; }
    }


}
