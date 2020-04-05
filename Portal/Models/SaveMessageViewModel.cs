using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class SaveMessageViewModel
    {
        public long Id { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public DateTime SendDate { get; set; }
        public DateTime dueDate { get; set; }
        public string Message { get; set; }
        public long ProjectID { get; set; }
        public string Type { get; set; }
        public long parentId { get; set; }
        public long itemNo { get; set; }
        public string initial { get; set; }

        public bool isRead { get; set; }
        public string actionType { get; set; }

        public List<DocumentDb> DocumentDb  { get;set;}
    }
}
