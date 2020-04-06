using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models {
    public class PMAssignment {
    }

    public class PMAssignmentVM : PMAssignment {
        public List<string> ProjectTitles { get; set; }
        public List<ProjectMgr> PMs { get; set; }
        public List<Skillset> Skillsets { get; set; }

        //public List<WebAPIEvent> Events { get; set; }

        public List<Location> Locations { get; set; }
    }
}
