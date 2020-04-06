using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class HeatMapLayer
    {
        public int HeatMapLayerID { get; set; }
        public string Title { get; set; }
        public DateTime Created { get; set; }
        public string Description { get; set; }
        public string EntCode { get; set; }
    }

    public class HeatMapData
    {
        public long HeatMapDataID { get; set; }
        public int HeatMapLayerID { get; set; }
        public string Description { get; set; }
        public int Weight { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }

}
