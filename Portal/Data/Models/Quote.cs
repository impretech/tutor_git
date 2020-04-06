using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Quote
    {
        [Key]
        public long QuoteID { get; set; }
        public long ProjectID { get; set; }
        public DateTime CreatedDate { get; set; }
        public string TypeQuote { get; set; }
        public string TypeWork { get; set; }
        public string WorkIndex { get; set; }
        public DateTime BidIssue { get; set; }
        public DateTime PreBid { get; set; }
        public DateTime DueDate { get; set; }
        public string Description { get; set; }
        public long AwardedBidderID { get; set; }
        public long PONo { get; set; }
        public long ContractNo { get; set; }
        public decimal AwardAmount { get; set; }
        public string AcctNo { get; set; }
        public decimal Budget { get; set; }
        public string Status { get; set; }
        public string EntCode { get; set; }
    }

    public class QuoteLookup
    {
        [Key]
        public long QuoteID { get; set; }
        public long ProjectID { get; set; }
        public DateTime CreatedDate { get; set; }
        public string TypeQuote { get; set; }
        public string TypeWork { get; set; }
        public string WorkIndex { get; set; }
        public DateTime BidIssue { get; set; }
        public DateTime PreBid { get; set; }
        public DateTime DueDate { get; set; }
        public string Description { get; set; }
        public long AwardedBidderID { get; set; }
        public long PONo { get; set; }
        public long ContractNo { get; set; }
        public decimal AwardAmount { get; set; }
        public string AcctNo { get; set; }
        public decimal Budget { get; set; }
        public string Status { get; set; }
        public string EntCode { get; set; }
        public string Title { get; set; }
    }

    public class QuoteBid
    {
        [Key]
        public long BidID { get; set; }
        public long QuoteID { get; set; }
        public long VendorID { get; set; }
        public decimal BaseBid { get; set; }
        public bool BidBond { get; set; }
        public int MWDBE { get; set; }
        public string Comment { get; set; }
        public decimal BidTot { get; set; }
    }

    public class QuoteAddendum
    {
        [Key]
        public long AddendumID { get; set; }
        public long QuoteID { get; set; }
        public string  Title { get; set; }
        public string  Description { get; set; }
    }

    public class QuoteBidAddendum
    {
        [Key]
        public long BidAddendumID { get; set; }
        public long AddendumID { get; set; }
        public long BidID { get; set; }
        public bool Acknowledgement { get; set; }
    }

    public class QuoteBidAlt
    {
        [Key]
        public long BidAltID { get; set; }
        public long BidID { get; set; }
        public string Description { get; set; }
        public string Title { get; set; }
        public decimal Amount { get; set; }
        public bool Selected { get; set; }
    }

    public class QuoteBidSummary : QuoteBid
    {
        public string Version { get; set; }
    }


}
