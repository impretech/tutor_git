using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public partial class DocumentDb
    {
        [Key]
        public long DocID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public long ProjectID { get; set; }
        public DateTime? Created { get; set; }
        public string CreatedBy { get; set; }
        public string ItemType { get; set; }
        public long ItemNo { get; set; }
        public long FileLength { get; set; }
    }

    public class DocLookup
    {
        public string EntCode { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
    }

    public class QuoteDoc: DocumentDb
    {
        public string DocType { get; set; }
        public long LinkID { get; set; }
    }

    public class DocCards:DocumentDb
    {
        public byte[] Image { get; set; }
        public List<long> Attachments { get; set; }
    }

    public class DocumentLink
    {
        [Key]
        public long DocLinkID { get; set; }
        public long DocID { get; set; }
        public string ItemType { get; set; }
        public long ItemNo { get; set; }
    }

}
