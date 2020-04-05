using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Lookup
    {
        [Key]
        public long LookupID { get; set; }
        public string Module { get; set; }
        public string EntCode { get; set; }
        public string Prompt { get; set; }
        public string Value { get; set; }
    }
}
