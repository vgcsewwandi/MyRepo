/**
 * Settings Handler
 * Handles settings page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings page
    initializeSettings();
    setupEventListeners();
    loadCalorieGoal();
});

/**
 * Initialize settings page
 */
function initializeSettings() {
    // Initialize calorie goal if needed
    if (!localStorage.getItem('calorieGoal')) {
        localStorage.setItem('calorieGoal', '2000');
    }
}

/**
 * Load calorie goal from localStorage
 */
function loadCalorieGoal() {
    const calorieGoal = localStorage.getItem('calorieGoal') || '2000';
    const calorieGoalInput = document.getElementById('calorieGoal');
    if (calorieGoalInput) {
        calorieGoalInput.value = calorieGoal;
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Update calorie goal button
    const updateGoalBtn = document.getElementById('updateGoalBtn');
    if (updateGoalBtn) {
        updateGoalBtn.addEventListener('click', updateCalorieGoal);
        // Initialize tooltip
        new bootstrap.Tooltip(updateGoalBtn);
    }
    
    
    // Export data button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
        // Initialize tooltip
        new bootstrap.Tooltip(exportDataBtn);
    }
    
    // Clear data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
        // Initialize tooltip
        new bootstrap.Tooltip(clearDataBtn);
    }
    
    // Initialize tooltips after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeTooltips();
    }, 200);
}








/**
 * Update calorie goal
 */
function updateCalorieGoal() {
    const calorieGoalInput = document.getElementById('calorieGoal');
    const calorieGoal = calorieGoalInput.value;
    
    // Validate
    if (!calorieGoal || parseInt(calorieGoal) < 1000 || parseInt(calorieGoal) > 5000) {
        showErrorModal('Please enter a valid calorie goal between 1000 and 5000 kcal.', 'Validation Error');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('calorieGoal', calorieGoal);
    
    // Show success message
    showSuccessModal('Daily calorie goal updated successfully!', 'Success');
}

/**
 * Export data based on selected format and type
 */
function exportData() {
    const exportFormat = document.getElementById('exportFormat').value; // json or xml
    const exportType = document.getElementById('exportType').value; // all, library, weekly, monthly
    
    let data = {};
    let fileName = '';
    
    // Get data based on export type
    switch(exportType) {
        case 'library':
            data = {
                foodLibrary: JSON.parse(localStorage.getItem('foodLibrary') || '[]'),
                exportDate: new Date().toISOString(),
                exportType: 'Food Library'
            };
            fileName = `food-library-${new Date().toISOString().split('T')[0]}`;
            break;
            
        case 'weekly':
            data = getWeeklyConsumptionData();
            fileName = `weekly-consumption-${new Date().toISOString().split('T')[0]}`;
            break;
            
        case 'monthly':
            data = getMonthlyConsumptionData();
            fileName = `monthly-consumption-${new Date().toISOString().split('T')[0]}`;
            break;
            
        case 'all':
        default:
            data = {
                meals: JSON.parse(localStorage.getItem('meals') || '[]'),
                foodLibrary: JSON.parse(localStorage.getItem('foodLibrary') || '[]'),
                calorieGoal: localStorage.getItem('calorieGoal') || '2000',
                exportDate: new Date().toISOString(),
                exportType: 'All Data'
            };
            fileName = `meal-planner-all-data-${new Date().toISOString().split('T')[0]}`;
            break;
    }
    
    // Convert to selected format
    let content = '';
    let mimeType = '';
    let fileExtension = '';
    
    if (exportFormat === 'xml') {
        content = convertToXML(data, exportType);
        mimeType = 'application/xml';
        fileExtension = 'xml';
    } else {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessModal(`Data exported successfully as ${exportFormat.toUpperCase()}!`, 'Export Successful');
}

/**
 * Get weekly consumption data
 */
function getWeeklyConsumptionData() {
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const today = new Date();
    const weeklyData = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMeals = meals.filter(meal => meal.date === dateStr);
        const dayCalories = dayMeals.reduce((sum, meal) => sum + parseInt(meal.calories || 0), 0);
        const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || '2000');
        
        weeklyData.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            meals: dayMeals,
            totalCalories: dayCalories,
            calorieGoal: calorieGoal,
            remaining: Math.max(calorieGoal - dayCalories, 0),
            percentage: Math.round((dayCalories / calorieGoal) * 100)
        });
    }
    
    return {
        weeklyConsumption: weeklyData,
        exportDate: new Date().toISOString(),
        exportType: 'Weekly Consumption Data',
        period: {
            startDate: weeklyData[0].date,
            endDate: weeklyData[weeklyData.length - 1].date
        }
    };
}

/**
 * Get monthly consumption data
 */
function getMonthlyConsumptionData() {
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const today = new Date();
    const monthlyData = [];
    
    // Get last 30 days grouped by week
    for (let week = 3; week >= 0; week--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (week * 7) - 6);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        let weekCalories = 0;
        const weekMeals = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayMeals = meals.filter(meal => meal.date === dateStr);
            weekCalories += dayMeals.reduce((sum, meal) => sum + parseInt(meal.calories || 0), 0);
            weekMeals.push(...dayMeals);
        }
        
        const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || '2000');
        const weeklyGoal = calorieGoal * 7;
        
        monthlyData.push({
            weekNumber: 4 - week,
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            totalCalories: weekCalories,
            weeklyGoal: weeklyGoal,
            meals: weekMeals,
            remaining: Math.max(weeklyGoal - weekCalories, 0),
            percentage: Math.round((weekCalories / weeklyGoal) * 100)
        });
    }
    
    return {
        monthlyConsumption: monthlyData,
        exportDate: new Date().toISOString(),
        exportType: 'Monthly Consumption Data',
        period: {
            startDate: monthlyData[0].startDate,
            endDate: monthlyData[monthlyData.length - 1].endDate
        }
    };
}

