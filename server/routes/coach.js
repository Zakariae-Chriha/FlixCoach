const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, clearChat, getMotivationalMessage, getDailyBriefing } = require('../controllers/coachController');
const protect = require('../middleware/auth');

router.use(protect);
router.post('/chat', sendMessage);
router.get('/chat', getChatHistory);
router.delete('/chat', clearChat);
router.get('/motivate', getMotivationalMessage);
router.get('/briefing', getDailyBriefing);

module.exports = router;
