/**
 * Modal Utilities
 * Provides reusable modal functions for success, error, confirmation, and info messages
 */

/**
 * Show a success modal
 */
function showSuccessModal(message, title = 'Success') {
    const modalHTML = `
        <div class="modal fade" id="successModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="success-icon mb-3">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="modal-title mb-2">${escapeHtml(title)}</h5>
                        <p class="text-muted mb-0">${escapeHtml(message)}</p>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('successModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Remove modal from DOM after it's hidden
    document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Show an error modal
 */
function showErrorModal(message, title = 'Error') {
    const modalHTML = `
        <div class="modal fade" id="errorModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="error-icon mb-3">
                            <i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="modal-title mb-2">${escapeHtml(title)}</h5>
                        <p class="text-muted mb-0">${escapeHtml(message)}</p>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('errorModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();
    
    // Remove modal from DOM after it's hidden
    document.getElementById('errorModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Show a confirmation modal
 * Returns a Promise that resolves to true if confirmed, false otherwise
 */
function showConfirmModal(message, title = 'Confirm', confirmText = 'Yes', cancelText = 'No') {
    return new Promise((resolve) => {
        const modalHTML = `
            <div class="modal fade" id="confirmModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header border-0 pb-0">
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <div class="confirm-icon mb-3">
                                <i class="bi bi-question-circle-fill text-warning" style="font-size: 4rem;"></i>
                            </div>
                            <h5 class="modal-title mb-2">${escapeHtml(title)}</h5>
                            <p class="text-muted mb-0">${escapeHtml(message)}</p>
                        </div>
                        <div class="modal-footer border-0 justify-content-center gap-3">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" id="confirmCancelBtn">
                                ${escapeHtml(cancelText)}
                            </button>
                            <button type="button" class="btn btn-primary" id="confirmOkBtn">
                                ${escapeHtml(confirmText)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('confirmModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modalElement = document.getElementById('confirmModal');
        const modal = new bootstrap.Modal(modalElement);
        
        let resolved = false;
        
        // Handle confirm button
        const okBtn = document.getElementById('confirmOkBtn');
        if (okBtn) {
            okBtn.addEventListener('click', function() {
                if (!resolved) {
                    resolved = true;
                    resolve(true);
                    modal.hide();
                }
            });
        }
        
        // Handle cancel button
        const cancelBtn = document.getElementById('confirmCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                    modal.hide();
                }
            });
        }
        
        // Handle modal hidden event - if not resolved by buttons, resolve as false
        modalElement.addEventListener('hidden.bs.modal', function() {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
            this.remove();
        }, { once: true });
        
        // Show modal
        modal.show();
    });
}

/**
 * Show an info modal
 */
function showInfoModal(message, title = 'Information') {
    const modalHTML = `
        <div class="modal fade" id="infoModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="info-icon mb-3">
                            <i class="bi bi-info-circle-fill text-primary" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="modal-title mb-2">${escapeHtml(title)}</h5>
                        <p class="text-muted mb-0">${escapeHtml(message)}</p>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('infoModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('infoModal'));
    modal.show();
    
    // Remove modal from DOM after it's hidden
    document.getElementById('infoModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize tooltips for all elements with data-bs-toggle="tooltip"
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize tooltips when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize tooltips after a short delay to ensure Bootstrap is loaded
        setTimeout(initializeTooltips, 100);
    });
}

