import nodemailer from "nodemailer";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import user from "./user.js";
import cors from "cors";
import bodyParser from "body-parser";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
app.use(bodyParser.json());
app.use(express.json());

mongoose.connect('mongodb+srv://charithpuligundla:Charith%402007@cherrycluster.0s50tpu.mongodb.net/?retryWrites=true&w=majority&appName=cherryCluster', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('mongodb connected'))
    .catch(err => console.log('connection failed', err));

const SECRET_KEY = 'code339';

// Allow frontend (5173) to talk to backend (4000)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

let otpStore = {}; // { email: { otp: "123456", expires: 123456789 } }

// Nodemailer config (use Gmail or SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "charithpuligundla@gmail.com",
    pass: "fcdn fvaf ssrg htif", // Use App Password, not normal Gmail password
  },
});

// Generate OTP and send email
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // valid 5 mins

  await transporter.sendMail({
    from: "charithpuligundla@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  });

  res.json({ message: "OTP sent to email" });
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ error: "No OTP sent" });
  if (record.expires < Date.now()) return res.status(401).json({ error: "OTP expired" });
  if (record.otp !== otp) return res.status(402).json({ error: "Invalid OTP" });

  // OTP valid → issue JWT
  const token = jwt.sign({ email }, "secretKey", { expiresIn: "1h" });

  delete otpStore[email]; // clear OTP after success

  res.json({ message: "Login success", token });
});

app.post("/run", async (req, res) => {
  const { code, language } = req.body;

  // Create temp directory for this run
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "code-"));
  let fileName = "";
  let cmd = "";

  try {
    switch (language) {
      case "javascript":
        fileName = path.join(tmpDir, "script.js");
        fs.writeFileSync(fileName, code);
        cmd = `docker run --rm -v "${tmpDir}:/app" -w /app node:18 node script.js`;
        break;

      case "python":
        fileName = path.join(tmpDir, "script.py");
        fs.writeFileSync(fileName, code);
        cmd = `docker run --rm -v "${tmpDir}:/app" -w /app python:3.12 python script.py`;
        break;

      case "java":
        fileName = path.join(tmpDir, "Main.java");
        fs.writeFileSync(fileName, code);
        cmd = `docker run --rm -v "${tmpDir}:/app" -w /app openjdk:20 bash -c "javac Main.java && java Main"`;
        break;

      case "c":
        fileName = path.join(tmpDir, "main.c");
        fs.writeFileSync(fileName, code);
        cmd = `docker run --rm -v "${tmpDir}:/app" -w /app gcc:13 bash -c "gcc main.c -o main && ./main"`;
        break;

      case "cpp":
        fileName = path.join(tmpDir, "main.cpp");
        fs.writeFileSync(fileName, code);
        cmd = `docker run --rm -v "${tmpDir}:/app" -w /app gcc:13 bash -c "g++ main.cpp -o main && ./main"`;
        break;

      default:
        return res.send({ error: "Language not supported" });
    }

    exec(cmd, { shell: "powershell.exe" }, (err, stdout, stderr) => {
      // Cleanup temp files
      fs.rmSync(tmpDir, { recursive: true, force: true });

      if (err) return res.send({ error: stderr || err.message });
      res.send({ output: stdout });
    });
  } catch (e) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    res.send({ error: e.message });
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
