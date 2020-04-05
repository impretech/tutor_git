using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class WebApiTask
    {
        public long id { get; set; }
        public string text { get; set; }
        public string start_date { get; set; }
        public int duration { get; set; }
        public decimal progress { get; set; }
        public long? parent { get; set; }
        public string type { get; set; }
        public string target { get; set; }
        public long projectid { get; set; }
        public int sortorder { get; set; }
        public bool editable { get; set; }
        public bool readOnly {get; set;}
        public bool open
        {
            get { return true; }
            set { }
        }

        public static explicit operator WebApiTask(Task task)
        {
            return new WebApiTask
            {
                id = task.Id,
                text = task.Text,
                start_date = task.StartDate.ToString("yyyy-MM-dd HH:mm"),
                duration = task.Duration,
                parent = task.ParentId,
                type = task.Type,
                progress = task.Progress,
                projectid = task.ProjectID,
                sortorder = task.SortOrder,
                editable = task.Editable,
                readOnly = task.Readonly
            };
        }

        public static explicit operator Task(WebApiTask task)
        {
            return new Task
            {
                Id = task.id,
                Text = task.text,
                StartDate = DateTime.Parse(task.start_date,
                    System.Globalization.CultureInfo.InvariantCulture),
                Duration = task.duration,
                ParentId = task.parent,
                Type = task.type,
                Progress = task.progress,
                ProjectID = task.projectid,
                SortOrder = task.sortorder,
                Editable = task.editable,
                Readonly = task.readOnly
            };
        }
    }

    public class WebApiLink
    {
        public long id { get; set; }
        public string type { get; set; }
        public long source { get; set; }
        public long target { get; set; }
        public long projectid { get; set; }
        public int lag { get; set; }
        public bool readOnly { get; set; }
        public bool editable { get; set; }


        public static explicit operator WebApiLink(Link link)
        {
            return new WebApiLink
            {
                id = link.Id,
                type = link.Type,
                source = link.SourceTaskId,
                target = link.TargetTaskId,
                projectid = link.ProjectID,
                editable = link.Editable,
                readOnly = link.Readonly,
                lag = link.Lag
            };
        }

        public static explicit operator Link(WebApiLink link)
        {
            return new Link
            {
                Id = link.id,
                Type = link.type,
                SourceTaskId = link.source,
                TargetTaskId = link.target,
                ProjectID = link.projectid,
                Editable = link.editable,
                Readonly = link.readOnly,
                Lag = link.lag
            };
        }
    }
}
