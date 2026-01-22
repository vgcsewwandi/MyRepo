# Testing Instructions

## Quick Test Guide

### 1. Open the Application
- Open `index.html` in a web browser (Chrome, Firefox, Safari, or Edge)
- Or use a local web server:
  ```bash
  # Python 3
  python -m http.server 8000
  # Then visit http://localhost:8000
  ```

### 2. Test Dashboard
- ✅ Dashboard should display "0 / 2000 kcal"
- ✅ Progress bar should be at 0%
- ✅ Should show "No meals logged today" message
- ✅ Empty state with fork/knife icon should be visible

### 3. Test Add Meal Functionality
1. Click "Add Meal" button or navigate to Add Meal page
2. **Test Food Library Dropdown:**
   - Open the "Select from Food Library" dropdown
   - Select "String Hoppers (2 pieces) - 140 kcal"
   - ✅ Name and Calories fields should auto-fill
3. **Test Manual Entry:**
   - Select "Breakfast" as category
   - Enter meal name: "Test Meal"
   - Enter calories: "300"
   - Click "Save Meal"
   - ✅ Should redirect to Dashboard
   - ✅ Dashboard should show "300 / 2000 kcal"
   - ✅ Progress bar should be at 15%
   - ✅ Meal should appear in "Today's Meals" list

### 4. Test Meal Deletion
1. On Dashboard, click the trash icon on a meal
2. ✅ Confirm dialog should appear
3. Click "OK"
4. ✅ Meal should be removed
5. ✅ Calorie count should update

### 5. Test Navigation
- ✅ Click navigation links: Dashboard, Add Meal, Analytics, Settings
- ✅ Active page should be highlighted in green
- ✅ Navigation should work on mobile (hamburger menu)

### 6. Test Responsive Design
- ✅ Resize browser window or use mobile device
- ✅ Layout should adapt properly
- ✅ Navigation menu should collapse on mobile

## Common Issues and Solutions

### Issue: Functions don't work / JavaScript errors
**Solution:** 
- Open browser Developer Tools (F12)
- Check Console tab for errors
- Ensure all JavaScript files are loading correctly
- Verify LocalStorage is enabled in browser

### Issue: Food library dropdown is empty
**Solution:**
- The default food library is initialized automatically
- If still empty, check browser console for errors
- Clear browser cache and reload

### Issue: Meals not saving
**Solution:**
- Check if LocalStorage is enabled
- Open Developer Tools > Application > Local Storage
- Verify 'meals' key exists after saving
- Check for JavaScript errors in console

### Issue: Progress bar not updating
**Solution:**
- Verify calorie goal is set (default: 2000)
- Check if meals are saved with correct date (today's date)
- Reload dashboard page

### Issue: Can't open JSON file (CORS error)
**Solution:**
- Use a local web server instead of opening file directly
- The app includes a fallback hardcoded food library
- Should work even without JSON file

## Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Local Storage Check
To verify data is being saved:
1. Open Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Expand "Local Storage"
4. Click on your domain
5. You should see:
   - `meals`: Array of meal objects
   - `foodLibrary`: Array of food items
   - `calorieGoal`: Daily calorie goal (default: 2000)

## Test Data
Try adding these test meals:
1. Breakfast: String Hoppers (2 pieces) - 140 kcal
2. Lunch: Rice & Curry (1 plate) - 450 kcal
3. Dinner: Kottu Roti (1 portion) - 600 kcal
4. Snack: Watalappan (1 piece) - 250 kcal

Total: 1440 kcal (72% of 2000 kcal goal)

## Expected Behavior
- ✅ All meals should appear on Dashboard
- ✅ Total calories: 1440 / 2000 kcal
- ✅ Progress bar: 72%
- ✅ Remaining: 560 kcal
- ✅ All meals should be deletable

