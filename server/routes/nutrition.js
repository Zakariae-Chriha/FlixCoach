const express = require('express');
const router = express.Router();
const { generateMealPlan, getActivePlan, getTodayMeals } = require('../controllers/nutritionController');
const protect = require('../middleware/auth');

router.use(protect);
router.post('/generate', generateMealPlan);
router.get('/active', getActivePlan);
router.get('/today', getTodayMeals);

module.exports = router;
