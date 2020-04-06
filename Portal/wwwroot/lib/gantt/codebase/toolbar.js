if (!window.ganttModules) {
    window.ganttModules = {};
}

ganttModules.menu = (function () {
    function addClass(node, className) {

        if (node != null && className != null) {
            node.className += " " + className;
        }
    }

    function removeClass(node, className) {
        node.className = node.className.replace(new RegExp(" *" + className.replace(/\-/g, "\\-"), "g"), "");
    }

    function getButton(name) {
        return document.querySelector(".gantt-controls [data-action='" + name + "']");
    }

    function highlightButton(name) {
        addClass(getButton(name), "menu-item-active");
    }
    function unhighlightButton(name) {
        removeClass(getButton(name), "menu-item-active");
    }

    function disableButton(name) {
        addClass(getButton(name), "menu-item-disabled");
    }

    function enableButton(name) {
        removeClass(getButton(name), "menu-item-disabled");
    }

    function refreshZoomBtns() {
        var zoom = ganttModules.zoom;
        if (zoom.canZoomIn()) {
            enableButton("zoomIn");
        } else {
            disableButton("zoomIn");
        }
        if (zoom.canZoomOut()) {
            enableButton("zoomOut");
        } else {
            disableButton("zoomOut");
        }
    }

    function refreshUndoBtns() {
        if (!gantt.getUndoStack().length) {
            disableButton("undo");
        } else {
            enableButton("undo");
        }

        if (!gantt.getRedoStack().length) {
            disableButton("redo");
        } else {
            enableButton("redo");
        }

    }

    setInterval(refreshUndoBtns, 1000);

    function toggleZoomToFitBtn() {
        if (ganttModules.zoomToFit.isEnabled()) {
            highlightButton("zoomToFit");
        } else {
            unhighlightButton("zoomToFit");
        }
    }

    var menu = {
        undo: function () {
            gantt.undo();
            refreshUndoBtns();
        },
        redo: function () {
            gantt.redo();
            refreshUndoBtns();
        },
        zoomIn: function () {
            ganttModules.zoomToFit.disable();
            var zoom = ganttModules.zoom;
            zoom.zoomIn();
            refreshZoomBtns();
            toggleZoomToFitBtn();
        },
        zoomOut: function () {
            ganttModules.zoomToFit.disable();
            ganttModules.zoom.zoomOut();
            refreshZoomBtns();
            toggleZoomToFitBtn();
        },
        zoomToFit: function () {
            ganttModules.zoom.deactivate();
            ganttModules.zoomToFit.toggle();
            toggleZoomToFitBtn();
            refreshZoomBtns();
        },
        fullscreen: function () {
            gantt.expand();
        },
        collapseAll: function () {
            gantt.eachTask(function (task) {
                task.$open = false;
            });
            gantt.render();

        },
        expandAll: function () {
            gantt.eachTask(function (task) {
                task.$open = true;
            });
            gantt.render();
        },
        toggleAutoScheduling: function () {
            gantt.config.auto_scheduling = !gantt.config.auto_scheduling;
            if (gantt.config.auto_scheduling) {
                gantt.autoSchedule();
                highlightButton("toggleAutoScheduling");
            } else {
                unhighlightButton("toggleAutoScheduling");
            }
        },
        toggleCriticalPath: function () {
            gantt.config.highlight_critical_path = !gantt.config.highlight_critical_path;
            if (gantt.config.highlight_critical_path) {
                highlightButton("toggleCriticalPath");
            } else {
                unhighlightButton("toggleCriticalPath");
            }
            gantt.render();
        },
        toPDF: function () {
            gantt.exportToPDF();
        },
        toPNG: function () {
            gantt.exportToPNG();
        },
        toExcel: function () {
            gantt.exportToExcel();
        },
        toMSProject: function () {
            gantt.exportToMSProject();
        }
    };


    return {
        setup: function () {

            var navBar = document.querySelector(".gantt-controls");
            gantt.event(navBar, "click", function (e) {
                var target = e.target || e.srcElement;
                while (!target.hasAttribute("data-action") && target !== document.body) {
                    target = target.parentNode;
                }

                if (target && target.hasAttribute("data-action")) {
                    var action = target.getAttribute("data-action");
                    if (menu[action]) {
                        menu[action]();
                    }
                }
            });
            this.setup = function () { };
        }
    };
})(gantt);





