using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models {
    public class SchedulerControl {
        public List<WebAPIEvent> Data = new List<WebAPIEvent>();
        public SchedulerCollections Collections = new SchedulerCollections();
    }

    public class SchedulerCollections {
        public List<SchedulerCollectionItems> Projects = new List<SchedulerCollectionItems>();
        public List<SchedulerCollectionItems> PMs = new List<SchedulerCollectionItems>();
        public List<SchedulerCollectionItems> Skillsets = new List<SchedulerCollectionItems>();
    }

    public class SchedulerCollectionItems {
        public string id { get; set; }
        public string value { get; set; }
        public string label { get; set; }

    }
}
