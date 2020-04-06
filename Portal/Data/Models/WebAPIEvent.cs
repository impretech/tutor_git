using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Data.Models
{
    public class WebAPIEvent
    {
        public int id { get; set; }
        public string text { get; set; }
        public string start_date { get; set; }
        public string end_date { get; set; }
        public string userid { get; set; }
        public long pmId { get; set; }

        public static explicit operator WebAPIEvent(SchedulerEvent ev)
        {
            return new WebAPIEvent
            {
                id = ev.Id,
                text = ev.Name,
                start_date = ev.StartDate.ToString("yyyy-MM-dd HH:mm"),
                end_date = ev.EndDate.ToString("yyyy-MM-dd HH:mm"),
                userid = ev.UserId,
                pmId = ev.PMId
            };
        }

        public static explicit operator SchedulerEvent(WebAPIEvent ev)
        {
            return new SchedulerEvent
            {
                Id = ev.id,
                Name = ev.text,
                StartDate = DateTime.Parse(ev.start_date,
                    System.Globalization.CultureInfo.InvariantCulture),
                EndDate = DateTime.Parse(ev.end_date,
                    System.Globalization.CultureInfo.InvariantCulture),
                UserId = ev.userid,
                PMId = ev.pmId
            };
        }


    }
}
