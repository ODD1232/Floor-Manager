// backend/src/routes/rolesMgmt.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/rolesController');
// const auth = require('../middleware/auth'); // uncomment when ready

router.get('/',                    ctrl.getRoles);
router.get('/permissions',         ctrl.getAllPermissions);
router.post('/',                   ctrl.createRole);
router.put('/:id/permissions',     ctrl.setRolePermissions);
router.delete('/:id',              ctrl.deleteRole);

module.exports = router;