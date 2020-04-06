using System.ComponentModel.DataAnnotations;

namespace Portal.Data.Models
{
    public partial class ProjectTeam
    {
        [Key]
        public long ProjectTeamID { get; set; }
        public long ContactID { get; set; }
        public long ProjectID { get; set; }
        public string Role { get; set; }
        public string EntCode { get; set; }
    }

    public partial class ProjectTeamDetail 
    {
        [Key]
        public long ProjectTeamID { get; set; }
        public long ContactID { get; set; }
        public long ProjectID { get; set; }
        public string Role { get; set; }
        public string EntCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Title { get; set; }
        public string Company { get; set; }
        public string EmailAddress { get; set; }
        public long EmailID { get; set; }
        public string PhoneNumber { get; set; }
        public long PhoneID { get; set; }

    }

}
