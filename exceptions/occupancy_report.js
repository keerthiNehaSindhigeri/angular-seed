import { ExceptionModel, ExceptionRow, InvoiceException, InvoiceExceptionsModel, AiAuditResultsModel, AiAuditResultRow } from './models.js';

// Global audit approval state cache by dateLabel as object keyed by normalized exception type
const auditApprovalState = {}; // { [dateLabel]: { [normalizedExceptionType]: confidenceString } }

function normaliseType(str) {
  return String(str || "").trim().toLowerCase().replace(/[\s\-]+/g, "");
}

document.addEventListener('DOMContentLoaded', () => {
  renderExceptions(exceptionModel);
  initOccupancyReportRequest();
});

const exceptionModel = new ExceptionModel("May", 30, [
  new ExceptionRow(
    "Hotel Occ. (95% Required)",
    "../assets/icons/help-icon_16.png",
    { 1: 7, 3: 13, 5: 5, 8: 11, 10: 3, 13: 14, 14: 9 }
  ),
  new ExceptionRow(
    "Billable No-Shows",
    "../assets/icons/help-icon_16.png",
    { 12: 1, 14: 1, 26: 1 }
  ),
  new ExceptionRow(
    "Crew ID Issues",
    "../assets/icons/help-icon_16.png",
    { 31: 4, 1: 1, 2: 2, 5: 2, 6: 1, 10: 1, 11: 2, 17: 1, 23: 1, 24: 1 }
  ),
  new ExceptionRow(
    "Walk-Ins",
    "../assets/icons/help-icon_16.png",
    {}
  ),
  new ExceptionRow(
    "Modified Reservations",
    "../assets/icons/help-icon_16.png",
    {}
  ),
  new ExceptionRow(
    "Day-Rooms",
    "../assets/icons/help-icon_16.png",
    { 1: 7, 2: 6, 3: 6, 4: 2, 5: 6, 6: 4, 7: 6, 8: 6, 9: 6, 10: 2, 11: 2, 12: 10, 13: 17, 14: 6, 15: 6, 16: 8, 17: 6, 18: 6, 19: 6, 20: 6, 21: 7, 22: 6, 23: 6, 24: 6, 25: 8, 26: 6, 27: 6, 28: 6, 29: 6 }
  )
]);

