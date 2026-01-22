/**
 * Add Meal Handler
 * Handles adding meals to the system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize add meal page
    initializeFoodLibraryIfNeeded();
    loadFoodLibrary();
    setupEventListeners();
});

/**
 * Initialize food library if needed
 */
function initializeFoodLibraryIfNeeded() {
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');
    
    if (foodLibrary.length === 0) {
        foodLibrary = getDefaultFoodLibrary();
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));
    }
}

/**
 * Load food library and populate dropdown
 */
function loadFoodLibrary() {
    const foodLibrarySelect = document.getElementById('foodLibrary');
    
    if (!foodLibrarySelect) {
        return;
    }
    
    // Get food library from localStorage
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');
    
    // If still empty, use default
    if (foodLibrary.length === 0) {
        foodLibrary = getDefaultFoodLibrary();
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));
    }
    
    // Populate dropdown
    populateFoodLibrary(foodLibrary);
    
    // Try to also load from JSON file in background (for updates)
    fetch('data/food-library.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem('foodLibrary', JSON.stringify(data));
                populateFoodLibrary(data);
            }
        })
        .catch(error => {
            // Silently fail - we already have the default library loaded
            console.log('Using default food library from localStorage');
        });
}

/**
 * Populate food library dropdown
 */
function populateFoodLibrary(foodLibrary) {
    const foodLibrarySelect = document.getElementById('foodLibrary');
    
    if (!foodLibrarySelect) {
        return;
    }
    
    // Clear existing options except the first one
    while (foodLibrarySelect.options.length > 1) {
        foodLibrarySelect.remove(1);
    }
    
    // Add food items to dropdown
    foodLibrary.forEach(food => {
        const option = document.createElement('option');
        option.value = food.id || food.name;
        option.textContent = `${food.name} - ${food.calories} kcal`;
        option.setAttribute('data-calories', food.calories);
        option.setAttribute('data-name', food.name);
        foodLibrarySelect.appendChild(option);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Food library selection
    const foodLibrarySelect = document.getElementById('foodLibrary');
    if (foodLibrarySelect) {
        foodLibrarySelect.addEventListener('change', function() {
            if (this.value && this.selectedIndex > 0) {
                const selectedOption = this.options[this.selectedIndex];
                const calories = selectedOption.getAttribute('data-calories');
                const name = selectedOption.getAttribute('data-name');
                
                // Auto-fill form fields
                const mealNameInput = document.getElementById('mealName');
                const mealCaloriesInput = document.getElementById('mealCalories');
                
                if (mealNameInput) {
                    mealNameInput.value = name || '';
                }
                if (mealCaloriesInput) {
                    mealCaloriesInput.value = calories || '';
                }
            }
        });
    }
    
    // Meal category buttons
    const categoryButtons = document.querySelectorAll('.meal-category-btn');
    const mealCategoryInput = document.getElementById('mealCategory');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
            
            // Update hidden input
            const category = this.getAttribute('data-category');
            if (mealCategoryInput) {
                mealCategoryInput.value = category;
            }
        });
    });
    
    // Set initial active state for Breakfast button
    if (categoryButtons.length > 0) {
        categoryButtons[0].classList.remove('btn-outline-primary');
        categoryButtons[0].classList.add('btn-primary');
    }
    
    // Save meal button
    const saveMealBtn = document.getElementById('saveMealBtn');
    if (saveMealBtn) {
        saveMealBtn.addEventListener('click', saveMeal);
        // Initialize tooltip
        new bootstrap.Tooltip(saveMealBtn);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        // Initialize tooltip
        new bootstrap.Tooltip(cancelBtn);
    }
    
    // Initialize remaining tooltips after a short delay
    setTimeout(() => {
        initializeTooltips();
    }, 200);
}

/**
 * Save meal to localStorage
 */
function saveMeal() {
    // Get form values
    const mealName = document.getElementById('mealName').value.trim();
    const mealCalories = document.getElementById('mealCalories').value;
    const mealCategory = document.getElementById('mealCategory').value;
    
    // Validate form
    if (!mealName || !mealCalories || !mealCategory) {
        showErrorModal('Please fill in all required fields.', 'Validation Error');
        return;
    }
    
    if (parseInt(mealCalories) < 0) {
        showErrorModal('Calories cannot be negative.', 'Validation Error');
        return;
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Create meal object
    const meal = {
        id: Date.now(), // Unique ID using timestamp
        name: mealName,
        calories: parseInt(mealCalories),
        category: mealCategory,
        date: today,
        timestamp: Date.now()
    };
    
    // Get existing meals from localStorage
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    
    // Add new meal
    meals.push(meal);
    
    // Save to localStorage
    localStorage.setItem('meals', JSON.stringify(meals));
    
    // Show success message and redirect
    showSuccessModal('Meal saved successfully! Redirecting to dashboard...', 'Success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}


