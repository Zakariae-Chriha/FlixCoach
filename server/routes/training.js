const express = require('express');
const router = express.Router();
const { generateProgram, getActiveProgram, markDayComplete, getTodayWorkout } = require('../controllers/trainingController');
const protect = require('../middleware/auth');

router.use(protect);
router.post('/generate', generateProgram);
router.get('/active', getActiveProgram);
router.get('/today', getTodayWorkout);
router.patch('/complete/:dayNumber', markDayComplete);

module.exports = router;
