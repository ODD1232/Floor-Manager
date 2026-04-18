const prisma = require("../config/prisma");

const filePath = (files, field) =>
  files?.[field]?.[0]?.path?.replace(/\\/g, "/") || null;

const createCandidate = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      phone,
      aadharNo,
      qualification,
      hasExperience,
      prevPosition,
      prevCompany,
      prevLocation,
      wasOnContract,
      contractDuration,
      contractorId,
      skillLevel,
      department,
      round2Type,
    } = req.body;

    if (!name || !phone || !aadharNo || !qualification) {
      return res.status(400).json({
        message: "Name, phone, aadhar and qualification are required.",
      });
    }

    if (!round2Type || !["test", "interview"].includes(round2Type)) {
      return res.status(400).json({
        message: "round2Type must be test or interview.",
      });
    }

    const existing = await prisma.candidate.findUnique({
      where: { aadharNo },
    });

    if (existing) {
      return res.status(400).json({
        message: "Candidate with this Aadhar number already exists.",
      });
    }

    const isClassified = !!(skillLevel && department);

    const candidate = await prisma.candidate.create({
      data: {
        name,
        employeeId: employeeId || null,
        phone,
        aadharNo,
        qualification,
        photoPath: filePath(req.files, "photo"),
        aadharPhotoPath: filePath(req.files, "aadharPhoto"),
        resumePath: filePath(req.files, "resume"),
        hasExperience: hasExperience === "true" || hasExperience === true,
        prevPosition: prevPosition || null,
        prevCompany: prevCompany || null,
        prevLocation: prevLocation || null,
        experienceLetterPath: filePath(req.files, "experienceLetter"),
        relevanceLetterPath: filePath(req.files, "relevanceLetter"),
        wasOnContract: wasOnContract === "true" || wasOnContract === true,
        contractDuration: contractDuration || null,
        contractorId: contractorId ? parseInt(contractorId) : null,
        skillLevel: skillLevel || null,
        department: department || null,
        currentRound: 2,
        round2Type,
        overallStatus: "IN_ROUND2",
        isClassified,
      },
    });

    return res.status(201).json({
      message: "Candidate registered and moved to Round 2.",
      candidate,
    });
  } catch (err) {
    console.error("CREATE CANDIDATE ERROR:", err);
    return res.status(500).json({
      message: "Failed to create candidate.",
      error: err.message,
    });
  }
};

const getCandidates = async (req, res) => {
  try {
    const {
      round,
      status,
      department,
      skillLevel,
      contractorId,
      search,
      classified,
    } = req.query;

    const where = {};

    if (round) where.currentRound = parseInt(round);
    if (status) where.overallStatus = status;
    if (department) where.department = department;
    if (skillLevel) where.skillLevel = skillLevel;
    if (contractorId) where.contractorId = parseInt(contractorId);
    if (classified === "false") where.isClassified = false;
    if (classified === "true") where.isClassified = true;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { aadharNo: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        contractor: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(candidates);
  } catch (err) {
    console.error("GET CANDIDATES ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch candidates.",
      error: err.message,
    });
  }
};

const getCandidate = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { contractor: true },
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    return res.json(candidate);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch candidate.",
      error: err.message,
    });
  }
};

const classifyCandidate = async (req, res) => {
  try {
    const { skillLevel, department } = req.body;
    const id = parseInt(req.params.id);

    if (!skillLevel || !department) {
      return res.status(400).json({
        message: "skillLevel and department required.",
      });
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        skillLevel,
        department,
        isClassified: true,
      },
      include: {
        contractor: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      message: "Candidate classified.",
      candidate,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to classify.",
      error: err.message,
    });
  }
};

const updateCandidateProfileFields = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skillLevel, department } = req.body;

    if (!skillLevel || !department) {
      return res.status(400).json({
        message: "skillLevel and department are required.",
      });
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        skillLevel,
        department,
        isClassified: true,
      },
      include: {
        contractor: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      message: "Candidate profile fields updated.",
      candidate,
    });
  } catch (err) {
    console.error("UPDATE PROFILE FIELDS ERROR:", err);
    return res.status(500).json({
      message: "Failed to update candidate profile fields.",
      error: err.message,
    });
  }
};

const updateRound21 = async (req, res) => {
  try {
    const { status } = req.body;
    const id = parseInt(req.params.id);

    const c = await prisma.candidate.findUnique({ where: { id } });

    if (!c) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    if (status === "passed" && !c.isClassified) {
      return res.status(400).json({
        message: "Cannot promote candidate is not classified; skill/department missing.",
      });
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        round21Status: status,
        currentRound: status === "passed" ? 3 : 2,
        overallStatus: status === "passed" ? "IN_ROUND3" : "REJECTED",
      },
    });

    return res.json({
      message: `Round 2.1 status updated to ${status}.`,
      candidate,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update Round 2.1.",
      error: err.message,
    });
  }
};

