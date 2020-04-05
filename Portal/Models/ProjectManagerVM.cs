using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class ProjectManagerVM
    {
        public long PMId { get; set; }
        public string Name { get; set; }        
        //public List<AssignedProjectVM> AssignedProjects { get; set; }
        public List<ProjectTask> AssignedProjectTasks { get; set; }
        /// <summary>
        /// Lists the tasks this PM is currently working on merged with the tasks of currently loaded project.
        /// </summary>
        public List<ProjectTask> MergedProjectTasks { get; set; }
    }

    public class AssignedProjectVM
    {
        public AssignedProjectVM()
        {
            WorkSchedule = new List<ProjectTask>();
        }
        public string ProjectName { get; set; }
        public List<ProjectTask> WorkSchedule { get; set; }
    }

    public class ProjectTask
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public long ProjectId { get; set; }
        public string ProjectTitle { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate
        {
            get
            {
                return this.StartDate.AddDays(this.Duration-1);
            }
        }
        public string DateLabel
        {
            get
            {
                return this.Date.ToString("MMM dd");
            }
        }
        /// <summary>
        /// The date this task reprensents on the chart
        /// </summary>
        public DateTime Date
        {
            get;set;
        }

        public int Duration { get; set; }
        public int WT { get; set; }        
    }

    class ProjectTaskEqualityComparer : IEqualityComparer<ProjectTask>
    {
        public bool Equals(ProjectTask task1, ProjectTask task2)
        {
            if (task1 == null || task2 == null)
                return false;

            return task1.Date.Date == task2.Date.Date;
               
        }

        public int GetHashCode(ProjectTask task)
        {
            return task.Date.Year + task.Date.Month + task.Date.Day;
        }
    }

}