// Dynamic invoice exceptions generation from exceptionModel and clicked date
function getInvoiceExceptionsDetailsModel({ dateLabel }) {
  const dayMatch = dateLabel.match(/\b(\d{1,2})\b/);
  if (!dayMatch) return new InvoiceExceptionsModel(`Invoice Exceptions ${dateLabel}`, [], `Comments For ${dateLabel}`, []);
  const day = parseInt(dayMatch[1], 10);
  const yearMatch = dateLabel.match(/\b(\d{4})\b/);
  const year = yearMatch ? yearMatch : '2025';  // Corrected: Use first matched value, not whole array
  const monthName = exceptionModel.monthName;

  let rows = [];

  exceptionModel.rows.forEach(exceptionRow => {
    if (exceptionRow.title === "Hotel Occ. (95% Required)") return;  // Skip hotel occupancy

    const count = exceptionRow.values[day] || 0;
    if (count > 0) {
      const normType = normaliseType(exceptionRow.title);

      const isApproved = isExceptionApproved(auditApprovalState, dateLabel, exceptionRow.title);

      for (let i = 0; i < count; i++) {
        const checkIn = `${monthName} ${day}, ${year} 07:00`;
        const checkOut = `${monthName} ${day}, ${year} 04:00`;

        let enteredIds = "NO ID";
        let expectedIds = String(Math.floor(100000 + Math.random() * 900000));
        let names = `Crew ${i + 1}`;

        if (normType === "billablenoshows") {
          enteredIds = "No Show";

        }
        else if (normType === "crewidissues") {
          // Generate expected ID
          const expectedID = String(Math.floor(100000 + Math.random() * 900000));
          // Generate entered ID, sometimes matching, sometimes mismatching:
          let enteredID;

          do {
            enteredID = String(Math.floor(100000 + Math.random() * 900000));
          } while (enteredID === expectedID);
          expectedIds = expectedID;
          enteredIds = enteredID;
        } else {
          enteredIds = expectedIds;
        }

        console.log(`[Invoice Exception] Day ${day} Type: ${exceptionRow.title}, Names: ${names}, ExpectedIds: ${expectedIds}, EnteredIds: ${enteredIds}, Approved: ${isApproved}`);

        rows.push(new InvoiceException(
          checkIn,
          checkOut,
          names,
          expectedIds,
          enteredIds,
          {
            billableNoShow: normType === "billablenoshows",
            modifiedReservations: normType === normaliseType("Modified Reservations"),
            walkIn: normType === normaliseType("Walk-Ins"),
            dayRooms: normType === normaliseType("Day-Rooms"),
            nonContractRate: false,
            autoApproved: isApproved
          }
        ));
      }
    }
  });

  return new InvoiceExceptionsModel(`Invoice Exceptions ${dateLabel}`, rows, `Comments For ${dateLabel}`, []);
}
function renderInvoiceExceptionsModal({ dateLabel }) {
  currentInvoiceModalDateLabel = dateLabel;

  const modal = document.getElementById('invoice-exceptions-modal-report');
  if (!modal) return;

  const model = getInvoiceExceptionsDetailsModel({ dateLabel });

  const modalTitle = modal.querySelector('#modal-title');
  if (modalTitle) modalTitle.textContent = model.title;

  const commentsTitle = modal.querySelector('#modal-comments-title');
  if (commentsTitle) commentsTitle.textContent = model.commentsTitle;
  const tbody = modal.querySelector('#modal-invoice-tbody');

  tbody.innerHTML = model.rows.map(r => {
    // Compute ID check variables here
    const isWrongID = r.enteredIds !== r.expectedIds && r.enteredIds != "No Show";
    const isNoID = r.enteredIds.trim() === "" || r.enteredIds.toUpperCase() === "NO ID";
    const showEmptyCheckbox = isNoID || isWrongID;
    const checkboxChecked = r.autoApproved && !showEmptyCheckbox;
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
          <input type="checkbox" class="entered-id-checkbox" data-exception="Crew ID Issues" ${checkboxChecked ? 'checked' : ''}>
       
        </label>
        `
        : `<span>${escapeHtml(r.enteredIds)}</span>`
      }
  </div>
</td>


       <td class="text-center">${r.billableNoShow ? `<input type="checkbox" class="invoice-checkbox" data-exception="Billable No-Shows" ${r.autoApproved ? 'checked' : ''}>` : ""}</td>
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

        // Store approvals in object format keyed by normalized exception type
        auditApprovalState[dateLabel] = {};
        auditModel.rows.forEach(r => {
          auditApprovalState[dateLabel][normaliseType(r.exception)] = r.confidence;
        });

        renderAiAuditResultsModal({ dateLabel });
        showModal(auditResultModal);
      }, 1000);
    };
  }
}


// Renders exception table header/body/footer dynamically as originally done
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

    const dateLabel = `${exceptionModel.monthName} ${day}, 2025`; // Adjust year dynamically as needed
    showLoader();
    setTimeout(() => {
      hideLoader();
      renderInvoiceExceptionsModal({ dateLabel });
    }, 500);
  });
}





// Generate AI audit results dynamically for exceptions present on date
function getAiAuditResultsModel({ dateLabel }) {
  const dayMatch = dateLabel.match(/\b(\d{1,2})\b/);
  if (!dayMatch) return new AiAuditResultsModel({ dateLabel, rows: [], resolvedCount: 0, manualReviewCount: 0 });
  const day = parseInt(dayMatch[1], 10);

  const rows = [];

  exceptionModel.rows.forEach(exceptionRow => {
    if (exceptionRow.title === "Hotel Occ. (95% Required)") return;
    const count = exceptionRow.values[day] || 0;
    const normType = normaliseType(exceptionRow.title);
    const approvedConfidence = auditApprovalState[dateLabel]?.[normType] || "0%";

    for (let i = 0; i < count; i++) {
      rows.push(new AiAuditResultRow({
        exception: exceptionRow.title,
        names: `Crew ${i + 1}`,      // match invoice exception names if possible
        expectedIds: "-",            // or real expected id if tracked
        confidence: approvedConfidence,
        analysis: approvedConfidence === "100%" ? "Audit approved" : "Needs review",
        checked: approvedConfidence === "100%",
        warning: false              // set true if any warning for specific row
      }));
    }
  });

  const resolvedCount = rows.filter(r => r.checked).length;
  const manualReviewCount = rows.length - resolvedCount;

  return new AiAuditResultsModel({
    dateLabel,
    resolvedCount,
    manualReviewCount,
    rows
  });
}


// Add this near the top of your file or inside init function to track current dateLabel for modals
let currentInvoiceModalDateLabel = null;


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
      const isChecked = event.target.checked;

      if (!auditApprovalState[dateLabel]) auditApprovalState[dateLabel] = {};

      // Create a unique key per exception instance
      const key = `${exceptionType}__${index}`;

      auditApprovalState[dateLabel][key] = isChecked ? "100%" : "0%";

      // Update invoice exception modal based on aggregated approval by type
      // Aggregate auditApprovalState for the invoice modal check
      renderInvoiceExceptionsModal({ dateLabel });
    });
  });


  const closeBtn = modal.querySelector('.close-button');
  if (closeBtn) {
    closeBtn.onclick = () => {
      hideModal(modal);
      if (currentInvoiceModalDateLabel) {
        renderInvoiceExceptionsModal({ dateLabel: currentInvoiceModalDateLabel });
      }
    };
  }
}
function isExceptionApproved(auditState, dateLabel, exceptionType) {
  const allKeys = Object.keys(auditState[dateLabel] || {});
  const normType = normaliseType(exceptionType);

  // Check if any instance of this exception type is approved
  return allKeys.some(key => {
    const [type, idx] = key.split("__");
    return normaliseType(type) === normType && auditState[dateLabel][key] === "100%";
  });
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
