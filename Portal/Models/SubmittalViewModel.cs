using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Portal.Data.Models;

namespace Portal.Models
{
    public class SubmittalViewModel
    {
        public Submittal Sub { get; set; }
        public string ProjectTitle { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<SubmittalDocs> Attachments { get; set; }
        public List<DistributionLog> DistrLogs { get; set; }
        public List<Note> Notes { get; set; }

        public SubmittalViewModel()
        {
            this.Sub = new Submittal();
            this.ProjectTitle = string.Empty;
            this.Lookups = new List<Lookup>();
            this.Attachments = new List<SubmittalDocs>();
            this.DistrLogs = new List<DistributionLog>();
            this.Notes = new List<Note>();
        }

    }
}
