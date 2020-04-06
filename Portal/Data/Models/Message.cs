using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public partial class Message
    {
        [Key]
        public long MessageID { get; set; }
        public string EmailFrom { get; set; }
        public string EmailTo { get; set; }
        public string EmailCC { get; set; }
        public string EmailBcc { get; set; }
        public DateTime DateRec { get; set; }
        public string EmailBody { get; set; }
        public string EmailSubject { get; set; }
        public string UserID { get; set; }
        public bool IsDismissed { get; set; }
        public long ProjectID { get; set; }
        public string ItemType { get; set; }
        public long ItemNo { get; set; }
        public bool HasAttachments { get; set; }
        public bool  OnSched { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public DateTime DueDate { get; set; }
        public string FromCompany { get; set; }
        public string ToCompany { get; set; }
        public long ReplyMessageID { get; set; }
        [NotMapped]
        public long ParentId { get; set; }
        [NotMapped]
        public List<DocumentDb> DocumentDb { get; set; }
        [NotMapped]
        public List<long> list { get; set; }
        public long SchedID { get; set; }
        [NotMapped]
        public string Initial { get; set; }
        public bool IsRead { get; set; }
        public string ActionType { get; set; }
    }
}
