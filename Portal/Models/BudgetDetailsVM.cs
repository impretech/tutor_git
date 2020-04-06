using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Portal.Data.Models;

namespace Portal.Models
{
    public class BudgetDetailsVM
    {
        public List<BudgetCategory> Categories { get; set; }
        public List<BudgetDetail> BudDetails { get; set; }
    }
}
