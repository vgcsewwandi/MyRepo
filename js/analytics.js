/**
 * Analytics Handler
 * Displays charts for weekly and monthly calorie intake
 */

let weeklyChart = null;
let monthlyChart = null;
let currentFilter = 'weekly';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize analytics page
    setupFilterButtons();
    
    // Initialize tooltips
    setTimeout(() => {
        initializeTooltips();
    }, 200);
    
    // Load initial chart after a short delay to ensure DOM is ready
    setTimeout(() => {
        loadAnalytics();
    }, 100);
});

/**
 * Setup filter button event listeners
 */
function setupFilterButtons() {
    const weeklyFilter = document.getElementById('weeklyFilter');
    const monthlyFilter = document.getElementById('monthlyFilter');
    
    if (weeklyFilter) {
        weeklyFilter.addEventListener('click', function() {
            switchFilter('weekly');
        });
        // Initialize tooltip
        new bootstrap.Tooltip(weeklyFilter);
    }
    
    if (monthlyFilter) {
        monthlyFilter.addEventListener('click', function() {
            switchFilter('monthly');
        });
        // Initialize tooltip
        new bootstrap.Tooltip(monthlyFilter);
    }
}

/**
 * Switch between weekly and monthly filter
 */
function switchFilter(filter) {
    if (filter === currentFilter) {
        return;
    }
    
    currentFilter = filter;
    
    // Update button states
    const weeklyFilter = document.getElementById('weeklyFilter');
    const monthlyFilter = document.getElementById('monthlyFilter');
    const chartTitle = document.getElementById('chartTitle');
    const weeklyContainer = document.getElementById('weeklyChartContainer');
    const monthlyContainer = document.getElementById('monthlyChartContainer');
    
    if (filter === 'weekly') {
        weeklyFilter.classList.add('active');
        monthlyFilter.classList.remove('active');
        if (chartTitle) chartTitle.textContent = 'Weekly Intake';
        if (weeklyContainer) weeklyContainer.style.display = 'block';
        if (monthlyContainer) monthlyContainer.style.display = 'none';
        
        // Load weekly chart
        setTimeout(() => {
            loadWeeklyChart();
        }, 100);
    } else {
        weeklyFilter.classList.remove('active');
        monthlyFilter.classList.add('active');
        if (chartTitle) chartTitle.textContent = 'Monthly Trend';
        if (weeklyContainer) weeklyContainer.style.display = 'none';
        if (monthlyContainer) monthlyContainer.style.display = 'block';
        
        // Load monthly chart
        setTimeout(() => {
            loadMonthlyChart();
        }, 100);
    }
}

/**
 * Load analytics data
 */
function loadAnalytics() {
    if (currentFilter === 'weekly') {
        loadWeeklyChart();
    } else {
        loadMonthlyChart();
    }
}

/**
 * Load weekly intake chart
 */
function loadWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) {
        return;
    }
    
    // Destroy existing chart if it exists
    if (weeklyChart) {
        weeklyChart.destroy();
    }
    
    // Get meals from localStorage
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || '2000');
    
    // Get last 7 days
    const today = new Date();
    const days = [];
    const intakeData = [];
    const goalData = [];
    const overGoalData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get day name
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.push(dayNames[date.getDay()]);
        
        // Calculate calories for this day
        const dayMeals = meals.filter(meal => meal.date === dateStr);
        const dayCalories = dayMeals.reduce((sum, meal) => sum + parseInt(meal.calories || 0), 0);
        
        intakeData.push(dayCalories);
        goalData.push(calorieGoal);
        
        if (dayCalories > calorieGoal) {
            overGoalData.push(dayCalories - calorieGoal);
        } else {
            overGoalData.push(0);
        }
    }
    
    // Calculate max value for y-axis
    const allValues = [...intakeData, ...goalData];
    const maxIntake = allValues.length > 0 ? Math.max(...allValues) : calorieGoal;
    const yAxisMax = maxIntake > 0 ? Math.max(calorieGoal * 1.2, Math.ceil(maxIntake * 1.2 / 500) * 500) : calorieGoal * 1.5;
    
    // Create chart
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Intake',
                    data: intakeData,
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Goal',
                    data: goalData,
                    backgroundColor: 'rgba(108, 117, 125, 0.5)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 1,
                    borderDash: [5, 5]
                },
                {
                    label: 'Over Goal',
                    data: overGoalData,
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    ticks: {
                        stepSize: 500
                    },
                    title: {
                        display: true,
                        text: 'Calories (kcal)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // We have custom legend
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y + ' kcal';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Load monthly trend chart
 */
function loadMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) {
        return;
    }
    
    // Destroy existing chart if it exists
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    // Get meals from localStorage
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || '2000');
    
    // Get last 30 days (or available days)
    const today = new Date();
    const days = [];
    const intakeData = [];
    const goalData = [];
    
    // Group by week for better visualization
    const weeks = [];
    const weekIntake = [];
    const weekGoal = [];
    
    // Get last 4 weeks
    for (let week = 3; week >= 0; week--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (week * 7) - 6);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Format week label
        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
        weeks.push(weekLabel);
        
        // Calculate total calories for this week
        let weekCalories = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayMeals = meals.filter(meal => meal.date === dateStr);
            weekCalories += dayMeals.reduce((sum, meal) => sum + parseInt(meal.calories || 0), 0);
        }
        
        weekIntake.push(weekCalories);
        weekGoal.push(calorieGoal * 7); // Weekly goal = daily goal * 7
    }
    
    // Calculate max value for y-axis
    const allWeekValues = [...weekIntake, ...weekGoal];
    const maxWeekIntake = allWeekValues.length > 0 ? Math.max(...allWeekValues) : calorieGoal * 7;
    const yAxisMax = maxWeekIntake > 0 ? Math.max(calorieGoal * 7 * 1.2, Math.ceil(maxWeekIntake * 1.2 / 1000) * 1000) : calorieGoal * 7 * 1.5;
    
    // Create chart
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeks,
            datasets: [
                {
                    label: 'Intake',
                    data: weekIntake,
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Goal',
                    data: weekGoal,
                    backgroundColor: 'rgba(108, 117, 125, 0.1)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    ticks: {
                        stepSize: 1000
                    },
                    title: {
                        display: true,
                        text: 'Calories (kcal)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Weeks'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // We have custom legend
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y + ' kcal';
                            return label;
                        }
                    }
                }
            }
        }
    });
}
