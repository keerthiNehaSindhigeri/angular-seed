import { ExceptionModel, ExceptionRow, InvoiceException, InvoiceExceptionsModel, AiAuditResultsModel, AiAuditResultRow } from './models.js';

// Global audit approval state cache by dateLabel as object keyed by normalized exception type
const auditApprovalState = {};
const invoiceExceptionsCache = {};

document.addEventListener('DOMContentLoaded', () => {
  renderExceptions(exceptionModel);
  initOccupancyReportRequest();
});


const exceptionTitles = [
  "Hotel Occ. (95% Required)",
  "Billable No-Shows",
  "Crew ID Issues",
  "Walk-Ins",
  "Modified Reservations",
  "Day-Rooms"
];


const helperIcon = "../assets/icons/help-icon_16.png";
const exceptionValues = [
  { 1: 97, 8: 98, 10: 95,  14: 90, 17: 95, 26:90, },
  { 1: 2, 10: 1, 14: 1, 26: 1, 8: 4,17:2, },
  { 1: 1, 31: 4, 1: 1, 2: 2, 5: 2, 6: 1, 10: 1, 11: 2, 17: 1, 23: 1, 24: 1 },
  { 1: 4, 2: 2, 5: 1 },
  { 1: 2, 6: 7, 9: 1 },
  { 1: 3, 2: 6, 3: 6, 4: 2, 5: 6, 6: 4, 7: 6, 8: 6, 9: 6, 10: 2, 11: 2, 12: 10, 13: 17, 14: 6, 15: 6, 16: 8, 17: 6, 18: 6, 19: 6, 20: 6, 21: 7, 22: 6, 23: 6, 24: 6, 25: 8, 26: 6, 27: 6, 28: 6, 29: 6 }
];


const exceptionRows = exceptionTitles.map((title, idx) =>
  new ExceptionRow(title, helperIcon, exceptionValues[idx])
);
const exceptionModel = new ExceptionModel("May", 30, exceptionRows);
let currentInvoiceModalDateLabel = null;

// invoice exceptions generation
function getInvoiceExceptionsDetailsModel({ dateLabel }) {
  renderOccupancySection(dateLabel);

  // If cache exists, refresh resolvedKeys from auditApprovalState
  if (invoiceExceptionsCache[dateLabel]) {
    const cache = invoiceExceptionsCache[dateLabel];
    cache.resolvedKeys = {};
    cache.rows.forEach((row, idx) => {
      const key = `${row.exceptionType}__${idx}`;
      row.autoApproved = auditApprovalState[dateLabel]?.[key] === "100%";
      if (row.autoApproved) {
        cache.resolvedKeys[key] = true;
      }
    });
    return cache;
  }

  const dayMatch = dateLabel.match(/\b(\d{1,2})\b/);
  if (!dayMatch) return new InvoiceExceptionsModel(`Invoice Exceptions ${dateLabel}`, [], `Comments For ${dateLabel}`, [], {});

  const day = parseInt(dayMatch[1], 10);
  const yearMatch = dateLabel.match(/\b(\d{4})\b/);
  const year = yearMatch ? yearMatch : '2025';
  const monthName = exceptionModel.monthName;

  let rows = [];
  let resolvedKeys = {};

  exceptionModel.rows.forEach(exceptionRow => {
    const exception = exceptionRow.title;
    if (exception === "Hotel Occ. (95% Required)") return;

    const count = exceptionRow.values[day] || 0;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const checkIn = `${monthName} ${day}, ${year} 07:00`;
        const checkOut = `${monthName} ${day}, ${year} 04:00`;

        let enteredIds = "NO ID";
        let expectedIds = String(Math.floor(100000 + Math.random() * 900000));
        let names = `Crew ${i + 1}`;

        if (exception === "Billable No-Shows") {
          enteredIds = "No Show";
        } else if (exception === "Crew ID Issues") {
          const expectedID = String(Math.floor(100000 + Math.random() * 900000));
          let enteredID;
          do {
            enteredID = String(Math.floor(100000 + Math.random() * 900000));
          } while (enteredID === expectedID);
          expectedIds = expectedID;
          enteredIds = enteredID;
        } else {
          enteredIds = expectedIds;
        }

        const approvalKey = `${exception}__${i}`;
        const isApproved = auditApprovalState[dateLabel]?.[approvalKey] === "100%";

        if (isApproved) {
          resolvedKeys[approvalKey] = true;
        }

        rows.push(new InvoiceException(
          checkIn,
          checkOut,
          names,
          expectedIds,
          enteredIds,
          {
            noShow: exception === "Billable No-Shows",
            modifiedReservations: exception === "Modified Reservations",
            walkIn: exception === "Walk-Ins",
            dayRooms: exception === "Day-Rooms",
            nonContractRate: false,
            autoApproved: isApproved
          },
          exception
        ));
      }
    }
  });

  const model = new InvoiceExceptionsModel(
    `Invoice Exceptions ${dateLabel}`,
    rows,
    `Comments For ${dateLabel}`,
    [],
    resolvedKeys
  );

  invoiceExceptionsCache[dateLabel] = model;
  return model;
}


