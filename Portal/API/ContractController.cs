using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.API
{

    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class ContractController : ControllerBase
    {
        private readonly SyvennDBContext _db;
        private readonly ActivityLogsController _Logger;

        public ContractController(SyvennDBContext dbContext)
        {
            _db = dbContext;
            _Logger = new ActivityLogsController(_db);
        }

        [HttpGet]
        [Route("GetContractsByProjectId")]
        public async Task<ActionResult<List<Contract>>> GetContractsByProjectId(long projectId)
        {
            try
            {
                var Contracts = await _db.Contracts.Where(p => p.ProjectID == projectId).ToListAsync();
                return Contracts;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetContractById")]
        public async Task<ActionResult<Contract>> GetContractById(long contrid)
        {
            try
            {
                var Contracts = await _db.Contracts.Where(p => p.ContractID == contrid).FirstOrDefaultAsync();
                return Contracts;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("AddContract")]
        public async Task<ActionResult<long>> AddContract([FromBody] Contract newContract)
        {
            try
            {
                var result = await _db.Contracts.AddAsync(newContract);
                await _db.SaveChangesAsync();

                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = newContract.EntCode,
                    ItemType = "Contract",
                    ItemID = newContract.ContractID,
                    Change = "AddContract - Contract : " + JsonConvert.SerializeObject(newContract)
                };
                await _Logger.InsertActivityLog(log);

                return newContract.ContractID;
            }
            catch
            {
                return null;
            }
        }

        [HttpPut]
        [Route("UpdateContract")]
        public async Task<ActionResult<bool>> UpdateContract([FromBody] Contract dl)
        {
            try
            {
                if (!(dl.ContractID > 0))
                {
                    return BadRequest();
                }

                Contract s = await _db.Contracts.FindAsync(dl.ContractID);

                if (s == null)
                    return NotFound();

                s.AccountNo = dl.AccountNo;
                s.Amount = dl.Amount;
                s.Bond = dl.Bond;
                s.BondSecured = dl.BondSecured;
                s.Description = dl.Description;
                s.EntCode = dl.EntCode;
                s.Insurance = dl.Insurance;
                s.PoNo = dl.PoNo;
                s.PoReq = dl.PoReq;
                s.EntCode = dl.EntCode;
                s.ProjectID = dl.ProjectID;
                s.QuoteDescription = dl.QuoteDescription;
                s.QuoteID = dl.QuoteID;
                s.Status = dl.Status;
                s.VendorID = dl.VendorID;
                s.VendorName = dl.VendorName;
                s.Writer = dl.Writer;
                s.Written = dl.Written;
                

                _db.Contracts.Update(s);
                await _db.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    EntCode = dl.EntCode,
                    ItemType = "Contract",
                    ItemID = dl.ContractID,
                    Change = "UpdateContract - Update Contract: " + JsonConvert.SerializeObject(dl)
                };
                await _Logger.InsertActivityLog(log);
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return BadRequest();
            }
        }

        public async Task<ContractViewModel> GetContractVMbyID(long id)
        {
            var contract =await _db.Contracts.Where(p => p.ContractID == id).FirstOrDefaultAsync();
            var proj = await _db.Project.Where(p => p.ProjectId == contract.ProjectID).Select(p => p.Title).FirstAsync();
            var docs = await _db.DocumentDbs.Where(p => p.ItemType == "Contract" && p.ItemNo == id).ToListAsync();

            ContractViewModel result = new ContractViewModel
            {
                contract = contract,
                Documents = docs,
                ProjectTitle = proj
            };
            return result;
        }

    }
}