using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Data;
using Portal.Data.Models;

namespace Portal.API.Gantt
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/gantt/[controller]")]
    //[ApiController]
    public class TaskController : Controller
    {
        private readonly SyvennDBContext _context;
        public TaskController(SyvennDBContext context)
        {
            _context = context;
        }

        // GET api/task
        [HttpGet]
        public IEnumerable<WebApiTask> Get()
        {
            return _context.Tasks
                .ToList()
                .Select(t => (WebApiTask)t);
        }

        // GET api/task/5
        [HttpGet("{id}")]
        public WebApiTask Get(long id)
        {
            return (WebApiTask)_context
                .Tasks
                .Find(id);
        }

        // POST api/task
        [HttpPost]
        public ObjectResult Post(WebApiTask apiTask)
        {
            var newTask = (Data.Models.Task)apiTask;
            newTask.ProjectID = 1002;    //*******************      Pass in actual ProjectID          ******************
            newTask.Editable = true;
            newTask.Readonly = false;
            newTask.Type = "task";  //*******************      Pass in actual type          ******************
            newTask.SortOrder = _context.Tasks.Where(s => s.ProjectID== newTask.ProjectID).Max(t => t.SortOrder) + 1;
            _context.Tasks.Add(newTask);
            _context.SaveChanges();

            return Ok(new
            {
                tid = newTask.Id,
                action = "inserted"
            });
        }

        // PUT api/task/5
        [HttpPut("{id}")]
        public ObjectResult Put(long id, WebApiTask apiTask)
        {
            var updatedTask = (Data.Models.Task)apiTask;
            var dbTask = _context.Tasks.Find(id);
            dbTask.Text = updatedTask.Text;
            dbTask.StartDate = updatedTask.StartDate;
            dbTask.Duration = updatedTask.Duration;
            dbTask.ParentId = updatedTask.ParentId;
            dbTask.Progress = updatedTask.Progress;
            dbTask.Type = updatedTask.Type;

            if (!string.IsNullOrEmpty(apiTask.target))
            {
                // reordering occurred                         
                this._UpdateOrders(dbTask, apiTask.target);
            }


            _context.SaveChanges();

            return Ok(new
            {
                action = "updated"
            });
        }

        // DELETE api/task/5
        [HttpDelete("{id}")]
        public ObjectResult DeleteTask(long id)
        {
            var task = _context.Tasks.Find(id);
            if (task != null)
            {
                _context.Tasks.Remove(task);
                _context.SaveChanges();
            }

            return Ok(new
            {
                action = "deleted"
            });
        }

        private void _UpdateOrders(Data.Models.Task updatedTask, string orderTarget)
        {
            long adjacentTaskId;
            var nextSibling = false;

            var targetId = orderTarget;

            // adjacent task id is sent either as '{id}' or as 'next:{id}' depending 
            // on whether it's the next or the previous sibling
            if (targetId.StartsWith("next:"))
            {
                targetId = targetId.Replace("next:", "");
                nextSibling = true;
            }

            if (!long.TryParse(targetId, out adjacentTaskId))
            {
                return;
            }

            var adjacentTask = _context.Tasks.Find(adjacentTaskId);
            var startOrder = adjacentTask.SortOrder;

            if (nextSibling)
                startOrder++;

            updatedTask.SortOrder = startOrder;

            var updateOrders = _context.Tasks
                .Where(t => t.Id != updatedTask.Id)
                .Where(t => t.SortOrder >= startOrder)
                .OrderBy(t => t.SortOrder);

            var taskList = updateOrders.ToList();

            taskList.ForEach(t => t.SortOrder++);
        }
    }
}