const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { checkIn, checkOut, listAll, listMine } = require('../controllers/attendanceController');

const router = express.Router();

router.use(requireAuth);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', listMine);
router.get('/', requireAdmin, listAll);

module.exports = router;
