const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb+srv://admin123:admin123@ecdsga.eknlq8q.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Express setup
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Student schema
const studentSchema = new mongoose.Schema(
  {
    studentNumber: String,
    fullName: String,
    program: String,
    yearSection: String,
    status: String,
    gender: String,
    password: String,
    role: [String],
  },
  { collection: "Students" }
);
const Student = mongoose.model("Student", studentSchema);

// Admin schema
const adminSchema = new mongoose.Schema(
  {
    studentNumber: String,
    fullName: String,
    password: String,
    role: [String],
  },
  { collection: "Admins" }
);
const Admin = mongoose.model("Admin", adminSchema);

// Login route
app.post("/login", async (req, res) => {
  const { studentNumber, password } = req.body;
  console.log("Login attempt:", studentNumber, password);

  try {
    let user = await Student.findOne({ studentNumber });

    if (!user) {
      user = await Admin.findOne({ studentNumber });
    }

    if (!user) {
      return res.status(401).send("User not found.");
    }

    if (String(user.password) !== String(password)) {
      console.log("Password mismatch:", user.password, "!=", password);
      return res.status(401).send("Invalid password.");
    }

    // Handle multiple roles
    if (Array.isArray(user.role) && user.role.length > 1) {
      return res.json({
        multipleRoles: true,
        roles: user.role,
      });
    }

    // Single role redirection with fullName
    const role = user.role[0];
    if (role === "admin") {
      return res.json({ redirect: "/admindashboard.html", fullName: user.fullName });
    } else if (role === "student") {
      return res.json({ redirect: "/studentdashboard.html", fullName: user.fullName });
    } else {
      return res.json({ redirect: "/index.html" });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});

// Register route
app.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      studentNumber,
      program,
      yearSection,
      status,
      gender,
      password,
      role = ["student"], // default to student if not provided
    } = req.body;

    const existingStudent = await Student.findOne({ studentNumber });
    if (existingStudent) {
      return res.status(400).send("Student number already exists.");
    }

    const newStudent = new Student({
      fullName,
      studentNumber,
      program,
      yearSection,
      status,
      gender,
      password,
      role,
    });

    await newStudent.save();
    res.send("Registration successful!");
  } catch (err) {
    console.error("Error in registration:", err);
    res.status(500).send("Server error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
