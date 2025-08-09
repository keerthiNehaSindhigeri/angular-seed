'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Queries all the close buttons inside a modal's footer and attaches click handlers to hide the modal when clicked
    const modalCloseButtons = document.querySelectorAll('.modal .modal-footer button.close');

    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        });
    });
});

/**
 * Shows the given modal by adding the "show" class.
 * @param {HTMLElement} modal - The modal element to show.
 */
function showModal(modal) {
    modal.classList.add("show");
}

/**
 * Hides the given modal by removing the "show" class.
 * @param {HTMLElement} modal - The modal element to hide.
 */
function hideModal(modal) {
    modal.classList.remove("show");
}
