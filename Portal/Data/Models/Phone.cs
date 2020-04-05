using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public partial class Phone
    {
        [Key]
        public long PhoneID { get; set; }
        public string Label { get; set; }
        public string PhoneNumber { get; set; }
        public bool isPrimary { get; set; }
    }

}
