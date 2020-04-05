using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using Portal.Data;
using Portal.Data.Models;
using Portal.Models;
using System.Net.Http;

namespace Portal.API
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly SyvennDBContext _context;
        private readonly ActivityLogsController _Logger;
        string GeoCodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=XXX&key=AIzaSyDt94yDSjbDB_oKTZxB1NNi0eGqkokrHLE";
    

        public LocationsController(SyvennDBContext context)
        {
            _context = context;
            _Logger = new ActivityLogsController(_context);
        }

        // GET: api/Locations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
        {
            return await _context.Locations.ToListAsync();
        }

        [Route("GetLocationsbyContactID2")]
        public async Task<ActionResult<List<Location>>> GetLocationsbyContactID2(long contactid)
        {
            try
            {
                var LocIds = await _context.ContactLinks.Where(i => i.ContactID == contactid && i.ItemType.ToUpper() == "LOCATION").Select(i => i.ItemID).ToListAsync();
                var Locations = await _context.Locations.Where(i => LocIds.Contains(i.LocationID)).ToListAsync();
                return Locations;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetLocationsbyProject")]
        public async Task<ActionResult<List<Location>>> GetLocationsbyProject(long projectid)
        {
            try
            {
                var LocIds = await _context.LocationLinks.Where(i => i.ItemID == projectid && i.ItemType.ToUpper() == "PROJECT").Select(i => i.LocationID).ToListAsync();
                var Locations = await _context.Locations.Where(i => LocIds.Contains(i.LocationID)).ToListAsync();
                return Locations;
            }
            catch
            {
                return null;
            }
        }

        // GET: api/Locations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Location>> GetLocation(long id)
        {
            var location = await _context.Locations.FindAsync(id);

            if (location == null)
            {
                return NotFound();
            }

            return location;
        }

        // PUT: api/Locations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLocation(long id, Location location)
        {
            if (id != location.LocationID)
            {
                return BadRequest();
            }

            _context.Entry(location).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                ActivityLog log = new ActivityLog
                {
                    LogUser = "L. Edwards",   //Replace with actual user login or email
                    LogDate = DateTime.Now,
                    //  EntCode = entcode,
                    ItemType = "LOCATION",
                    ItemID = location.LocationID,
                    Change = "PutLocation - Location : " + JsonConvert.SerializeObject(location)
                };
                await _Logger.InsertActivityLog(log);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LocationExists(id))
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

        // POST: api/Locations
        [HttpPost]
        public async Task<ActionResult<Location>> PostLocation(Location location)
        {
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();
            ActivityLog log = new ActivityLog
            {
                LogUser = "L. Edwards",   //Replace with actual user login or email
                LogDate = DateTime.Now,
                //  EntCode = entcode,
                ItemType = "LOCATION",
                ItemID = location.LocationID,
                Change = "PostLocation - Location : " + JsonConvert.SerializeObject(location)
            };
            await _Logger.InsertActivityLog(log);

            if (location.Longitude == 0)
            {
                GeoCoding.Location loc = new GeoCoding.Location();
                loc = await GetLongLatByLocID(location.LocationID);
                if (loc != null)
                {
                    location.Latitude = Convert.ToDecimal(loc.lat);
                    location.Longitude = Convert.ToDecimal(loc.lng);
                    _context.Update(location);
                    await _context.SaveChangesAsync();
                }
            }
            return CreatedAtAction("GetLocation", new { id = location.LocationID }, location);
        }

        [HttpGet]
        [Route("GetGeoCodeByLocID")]
        public async Task<GeoCoding.Location> GetLongLatByLocID(long locid)
        {
            try
            {
                GeoCoding.GeoCode temp = new GeoCoding.GeoCode();
                string address = string.Empty;
                Location t = new Location();
                t = await _context.Locations.Where(d => d.LocationID == locid).FirstOrDefaultAsync();
                if (t != null)
                {
                    if (t.Address2 != null)
                        address = t.Address1.Trim() + " " + t.Address2.Trim() + ", " + t.AddCity + ", " + t.AddState;
                    else
                        address = t.Address1.Trim() +  ", " + t.AddCity + ", " + t.AddState;
                    address = address.Replace(' ', '+');
                    string url = GeoCodeURL.Replace("XXX", address);
                    using (var client = new HttpClient())
                    {
                        using (var response = await client.GetAsync(url))
                        {
                            string apiResponse = await response.Content.ReadAsStringAsync();
                            temp = JsonConvert.DeserializeObject < GeoCoding.GeoCode > (apiResponse);
                        }
                        if (temp.status=="OK" && temp.results.Count> 0)
                        {
                            //t.Latitude = temp.results[0].geometry.location.lat;
                            //t.Longitude = temp.results[0].geometry.location.lng;
                            return temp.results[0].geometry.location;
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
        }

        //[HttpGet]
        //[Route("GeoLocationAll")]
        public async Task<bool> GetLocateAll()
        {
            try
            {
                var locs =await _context.Locations.ToListAsync();
                foreach (Location l in locs)
                {
                    GeoCoding.Location temp = new GeoCoding.Location();
                    temp = await GetLongLatByLocID(l.LocationID);
                    if (temp != null)
                    {
                        l.Longitude = Convert.ToDecimal(temp.lng);
                        l.Latitude = Convert.ToDecimal(temp.lat);
                        _context.Update(l);
                    }
                }
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // DELETE: api/Locations/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Location>> DeleteLocation(long id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
            {
                return NotFound();
            }
            
            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            ActivityLog log = new ActivityLog
            {
                LogUser = "L. Edwards",   //Replace with actual user login or email
                LogDate = DateTime.Now,
                //  EntCode = entcode,
                ItemType = "LOCATION",
                ItemID = location.LocationID,
                Change = "DeleteLocation - Location : " + JsonConvert.SerializeObject(location)
            };
            await _Logger.InsertActivityLog(log);
            return location;
        }

        private bool LocationExists(long id)
        {
            return _context.Locations.Any(e => e.LocationID == id);
        }

        [HttpGet]
        [Route("GetLocationsByContactID")]
        public async Task<ActionResult<List<LocationViewModel>>> GetLocationsbyContactID(long c)
        {
            try
            {
                var LocIds = await _context.ContactLinks.Where(i => i.ContactID == c && i.ItemType.ToUpper() == "LOCATION").Select(i => i.ItemID).ToListAsync();
                var Locs = await _context.Locations.Where(i => LocIds.Contains(i.LocationID)).ToListAsync();
                List<LocationViewModel> lvm = new List<LocationViewModel>();
                foreach (Location e in Locs)
                {
                    LocationViewModel newe = new LocationViewModel()
                    {
                        ParentID = c,
                        ParentType = "CONTACT",
                        LocationID = e.LocationID,
                        Address1 = e.Address1,
                        Address2 = e.Address2,
                        AddCity = e.AddCity,
                        AddState = e.AddState,
                        AddZip = e.AddZip,
                        AddActive = e.AddActive,
                        Bldg = e.Bldg,
                        Floor = e.Floor,
                        Room = e.Room,
                        isPrimary = e.isPrimary,
                        Label = e.Label
                    };
                    lvm.Add(newe);
                }

                //DataSourceResult result = new DataSourceResult
                //{
                //    Data = lvm,
                //    Total = lvm.Count()
                //};
                return lvm;    
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("GetLocation4Grid")]
        public async Task<List<LocationViewModel>> GetLocation4Grid(long c, string type)
        {
            try
            {
                List<long> LocIds = new List<long>();
                if (type.ToUpper() == "CONTACT")
                    LocIds = await _context.ContactLinks.Where(i => i.ContactID == c && i.ItemType.ToUpper() == "LOCATION").Select(i => i.ItemID).ToListAsync();
                else if (type.ToUpper() == "PROJECT")
                    LocIds = await _context.LocationLinks.Where(i => i.ItemID == c && i.ItemType.ToUpper() == type.ToUpper()).Select(i => i.LocationID).ToListAsync();
                else
                    LocIds = await _context.VendorLinks.Where(i => i.VendorID == c && i.ItemType.ToUpper() == "LOCATION").Select(i => i.ItemID).ToListAsync();

                var Locs = await _context.Locations.Where(i => LocIds.Contains(i.LocationID)).ToListAsync();
                List<LocationViewModel> lvm = new List<LocationViewModel>();
                foreach (Location e in Locs)
                {
                    LocationViewModel newe = new LocationViewModel()
                    {
                        ParentID = c,
                        ParentType = type.ToUpper(),
                        LocationID = e.LocationID,
                        Address1 = e.Address1,
                        Address2 = e.Address2,
                        AddCity = e.AddCity,
                        AddState = e.AddState,
                        AddZip = e.AddZip,
                        AddActive = e.AddActive,
                        Bldg = e.Bldg,
                        Floor = e.Floor,
                        Room = e.Room,
                        isPrimary = e.isPrimary,
                        Label = e.Label
                    };
                    lvm.Add(newe);
                }

                return lvm;
            }
            catch
            {
                return null;
            }
        }

        [HttpGet]
        [Route("Read")]
        public async Task<ActionResult<DataSourceResult>> GetLocationsGrid(long c, string type)
        {
            try
            {
                List<long> LocIds = new List<long>();
                if (type.ToUpper() == "CONTACT")
                    LocIds = await _context.ContactLinks.Where(i => i.ContactID == c && i.ItemType.ToUpper() == "LOCATION").Select(i => i.ItemID).ToListAsync();
                else if (type.ToUpper() == "PROJECT")
                    LocIds = await _context.LocationLinks.Where(i => i.ItemID == c && i.ItemType.ToUpper() == type.ToUpper()).Select(i => i.LocationID).ToListAsync();
                else
                    LocIds = await _context.VendorLinks.Where(i => i.VendorID == c && i.ItemType.ToUpper() == "LOCATION").Select(i => i.ItemID).ToListAsync();

                var Locs = await _context.Locations.Where(i => LocIds.Contains(i.LocationID)).ToListAsync();
                List<LocationViewModel> lvm = new List<LocationViewModel>();
                foreach (Location e in Locs)
                {
                    LocationViewModel newe = new LocationViewModel()
                    {
                        ParentID = c,
                        ParentType = type.ToUpper(),
                        LocationID = e.LocationID,
                        Address1 = e.Address1,
                        Address2 = e.Address2,
                        AddCity = e.AddCity,
                        AddState = e.AddState,
                        AddZip = e.AddZip,
                        AddActive = e.AddActive,
                        Bldg = e.Bldg,
                        Floor = e.Floor,
                        Room = e.Room,
                        isPrimary = e.isPrimary,
                        Label = e.Label
                    };
                    lvm.Add(newe);
                }

                DataSourceResult result = new DataSourceResult
                {
                    Data = lvm,
                    Total = lvm.Count()
                };
                return result;
            }
            catch
            {
                return null;
            }
        }


        [HttpPost]
        [Route("Update")]
        public async Task<ActionResult> UpdateLocationVM(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<LocationViewModel> L)
        {
            if (L != null && ModelState.IsValid)
            {
                try
                {
                    foreach (var loc in L)
                    {
                        Location update = new Location
                        {
                            LocationID = loc.LocationID,
                            Bldg = loc.Bldg,
                            Floor = loc.Floor,
                            Room = loc.Room,
                            Address1 = loc.Address1,
                            Address2 = loc.Address2,
                            AddCity = loc.AddCity,
                            AddState = loc.AddState,
                            AddZip = loc.AddZip,
                            AddActive = loc.AddActive,
                            isPrimary = loc.isPrimary,
                            Label = loc.Label
                        };
                        var result = _context.Locations.Update(update);
                        await _context.SaveChangesAsync();
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "LOCATION",
                            ItemID = loc.LocationID,
                            Change = "UpdateLocationVM: " + JsonConvert.SerializeObject(L)
                        };
                        await _Logger.InsertActivityLog(log);
                    }
                    return Ok(L.ToDataSourceResult(request, ModelState));
                }
                catch
                {
                    return BadRequest();
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("Create")]
        public async Task<ActionResult> CreateLocationVM(DataSourceRequest request, [Bind(Prefix = "models")]IEnumerable<LocationViewModel> L)
        {
            if (L != null && ModelState.IsValid)
            {
                try
                {
                    foreach (var loc in L)
                    {
                        Location update = new Location
                        {
                            LocationID = loc.LocationID,
                            Bldg = loc.Bldg,
                            Floor = loc.Floor,
                            Room = loc.Room,
                            Address1 = loc.Address1,
                            Address2 = loc.Address2,
                            AddCity = loc.AddCity,
                            AddState = loc.AddState,
                            AddZip = loc.AddZip,
                            AddActive = loc.AddActive,
                            isPrimary = loc.isPrimary,
                            Label = loc.Label
                        };
                        var result = _context.Locations.Add(update);
                        await _context.SaveChangesAsync();
                        loc.LocationID = update.LocationID;

                        switch (loc.ParentType)
                        {
                            case "CONTACT":
                                ContactLink cl = new ContactLink() { ContactID = loc.ParentID, ItemID = update.LocationID, ItemType = "LOCATION" };
                                await _context.ContactLinks.AddAsync(cl);
                                break;
                            case "PROJECT":
                                LocationLink l1 = new LocationLink() { ItemType = "Project", ItemID = loc.ParentID, LocationID = update.LocationID };
                                await _context.LocationLinks.AddAsync(l1);
                                break;
                            case "VENDOR":
                                VendorLink v1 = new VendorLink() { VendorID = loc.ParentID, ItemID = update.LocationID, ItemType = "LOCATION" };
                                await _context.VendorLinks.AddAsync(v1);
                                break;
                            case "TBD":  //for later use
                                break;
                        }
                        ActivityLog log = new ActivityLog
                        {
                            LogUser = "L. Edwards",   //Replace with actual user login or email
                            LogDate = DateTime.Now,
                            //  EntCode = entcode,
                            ItemType = "LOCATION",
                            ItemID = loc.LocationID,
                            Change = "CeateLocationVM: " + JsonConvert.SerializeObject(loc)
                        };
                        await _Logger.InsertActivityLog(log);

                    }

                    return Ok(L.ToDataSourceResult(request, ModelState));
                }
                catch
                {
                    return BadRequest();
                }
            }

            return BadRequest();

        }

        [HttpGet]
        [Route("GetLocationLinkByTypeID")]
        public async Task<List<LocationLink>> GetLocationLinkByTypeID(string type, long id)
        {
            try
            {
                var result = await  _context.LocationLinks.Where(i => i.ItemType == type && i.ItemID == id).ToListAsync();
                return result;

            }
            catch (Exception ex)
            {
                Console.Write("GetLocationByTypeID Error: " + ex.Message);
                return null;
            }
        }

        [HttpGet]
        [Route("GetLocationLinkByID")]
        public async Task<LocationLink> GetLocationLinkByID(long id)
        {
            try
            {
                var result = await _context.LocationLinks.Where(i =>  i.LocationLinkID == id).FirstOrDefaultAsync();
                return result;

            }
            catch (Exception ex)
            {
                Console.Write("GetLocationLinkByID Error: " + ex.Message);
                return null;
            }
        }

        [HttpPost]
        [Route("InsertLocationLink")]
        public async Task<long> InsertLocationLink([FromBody] LocationLink L)
        {
            try
            {
                if (L != null)
                {
                    _context.LocationLinks.Add(L);
                    await _context.SaveChangesAsync();
                    return L.LocationLinkID;
                }
                else
                    return 0;
            }
            catch (Exception ex)
            {
                Console.Write("InsertLocationLink Error: " + ex.Message);
                return 0;
            }
        }


        [HttpPut]
        [Route("UpdateLocationLink")]
        public async Task<long> UpdateLocationLink([FromBody] LocationLink L)
        {
            try
            {
                if (L != null)
                {
                    var loc = await _context.LocationLinks.Where(i => i.LocationLinkID == L.LocationLinkID).FirstOrDefaultAsync();
                    loc.LocationLinkID = L.LocationLinkID;
                    loc.LocationID = L.LocationID;
                    loc.ItemType = L.ItemType;
                    loc.ItemID = L.ItemID;
                    _context.LocationLinks.Update(loc);
                    await _context.SaveChangesAsync();
                    return L.LocationLinkID;
                }
                else
                    return 0;
            }
            catch (Exception ex)
            {
                Console.Write("UpdateLocationLink Error: " + ex.Message);
                return 0;
            }
        }

        [HttpDelete]
        [Route("DeleteLocationLink")]
        public async Task<bool> DeleteLocationLink([FromBody] LocationLink L)
        {
            try
            {
                if (L != null)
                {
                    _context.LocationLinks.Remove(L);
                    await _context.SaveChangesAsync();
                    return true;
                }
                else
                    return false;
            }
            catch (Exception ex)
            {
                Console.Write("InsertLocationLink Error: " + ex.Message);
                return true;
            }
        }


    }
}
