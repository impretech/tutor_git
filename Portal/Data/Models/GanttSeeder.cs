using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class GanttSeeder
    {
        public static void Seed(SyvennDBContext context)
        {
            if (context.Tasks.Any())
            {
                return;   // DB has been seeded
            }

            using (var transaction = context.Database.BeginTransaction())
            {
                List<Task> tasks = new List<Task>()
               {
                  new Task()
                    {
                       //Id = 1,
                       Text = "Project #2",
                       StartDate = DateTime.Today.AddDays(-3),
                       Duration = 18,
                       Progress = 0.4m,
                       ProjectID = 1003,
                       ParentId = null
                    },
                    new Task()
                    {
                      // Id = 2,
                       Text = "Task #1",
                       StartDate = DateTime.Today.AddDays(-2),
                       Duration = 8,
                       Progress = 0.6m,
                        ProjectID = 1003,
                       ParentId = 1
                    },
                    new Task()
                    {
                       //Id = 3,
                       Text = "Task #2",
                       StartDate = DateTime.Today.AddDays(-1),
                       Duration = 8,
                       Progress = 0.6m,
                       ProjectID = 1003,
                       ParentId = 1
                    }
               };

                try
                {
                    tasks.ForEach(s => context.Tasks.Add(s));
                    // context.Database.ExecuteSqlCommand("SET IDENTITY_INSERT Gantt_Task ON;");
                    context.SaveChanges();

                    // context.Database.ExecuteSqlCommand("SET IDENTITY_INSERT Gantt_Task OFF;");
                    List<Link> links = new List<Link>()
                   {
                       new Link() { SourceTaskId = 1, TargetTaskId = 2, Type = "1"},
                       new Link() { SourceTaskId = 2, TargetTaskId = 3, Type = "0"}
                   };

                    links.ForEach(s => context.Links.Add(s));
                    // context.Database.ExecuteSqlCommand("SET IDENTITY_INSERT Links ON;");
                    context.SaveChanges();
                    // context.Database.ExecuteSqlCommand("SET IDENTITY_INSERT Links OFF;");
                    transaction.Commit();

                }
                catch(Exception ex)
                {
                    Console.Write(ex.Message);
                    //return null;
                }
                }
        }
    }
}
