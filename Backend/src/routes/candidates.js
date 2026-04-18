const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/candidateController");
const { candidateUpload, signatureUpload } = require("../middleware/upload");

router.get("/contractors", ctrl.getContractors);
router.patch("/round21", ctrl.updateRound21Bulk);
router.patch("/round22", ctrl.updateRound22);
router.patch("/dump", ctrl.dumpCandidates);

router.get("/", ctrl.getCandidates);
router.post("/", candidateUpload, ctrl.createCandidate);

router.get("/:id", ctrl.getCandidate);
router.patch("/:id/profile-fields", ctrl.updateCandidateProfileFields);
router.patch("/:id/round21", ctrl.updateRound21);
router.patch("/:id/classify", ctrl.classifyCandidate);
router.patch("/:id/round3-details", ctrl.updateRound3Details);
router.patch("/:id/approve", signatureUpload, ctrl.approveCandidate);

module.exports = router;