/**
 * Convert data object to XML format
 */
function convertToXML(data, type) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<MealPlannerData>\n';
    xml += `  <ExportDate>${data.exportDate || new Date().toISOString()}</ExportDate>\n`;
    xml += `  <ExportType>${data.exportType || 'Data Export'}</ExportType>\n`;
    
    if (type === 'library' || type === 'all') {
        if (data.foodLibrary) {
            xml += '  <FoodLibrary>\n';
            data.foodLibrary.forEach((food, index) => {
                xml += `    <FoodItem id="${food.id || index + 1}">\n`;
                xml += `      <Name><![CDATA[${food.name}]]></Name>\n`;
                xml += `      <Calories>${food.calories}</Calories>\n`;
                xml += '    </FoodItem>\n';
            });
            xml += '  </FoodLibrary>\n';
        }
    }
    
    if (type === 'weekly') {
        if (data.weeklyConsumption) {
            xml += '  <WeeklyConsumption>\n';
            xml += `    <Period>\n`;
            xml += `      <StartDate>${data.period.startDate}</StartDate>\n`;
            xml += `      <EndDate>${data.period.endDate}</EndDate>\n`;
            xml += `    </Period>\n`;
            data.weeklyConsumption.forEach(day => {
                xml += `    <Day date="${day.date}">\n`;
                xml += `      <DayName>${day.dayName}</DayName>\n`;
                xml += `      <TotalCalories>${day.totalCalories}</TotalCalories>\n`;
                xml += `      <CalorieGoal>${day.calorieGoal}</CalorieGoal>\n`;
                xml += `      <Remaining>${day.remaining}</Remaining>\n`;
                xml += `      <Percentage>${day.percentage}</Percentage>\n`;
                xml += '      <Meals>\n';
                day.meals.forEach(meal => {
                    xml += `        <Meal>\n`;
                    xml += `          <Name><![CDATA[${meal.name}]]></Name>\n`;
                    xml += `          <Category>${meal.category}</Category>\n`;
                    xml += `          <Calories>${meal.calories}</Calories>\n`;
                    xml += `          <Timestamp>${meal.timestamp}</Timestamp>\n`;
                    xml += `        </Meal>\n`;
                });
                xml += '      </Meals>\n';
                xml += '    </Day>\n';
            });
            xml += '  </WeeklyConsumption>\n';
        }
    }
    
    if (type === 'monthly') {
        if (data.monthlyConsumption) {
            xml += '  <MonthlyConsumption>\n';
            xml += `    <Period>\n`;
            xml += `      <StartDate>${data.period.startDate}</StartDate>\n`;
            xml += `      <EndDate>${data.period.endDate}</EndDate>\n`;
            xml += `    </Period>\n`;
            data.monthlyConsumption.forEach(week => {
                xml += `    <Week number="${week.weekNumber}">\n`;
                xml += `      <StartDate>${week.startDate}</StartDate>\n`;
                xml += `      <EndDate>${week.endDate}</EndDate>\n`;
                xml += `      <TotalCalories>${week.totalCalories}</TotalCalories>\n`;
                xml += `      <WeeklyGoal>${week.weeklyGoal}</WeeklyGoal>\n`;
                xml += `      <Remaining>${week.remaining}</Remaining>\n`;
                xml += `      <Percentage>${week.percentage}</Percentage>\n`;
                xml += `      <MealCount>${week.meals.length}</MealCount>\n`;
                xml += '    </Week>\n';
            });
            xml += '  </MonthlyConsumption>\n';
        }
    }
    
    if (type === 'all') {
        if (data.meals) {
            xml += '  <Meals>\n';
            data.meals.forEach(meal => {
                xml += `    <Meal>\n`;
                xml += `      <Date>${meal.date}</Date>\n`;
                xml += `      <Name><![CDATA[${meal.name}]]></Name>\n`;
                xml += `      <Category>${meal.category}</Category>\n`;
                xml += `      <Calories>${meal.calories}</Calories>\n`;
                xml += `      <Timestamp>${meal.timestamp}</Timestamp>\n`;
                xml += '    </Meal>\n';
            });
            xml += '  </Meals>\n';
        }
        if (data.calorieGoal) {
            xml += `  <CalorieGoal>${data.calorieGoal}</CalorieGoal>\n`;
        }
    }
    
    xml += '</MealPlannerData>';
    return xml;
}

/**
 * Clear all data
 */
async function clearAllData() {
    const confirmed1 = await showConfirmModal(
        'Are you sure you want to clear ALL data? This action cannot be undone!',
        'Clear All Data',
        'Continue',
        'Cancel'
    );
    
    if (!confirmed1) {
        return;
    }
    
    const confirmed2 = await showConfirmModal(
        'This will delete all meals, food library, and settings. Are you absolutely sure?',
        'Final Confirmation',
        'Yes, Clear All',
        'Cancel'
    );
    
    if (!confirmed2) {
        return;
    }
    
    // Clear all localStorage data
    localStorage.removeItem('meals');
    localStorage.removeItem('foodLibrary');
    localStorage.removeItem('calorieGoal');
    
    // Initialize defaults
    initializeSettings();
    loadCalorieGoal();
    
    showSuccessModal('All data cleared successfully! Redirecting to dashboard...', 'Success');
    
    // Redirect to dashboard after showing success
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}


