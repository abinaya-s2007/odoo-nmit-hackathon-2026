const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { balance, request, listRequests, decide } = require('../controllers/timeoffController');

const router = express.Router();

router.use(requireAuth);

router.get('/balance', balance);
router.post('/request', request);
router.get('/requests', requireAdmin, listRequests);
router.patch('/requests/:id', requireAdmin, decide);

module.exports = router;
