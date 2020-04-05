using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public partial class Note
    {
        [Key]
        public long NoteID { get; set; }
        public long ProjectID { get; set; }
        public string Writer { get; set; }
        public DateTime Created { get; set; }
        public string ProgressNote { get; set; }
        public long ItemNo { get; set; }
        public string ItemType { get; set; }
    }
}
