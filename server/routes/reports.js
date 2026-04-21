const express = require('express');
const router = express.Router();
const { generateWeeklyReport, getReports, getLatestReport } = require('../controllers/reportController');
const protect = require('../middleware/auth');

router.use(protect);
router.post('/weekly', generateWeeklyReport);
router.get('/', getReports);
router.get('/latest', getLatestReport);

module.exports = router;