ganttModules.zoom = (function (gantt) {

    var configs = {
        1: function () {
            gantt.config.scale_unit = "day";
            gantt.config.step = 1;
            gantt.config.date_scale = "%d %M";
            gantt.config.min_column_width = 30;
            gantt.config.subscales = [
                { unit: "hour", step: 1, date: "%h" }
            ];
            gantt.config.round_dnd_dates = true;

            gantt.config.scale_height = 60;
            gantt.templates.date_scale = null;
        },
        2: function () {

            gantt.config.scale_unit = "week";
            gantt.config.date_scale = "%W";
            gantt.config.step = 1;
            gantt.templates.date_scale = null;
            gantt.config.min_column_width = 60;
            gantt.config.subscales = [
                { unit: "month", step: 1, date: "%M" },
                { unit: "day", step: 1, date: "%D" }
            ];
            gantt.config.round_dnd_dates = true;
            gantt.config.scale_height = 60;
            gantt.templates.date_scale = null;
        },
        3: function () {
            gantt.config.scale_unit = "year";
            gantt.config.date_scale = "%Y";
            gantt.config.min_column_width = 60;
            gantt.config.subscales = [
                { unit: "month", step: 1, date: "%M" },
                { unit: "week", step: 1, date: "%W" }
            ];
            gantt.config.round_dnd_dates = false;
            gantt.config.scale_height = 60;
            gantt.templates.date_scale = null;
        },
        4: function () {
            gantt.config.scale_unit = "year";
            gantt.config.step = 1;
            gantt.config.date_scale = "%Y";
            gantt.config.min_column_width = 50;
            gantt.config.round_dnd_dates = false;
            gantt.config.scale_height = 60;
            gantt.templates.date_scale = null;


            gantt.config.subscales = [
                { unit: "month", step: 1, date: "%M" }
            ];
        },
        5: function () {
            gantt.config.scale_unit = "year";
            gantt.config.step = 1;
            gantt.config.date_scale = "%Y";
            gantt.config.min_column_width = 50;
            gantt.config.round_dnd_dates = false;
            gantt.config.scale_height = 60;
            gantt.templates.date_scale = null;


            function quarterLabel(date) {
                var month = date.getMonth();
                var q_num;

                if (month >= 9) {
                    q_num = 4;
                } else if (month >= 6) {
                    q_num = 3;
                } else if (month >= 3) {
                    q_num = 2;
                } else {
                    q_num = 1;
                }

                return "Q" + q_num;
            }

            gantt.config.subscales = [
                { unit: "quarter", step: 1, template: quarterLabel },
                { unit: "month", step: 1, date: "%M" }
            ];
        },
        6: function () {
            gantt.config.scale_unit = "year";
            gantt.config.round_dnd_dates = false;
            gantt.config.step = 1;
            gantt.config.date_scale = "%Y";
            gantt.config.min_column_width = 50;

            gantt.config.scale_height = 60;
            gantt.templates.date_scale = null;

            gantt.config.subscales = [];
        }
    };

    var isActive = true;
    var current = 0;

    function setScaleConfig(config) {
        configs[config]();
    }


    function refresh() {
        if (gantt.$container)
            gantt.render();
    }

    return {
        deactivate: function () {
            isActive = false;
        },
        setZoom: function (level) {
            isActive = true;
            current = level;

            setScaleConfig(current);
            refresh();
        },
        zoomOut: function () {
            if (this.canZoomOut()) {
                isActive = true;
                current = (current + 1);
                if (!configs[current])
                    current = 6;

                setScaleConfig(current);
                refresh();
            }
        },
        zoomIn: function () {
            if (this.canZoomIn()) {
                isActive = true;
                current = (current - 1);
                if (!configs[current])
                    current = 1;
                setScaleConfig(current);
                refresh();
            }
        },
        canZoomOut: function () {
            return !isActive || !!(configs[current + 1]);
        },
        canZoomIn: function () {
            return !isActive || !!(configs[current - 1]);
        }
    };
})(gantt);




