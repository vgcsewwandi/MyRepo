/**
 * Utility Functions
 * Shared utility functions for the Meal Planner application
 */

/**
 * Initialize food library in localStorage if it doesn't exist
 */
function initializeFoodLibrary() {
    let foodLibrary = JSON.parse(localStorage.getItem('foodLibrary') || '[]');
    
    if (foodLibrary.length === 0) {
        // Set default food library
        foodLibrary = [
            { id: 1, name: "String Hoppers (2 pieces)", calories: 140 },
            { id: 2, name: "Egg Hopper", calories: 180 },
            { id: 3, name: "Roti (1 piece)", calories: 60 },
            { id: 4, name: "Rice & Curry (1 plate)", calories: 450 },
            { id: 5, name: "Kottu Roti (1 portion)", calories: 600 },
            { id: 6, name: "Dhal Curry (1 cup)", calories: 120 },
            { id: 7, name: "Coconut Sambol (2 tbsp)", calories: 80 },
            { id: 8, name: "Pol Roti (1 piece)", calories: 150 },
            { id: 9, name: "Kiribath (1 piece)", calories: 200 },
            { id: 10, name: "Watalappan (1 piece)", calories: 250 }
        ];
        localStorage.setItem('foodLibrary', JSON.stringify(foodLibrary));
    }
    
    return foodLibrary;
}

/**
 * Initialize calorie goal if it doesn't exist
 */
function initializeCalorieGoal() {
    if (!localStorage.getItem('calorieGoal')) {
        localStorage.setItem('calorieGoal', '2000');
    }
}

/**
 * Get default food library
 */
function getDefaultFoodLibrary() {
    return [
        { id: 1, name: "String Hoppers (2 pieces)", calories: 140 },
        { id: 2, name: "Egg Hopper", calories: 180 },
        { id: 3, name: "Roti (1 piece)", calories: 60 },
        { id: 4, name: "Rice & Curry (1 plate)", calories: 450 },
        { id: 5, name: "Kottu Roti (1 portion)", calories: 600 },
        { id: 6, name: "Dhal Curry (1 cup)", calories: 120 },
        { id: 7, name: "Coconut Sambol (2 tbsp)", calories: 80 },
        { id: 8, name: "Pol Roti (1 piece)", calories: 150 },
        { id: 9, name: "Kiribath (1 piece)", calories: 200 },
        { id: 10, name: "Watalappan (1 piece)", calories: 250 }
    ];
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
 * Initialize all default data
 */
function initializeDefaults() {
    initializeFoodLibrary();
    initializeCalorieGoal();
}

// Initialize defaults when utils.js is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeDefaults);
}

