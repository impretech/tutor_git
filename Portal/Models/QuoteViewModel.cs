using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class QuoteViewModel
    {
        public Quote quote { get; set; }
        public List<QuoteBidSummary> Bids { get; set; }
        public List<QuoteAddendum> Addendums { get; set; }
        public List<QuoteBidAlt> Alternatives { get; set; }
        public List<QuoteBidAddendum> AddendAck { get; set; }
        public List<DocumentDb> Documents { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }

        public QuoteViewModel()
        {
            quote = new Quote();
            Bids = new List<QuoteBidSummary>();
            Addendums = new List<QuoteAddendum>();
            Alternatives = new List<QuoteBidAlt>();
            AddendAck = new List<QuoteBidAddendum>();
            Documents = new List<DocumentDb>();
            Lookups = new List<Lookup>();
            Notes = new List<Note>();
        }

    }
}
