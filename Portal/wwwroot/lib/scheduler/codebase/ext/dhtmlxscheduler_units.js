/*
@license
dhtmlxScheduler.Net v.4.0.0 Professional

This software is covered by DHTMLX Commercial License. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
Scheduler.plugin(function(e){e._props={},e.createUnitsView=function(t,a,i,n,r,o,l){function d(){_||(_=e.xy.scale_height,e.xy.scale_height=2*e.xy.scale_height)}function s(){_&&(e.xy.scale_height/=2,_=!1)}"object"==typeof t&&(i=t.list,a=t.property,n=t.size||0,r=t.step||1,o=t.skip_incorrect,l=t.days||1,t=t.name),e._props[t]={map_to:a,options:i,step:r,position:0,days:l},n>e._props[t].options.length&&(e._props[t]._original_size=n,n=0),e._props[t].size=n,e._props[t].skip_incorrect=o||!1,e.date[t+"_start"]=e.date.day_start,
e.templates[t+"_date"]=function(a,i){var n=e._props[t];return n.days>1?e.templates.week_date(a,i):e.templates.day_date(a)},e._get_unit_index=function(t,a){var i=t.position||0,n=Math.round((e._correct_shift(+a,1)-+e._min_date)/864e5),r=t.size||t.options.length;return n>=r&&(n%=r),i+n},e.templates[t+"_scale_text"]=function(e,t,a){return a.css?"<span class='"+a.css+"'>"+t+"</span>":t},e.templates[t+"_scale_date"]=function(a){var i=e._props[t],n=i.options;if(!n.length)return"";var r=e._get_unit_index(i,a),o=n[r];
return e.templates[t+"_scale_text"](o.key,o.label,o)},e.templates[t+"_second_scale_date"]=function(t){return e.templates.week_scale_date(t)},e.date["add_"+t]=function(a,i){return e.date.add(a,i*e._props[t].days,"day")},e.date["get_"+t+"_end"]=function(a){return e.date.add(a,(e._props[t].size||e._props[t].options.length)*e._props[t].days,"day")},e.attachEvent("onOptionsLoad",function(){for(var a=e._props[t],i=a.order={},n=a.options,r=0;r<n.length;r++)i[n[r].key]=r;a._original_size&&0===a.size&&(a.size=a._original_size,
delete a._original_size),a.size>n.length?(a._original_size=a.size,a.position=0,a.size=0):a.size=a._original_size||a.size,e._date&&e._mode==t&&e.setCurrentView(e._date,e._mode)}),e["mouse_"+t]=function(t){var a=e._props[this._mode];if(a){if(t=this._week_indexes_from_pos(t),this._drag_event||(this._drag_event={}),this._drag_id&&this._drag_mode&&(this._drag_event._dhx_changed=!0),this._drag_mode&&"new-size"==this._drag_mode){var i=e._get_event_sday(e._events[e._drag_id]);Math.floor(t.x/a.options.length)!=Math.floor(i/a.options.length)&&(t.x=i);
}var n=a.size||a.options.length,r=t.x%n,o=Math.min(r+a.position,a.options.length-1);t.section=(a.options[o]||{}).key,t.x=Math.floor(t.x/n);var l=this.getEvent(this._drag_id);this._update_unit_section({view:a,event:l,pos:t})}return t.force_redraw=!0,t};var _=!1;e[t+"_view"]=function(t){var a=e._props[e._mode];t?(a&&a.days>1?d():s(),e._reset_scale()):s()},e.callEvent("onOptionsLoad",[])},e._update_unit_section=function(e){var t=e.view,a=e.event,i=e.pos;a&&(a[t.map_to]=i.section)},e.scrollUnit=function(t){
var a=e._props[this._mode];a&&(a.position=Math.min(Math.max(0,a.position+t),a.options.length-a.size),this.setCurrentView())},function(){var t=function(t){var a=e._props[e._mode];if(a&&a.order&&a.skip_incorrect){for(var i=[],n=0;n<t.length;n++)"undefined"!=typeof a.order[t[n][a.map_to]]&&i.push(t[n]);t.splice(0,t.length),t.push.apply(t,i)}return t},a=e._pre_render_events_table;e._pre_render_events_table=function(e,i){return e=t(e),a.apply(this,[e,i])};var i=e._pre_render_events_line;e._pre_render_events_line=function(e,a){
return e=t(e),i.apply(this,[e,a])};var n=function(t,a){if(t&&"undefined"==typeof t.order[a[t.map_to]]){var i=e,n=864e5,r=Math.floor((a.end_date-i._min_date)/n);return t.options.length&&(a[t.map_to]=t.options[Math.min(r+t.position,t.options.length-1)].key),!0}},r=e.is_visible_events;e.is_visible_events=function(t){var a=r.apply(this,arguments);if(a){var i=e._props[this._mode];if(i&&i.size){var n=i.order[t[i.map_to]];if(n<i.position||n>=i.size+i.position)return!1}}return a};var o=e._process_ignores;
e._process_ignores=function(t,a,i,n,r){if(!e._props[this._mode])return void o.call(this,t,a,i,n,r);this._ignores={},this._ignores_detected=0;var l=e["ignore_"+this._mode];if(l){var d=e._props&&e._props[this._mode]?e._props[this._mode].size||e._props[this._mode].options.length:1;a/=d;for(var s=new Date(t),_=0;a>_;_++){if(l(s))for(var c=_*d,u=(_+1)*d,h=c;u>h;h++)this._ignores_detected+=1,this._ignores[h]=!0,r&&a++;s=e.date.add(s,n,i),e.date[i+"_start"]&&(s=e.date[i+"_start"](s))}}};var l=e._reset_scale;
e._reset_scale=function(){var t=e._props[this._mode];t&&(t.size&&t.position&&t.size+t.position>t.options.length?t.position=Math.max(0,t.options.length-t.size):t.size||(t.position=0));var a=l.apply(this,arguments);if(t){this._max_date=this.date.add(this._min_date,t.days,"day");for(var i=this._els.dhx_cal_data[0].childNodes,n=0;n<i.length;n++)i[n].className=i[n].className.replace("_now","");var r=this._currentDate();if(r.valueOf()>=this._min_date&&r.valueOf()<this._max_date){var o=864e5,d=Math.floor((r-e._min_date)/o),s=t.size||t.options.length,_=d*s,c=_+s;
for(n=_;c>n;n++)i[n]&&(i[n].className=i[n].className.replace("dhx_scale_holder","dhx_scale_holder_now"))}if(t.size&&t.size<t.options.length){var u=this._els.dhx_cal_header[0],h=document.createElement("div");t.position&&(this._waiAria.headerButtonsAttributes(h,""),h.className="dhx_cal_prev_button",h.style.cssText="left:1px;top:2px;position:absolute;",h.innerHTML="&nbsp;",u.firstChild.appendChild(h),h.onclick=function(){e.scrollUnit(-1*t.step)}),t.position+t.size<t.options.length&&(this._waiAria.headerButtonsAttributes(h,""),
h=document.createElement("div"),h.className="dhx_cal_next_button",h.style.cssText="left:auto; right:0px;top:2px;position:absolute;",h.innerHTML="&nbsp;",u.lastChild.appendChild(h),h.onclick=function(){e.scrollUnit(t.step)})}}return a};var d=e._get_view_end;e._get_view_end=function(){var t=e._props[this._mode];if(t&&t.days>1){var a=this._get_timeunit_start();return e.date.add(a,t.days,"day")}return d.apply(this,arguments)};var s=e._render_x_header;e._render_x_header=function(t,a,i,n){var r=e._props[this._mode];
if(!r||r.days<=1)return s.apply(this,arguments);if(r.days>1){var o=n.querySelector(".dhx_second_cal_header");o||(o=document.createElement("div"),o.className="dhx_second_cal_header",n.appendChild(o));var l=e.xy.scale_height;e.xy.scale_height=Math.ceil(l/2),s.call(this,t,a,i,o,Math.ceil(e.xy.scale_height));var d=r.size||r.options.length;if((t+1)%d===0){var _=document.createElement("div");_.className="dhx_scale_bar dhx_second_scale_bar";var c=this.date.add(this._min_date,Math.floor(t/d),"day");this.templates[this._mode+"_second_scalex_class"]&&(_.className+=" "+this.templates[this._mode+"_second_scalex_class"](new Date(c)));
var u,h=this._cols[t]*d-1;u=d>1?this._colsS[t-(d-1)]-this.xy.scale_width-2:a,this.set_xy(_,h,this.xy.scale_height-2,u,0),_.innerHTML=this.templates[this._mode+"_second_scale_date"](new Date(c),this._mode),o.appendChild(_)}e.xy.scale_height=l}};var _=e._get_event_sday;e._get_event_sday=function(t){var a=e._props[this._mode];if(a){if(a.days<=1)return n(a,t),this._get_section_sday(t[a.map_to]);var i=864e5,r=Math.floor((t.end_date.valueOf()-1-60*t.end_date.getTimezoneOffset()*1e3-(e._min_date.valueOf()-60*e._min_date.getTimezoneOffset()*1e3))/i),o=a.size||a.options.length,l=a.order[t[a.map_to]];
return r*o+l-a.position}return _.call(this,t)},e._get_section_sday=function(t){var a=e._props[this._mode];return a.order[t]-a.position};var c=e.locate_holder_day;e.locate_holder_day=function(t,a,i){var r=e._props[this._mode];if(!r)return c.apply(this,arguments);var o;if(i?n(r,i):(i={start_date:t,end_date:t},o=0),r.days<=1)return 1*(void 0===o?r.order[i[r.map_to]]:o)+(a?1:0)-r.position;var l=864e5,d=Math.floor((i.start_date.valueOf()-e._min_date.valueOf())/l),s=r.options.length,_=void 0===o?r.order[i[r.map_to]]:o;
return d*s+1*_+(a?1:0)-r.position};var u=e._time_order;e._time_order=function(t){var a=e._props[this._mode];a?t.sort(function(e,t){return a.order[e[a.map_to]]>a.order[t[a.map_to]]?1:-1}):u.apply(this,arguments)};var h=e._pre_render_events_table;e._pre_render_events_table=function(t,a){function i(t){var a=e.date.add(t,1,"day");return a=e.date.date_part(a)}var n=e._props[this._mode];if(n&&n.days>1){for(var r={},o=0;o<t.length;o++){var l=t[o];if(e.isOneDayEvent(t[o])){var d=+e.date.date_part(new Date(l.start_date));
r[d]||(r[d]=[]),r[d].push(l)}else{var s=new Date(Math.min(+l.end_date,+this._max_date)),_=new Date(Math.max(+l.start_date,+this._min_date));for(_=e.date.day_start(_),t.splice(o,1),o--;+s>+_;){var c=this._copy_event(l);c.start_date=_,c.end_date=i(c.start_date),_=e.date.add(_,1,"day");var d=+e.date.date_part(new Date(_));r[d]||(r[d]=[]),r[d].push(c)}}}var u,t=[];for(var o in r){var p=h.apply(this,[r[o],a]),v=this._colsS.heights;(!u||v[0]>u[0])&&(u=v.slice()),t.push.apply(t,p)}var m=this._colsS.heights;
m.splice(0,m.length),m.push.apply(m,u);for(var o=0;o<t.length;o++)if(this._ignores[t[o]._sday])t.splice(o,1),o--;else{var g=t[o];g._first_chunk=g._last_chunk=!1;var f=this.getEvent(g.id);f._sorder=g._sorder}t.sort(function(e,t){return e.start_date.valueOf()==t.start_date.valueOf()?e.id>t.id?1:-1:e.start_date>t.start_date?1:-1})}else t=h.apply(this,[t,a]);return t},e.attachEvent("onEventAdded",function(t,a){if(this._loading)return!0;for(var i in e._props){var n=e._props[i];"undefined"==typeof a[n.map_to]&&(a[n.map_to]=n.options[0].key);
}return!0}),e.attachEvent("onEventCreated",function(t,a){var i=e._props[this._mode];if(i&&a){var r=this.getEvent(t);n(i,r);var o=this._mouse_coords(a);this._update_unit_section({view:i,event:r,pos:o}),this.event_updated(r)}return!0})}()});
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_units.js.map