// Generate AI audit results for exceptions present on selectedDate
function getAiAuditResultsModel({ dateLabel }) {
  // Get invoice exceptions data for the given date
  const invoiceModel = getInvoiceExceptionsDetailsModel({ dateLabel });
  const invoiceRows = invoiceModel.rows;
  const resolvedKeys = invoiceModel.resolvedKeys || {};
  /// get hotel occupancy percentage
  const occupancy = getOccupancyPercentage(dateLabel);


  const exceptionAnalysisMap = {
    "Billable No-Shows": () => `Hotel occupancy report is matching ${occupancy !== null ? occupancy + '%' : 'N/A'}`,
    "Crew ID Issues": () => "Crew ID mismatch detected",
    "Walk-Ins": () => "Walk-in exceptions require manual confirmation",
    "Modified Reservations": () => "Reservation modified after booking",
    "Day-Rooms": () => "Day-room charge applied",
    "Hotel Occ. (95% Required)": () => "Bill charges comes under the aggrement"
  };
  // Map invoice rows to AI audit rows, using resolvedKeys for checked status
  const auditRows = invoiceRows.map((invRow, index) => {
    const key = `${invRow.exceptionType}__${index}`;
    const checked = !!resolvedKeys[key];
    const confidence = checked ? "100%" : "0%";


    const getAnalysisText = exceptionAnalysisMap[invRow.exceptionType] || ((checked) => (checked ? "Audit approved" : "Needs review"));
    const analysisText = typeof getAnalysisText === "function" ? getAnalysisText(checked) : getAnalysisText;
    return new AiAuditResultRow({
      exception: invRow.exceptionType || invRow.names,
      names: invRow.names,
      expectedIds: invRow.expectedIds,
      confidence,
      analysis: analysisText,
      checked,
      warning: false,
      index
    });
  });

  const resolvedTotal = Object.keys(resolvedKeys).length;

  return new AiAuditResultsModel({
    dateLabel,
    resolvedCount: resolvedTotal,
    manualReviewCount: invoiceRows.length - resolvedTotal,
    rows: auditRows
  });
}


