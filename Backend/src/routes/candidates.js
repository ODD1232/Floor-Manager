// backend/src/routes/candidates.js  (FULL REPLACEMENT)
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/Candidatecontroller');
const { candidateUpload, signatureUpload } = require('../middleware/Upload');

// Specific routes BEFORE /:id to avoid param conflict
router.get('/contractors',   ctrl.getContractors);
router.patch('/round22',     ctrl.updateRound22);
router.patch('/dump',        ctrl.dumpCandidates);

// CRUD
router.get('/',              ctrl.getCandidates);
router.post('/',             candidateUpload, ctrl.createCandidate);
router.get('/:id',           ctrl.getCandidate);

// Round transitions
router.patch('/:id/round21',   ctrl.updateRound21);
router.patch('/:id/classify',  ctrl.classifyCandidate);
router.patch('/:id/approve',   signatureUpload, ctrl.approveCandidate);

module.exports = router;