const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { alerts } = require('../controllers/dashboardController');

const router = express.Router();

router.use(requireAuth);
router.get('/alerts', alerts);

module.exports = router;
