// backend/src/routes/candidates.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../src/controllers/Candidatecontroller');
const { candidateUpload, signatureUpload } = require('../src/middleware/Upload');
// const auth  = require('../middleware/auth');   // uncomment when ready

// ── Contractors dropdown ──────────────────────────────────────────────────────
router.get('/contractors', ctrl.getContractors);

// ── Candidate list & detail ───────────────────────────────────────────────────
router.get('/',    ctrl.getCandidates);
router.get('/:id', ctrl.getCandidate);

// ── Round 1 — create ─────────────────────────────────────────────────────────
router.post('/', candidateUpload, ctrl.createCandidate);

// ── Move to Round 2 ───────────────────────────────────────────────────────────
router.patch('/move-to-round2', ctrl.moveToRound2);

// ── Round 2.1 — test result ───────────────────────────────────────────────────
router.patch('/:id/round21', ctrl.updateRound21);

// ── Round 2.2 — bulk interview result ────────────────────────────────────────
router.patch('/round22', ctrl.updateRound22);

// ── Dump (bulk reject) ────────────────────────────────────────────────────────
router.patch('/dump', ctrl.dumpCandidates);

// ── Round 3 — approve + signature ────────────────────────────────────────────
router.patch('/:id/approve', signatureUpload, ctrl.approveCandidate);

module.exports = router;