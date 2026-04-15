const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
app.use("/api/roles", require("./routes/roles"));
app.use("/api/roles-mgmt", require("./routes/rolesMgmt"));
app.use("/api/candidates", require("./routes/candidates"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 5009;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// const express =require('express')
// const cors = require("cors");
// const app = express();

// app.use(cors({ 
//   origin: 'http://localhost:5173',  // Frontend Vite port
//   credentials: true 
// }));
// app.use(cors());
// app.use(express.json());

// const authRoutes = require('./routes/auth');

// app.use('/api/auth', authRoutes);
// app.use('/api/roles', require('./routes/roles'));
// // ADD THIS LINE to backend/src/index.js
// // Place after your existing app.use('/api/roles', ...) line:

// app.use('/api/roles-mgmt', require('./routes/rolesMgmt'));   //added new today 
// // Serve uploaded files statically
// app.use('/uploads', express.static('uploads'));    //added new 
 
// // Recruitment routes
// app.use('/api/candidates', require('./routes/candidates'));    //added new 
//   const PORT = process.env.PORT || 5009;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
