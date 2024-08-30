// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Api Working");
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define a simple schema and model for job seekers
const JobSeekerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  qualifications: String,
  resume: String, // This will store the filename of the uploaded resume
});

const JobSeeker = mongoose.model("JobSeeker", JobSeekerSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
app.post("/api/signup", upload.single("resume"), async (req, res) => {
    try {
      const { name, email, phone, qualifications } = req.body;
      const resume = req.file.filename;
  
      const newJobSeeker = new JobSeeker({
        name,
        email,
        phone,
        qualifications,
        resume,
      });
  
      await newJobSeeker.save();
      
      res.status(200).json({ message: "Form submitted successfully", resumeUrl: `/uploads/${resume}` });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