// Renders exception table
function renderExceptions(model) {
  const root = document.getElementById('exception-table');
  if (!root) return;

  let table = root.querySelector('table');
  if (!table) {
    table = document.createElement('table');
    root.appendChild(table);
  }

  let thead = table.querySelector('thead') || table.createTHead();
  let tbody = table.querySelector('tbody') || table.createTBody();
  let tfoot = table.querySelector('tfoot') || table.createTFoot();

  let headHTML = `
    <tr>
      <th></th>
      <th colspan="${model.daysInMonth}">${model.monthName}</th>
    </tr>
    <tr>
      <th></th>
      ${Array.from({ length: model.daysInMonth }, (_, i) => `<th>${i + 1}</th>`).join("")}
    </tr>
  `;
  thead.innerHTML = headHTML;

  let bodyHTML = model.rows.map(row => {
    const cells = Array.from({ length: model.daysInMonth }, (_, idx) => {
      const day = idx + 1;
      const val = row.values[day];
      return val ? `<td data-day="${day}" data-row-title="${escapeHtml(row.title)}"><a href="#" class="text-error fw-700">${val}</a></td>` : "<td></td>";
    }).join("");
    return `<tr>
      <td>${escapeHtml(row.title)} <img src="${row.helpIcon}" alt=""></td>
      ${cells}
    </tr>`;
  }).join("");
  tbody.innerHTML = bodyHTML;

  const viewAttachments = `<tr><td>View Attachments</td>${"<td></td>".repeat(model.daysInMonth)}</tr>`;
  const messages = `<tr><td>Messages</td>${`<td><img src="../assets/icons/dropdown_16.png" class="cursor-pointer" alt=""></td>`.repeat(model.daysInMonth)}</tr>`;
  tfoot.innerHTML = viewAttachments + messages;
}



function initOccupancyReportRequest() {
  const container = document.getElementById('exception-table');
  if (!container) return;

  container.addEventListener('click', e => {
    const td = e.target.closest('td');
    if (!td) return;

    const day = td.getAttribute('data-day');
    if (!day) return;

    const dateLabel = `${exceptionModel.monthName} ${day}, 2025`;
    showLoader();
    setTimeout(() => {
      hideLoader();
      renderInvoiceExceptionsModal({ dateLabel });
    }, 500);
  });
}

