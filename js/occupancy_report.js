document.addEventListener('DOMContentLoaded', () => {
    initOccupancyReportRequest();

});

function initOccupancyReportRequest() {
    const button = document.getElementById('request-exceptions-list');
    const table = document.getElementById('exception-table');
    const detailedTable = document.getElementById('invoice-exceptions-modal-report');
    const aiAuditBtn = document.getElementById("ai-audit-btn")
    const aiAuditRunning = document.getElementById("audit-running")
    const aiAuditResultTable = document.getElementById("ai-audit-result-table")

    button.addEventListener('click', () => {
        showLoader();
        setTimeout(() => {
            hideLoader();
            showModal(table);
        }, 3000);
        /// Handles click events on table cells that contain data

        table.addEventListener('click', (e) => {
            // Identify the clicked table cell
            const clickedCell = e.target.closest('td');
            if (!clickedCell) return;

            const cellValue = clickedCell.textContent.trim();
            if (cellValue) {
                // Triggered when a cell with data is clicked
                console.log("Cell clicked with value:", cellValue);

                showModal(detailedTable);

                if (aiAuditBtn.checkVisibility) {
                    aiAuditBtn.addEventListener('click', () => {
                        showModal(aiAuditRunning);
                        setTimeout(() => {
                            hideModal(aiAuditRunning);
                            const modal = button.closest('.modal');
                            if (!modal) {
                                showModal(aiAuditResultTable);

                            }
                        }, 3000);


                    });
                }

            }
        });


    });
}
