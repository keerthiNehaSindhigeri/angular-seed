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
    constructor(checkIn, checkOut, names, expectedIds, enteredIds, options = {}) {
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.names = names;
        this.expectedIds = expectedIds;
        this.enteredIds = enteredIds;
        this.billableNoShow = options.billableNoShow || false;
        this.modifiedReservations = options.modifiedReservations || false;
        this.walkIn = options.walkIn || false;
        this.dayRooms = options.dayRooms || false;
        this.nonContractRate = options.nonContractRate || false;
    }
}

// Array of InvoiceException
export class InvoiceExceptionsModel {
    constructor(title, rows = [], commentsTitle = '', comments = []) {
        this.title = title;
        this.rows = rows;
        this.commentsTitle = commentsTitle;
        this.comments = comments;
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

export function getAiAuditResultsModel({ dateLabel }) {
    return new AiAuditResultsModel({
        dateLabel,
        resolvedCount: 7,
        manualReviewCount: 1,
        rows: [
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            // other rows...
            new AiAuditResultRow({ exception: "Day Rooms", names: "Crew 1", expectedIds: "123456", confidence: "0%", analysis: "Hotel occupancy report is matching 95%", checked: false, warning: true }),
        ]
    });
}
