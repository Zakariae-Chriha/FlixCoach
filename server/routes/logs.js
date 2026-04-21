const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getTodayLog, logFood, removeFoodEntry,
  logSleep, logMentalWellness, logWorkout, logWater, getWeekLogs, analyzeMealPhoto,
} = require('../controllers/logController');
const protect = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

router.use(protect);
router.get('/today', getTodayLog);
router.get('/week', getWeekLogs);
router.post('/food', logFood);
router.delete('/food/:entryId', removeFoodEntry);
router.post('/analyze-photo', upload.single('photo'), analyzeMealPhoto);
router.post('/sleep', logSleep);
router.post('/mental', logMentalWellness);
router.post('/workout', logWorkout);
router.post('/water', logWater);

module.exports = router;
