import express from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
app.use(express.json());

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

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
