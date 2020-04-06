using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Portal.Data;
using Portal.Data.Models;

namespace Portal.API
{

    [Produces("application/json")]
    [Route("api/[controller]")]
    public class LookupController : Controller
    {
        private readonly SyvennDBContext _db;

        public LookupController(SyvennDBContext dbContext)
        {
            _db = dbContext;
        }

        [HttpGet]
        [Route("GetLookupsByModule")]
        public  ActionResult<List<Lookup>> GetLookupsByModule(string module, string entcode)
        {
            try
            {
                var LookupList =  _db.Lookups.Where(p => (p.Module == module) && (p.EntCode == entcode)).OrderBy(p => p.Prompt).ToList();
                if (LookupList.Count> 0)
                     return LookupList;
                else
                {
                    var LookupList2 = _db.Lookups.Where(p => (p.Module == module) && (p.EntCode == "PRO1")).OrderBy(p => p.Prompt).ToList();
                    return LookupList2;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
    }
}