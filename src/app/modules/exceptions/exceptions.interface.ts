// Interface for values in ExceptionRow
interface ExceptionValues {
  [key: string]: any;
}

export class ExceptionRow {
  title: string;
  helpIcon: string;
  values: ExceptionValues;

  constructor(title: string, helpIcon: string, values: ExceptionValues = {}) {
    this.title = title;
    this.helpIcon = helpIcon;
    this.values = values;
  }
}

// ExceptionModel
export class ExceptionModel {
  monthName: string;
  daysInMonth: number;
  rows: ExceptionRow[];

  constructor(monthName: string, daysInMonth: number, rows: ExceptionRow[] = []) {
    this.monthName = monthName;
    this.daysInMonth = daysInMonth;
    this.rows = rows;
  }
}

// InvoiceException
interface InvoiceOptions {
  noShow?: boolean;
  modifiedReservations?: boolean;
  walkIn?: boolean;
  dayRooms?: boolean;
  nonContractRate?: boolean;
}

export class InvoiceException {
  checkIn: string;
  checkOut: string;
  names: string[];
  expectedIds: string[];
  enteredIds: string[];
  noShow: boolean;
  modifiedReservations: boolean;
  walkIn: boolean;
  dayRooms: boolean;
  nonContractRate: boolean;
  exceptionType: string;

  constructor(
    checkIn: string,
    checkOut: string,
    names: string[],
    expectedIds: string[],
    enteredIds: string[],
    options: InvoiceOptions = {},
    exceptionType: string
  ) {
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

// InvoiceExceptionsModel
export class InvoiceExceptionsModel {
  title: string;
  rows: InvoiceException[];
  commentsTitle: string;
  comments: string[];
  resolvedKeys: Record<string, any>;

  constructor(
    title: string,
    rows: InvoiceException[] = [],
    commentsTitle: string = '',
    comments: string[] = [],
    resolvedKeys: Record<string, any> = {}
  ) {
    this.title = title;
    this.rows = rows;
    this.commentsTitle = commentsTitle;
    this.comments = comments;
    this.resolvedKeys = resolvedKeys;
  }
}

// AiAuditResultRow
export class AiAuditResultRow {
  exception: string;
  names: string[];
  expectedIds: string[];
  confidence: number;
  analysis: string;
  checked: boolean;
  warning: boolean;

  constructor({
    exception,
    names,
    expectedIds,
    confidence,
    analysis,
    checked = false,
    warning = false
  }: {
    exception: string;
    names: string[];
    expectedIds: string[];
    confidence: number;
    analysis: string;
    checked?: boolean;
    warning?: boolean;
  }) {
    this.exception = exception;
    this.names = names;
    this.expectedIds = expectedIds;
    this.confidence = confidence;
    this.analysis = analysis;
    this.checked = checked;
    this.warning = warning;
  }
}

// AiAuditResultsModel
export class AiAuditResultsModel {
  summary: {
    dateLabel: string;
    resolvedCount: number;
    manualReviewCount: number;
  };
  rows: AiAuditResultRow[];

  constructor({
    dateLabel,
    resolvedCount,
    manualReviewCount,
    rows = []
  }: {
    dateLabel: string;
    resolvedCount: number;
    manualReviewCount: number;
    rows?: AiAuditResultRow[];
  }) {
    this.summary = { dateLabel, resolvedCount, manualReviewCount };
    this.rows = rows;
  }
}

// getAiAuditResultsModel
export class GetAiAuditResultsModel {
  exception: string;
  names: string[];
  expectedIds: string[];
  confidence: number;
  analysis: string;
  checked: boolean;
  warning: boolean;

  constructor({
    exception,
    names,
    expectedIds,
    confidence,
    analysis,
    checked,
    warning
  }: {
    exception: string;
    names: string[];
    expectedIds: string[];
    confidence: number;
    analysis: string;
    checked: boolean;
    warning: boolean;
  }) {
    this.exception = exception;
    this.names = names;
    this.expectedIds = expectedIds;
    this.confidence = confidence;
    this.analysis = analysis;
    this.checked = checked;
    this.warning = warning;
  }
}
