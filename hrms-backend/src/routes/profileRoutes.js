const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
} = require('../controllers/profileController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/password', changePassword);

module.exports = router;
