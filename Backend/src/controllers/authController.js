const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    let { name, employeeId, password } = req.body || {};

    name = name?.trim();
    employeeId = employeeId?.trim();

    if (!name || !employeeId || !password) {
      return res.status(400).json({
        message: "Name, employee ID and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { employeeId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Admin already exists with this employee ID.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        employeeId,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Admin registered successfully.",
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Registration failed.",
      error: error.message,
    });
  }
};

const adminRegister = async (req, res) => {
  try {
    const { name, employeeId, password, roleId } = req.body;

    if (!name || !employeeId || !password || !roleId) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const existingUser = await prisma.user.findUnique({ where: { employeeId } });
    if (existingUser) {
      return res.status(400).json({ message: "Employee ID exists" });
    }

    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        employeeId,
        password: hashedPassword,
      },
    });

    await prisma.roleUser.create({
      data: {
        userId: user.id,
        roleId: Number(roleId),
      },
    });

    return res.status(201).json({
      message: "User created",
      user: {
        id: user.id,
        name,
        employeeId,
        roleId: Number(roleId),
      },
    });
  } catch (error) {
    console.error("ADMIN REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    let { employeeId, password } = req.body || {};
    employeeId = employeeId?.trim();

    if (!employeeId || !password) {
      return res.status(400).json({
        message: "Employee ID and password are required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { employeeId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid employee ID or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid employee ID or password.",
      });
    }

    const roleNames = user.roles.map((r) => r.role.name);

    const permissions = [
      ...new Set(
        user.roles.flatMap((r) =>
          r.role.rolePermissions.map((rp) => rp.permission.key)
        )
      ),
    ];

    const isSuperAdmin =
      roleNames.includes("super_admin") || roleNames.includes("Super Admin");

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured in .env",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        employeeId: user.employeeId,
        roles: roleNames,
        permissions,
        isSuperAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        roles: roleNames,
        permissions,
        isSuperAdmin,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
};

module.exports = { register, login, adminRegister };