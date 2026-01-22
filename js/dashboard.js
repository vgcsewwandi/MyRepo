/**
 * Dashboard Handler
 * Displays daily summary and today's meals
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize default calorie goal if not set
    if (!localStorage.getItem('calorieGoal')) {
        localStorage.setItem('calorieGoal', '2000');
    }
    
    // Initialize dashboard
    loadDashboard();
});

/**
 * Load and display dashboard data
 */
function loadDashboard() {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get meals from localStorage
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    
    // Filter today's meals
    const todayMeals = meals.filter(meal => meal.date === today);
    
    // Calculate total calories
    const totalCalories = todayMeals.reduce((sum, meal) => sum + parseInt(meal.calories || 0), 0);
    
    // Get daily calorie goal (default: 2000)
    const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || '2000');
    
    // Update calorie intake display
    updateCalorieDisplay(totalCalories, calorieGoal);
    
    // Display meals
    displayMeals(todayMeals);
}

/**
 * Update calorie intake display
 */
function updateCalorieDisplay(totalCalories, calorieGoal) {
    const calorieText = document.getElementById('calorieText');
    const calorieProgress = document.getElementById('calorieProgress');
    const percentageText = document.getElementById('percentageText');
    const remainingText = document.getElementById('remainingText');
    
    if (!calorieText || !calorieProgress || !percentageText || !remainingText) {
        return;
    }
    
    // Calculate percentage
    const percentage = Math.min((totalCalories / calorieGoal) * 100, 100);
    const remaining = Math.max(calorieGoal - totalCalories, 0);
    
    // Update text
    calorieText.textContent = `${totalCalories} / ${calorieGoal} kcal`;
    percentageText.textContent = `${Math.round(percentage)}% of daily goal`;
    remainingText.textContent = `${remaining} kcal remaining`;
    
    // Update progress bar
    calorieProgress.style.width = `${percentage}%`;
    calorieProgress.setAttribute('aria-valuenow', percentage);
    calorieProgress.textContent = `${Math.round(percentage)}%`;
    
    // Change progress bar color based on status
    if (percentage >= 100) {
        calorieProgress.classList.remove('bg-success');
        calorieProgress.classList.add('bg-danger');
        remainingText.classList.remove('text-success');
        remainingText.classList.add('text-danger');
    } else if (percentage >= 80) {
        calorieProgress.classList.remove('bg-success', 'bg-danger');
        calorieProgress.classList.add('bg-warning');
    } else {
        calorieProgress.classList.remove('bg-warning', 'bg-danger');
        calorieProgress.classList.add('bg-success');
        remainingText.classList.remove('text-danger');
        remainingText.classList.add('text-success');
    }
}

/**
 * Display meals list
 */
function displayMeals(meals) {
    const mealsList = document.getElementById('mealsList');
    const emptyState = document.getElementById('emptyState');
    
    if (!mealsList) {
        return;
    }
    
    // Clear existing content except empty state
    const existingMeals = mealsList.querySelectorAll('.meal-item');
    existingMeals.forEach(meal => meal.remove());
    
    if (meals.length === 0) {
        // Show empty state
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    // Hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Create meal items
    meals.forEach((meal, index) => {
        const mealItem = createMealItem(meal, index);
        mealsList.insertBefore(mealItem, emptyState);
    });
}

/**
 * Create meal item HTML element
 */
function createMealItem(meal, index) {
    const mealDiv = document.createElement('div');
    mealDiv.className = 'meal-item';
    mealDiv.setAttribute('data-meal-index', index);
    
    const time = new Date(meal.timestamp || Date.now());
    const timeString = time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Get category icon
    const categoryIcon = getCategoryIcon(meal.category);

    mealDiv.innerHTML = `
        <div class="meal-item-header">
            <div class="flex-fill">
                <h5 class="meal-name">${escapeHtml(meal.name)}</h5>
                <span class="meal-category" data-category="${escapeHtml(meal.category)}">
                    ${categoryIcon}
                    ${escapeHtml(meal.category)}
                </span>
                <div class="meal-time mt-2">${timeString}</div>
            </div>
            <div class="text-end">
                <div class="meal-calories">${meal.calories} kcal</div>
                <div class="meal-actions mt-2">
                    <button class="btn btn-sm btn-outline-primary btn-icon delete-meal-btn"
                            data-meal-index="${index}"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Delete this meal">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add delete functionality
    const deleteBtn = mealDiv.querySelector('.delete-meal-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deleteMeal(index);
        });
        // Initialize tooltip for delete button
        new bootstrap.Tooltip(deleteBtn);
    }
    
    return mealDiv;
}

/**
 * Delete a meal
 */
async function deleteMeal(index) {
    const confirmed = await showConfirmModal(
        'Are you sure you want to delete this meal?',
        'Delete Meal',
        'Delete',
        'Cancel'
    );
    
    if (!confirmed) {
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const todayMeals = meals.filter(meal => meal.date === today);
    
    if (index >= 0 && index < todayMeals.length) {
        // Find the meal in the full meals array
        const mealToDelete = todayMeals[index];
        const mealIndex = meals.findIndex(m => 
            m.date === mealToDelete.date && 
            m.name === mealToDelete.name && 
            m.calories === mealToDelete.calories &&
            m.timestamp === mealToDelete.timestamp
        );
        
        if (mealIndex !== -1) {
            meals.splice(mealIndex, 1);
            localStorage.setItem('meals', JSON.stringify(meals));
            loadDashboard(); // Reload dashboard
            showSuccessModal('Meal deleted successfully!', 'Success');
        }
    }
}

/**
 * Get category icon based on meal category
 */
function getCategoryIcon(category) {
    const icons = {
        'Breakfast': '<i class="bi bi-sunrise-fill"></i>',
        'Lunch': '<i class="bi bi-sun-fill"></i>',
        'Dinner': '<i class="bi bi-moon-fill"></i>',
        'Snack': '<i class="bi bi-cup-hot-fill"></i>'
    };
    return icons[category] || '<i class="bi bi-fork-knife"></i>';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

