using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class Skillset
    {
        [Key]
        public int SkillsetId { get; set; }
        public string Skill { get; set; }
        public string Description { get; set; }
    }

    public class ProjectSkillset
    {
        [Key]
        public long Id { get; set; }
        public long ProjectID { get; set; }
        public int SkillsetId { get; set; }
    }
}
