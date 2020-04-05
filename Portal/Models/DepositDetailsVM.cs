using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Portal.Models.DepositViewModel;

namespace Portal.Models
{
    public class DepositDetailsVM
    {
        public List<GroupedDepositCategory> Categories { get; set; }
        public List<GroupedDepositDetail> DepDetails { get; set; }
    }
}
