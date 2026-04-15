// backend/src/controllers/candidateController.js  (FULL REPLACEMENT)
const prisma = require('../config/prisma');

const filePath = (files, field) =>
  files?.[field]?.[0]?.path?.replace(/\\/g, '/') || null;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/candidates  — Round 1: create + immediately set round2Type
// body fields: all candidate fields + round2Type ('test' | 'interview')
// ─────────────────────────────────────────────────────────────────────────────
const createCandidate = async (req, res) => {
  try {
    const {
      name, phone, aadharNo, qualification,
      hasExperience, prevPosition, prevCompany, prevLocation,
      wasOnContract, contractDuration, contractorId,
      skillLevel, department, round2Type,
    } = req.body;

    if (!name || !phone || !aadharNo || !qualification) {
      return res.status(400).json({ message: 'Name, phone, aadhar and qualification are required.' });
    }
    if (!round2Type || !['test', 'interview'].includes(round2Type)) {
      return res.status(400).json({ message: 'round2Type must be "test" or "interview".' });
    }

    const existing = await prisma.candidate.findUnique({ where: { aadharNo } });
    if (existing) {
      return res.status(400).json({ message: 'Candidate with this Aadhar number already exists.' });
    }

    // Classify status: if no skill/dept, stays PENDING_CLASSIFICATION so it shows
    // in "unclassified" filter and cannot reach Round 3 until fixed
    const isClassified = !!(skillLevel && department);

    const candidate = await prisma.candidate.create({
      data: {
        name,
        phone,
        aadharNo,
        qualification,
        photoPath:            filePath(req.files, 'photo'),
        aadharPhotoPath:      filePath(req.files, 'aadharPhoto'),
        resumePath:           filePath(req.files, 'resume'),
        hasExperience:        hasExperience === 'true',
        prevPosition:         prevPosition  || null,
        prevCompany:          prevCompany   || null,
        prevLocation:         prevLocation  || null,
        experienceLetterPath: filePath(req.files, 'experienceLetter'),
        relevanceLetterPath:  filePath(req.files, 'relevanceLetter'),
        wasOnContract:        wasOnContract === 'true',
        contractDuration:     contractDuration || null,
        contractorId:         contractorId ? parseInt(contractorId) : null,
        skillLevel:           skillLevel   || null,
        department:           department   || null,
        currentRound:         2,                          // jump straight to round 2
        round2Type:           round2Type,
        overallStatus:        'IN_ROUND2',
        isClassified,
      },
    });

    res.status(201).json({ message: 'Candidate registered and moved to Round 2.', candidate });
  } catch (err) {
    console.error('CREATE CANDIDATE ERROR:', err);
    res.status(500).json({ message: 'Failed to create candidate.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/candidates  — list with filters
// Query: round, status, department, skillLevel, contractorId, search, classified
// classified=false → show unclassified only
// ─────────────────────────────────────────────────────────────────────────────
const getCandidates = async (req, res) => {
  try {
    const { round, status, department, skillLevel, contractorId, search, classified } = req.query;

    const where = {};
    if (round)        where.currentRound  = parseInt(round);
    if (status)       where.overallStatus = status;
    if (department)   where.department    = department;
    if (skillLevel)   where.skillLevel    = skillLevel;
    if (contractorId) where.contractorId  = parseInt(contractorId);
    if (classified === 'false') where.isClassified = false;
    if (classified === 'true')  where.isClassified = true;

    if (search) {
      where.OR = [
        { name:     { contains: search, mode: 'insensitive' } },
        { aadharNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: { contractor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(candidates);
  } catch (err) {
    console.error('GET CANDIDATES ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch candidates.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/candidates/:id
// ─────────────────────────────────────────────────────────────────────────────
const getCandidate = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { contractor: true },
    });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch candidate.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/candidates/:id/classify  — fill in missing skill/dept
// body: { skillLevel, department }
// ─────────────────────────────────────────────────────────────────────────────
const classifyCandidate = async (req, res) => {
  try {
    const { skillLevel, department } = req.body;
    const id = parseInt(req.params.id);
    if (!skillLevel || !department) {
      return res.status(400).json({ message: 'skillLevel and department required.' });
    }
    const candidate = await prisma.candidate.update({
      where: { id },
      data:  { skillLevel, department, isClassified: true },
    });
    res.json({ message: 'Candidate classified.', candidate });
  } catch (err) {
    res.status(500).json({ message: 'Failed to classify.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/candidates/:id/round21  — Round 2.1 test result
// body: { status: 'passed' | 'failed' }
// ─────────────────────────────────────────────────────────────────────────────
const updateRound21 = async (req, res) => {
  try {
    const { status } = req.body;
    const id = parseInt(req.params.id);

    // Block promotion if unclassified
    const c = await prisma.candidate.findUnique({ where: { id } });
    if (status === 'passed' && !c.isClassified) {
      return res.status(400).json({ message: 'Cannot promote: candidate is not classified (skill & department missing).' });
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        round21Status: status,
        currentRound:  status === 'passed' ? 3 : 2,
        overallStatus: status === 'passed' ? 'IN_ROUND3' : 'REJECTED',
      },
    });
    res.json({ message: `Round 2.1 status: ${status}`, candidate });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update Round 2.1.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/candidates/round22  — bulk interview results
// body: { updates: [{ id, status }] }
// ─────────────────────────────────────────────────────────────────────────────
const updateRound22 = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates?.length) return res.status(400).json({ message: 'updates array required.' });

    const errors = [];
    const ops = [];

    for (const { id, status } of updates) {
      if (status === 'passed') {
        const c = await prisma.candidate.findUnique({ where: { id: Number(id) } });
        if (!c?.isClassified) {
          errors.push(`${c?.name || id}: not classified`);
          continue;
        }
      }
      ops.push(prisma.candidate.update({
        where: { id: Number(id) },
        data: {
          round22Status: status,
          currentRound:  status === 'passed' ? 3 : 2,
          overallStatus: status === 'passed' ? 'IN_ROUND3' : 'REJECTED',
        },
      }));
    }

    if (ops.length) await prisma.$transaction(ops);

    const msg = errors.length
      ? `${ops.length} updated. Blocked: ${errors.join(', ')}`
      : `${ops.length} candidate(s) updated.`;

    res.json({ message: msg, blocked: errors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update Round 2.2.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/candidates/dump  — bulk reject
// ─────────────────────────────────────────────────────────────────────────────
const dumpCandidates = async (req, res) => {
  try {
    const { ids, remarks } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'ids required.' });

    await prisma.candidate.updateMany({
      where: { id: { in: ids.map(Number) } },
      data:  { overallStatus: 'REJECTED', remarks: remarks || 'Rejected' },
    });
    res.json({ message: `${ids.length} candidate(s) rejected.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to dump candidates.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/candidates/:id/approve  — Round 3 dept approval + signature
// ─────────────────────────────────────────────────────────────────────────────
const approveCandidate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { remarks } = req.body;

    // Verify classified
    const c = await prisma.candidate.findUnique({ where: { id } });
    if (!c?.isClassified) {
      return res.status(400).json({ message: 'Cannot approve: candidate is not classified.' });
    }

    const sigPath = req.file?.path?.replace(/\\/g, '/') || null;

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        round3Status:  'passed',
        overallStatus: 'APPROVED',
        signaturePath: sigPath,
        signedById:    req.user?.id || null,
        signedAt:      new Date(),
        remarks:       remarks || null,
      },
    });
    res.json({ message: 'Candidate approved.', candidate });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve candidate.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/candidates/contractors
// ─────────────────────────────────────────────────────────────────────────────
const getContractors = async (req, res) => {
  try {
    const contractors = await prisma.contractor.findMany({ orderBy: { name: 'asc' } });
    res.json(contractors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contractors.', error: err.message });
  }
};

module.exports = {
  createCandidate,
  getCandidates,
  getCandidate,
  classifyCandidate,
  updateRound21,
  updateRound22,
  dumpCandidates,
  approveCandidate,
  getContractors,
};