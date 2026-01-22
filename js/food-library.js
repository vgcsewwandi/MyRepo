/**
 * Food Library Handler
 * Handles food library page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize food library page
    initializeFoodLibrary();
    setupFoodLibraryEventListeners();
});

/**
 * Initialize food library page
 */
function initializeFoodLibrary() {
    // Initialize food library if needed
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');
    if (foodLibrary.length === 0) {
        foodLibrary = getDefaultFoodLibrary();
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));
    }

    loadFoodLibraryTable();
}

/**
 * Load and display food library table
 */
function loadFoodLibraryTable() {
    const tableBody = document.getElementById('foodLibraryTable');
    if (!tableBody) {
        return;
    }

    // Get food library from localStorage
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');

    // If empty, initialize with default
    if (foodLibrary.length === 0) {
        foodLibrary = getDefaultFoodLibrary();
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));
    }

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add rows for each food item
    foodLibrary.forEach((food, index) => {
        const row = createFoodTableRow(food, index);
        tableBody.appendChild(row);
    });

    // Show message if no foods
    if (foodLibrary.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" class="text-center text-muted py-4">
                No foods in library. Click "Add Food" to add one.
            </td>
        `;
        tableBody.appendChild(row);
    }
}

/**
 * Create a table row for a food item
 */
function createFoodTableRow(food, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${escapeHtml(food.name)}</td>
        <td>${food.calories} kcal</td>
        <td>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary edit-food-btn"
                        data-index="${index}"
                        data-id="${food.id || index}"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Edit this food item">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-food-btn"
                        data-index="${index}"
                        data-id="${food.id || index}"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Delete this food item">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;

    // Add event listeners for edit and delete buttons
    const editBtn = row.querySelector('.edit-food-btn');
    const deleteBtn = row.querySelector('.delete-food-btn');

    if (editBtn) {
        editBtn.addEventListener('click', function() {
            editFood(index, food);
        });
        // Initialize tooltip
        new bootstrap.Tooltip(editBtn);
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deleteFoodFromLibrary(index, food);
        });
        // Initialize tooltip
        new bootstrap.Tooltip(deleteBtn);
    }

    return row;
}

/**
 * Clear add food form
 */
function clearAddFoodForm() {
    const foodName = document.getElementById('foodName');
    const foodCalories = document.getElementById('foodCalories');

    if (foodName) foodName.value = '';
    if (foodCalories) foodCalories.value = '';
}

/**
 * Save food to library
 */
async function saveFoodToLibrary() {
    const foodName = document.getElementById('foodName').value.trim();
    const foodCalories = document.getElementById('foodCalories').value;

    // Validate
    if (!foodName || !foodCalories) {
        showErrorModal('Please fill in all fields.', 'Validation Error');
        return;
    }

    if (parseInt(foodCalories) < 0) {
        showErrorModal('Calories cannot be negative.', 'Validation Error');
        return;
    }

    // Get existing food library
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');

    // Check if food name already exists
    const exists = foodLibrary.some(food =>
        food.name.toLowerCase() === foodName.toLowerCase()
    );

    if (exists) {
        const confirmed = await showConfirmModal(
            'A food with this name already exists. Do you want to add it anyway?',
            'Duplicate Food',
            'Add Anyway',
            'Cancel'
        );
        if (!confirmed) {
            return;
        }
    }

    // Create new food item
    const maxId = foodLibrary.length > 0
        ? Math.max(...foodLibrary.map(f => f.id || 0))
        : 0;

    const newFood = {
        id: maxId + 1,
        name: foodName,
        calories: parseInt(foodCalories)
    };

    // Add to library
    foodLibrary.push(newFood);

    // Save to localStorage
    localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFoodModal'));
    if (modal) {
        modal.hide();
    }

    // Reload table
    loadFoodLibraryTable();

    // Show success message
    showSuccessModal('Food added to library successfully!', 'Success');
}

/**
 * Edit food item
 */
function editFood(index, food) {
    // Fill edit modal with food data
    document.getElementById('editFoodId').value = index;
    document.getElementById('editFoodName').value = food.name;
    document.getElementById('editFoodCalories').value = food.calories;

    // Show edit modal
    const editModalElement = document.getElementById('editFoodModal');
    const editModal = new bootstrap.Modal(editModalElement);
    editModal.show();

    // Initialize tooltips after modal is shown
    editModalElement.addEventListener('shown.bs.modal', function() {
        const updateBtn = document.getElementById('updateFoodBtn');
        if (updateBtn) {
            const tooltip = bootstrap.Tooltip.getInstance(updateBtn);
            if (!tooltip) {
                new bootstrap.Tooltip(updateBtn);
            }
        }
    }, { once: true });
}

/**
 * Update food in library
 */
function updateFoodInLibrary() {
    const index = parseInt(document.getElementById('editFoodId').value);
    const foodName = document.getElementById('editFoodName').value.trim();
    const foodCalories = document.getElementById('editFoodCalories').value;

    // Validate
    if (!foodName || !foodCalories) {
        showErrorModal('Please fill in all fields.', 'Validation Error');
        return;
    }

    if (parseInt(foodCalories) < 0) {
        showErrorModal('Calories cannot be negative.', 'Validation Error');
        return;
    }

    // Get existing food library
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');

    if (index >= 0 && index < foodLibrary.length) {
        // Check if food name already exists (excluding current item)
        const exists = foodLibrary.some((food, i) =>
            i !== index && food.name.toLowerCase() === foodName.toLowerCase()
        );

        if (exists) {
            showErrorModal('A food with this name already exists.', 'Validation Error');
            return;
        }

        // Update food item
        foodLibrary[index].name = foodName;
        foodLibrary[index].calories = parseInt(foodCalories);

        // Save to localStorage
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editFoodModal'));
        if (modal) {
            modal.hide();
        }

        // Reload table
        loadFoodLibraryTable();

        // Show success message
        showSuccessModal('Food updated successfully!', 'Success');
    }
}

/**
 * Delete food from library
 */
async function deleteFoodFromLibrary(index, food) {
    const confirmed = await showConfirmModal(
        `Are you sure you want to delete "${food.name}" from the library?`,
        'Delete Food',
        'Delete',
        'Cancel'
    );

    if (!confirmed) {
        return;
    }

    // Get existing food library
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');

    if (index >= 0 && index < foodLibrary.length) {
        // Remove food item
        foodLibrary.splice(index, 1);

        // Save to localStorage
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));

        // Reload table
        loadFoodLibraryTable();

        // Show success message
        showSuccessModal('Food deleted from library successfully!', 'Success');
    }
}

/**
 * Setup event listeners for food library
 */
function setupFoodLibraryEventListeners() {
    // Add food button
    const addFoodBtn = document.getElementById('addFoodBtn');
    if (addFoodBtn) {
        // Initialize tooltip for add food button
        new bootstrap.Tooltip(addFoodBtn);

        // Handle button click to open modal
        addFoodBtn.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('addFoodModal'));
            modal.show();
        });
    }

    // Save food button (in modal)
    const saveFoodBtn = document.getElementById('saveFoodBtn');
    if (saveFoodBtn) {
        saveFoodBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveFoodToLibrary();
        });
        // Initialize tooltip for save button
        new bootstrap.Tooltip(saveFoodBtn);
    }

    // Update food button (in edit modal)
    const updateFoodBtn = document.getElementById('updateFoodBtn');
    if (updateFoodBtn) {
        updateFoodBtn.addEventListener('click', function(e) {
            e.preventDefault();
            updateFoodInLibrary();
        });
        // Initialize tooltip for update button
        new bootstrap.Tooltip(updateFoodBtn);
    }

    // Initialize tooltips when modals are shown
    const addFoodModal = document.getElementById('addFoodModal');
    const editFoodModal = document.getElementById('editFoodModal');

    if (addFoodModal) {
        addFoodModal.addEventListener('shown.bs.modal', function() {
            // Clear form when modal is shown
            clearAddFoodForm();

            // Initialize tooltips for buttons inside modal
            const saveBtn = this.querySelector('#saveFoodBtn');
            const cancelBtn = this.querySelector('[data-bs-dismiss="modal"].btn-secondary');

            if (saveBtn) {
                const tooltip = bootstrap.Tooltip.getInstance(saveBtn);
                if (!tooltip) {
                    new bootstrap.Tooltip(saveBtn);
                }
            }
            if (cancelBtn) {
                const tooltip = bootstrap.Tooltip.getInstance(cancelBtn);
                if (!tooltip) {
                    const tooltipInstance = new bootstrap.Tooltip(cancelBtn, {
                        trigger: 'hover',
                        placement: 'top'
                    });
                }
            }
        });
    }

    if (editFoodModal) {
        editFoodModal.addEventListener('shown.bs.modal', function() {
            // Initialize tooltips for buttons inside modal
            const updateBtn = this.querySelector('#updateFoodBtn');
            const cancelBtn = this.querySelector('[data-bs-dismiss="modal"].btn-secondary');

            if (updateBtn) {
                const tooltip = bootstrap.Tooltip.getInstance(updateBtn);
                if (!tooltip) {
                    new bootstrap.Tooltip(updateBtn);
                }
            }
            if (cancelBtn) {
                const tooltip = bootstrap.Tooltip.getInstance(cancelBtn);
                if (!tooltip) {
                    new bootstrap.Tooltip(cancelBtn, {
                        trigger: 'hover',
                        placement: 'top'
                    });
                }
            }
        });
    }

    // Initialize tooltips after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeTooltips();
    }, 200);
}