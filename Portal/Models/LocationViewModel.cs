﻿using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class LocationViewModel: Location
    {
        public long ParentID { get; set; }
        public string ParentType { get; set; }
    }
}
