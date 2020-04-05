using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Data;
using Portal.Data.Models;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class ActivityLogsController : ControllerBase
    {
        private readonly SyvennDBContext _context;

        public ActivityLogsController(SyvennDBContext context)
        {
            _context = context;
        }

        // GET: api/ActivityLogs
        [HttpGet]
        [Route("GetActivityLogs")]
        public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogs(string entcode)
        {
            return await _context.ActivityLogs.Where(i => i.EntCode == entcode).ToListAsync();
        }

        // GET: api/ActivityLogs/5
        [HttpGet]
        [Route("GetActivityLogbyId")]
        public async Task<ActionResult<ActivityLog>> GetActivityLogbyId(long id)
        {
            var activityLog = await _context.ActivityLogs.FindAsync(id);

            if (activityLog == null)
            {
                return NotFound();
            }

            return activityLog;
        }

        // PUT: api/ActivityLogs/5
        [HttpPut]
        [Route("UpdateActivityLog")]
        public async Task<IActionResult> UpdateActivityLog(long id, ActivityLog activityLog)
        {
            if (id != activityLog.ActivityLogID)
            {
                return BadRequest();
            }

            _context.Entry(activityLog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityLogExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/ActivityLogs
        [HttpPost]
        [Route("PostActivityLog")]
        public async Task<ActionResult<ActivityLog>> PostActivityLog(ActivityLog activityLog)
        {
            _context.ActivityLogs.Add(activityLog);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetActivityLog", new { id = activityLog.ActivityLogID }, activityLog);
        }


        public async Task<ActionResult<ActivityLog>> InsertActivityLog(ActivityLog activityLog)
        {
            try
            {
                _context.ActivityLogs.Add(activityLog);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetActivityLog", new { id = activityLog.ActivityLogID }, activityLog);
            }
            catch
            {
                return null;
            }
        }
        // DELETE: api/ActivityLogs/5
        [HttpDelete] //("{id}")]
        [Route("DeleteActivityLog")]
        public async Task<ActionResult<ActivityLog>> DeleteActivityLog(long id)
        {
            var activityLog = await _context.ActivityLogs.FindAsync(id);
            if (activityLog == null)
            {
                return NotFound();
            }

            _context.ActivityLogs.Remove(activityLog);
            await _context.SaveChangesAsync();

            return activityLog;
        }

        private bool ActivityLogExists(long id)
        {
            return _context.ActivityLogs.Any(e => e.ActivityLogID == id);
        }
    }
}
