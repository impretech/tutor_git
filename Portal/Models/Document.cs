using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class DocumentData : UploadData
    {
        public long DocID { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public long FileLength { get; set; }
    }

    public class UploadData
    {
        public long ProjectID { get; set; }
        public string ItemType { get; set; }
        public long ItemNo { get; set; }
        public string EntCode { get; set; }
    }
}
