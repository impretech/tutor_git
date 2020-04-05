using Portal.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class ProjectDetails
    {
        public Project Project { get; set; }

        public BudgetSummary BudgetData { get; set; }

        public ScheduleSummary SchedData { get; set; }

        public ProjectFinBarData FinBarData { get; set; }

        public Note LastNote { get; set; }

        public decimal Score { get; set; }

        public List<Note> Notes { get; set; }
        public List<Lookup> Lookups { get; set; }
        public MessagingViewModel MessagingData { get; set; }

        public ProjectItemsViewModel ProjectItems { get; set; }

        public List<ProjectMgr> ProjectManagers { get; set; }
    }

    public class BudgetSummary
    {
        public long ProjectId { get; set; }
        public decimal Budgeted { get; set; }
        public decimal Committed { get; set; }
        public decimal Paid { get; set; }
    }

    public class ScheduleSummary
    {
        public long ProjectId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public decimal ComplPerc { get; set; }
    }

    public class DetailItems {
        public string DisplayType { get; set; }   //Label, Spacer, TextArea
        public string Property { get; set; }  //Name to display as label
        public string Value { get; set; }  //Actual value, formatted as you want displayed
    }
}
