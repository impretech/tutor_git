using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class ChangeOrderViewModel
    {
        public ChangeOrder CO { get; set; }
        public string ProjectTitle { get; set; }
        public List<Lookup> Lookups { get; set; }
        public List<Note> Notes { get; set; }
        public List<DocumentDb> Documents { get; set; }


        public ChangeOrderViewModel()
        {
            this.CO = new ChangeOrder();
            this.ProjectTitle = string.Empty;
            this.Lookups = new List<Lookup>();
            this.Notes = new List<Note>();
            this.Documents = new List<DocumentDb>();
        }
    }
}
