using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class DocFile
    {
        [Key]
        public long DocID { get; set; }
        public byte[] FileData { get; set; }

    }
}
