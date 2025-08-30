export class ExceptionRow {
    constructor(title, helpIcon, values = {}) {
        this.title = title;
        this.helpIcon = helpIcon;
        this.values = values;
    }
}

// Array of ExceptionRow
export class ExceptionModel {
    constructor(monthName, daysInMonth, rows = []) {
        this.monthName = monthName;
        this.daysInMonth = daysInMonth;
        this.rows = rows;
    }
}

export class InvoiceException {
    constructor(checkIn, checkOut, names, expectedIds, enteredIds, options = {}, exceptionType) {
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.names = names;
        this.expectedIds = expectedIds;
        this.enteredIds = enteredIds;
        this.noShow = options.noShow || false;
        this.modifiedReservations = options.modifiedReservations || false;
        this.walkIn = options.walkIn || false;
        this.dayRooms = options.dayRooms || false;
        this.nonContractRate = options.nonContractRate || false;
        this.exceptionType = exceptionType;
    }
}

// Array of InvoiceException
export class InvoiceExceptionsModel {
    constructor(title, rows = [], commentsTitle = '', comments = [], resolvedKeys = {}) {
        this.title = title;
        this.rows = rows;
        this.commentsTitle = commentsTitle;
        this.comments = comments;
        this.resolvedKeys = resolvedKeys;
    }
}


/// audit results model
export class AiAuditResultRow {
    constructor({ exception, names, expectedIds, confidence, analysis, checked = false, warning = false }) {
        this.exception = exception;
        this.names = names;
        this.expectedIds = expectedIds;
        this.confidence = confidence;
        this.analysis = analysis;
        this.checked = checked;
        this.warning = warning;
    }
}

export class AiAuditResultsModel {
    constructor({ dateLabel, resolvedCount, manualReviewCount, rows = [] }) {
        this.summary = { dateLabel, resolvedCount, manualReviewCount };
        this.rows = rows;
    }
}

export class getAiAuditResultsModel {
    contructor({ exception, names, expectedIds, confidence, analysis, checked, warning }) {
        this.exception = exception;
        this.names = names;
        this.expectedIds = expectedIds;
        this.confidence = confidence;
        this.analysis = analysis;
        this.checked = checked;
        this.warning = warning;
    }

}