const updateRound21Bulk = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates?.length) {
      return res.status(400).json({ message: "updates array required." });
    }

    const errors = [];
    const ops = [];

    for (const { id, status } of updates) {
      const c = await prisma.candidate.findUnique({
        where: { id: Number(id) },
      });

      if (!c) {
        errors.push(`${id} not found`);
        continue;
      }

      if (status === "passed" && !c.isClassified) {
        errors.push(`${c.name || id} not classified`);
        continue;
      }

      ops.push(
        prisma.candidate.update({
          where: { id: Number(id) },
          data: {
            round21Status: status,
            currentRound: status === "passed" ? 3 : 2,
            overallStatus: status === "passed" ? "IN_ROUND3" : "REJECTED",
          },
        })
      );
    }

    if (ops.length) {
      await prisma.$transaction(ops);
    }

    const msg = errors.length
      ? `${ops.length} updated. Blocked: ${errors.join(", ")}`
      : `${ops.length} candidates updated.`;

    return res.json({ message: msg, blocked: errors });
  } catch (err) {
    console.error("UPDATE ROUND 2.1 BULK ERROR:", err);
    return res.status(500).json({
      message: "Failed to update Round 2.1.",
      error: err.message,
    });
  }
};

const updateRound22 = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates?.length) {
      return res.status(400).json({ message: "updates array required." });
    }

    const errors = [];
    const ops = [];

    for (const { id, status } of updates) {
      if (status === "passed") {
        const c = await prisma.candidate.findUnique({
          where: { id: Number(id) },
        });

        if (!c?.isClassified) {
          errors.push(`${c?.name || id} not classified`);
          continue;
        }
      }

      ops.push(
        prisma.candidate.update({
          where: { id: Number(id) },
          data: {
            round22Status: status,
            currentRound: status === "passed" ? 3 : 2,
            overallStatus: status === "passed" ? "IN_ROUND3" : "REJECTED",
          },
        })
      );
    }

    if (ops.length) {
      await prisma.$transaction(ops);
    }

    const msg = errors.length
      ? `${ops.length} updated. Blocked: ${errors.join(", ")}`
      : `${ops.length} candidates updated.`;

    return res.json({ message: msg, blocked: errors });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update Round 2.2.",
      error: err.message,
    });
  }
};

const dumpCandidates = async (req, res) => {
  try {
    const { ids, remarks } = req.body;

    if (!ids?.length) {
      return res.status(400).json({ message: "ids required." });
    }

    await prisma.candidate.updateMany({
      where: { id: { in: ids.map(Number) } },
      data: {
        overallStatus: "REJECTED",
        remarks: remarks || "Rejected",
      },
    });

    return res.json({
      message: `${ids.length} candidates rejected.`,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to dump candidates.",
      error: err.message,
    });
  }
};

const updateRound3Details = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { employeeId, skillLevel, department, remarks } = req.body;

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        employeeId: employeeId || null,
        skillLevel: skillLevel || null,
        department: department || null,
        isClassified: !!(skillLevel && department),
        round3Status: "pending",
        remarks: remarks || null,
      },
      include: {
        contractor: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      message: "Round 3 details updated.",
      candidate,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update Round 3 details.",
      error: err.message,
    });
  }
};

const approveCandidate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const remarks = req.body?.remarks;

    const c = await prisma.candidate.findUnique({ where: { id } });

    if (!c) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    if (!c.isClassified) {
      return res.status(400).json({
        message: "Cannot approve candidate is not classified.",
      });
    }

    const sigPath = req.file?.path?.replace(/\\/g, "/") || null;

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        round3Status: "passed",
        overallStatus: "APPROVED",
        signaturePath: sigPath,
        signedById: req.user?.id || null,
        signedAt: new Date(),
        remarks: remarks || null,
      },
    });

    return res.json({
      message: "Candidate approved.",
      candidate,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to approve candidate.",
      error: err.message,
    });
  }
};

const getContractors = async (req, res) => {
  try {
    const contractors = await prisma.contractor.findMany({
      orderBy: { name: "asc" },
    });
    return res.json(contractors);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch contractors.",
      error: err.message,
    });
  }
};

module.exports = {
  createCandidate,
  getCandidates,
  getCandidate,
  classifyCandidate,
  updateCandidateProfileFields,
  updateRound21,
  updateRound21Bulk,
  updateRound22,
  dumpCandidates,
  updateRound3Details,
  approveCandidate,
  getContractors,
};