import dateUtils from '../Util/dateUtil.js';
import Util from './Util';
var moment = require('moment');
export default {
    parse: function (value) {
        if (!value) {
            return null;
        }
        value = value.toString();

        if (value.indexOf('-') !== -1) {
            return new Date(value)
        }

        return new Date(Number(value.substr(0, 4)),
            Number(value.substr(4, 2)) - 1,
            Number(value.substr(6, 2)),
            Number(value.substr(8, 2)),
            Number(value.substr(10, 2)),
            Number(value.substr(12, 2))
        )
    },
    toString: function (date, format) {
        if (date === undefined || typeof date !== 'object' || date === null) {
            return '-';
        }
        let returnValue = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)) + "/" + (date.getDate() >= 10 ? date.getDate() : ('0' + date.getDate())) + "/" + date.getFullYear();
        if (format === true) {
            returnValue += "  " + this.getFullTime(date);
        }
        return returnValue;
    },
    getShortMonthName: function (date) {
        if (Object.prototype.toString.call(date) === "[object Date]") {
            // it is a date
            if (isNaN(date.getTime())) {
                // date is not valid
                return '-';
            }
            else {
                let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                return (months[date.getMonth()].substr(0, 3));
            }
        }
        else {
            return '-';
        }

    },
    formatAMPM: function (date) {
        if (date === undefined || typeof date !== 'object' || date === null) {
            return '';
        }
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ampm;
        return strTime;
    },
    getUtDateTime: function (date) {
        var dateToConvert = new Date();
        if (date) {
            dateToConvert = new Date(date);
        }
        return dateToConvert.toISOString().slice(0, 19).replace('T', ' ');
    },
    getLocalDateTime: function (utcDate) {
        if (!utcDate) {
            return;
        }
        var d = new Date(utcDate);
        var offset = new Date().getTimezoneOffset();
        d.setMinutes(d.getMinutes() - offset);
        return d;
    },
    getFullTime(date) {
        if (!date)
            return
        return (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    },
    getAge: function (from, to) {
        if (!from) {
            return "";
        }
        if (!to) {
            to = new Date();
        }
        if (to < from) {
            var temp = from;
            from = to;
            to = temp;
        }
        var months = to.getFullYear() * 12 - from.getFullYear() * 12;
        return Math.floor(months / 12);
    },
    getTimeDiff(firstDate, secondDate) {
        var timeStart = new Date(firstDate).getTime();
        var timeEnd = new Date(secondDate).getTime();
        var hourDiff = timeEnd - timeStart; //in ms
        var secDiff = hourDiff / 1000; //in s
        return (secDiff + " Secs");
        //TODO - In Future if we need to show the time in hours and mins.
        // var minDiff = hourDiff / 60 / 1000; //in minutes
        // var hDiff = hourDiff / 3600 / 1000; //in hours
        // var humanReadable = {};
        // humanReadable.hours = Math.floor(hDiff);
        // humanReadable.minutes = minDiff - 60 * humanReadable.hours;
        // humanReadable.seconds = secDiff - minDiff * 60;

    },
    formateSecond(totalSeconds, isMinutes) {
        if (!totalSeconds) {
            return "0s";
        }
        totalSeconds = isMinutes ? (totalSeconds * 60) : totalSeconds;
        var month = Math.floor(totalSeconds / 2419200);
        totalSeconds %= 2419200;
        var week = Math.floor(totalSeconds / 604800);
        totalSeconds %= 604800;
        var day = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return (
            (month ? month + 'mth ' : '') +
            (week ? week + 'w ' : '') +
            (day ? day + 'd ' : '') +
            (hours ? hours + 'h ' : '') +
            (minutes ? minutes + 'm ' : '') +
            (month !== 0 || week !== 0 || day !== 0 || hours !== 0 || minutes !== 0 ? (seconds ? seconds + 's' : '') : seconds + 's')
        )
    },
    dateParse(field, e, time, data) {
        var date = '';
        if (field === 17530101000000000) {
            return date;
        }
        if (field) {
            // if (typeof (field) === 'string') {
            //     field = $D(field);
            // }
            date = moment(field).format('L');

            if (time) {
                var serverTimeZoneOffSet = localStorage.getItem('serverTimeZone');
                var timeZoneOffSet = localStorage.getItem('timeZoneOffSet');
                field = moment(field).add(serverTimeZoneOffSet - (timeZoneOffSet), 'minutes');
                date = moment(field).format('L') + ' ' + moment(field, 'm-D-YYYY HH:mm:ss ').format("HH:mm:ss A ");
                //var timezone = utils.getTimeZone(e.data.TimeZoneId, data);
                //timezone = timezone ? ' ' + timezone : '';
                // date = date + timezone;
            }
            return date;
        }
    },
    dateParse2(field, time, format) {
        var date = '';
        format = format || "HH:mm";
        if (field === 17530101000000000) {
            return date;
        }
        if (field) {
            if (typeof (field) === 'string') {
                let value = field;
                field = new Date(Number(value.substr(0, 4)),
                    Number(value.substr(4, 2)) - 1,
                    Number(value.substr(6, 2)),
                    Number(value.substr(8, 2)),
                    Number(value.substr(10, 2)),
                    Number(value.substr(12, 2))
                )
            }
            date = moment(field).format('L');

            if (time) {
                var serverTimeZoneOffSet = localStorage.getItem('serverTimeZone');
                var timeZoneOffSet = localStorage.getItem('timeZoneOffSet');
                field = moment(field).add(serverTimeZoneOffSet - (timeZoneOffSet), 'minutes');
                date = moment(field).format('L') + ' ' + moment(field, 'm-D-YY HH:mm:ss').format(format);
            }
            return date;
        }
    },
    MomentDateRenderer(value) {
        if (value.value) {
            value.value = value.value._isValid ? moment(value.value).format("YYYYMMDDHHmmss000") : value.value;
            var date = value.value instanceof Date ? value.value : this.parse(value.value);
            var indexValue = value.row.TimeZoneId - 1;
            if (indexValue > 0) {
                var timeZone = value ? this.state.json.combos.TimeZone[indexValue] ? this.state.json.combos.TimeZone[indexValue].CustomStringValue : value : '';
            }
            date = value.column.type === "dateField" ? date && date.getFullYear() > 1970 ? moment(date).format(Util.dateFormat) : '' : date && date.getFullYear() > 1970 ? moment(date).format(Util.dateTimeFormat) : ''; timeZone = timeZone ? '  ' + timeZone : ' ';
            return date ? date + timeZone : ' ';
        }
    },
    DateTimeWithTimeZone: function (value) {
        var date = value.value instanceof Date ? value.value : this.parse(value.value);
        var indexValue = value.row.TimeZoneId - 1;
        if (indexValue > 0) {
            var timeZone = value ? this.state.json.combos.TimeZone[indexValue] ? this.state.json.combos.TimeZone[indexValue].CustomStringValue : value : '';
        }
        date = date && date.getFullYear() > 1970 ? moment(date).format(Util.dateTimeFormat) : '';
        timeZone = timeZone ? '  ' + timeZone : ' ';
        return date ? date + timeZone : ' ';

    },
    DateTimeWithLocalTimeZone: function (value) {
        var date = value.value instanceof Date ? value.value : this.parse(value.value);
        var localDate = date ? this.getLocalDateTime(date) : '';
        date = localDate && localDate.getFullYear() > 1970 ? moment(localDate).format(Util.dateTimeFormat) : '';
        var timeZone = localDate ? localDate.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "") : '';
        return date ? date + ' ' + timeZone : '';
    },

    DateLocalizer: function (value) {
        var date = value.value instanceof Date ? value.value : this.parse(value.value);
        var localDate = this.getLocalDateTime(date);
        date = localDate && localDate.getFullYear() > 1970 ? moment(localDate).format(Util.dateTimeFormat) : '';
        return date;
    },
    standardDate: function (value) {
        if (!value) {
            return '';
        }
        var val = value.value;
        if (!val) {
            val = value;
        }
        var date = val instanceof Date ? val : dateUtils.parse(val);
        date = date && date.getFullYear() > 1970 ? moment(date).format(Util.dateFormat) : '';
        return date;
    },
    timeZoneSortForm: function (value) {
        value = value.value;
        var indexValue = value - 1;
        var timeZone = '';
        if (indexValue > 0) {
            timeZone = value ? this.state.json.combos.TimeZone[indexValue] ? this.state.json.combos.TimeZone[indexValue].CustomStringValue : value : '';
        }
        return timeZone;
    },
    standardDateTime: function (value, format) {
        if (!value) {
            return '';
        }
        var val = value;
        if (!val) {
            val = value;
        }
        var date = val instanceof Date ? val : dateUtils.parse(val);
        date = date && date.getFullYear() > 1970 ? moment(date).format(format ? format : Util.dateTimeFormat) : '';
        return date;
    }
}