// invoice exception details modal (Table-2 data)
function renderInvoiceExceptionsModal({ dateLabel }) {
  currentInvoiceModalDateLabel = dateLabel;

  const modal = document.getElementById('invoice-exceptions-modal-report');
  if (!modal) return;

  const model = getInvoiceExceptionsDetailsModel({ dateLabel });

  const modalTitle = modal.querySelector('#modal-title');
  const occupancy = getOccupancyPercentage(dateLabel);
  if (modalTitle) {
    modalTitle.textContent = model.title;
    if (occupancy === null || occupancy === undefined) {
      modalTitle.style.marginTop = '2rem';
    } else {
      modalTitle.style.marginTop = '0rem';
    }
  }

  const commentsTitle = modal.querySelector('#modal-comments-title');
  if (commentsTitle) commentsTitle.textContent = model.commentsTitle;
  const tbody = modal.querySelector('#modal-invoice-tbody');

  tbody.innerHTML = model.rows.map(r => {
    //validate crew ID issue
    const isWrongID = r.enteredIds !== r.expectedIds && r.enteredIds != "No Show";
    const isNoID = r.enteredIds.trim() === "" || r.enteredIds.toUpperCase() === "NO ID";
    const idText = !isNoID && isWrongID ? `<span class="ml-2">${escapeHtml(r.enteredIds)}</span>` : "";

    return `
    <tr>
      <td>${escapeHtml(r.checkIn)}</td>
      <td>${escapeHtml(r.checkOut)}</td>
      <td>${escapeHtml(r.names)}</td>
      <td>${escapeHtml(r.expectedIds)}</td>
<td>
  <div class="d-flex align-items-center justify-content-end align-items-center">
    ${idText
        ? `
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
           <span>${escapeHtml(r.enteredIds)}</span>
          <input type="checkbox" class="entered-id-checkbox" data-exception="Crew ID Issues" ${r.autoApproved ? 'checked' : ''}>
       
        </label>
        `
        : `<span>${escapeHtml(r.enteredIds)}</span>`
      }
  </div>
</td>


  <td class="text-center">${r.noShow ? `<input type="checkbox" class="invoice-checkbox" data-exception="Billable No-Shows" ${r.autoApproved ? 'checked' : ''}>` : ""}</td>
    <td class="text-center">${r.modifiedReservations ? `<input type="checkbox" class="invoice-checkbox" data-exception="Modified Reservations" ${r.autoApproved ? 'checked' : ''}>` : ""}</td>
    <td class="text-center">${r.walkIn ? `<input type="checkbox" class="invoice-checkbox" data-exception="Walk-Ins" ${r.autoApproved ? 'checked' : ''}>` : ""}</td>
    <td class="text-center">${r.dayRooms ? `<input type="checkbox" class="invoice-checkbox" data-exception="Day-Rooms" ${r.autoApproved ? 'checked' : ''}>` : ""}</td>
    <td class="text-center">${r.nonContractRate ? `<input type="checkbox" class="invoice-checkbox" data-exception="Non-Contract Rate" ${r.autoApproved ? 'checked' : ''}>` : ""}</td>
    <td class="text-center"><a href="#" class="link-olive">Folio</a><a href="#" class="link-olive">Fax</a></td>
    <td class="text-center"><a href="#" class="link-olive">View Details</a></td>
    <td class="text-center cursor-pointer"><img src="../assets/icons/document.png" alt=""></td>

    </tr>
  `;
  }).join('');

  // Fill comments table body
  const commentsBody = modal.querySelector('#modal-comments-tbody');
  if (!commentsBody) return;

  if (model.comments.length === 0) {
    commentsBody.innerHTML = `<tr><td colspan="7" class="text-start">No records found.</td></tr>`;
  } else {
    commentsBody.innerHTML = model.comments.map(c => `
      <tr>
        <td>${escapeHtml(c.date)}</td>
        <td>${escapeHtml(c.user)}</td>
        <td>${escapeHtml(c.type)}</td>
        <td>${escapeHtml(c.refDate)}</td>
        <td>${escapeHtml(c.text)}</td>
        <td><button class="btn btn-link" data-action="edit-comment" data-id="${c.id}">Edit</button></td>
        <td><button class="btn btn-link" data-action="delete-comment" data-id="${c.id}">Delete</button></td>
      </tr>
    `).join('');
  }


  showModal(modal);

  const aiAuditBtn = modal.querySelector('#ai-audit-btn');
  if (aiAuditBtn) {
    aiAuditBtn.onclick = () => {
      const auditRunningModal = document.getElementById('audit-running');
      const auditResultModal = document.getElementById('ai-audit-result-table');

      showModal(auditRunningModal);

      setTimeout(() => {
        hideModal(auditRunningModal);

        const auditModel = getAiAuditResultsModel({ dateLabel });

        auditApprovalState[dateLabel] = {};
        auditModel.rows.forEach((r, index) => {
          const key = `${r.exception}__${index}`;
          auditApprovalState[dateLabel][key] = r.confidence;
        });

        // Refresh Invoice Exceptions table immediately
        renderInvoiceExceptionsModal({ dateLabel });

        // Then show AI audit results
        renderAiAuditResultsModal({ dateLabel });
        showModal(auditResultModal);
      }, 1000);
    };

  }

  // // Attach change listeners for invoice exception checkboxes
  modal.querySelectorAll('.invoice-checkbox, .entered-id-checkbox').forEach((checkbox, index) => {
    checkbox.addEventListener('change', (event) => {
      const exceptionType = event.target.getAttribute('data-exception');
      const tr = event.target.closest('tr');
      const tbody = tr.parentElement;
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const rowIndex = rows.indexOf(tr);

      const dateLabel = currentInvoiceModalDateLabel;
      const key = `${exceptionType}__${rowIndex}`;

      if (!auditApprovalState[dateLabel]) auditApprovalState[dateLabel] = {};

      auditApprovalState[dateLabel][key] = event.target.checked ? "100%" : "0%";

      renderInvoiceExceptionsModal({ dateLabel });
      renderAiAuditResultsModal({ dateLabel });
    });
  });

}

// Function to get occupancy percentage
function getOccupancyPercentage(dateLabel) {
  const dayMatch = dateLabel.match(/\b(\d{1,2})\b/);
  if (!dayMatch) return null;
  const day = parseInt(dayMatch[1], 10);

  const hotelOccRow = exceptionModel.rows.find(r => r.title === "Hotel Occ. (95% Required)");
  if (!hotelOccRow) return null;

  return hotelOccRow.values[day] || null;
}

