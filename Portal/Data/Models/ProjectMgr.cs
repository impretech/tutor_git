using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class ProjectMgr
    {
        [Key]
        public long PMId { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public long ContactID { get; set; }
        public string Status { get; set; }
    }

    public class PMSkillset
    {
        [Key]
        public long PMSkillsetId { get; set; }
        public long PMId { get; set; }
        public int SkillsetId { get; set; }
    }

    public class PMSkillsetView
    {
        [Key]
        public long PMSkillsetId { get; set; }
        public long PMId { get; set; }
        public long SkillsetId { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public long ContactID { get; set; }
        public string Skill { get; set; }
    }
}
