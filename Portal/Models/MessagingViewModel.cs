using System.Collections.Generic;
using System.Linq;

namespace Portal.Models
{
    public class MessagingViewModel
    {
        public List<LookupModel> MessagingTypes { get; set; }
        public List<LookupModel> ProjectTeam { get; set; }
        public List<newLookupModel> ProjectTeamEmails { get; set; }
        public List<LookupModel> Tasks { get; set; }
        public List<SaveMessageViewModel> ProjectMessages { get; set; }
        public List<LookupModel> Actions { get; set; }
        public List<LookupModel> Statuses { get; set; }
        public long projectId { get; set; }
        public long rfiId { get; set; }
    }

    public class LookupModel
    {
        public long Id { get; set; }
        public string Name { get; set; }
    }

    public class newLookupModel
    {
        public long Id { get; set; }
        public string param { get; set; }
        public string Name { get; set; }
    }
}