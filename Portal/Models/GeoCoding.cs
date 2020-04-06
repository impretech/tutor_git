using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class GeoCoding
    {
        public class AddressComponent
        {
            public string long_name { get; set; }
            public string short_name { get; set; }
            public List<string> types { get; set; }
        }

        public class Location
        {
            public double lat { get; set; }
            public double lng { get; set; }
        }

        public class Northeast
        {
            public double lat { get; set; }
            public double lng { get; set; }
        }

        public class Southwest
        {
            public double lat { get; set; }
            public double lng { get; set; }
        }

        public class Viewport
        {
            public Northeast northeast { get; set; } = new Northeast();
            public Southwest southwest { get; set; } = new Southwest();
        }

        public class Geometry
        {
            public Location location { get; set; } = new Location();
            public string location_type { get; set; }
            public Viewport viewport { get; set; } = new Viewport();
        }

        public class PlusCode
        {
            public string compound_code { get; set; }
            public string global_code { get; set; }
        }

        public class Result
        {
            public List<AddressComponent> address_components { get; set; } = new List<AddressComponent>();
            public string formatted_address { get; set; }
            public Geometry geometry { get; set; } = new Geometry();
            public string place_id { get; set; }
            public PlusCode plus_code { get; set; } = new PlusCode();
            public List<string> types { get; set; }
        }

        public class GeoCode
        {
            public List<Result> results { get; set; } = new List<Result>();
            public string status { get; set; }
        }
    }
}
