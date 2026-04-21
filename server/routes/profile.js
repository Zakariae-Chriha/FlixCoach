const express = require('express');
const router = express.Router();
const { createOrUpdateProfile, getProfile, updateWeight } = require('../controllers/profileController');
const protect = require('../middleware/auth');

router.use(protect);
router.get('/', getProfile);
router.post('/', createOrUpdateProfile);
router.patch('/weight', updateWeight);

module.exports = router;
