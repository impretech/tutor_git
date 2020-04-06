using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Portal.Data.Models
{
    public partial class Location
    {
        [Key]
        public long LocationID { get; set; }
        public string Bldg { get; set; }
        public string Floor { get; set; }
        public string Room { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string AddCity { get; set; }
        public string AddState { get; set; }
        public string AddZip { get; set; }
        public bool AddActive { get; set; }
        public bool isPrimary { get; set; }
        public string Label { get; set; }
        public decimal Longitude { get; set; }
        public decimal Latitude { get; set; }
    }


    public class LocationLink
    {
        [Key]
        public long LocationLinkID { get; set; }
        public long LocationID { get; set; }
        public string ItemType { get; set; }
        public long ItemID { get; set; }
    }


    public class ProjectLocationLookup
    {
        [Key]
        public long LocationID { get; set; }
        public long ProjectID { get; set; }
        public string Title { get; set; }
        public string Phase { get; set; }
        public string Status { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string AddCity { get; set; }
        public string AddState { get; set; }
        public string AddZip { get; set; }
        public string Label { get; set; }
        public decimal Longitude { get; set; }
        public decimal Latitude { get; set; }
        public bool isPrimary { get; set; }
        public string Description { get; set; }
        public string PM { get; set; }
        public DateTime StartDate { get; set; }
        public int Duration { get; set; }
        public string EntCode { get; set; }

        
    }

    public class  LocationLookup : ProjectLocationLookup
    {
        public string Statuscode { get; set; }
    }

}
