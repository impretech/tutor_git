using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class RFIViewModel
    {
        public RFI rFI { get; set; }
        public List<RFIResponse> Responses {get; set;}
        public List<RFIDocs> Attachments { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }
        public MessagingViewModel MessagingData { get; set; }

        public RFIViewModel()
        {
            rFI = new RFI();
            Responses = new List<RFIResponse>();
            Attachments = new List<RFIDocs>();
            Lookups = new List<Lookup>();
            Notes = new List<Note>();
        }
    }
}