// Function to render occupancy section
function renderOccupancySection(dateLabel) {
  const occupancy = getOccupancyPercentage(dateLabel);

  const container = document.getElementById('occupancy-section-container');
  if (!container) return;

  container.innerHTML = '';

  if (occupancy === null || occupancy === undefined) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  container.style.gap = '8px';
  container.style.alignItems = 'center';
  container.style.marginLeft = '1rem';
  container.style.marginTop = '0.75rem';
  container.style.marginBottom = '0';

  const label = document.createElement('h4');
  label.textContent = 'Occupancy Percentage:';
  label.style.color = 'black';
  label.style.margin = '0';

  const value = document.createElement('h4');
  value.id = 'occupancy-percentage';
  value.textContent = `${occupancy}`;
  value.style.margin = '0';
  value.style.color = 'black';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'occupancy-percentage-checkbox';
  checkbox.className = 'entered-id-checkbox';
  checkbox.setAttribute('data-exception', 'hoteloccupancy');

  if (!auditApprovalState[dateLabel]) auditApprovalState[dateLabel] = {};
  const key = 'hoteloccupancy';
  checkbox.checked = auditApprovalState[dateLabel][key] === '100%';
  checkbox.addEventListener('change', (e) => {
    auditApprovalState[dateLabel][key] = e.target.checked ? '100%' : '0%';
    renderInvoiceExceptionsModal({ dateLabel });
  });

  container.appendChild(label);
  container.appendChild(value);
  container.appendChild(checkbox);
}


function renderAiAuditResultsModal({ dateLabel }) {
  const modal = document.getElementById('ai-audit-result-table');
  if (!modal) return;

  const model = getAiAuditResultsModel({ dateLabel });

  modal.querySelector('#ai-audit-summary').textContent = `AI audit completed for ${escapeHtml(model.summary.dateLabel)}`;
  modal.querySelector('#ai-audit-resolved-count').textContent = `${model.summary.resolvedCount} exceptions resolved`;
  modal.querySelector('#ai-audit-manual-review-count').textContent = `${model.summary.manualReviewCount} require manual review`;

  const tbody = modal.querySelector('#ai-audit-rows');
  tbody.innerHTML = model.rows.map((r, index) => `
    <tr${r.warning ? ' class="catskill-white"' : ''} data-row-index="${index}">
      <td>${r.warning ? `<div class="d-flex flex-wrap align-items-center justify-content-between"><div class="pr-8"><img src="../assets/images/warning.png" width="20" height="20"></div><div>${escapeHtml(r.exception)}</div></div>` : escapeHtml(r.exception)}</td>
      <td>${escapeHtml(r.names)}</td>
      <td>${escapeHtml(r.expectedIds)}</td>
      <td>${escapeHtml(r.confidence)}</td>
      <td>${escapeHtml(r.analysis)}</td>
      <td><input type="checkbox" class="audit-checkbox" data-exception="${escapeHtml(r.exception)}" ${r.checked ? 'checked' : ''}></td>
    </tr>
  `).join('');
  tbody.querySelectorAll('.audit-checkbox').forEach((checkbox, index) => {
    checkbox.addEventListener('change', (event) => {
      const exceptionType = event.target.getAttribute('data-exception');
      const key = `${exceptionType}__${index}`;
      const dateLabel = currentInvoiceModalDateLabel;

      if (!auditApprovalState[dateLabel]) auditApprovalState[dateLabel] = {};
      auditApprovalState[dateLabel][key] = event.target.checked ? "100%" : "0%";

      renderInvoiceExceptionsModal({ dateLabel });
    });

  });


  const closeBtn = modal.querySelector('.close-button');
  if (closeBtn) {
    closeBtn.onclick = () => {
      hideModal(modal);

      // Re-render invoice exceptions modal to reflect this change
      renderInvoiceExceptionsModal({ dateLabel });

    };
  }
}


function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
