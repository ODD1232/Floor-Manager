const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    console.log('ROLES ROUTE HIT');
    const roles = await prisma.role.findMany({
      select: { id: true, name: true }
    });
    res.json(roles || []);
  } catch (error) {
    console.error('Roles error:', error);
    res.status(500).json({ message: 'Roles fetch failed' });
  }
});

module.exports = router;