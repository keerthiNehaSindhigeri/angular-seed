
import { ExceptionModel, ExceptionRow, InvoiceException, InvoiceExceptionsModel, AiAuditResultsModel, AiAuditResultRow } from './models.js';
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


function getInvoiceExceptionsDetailsModel({ dateLabel }) {
    let rows = [
        new InvoiceException(`${dateLabel} 0700`, "13 May 2025 0400", "Block", "-", "NO ID"),
        new InvoiceException(`${dateLabel} 0700`, "13 May 2025 0400", "Block", "-", "NO ID", { nonContractRate: true }),
        new InvoiceException(`${dateLabel} 1020`, "13 May 2025 0855", "Sumit D", "25761", "25761")
    ];

    rows = rows.map(r => {
        const checkInDate = parseDateTime(r.checkIn);
        const checkOutDate = parseDateTime(r.checkOut);
        if (checkOutDate < checkInDate) {
            const fixedCheckout = new Date(checkInDate);
            fixedCheckout.setHours(23, 59);
            r.checkOut = formatDateTime(fixedCheckout);
        }
        return r;
    });

    return new InvoiceExceptionsModel(`Invoice Exceptions ${dateLabel}`, rows, `Comments For ${dateLabel}`, []);
}



// AI audit results data factory
function getAiAuditResultsModel({ dateLabel }) {
    return new AiAuditResultsModel({
        dateLabel,
        resolvedCount: 7,
        manualReviewCount: 1,
        rows: [
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            new AiAuditResultRow({ exception: "No-Show", names: "Crew 1", expectedIds: "123456", confidence: "100%", analysis: "Hotel occupancy report is matching 95%", checked: false }),
            new AiAuditResultRow({ exception: "Day Rooms", names: "Crew 1", expectedIds: "123456", confidence: "0%", analysis: "Hotel occupancy report is matching 95%", checked: false, warning: true }),
        ]
    });
}


function renderExceptions(model) {
    const root = document.getElementById('exception-table');
    if (!root) return;

    // Ensure table skeleton exists
    let table = root.querySelector('table');
    if (!table) {
        table = document.createElement('table');
        root.appendChild(table);
    }

    // Ensure sections
    let thead = table.querySelector('thead') || table.createTHead();
    let tbody = table.querySelector('tbody') || table.createTBody();
    let tfoot = table.querySelector('tfoot') || table.createTFoot();

    // Header
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

    // Body
    let bodyHTML = model.rows.map(row => {
        const cells = Array.from({ length: model.daysInMonth }, (_, idx) => {
            const day = idx + 1;
            const val = row.values[day];
            return val ? `<td data-day="${day}" data-row-title="${escapeHtml(row.title)}"><a href="#" class="text-error fw-700">${val}</a></td>` : "<td></td>";
        }).join("");
        return `<tr>
      <td>${row.title} <img src="${row.helpIcon}" alt=""></td>
      ${cells}
    </tr>`;
    }).join("");
    tbody.innerHTML = bodyHTML;

    // Footer
    const viewAttachments = `<tr><td>View Attachments</td>${"<td></td>".repeat(model.daysInMonth)}</tr>`;
    const messages = `<tr><td>Messages</td>${`<td><img src="../assets/icons/dropdown_16.png" class="cursor-pointer" alt=""></td>`.repeat(model.daysInMonth)}</tr>`;
    tfoot.innerHTML = viewAttachments + messages;
}

function renderInvoiceExceptionsModal({ dateLabel }) {
    const modal = document.getElementById('invoice-exceptions-modal-report');
    if (!modal) return;

    const model = getInvoiceExceptionsDetailsModel({ dateLabel });

    // Update titles
    const modalTitle = modal.querySelector('#modal-title');
    if (modalTitle) modalTitle.textContent = model.title;

    const commentsTitle = modal.querySelector('#modal-comments-title');
    if (commentsTitle) commentsTitle.textContent = model.commentsTitle;

    // Fill invoice table body
    const tbody = modal.querySelector('#modal-invoice-tbody');
    tbody.innerHTML = model.rows.map(r => `
    <tr>
      <td>${escapeHtml(r.checkIn)}</td>
      <td>${escapeHtml(r.checkOut)}</td>
      <td>${escapeHtml(r.names)}</td>
      <td>${escapeHtml(r.expectedIds)}</td>
      <td>
        <div class="d-flex align-items-center justify-content-end">
          <span>${escapeHtml(r.enteredIds)}</span>
          <input type="checkbox" name="expected-id">
        </div>
      </td>
      <td>${r.billableNoShow ? '✔' : ''}</td>
      <td>${r.modifiedReservations ? '✔' : ''}</td>
      <td>${r.walkIn ? '✔' : ''}</td>
      <td>${r.dayRooms ? '✔' : ''}</td>
      <td class="text-center"><input type="checkbox" name="non-contract-rate" ${r.nonContractRate ? 'checked' : ''}></td>
      <td class="text-center">
        <a href="#" class="link-olive">Folio</a>
        <a href="#" class="link-olive">Fax</a>
      </td>
      <td class="text-center">
        <a href="#" class="link-olive">View Details</a>
      </td>
      <td class="text-center cursor-pointer">
        <img src="../assets/icons/document.png" alt="">
      </td>
    </tr>
  `).join('');

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

    // Show modal (assuming showModal defined)
    showModal(modal);

    // Bind AI Audit button click handler
    const aiAuditBtn = modal.querySelector('#ai-audit-btn');
    if (aiAuditBtn) {
        aiAuditBtn.onclick = () => {
            const auditRunningModal = document.getElementById('audit-running');
            const auditResultModal = document.getElementById('ai-audit-result-table');
            showModal(auditRunningModal);
            setTimeout(() => {
                hideModal(auditRunningModal);
                renderAiAuditResultsModal({ dateLabel });
                showModal(auditResultModal);
            }, 1000);
        };
    }
}


// 3) AI Audit Results modal
function renderAiAuditResultsModal({ dateLabel }) {
    const modal = document.getElementById('ai-audit-result-table');
    if (!modal) return;

    const model = getAiAuditResultsModel({ dateLabel });

    modal.querySelector('#ai-audit-summary').textContent = `AI audit completed for ${escapeHtml(model.summary.dateLabel)}`;
    modal.querySelector('#ai-audit-resolved-count').textContent = `${model.summary.resolvedCount} exceptions resolved`;
    modal.querySelector('#ai-audit-manual-review-count').textContent = `${model.summary.manualReviewCount} require manual review`;

    const tbody = modal.querySelector('#ai-audit-rows');
    tbody.innerHTML = model.rows.map(r => `
    <tr${r.warning ? ' class="catskill-white"' : ''}>
      <td>${r.warning ? `
        <div class="d-flex flex-wrap align-items-center justify-content-between">
          <div class="pr-8"><img src="../assets/images/warning.png" width="20" height="20"></div>
          <div>${escapeHtml(r.exception)}</div>
        </div>` : escapeHtml(r.exception)}
      </td>
      <td>${escapeHtml(r.names)}</td>
      <td>${escapeHtml(r.expectedIds)}</td>
      <td>${escapeHtml(r.confidence)}</td>
      <td>${escapeHtml(r.analysis)}</td>
      <td><input type="checkbox" ${r.checked ? 'checked' : ''}></td>
    </tr>
  `).join('');
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

        }, 1000);
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
