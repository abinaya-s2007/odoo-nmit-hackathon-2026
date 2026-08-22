const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { list, create, getOne, update } = require('../controllers/employeeController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id', update);

module.exports = router;
