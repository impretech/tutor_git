using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Razor;

namespace Portal.Helpers {
    public class ViewLocationExpander : IViewLocationExpander {
        public IEnumerable<string> ExpandViewLocations(ViewLocationExpanderContext context, IEnumerable<string> viewLocations) {
            var locations = new List<string>(viewLocations);

            locations.Add("/Features/Shared/{0}.cshtml");
            locations.Add("/Features/Partials/{0}.cshtml");
            locations.Add("/Features/{1}/{0}.cshtml");

            locations.Add("/Features/Security/{1}/{0}.cshtml");

            return locations;
        }

        public void PopulateValues(ViewLocationExpanderContext context) {
            // do nothing.. not needed for this 
        }
    }
}