ganttModules.zoomToFit = (function (gantt) {
    var cachedSettings = {};
    function saveConfig() {
        var config = gantt.config;
        cachedSettings = {};
        cachedSettings.scale_unit = config.scale_unit;
        cachedSettings.date_scale = config.date_scale;
        cachedSettings.step = config.step;
        cachedSettings.subscales = config.subscales;
        cachedSettings.template = gantt.templates.date_scale;
        cachedSettings.start_date = config.start_date;
        cachedSettings.end_date = config.end_date;
    }
    function restoreConfig() {
        applyConfig(cachedSettings);
    }

    function applyConfig(config, dates) {
        gantt.config.scale_unit = config.scale_unit;
        if (config.date_scale) {
            gantt.config.date_scale = config.date_scale;
            gantt.templates.date_scale = null;
        }
        else {
            gantt.templates.date_scale = config.template;
        }

        gantt.config.step = config.step;
        gantt.config.subscales = config.subscales;

        if (dates) {
            gantt.config.start_date = gantt.date.add(dates.start_date, -1, config.unit);
            gantt.config.end_date = gantt.date.add(gantt.date[config.unit + "_start"](dates.end_date), 2, config.unit);
        } else {
            gantt.config.start_date = gantt.config.end_date = null;
        }
    }



    function zoomToFit() {
        var project = gantt.getSubtaskDates(),
            areaWidth = gantt.$task.offsetWidth;

        for (var i = 0; i < scaleConfigs.length; i++) {
            var columnCount = getUnitsBetween(project.start_date, project.end_date, scaleConfigs[i].unit, scaleConfigs[i].step);
            if ((columnCount + 2) * gantt.config.min_column_width <= areaWidth) {
                break;
            }
        }

        if (i === scaleConfigs.length) {
            i--;
        }

        applyConfig(scaleConfigs[i], project);
    }

    // get number of columns in timeline
    function getUnitsBetween(from, to, unit, step) {
        var start = new Date(from),
            end = new Date(to);
        var units = 0;
        while (start.valueOf() < end.valueOf()) {
            units++;
            start = gantt.date.add(start, step, unit);
        }
        return units;
    }

    //Setting available scales
    var scaleConfigs = [
        // minutes
        {
            unit: "minute", step: 1, scale_unit: "hour", date_scale: "%H", subscales: [
                { unit: "minute", step: 1, date: "%H:%i" }
            ]
        },
        // hours
        {
            unit: "hour", step: 1, scale_unit: "day", date_scale: "%j %M",
            subscales: [
                { unit: "hour", step: 1, date: "%H:%i" }
            ]
        },
        // days
        {
            unit: "day", step: 1, scale_unit: "month", date_scale: "%F",
            subscales: [
                { unit: "day", step: 1, date: "%j" }
            ]
        },
        // weeks
        {
            unit: "week", step: 1, scale_unit: "month", date_scale: "%F",
            subscales: [
                {
                    unit: "week", step: 1, template: function (date) {
                        var dateToStr = gantt.date.date_to_str("%d %M");
                        var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                        return dateToStr(date) + " - " + dateToStr(endDate);
                    }
                }
            ]
        },
        // months
        {
            unit: "month", step: 1, scale_unit: "year", date_scale: "%Y",
            subscales: [
                { unit: "month", step: 1, date: "%M" }
            ]
        },
        // quarters
        {
            unit: "month", step: 3, scale_unit: "year", date_scale: "%Y",
            subscales: [
                {
                    unit: "month", step: 3, template: function (date) {
                        var dateToStr = gantt.date.date_to_str("%M");
                        var endDate = gantt.date.add(gantt.date.add(date, 3, "month"), -1, "day");
                        return dateToStr(date) + " - " + dateToStr(endDate);
                    }
                }
            ]
        },
        // years
        {
            unit: "year", step: 1, scale_unit: "year", date_scale: "%Y",
            subscales: [
                {
                    unit: "year", step: 5, template: function (date) {
                        var dateToStr = gantt.date.date_to_str("%Y");
                        var endDate = gantt.date.add(gantt.date.add(date, 5, "year"), -1, "day");
                        return dateToStr(date) + " - " + dateToStr(endDate);
                    }
                }
            ]
        },
        // decades
        {
            unit: "year", step: 10, scale_unit: "year", template: function (date) {
                var dateToStr = gantt.date.date_to_str("%Y");
                var endDate = gantt.date.add(gantt.date.add(date, 10, "year"), -1, "day");
                return dateToStr(date) + " - " + dateToStr(endDate);
            },
            subscales: [
                {
                    unit: "year", step: 100, template: function (date) {
                        var dateToStr = gantt.date.date_to_str("%Y");
                        var endDate = gantt.date.add(gantt.date.add(date, 100, "year"), -1, "day");
                        return dateToStr(date) + " - " + dateToStr(endDate);
                    }
                }
            ]
        }
    ];

    var enabled = false;
    return {
        enable: function () {
            if (!enabled) {
                enabled = true;
                saveConfig();
                zoomToFit();
                gantt.render();
            }
        },
        isEnabled: function () {
            return enabled;
        },
        toggle: function () {
            if (this.isEnabled()) {
                this.disable();
            } else {
                this.enable();
            }
        },
        disable: function () {
            if (enabled) {
                enabled = false;
                restoreConfig();
                gantt.render();
            }
        }
    };

})(gantt);