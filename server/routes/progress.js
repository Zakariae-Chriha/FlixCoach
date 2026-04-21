const express = require('express');
const router = express.Router();
const { uploadPhoto, getPhotos, upload } = require('../controllers/progressController');
const protect = require('../middleware/auth');

router.use(protect);
router.post('/photo', upload.single('photo'), uploadPhoto);
router.get('/photos', getPhotos);

module.exports = router;
