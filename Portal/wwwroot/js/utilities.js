export class Utilities {
    static MoveKendoToolbar(gridName) {
        $(gridName).find(".k-grid-toolbar").insertAfter($(gridName + " .k-grid-content"));
    }
    static FormatPhoneNumber(phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return null;
    }
    static FormatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        const negativeSign = amount < 0 ? "-" : "";
        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;
        return negativeSign + "$" + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - parseFloat(i)).toFixed(decimalCount).slice(2) : "");
    }
    static FormatDateTimeString(dateString) {
        let date = new Date(dateString);
        return this.FormatDate(date) + " " + this.FormatTime(date);
    }
    static FormatDateString(dateString) {
        let date = new Date(dateString);
        return this.FormatDate(date);
    }
    static FormatDate(date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        let day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        return month + '/' + day + '/' + year;
    }
    static FormatTime(date) {
        let ap = "AM";
        let h = date.getHours();
        let m = this.addZero(date.getMinutes());
        let s = this.addZero(date.getSeconds());
        if (h >= 12) {
            ap = "PM";
            h = h - 12;
        }
        if (h === 0) {
            h = 12;
        }
        h = this.addZero(h);
        return h + ':' + m + ':' + s + " " + ap;
    }
    static addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    static validateElement(elm) {
        const element = (typeof elm === 'string' ? document.querySelector(elm) : elm);
        if (!element) {
            throw new Error('Could not find element');
        }
        if (element.tagName !== 'DIV') {
            throw new Error('Element isnt of type div');
        }
        return element;
    }
    static formatBytes(bytes, decimals = 0) {
        if (bytes == 0)
            return '0 Bytes';
        const k = 1024, dm = decimals <= 0 ? 0 : decimals || 2, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    static Currency2Float(str) {
        let c = jQuery.trim(str);
        c = c.replace("$", "");
        c = c.replace(",", "");
        return parseFloat(c);
    }
    static Float2Currency(val) {
        return kendo.toString(val, "c");
    }
    static deep(source) {
        return JSON.parse(JSON.stringify(source));
    }
}
