using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models {
    public class AppData {
        public UserData User = new UserData();
        public ConfigData Config = new ConfigData();
        public RoutingData Routing = new RoutingData();
       
        public class UserData {
            public int Id { get; set; }
            public string Name { get; set; }
            public DateTime Expires { get; set; }
        }

        public class ConfigData {
            public string ApiUrl { get; set; }
        }

        public class RoutingData {
            public string Controller { get; set; }
            public string Action { get; set; }
            public string XsrfToken { get; set; }
        }
    }
}
