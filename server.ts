import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();

// We will use standard Firebase client for simplicity on the server if Admin isn't available,
// but for true security Admin SDK is preferred. For now we will create an API 
// that can be called by the frontend.

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Email Configuration (Nodemailer)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Razorpay Configuration
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const razorpay = (razorpayKeyId && razorpayKeySecret)
    ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })
    : null;

  // --- API ROUTES ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 1. Create Order
  app.post("/api/payments/create-order", async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(503).json({ error: "Payment gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." });
      }

      const { amount, currency = "INR", receipt, notes } = req.body;
      
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
        return res.status(400).json({ error: "Amount must be a positive number within the supported limit" });
      }
      if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
        return res.status(400).json({ error: "Currency must be a valid three-letter currency code" });
      }

      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  // 2. Verify Payment
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required payment fields" });
      }

      if (!razorpayKeySecret) {
        return res.status(503).json({ error: "Payment verification unavailable. Missing gateway credentials." });
      }

      // Verify Signature
      const hmac = crypto.createHmac("sha256", razorpayKeySecret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest("hex");

      const receivedSignature = Buffer.from(String(razorpay_signature), "utf8");
      const expectedSignature = Buffer.from(generated_signature, "utf8");
      if (receivedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(receivedSignature, expectedSignature)) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }

      // We could use Firebase Admin here to update Firestore securely.
      // We will also send an email to the client confirming payment success.

      const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Payment Successful</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear Customer,</p>
          <p>We have successfully received your payment of <strong>${razorpay_payment_id}</strong> against Order ID <strong>${razorpay_order_id}</strong>.</p>
          <p>A receipt will be generated and available in your portal dashboard shortly.</p>
          <p>Thank you for choosing Sricore Solutions.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Sricore Solutions. All rights reserved.
        </div>
      </div>
      `;

      // Log it or send it (ignoring error so it doesn't block payment success response)
      if (process.env.SMTP_USER) {
        transporter.sendMail({
          from: `"Sricore Solutions Finance" <${process.env.SMTP_USER}>`,
          to: req.body.email || process.env.SMTP_USER, // fallback to self if no email provided in req
          subject: "Payment Confirmation - Sricore Solutions",
          html: emailHtml,
        }).catch(e => console.error("Email error:", e));
      }

      res.json({ 
        status: "success", 
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: error.message || "Failed to verify payment" });
    }
  });

  // 3. Send Email Notification
  app.post("/api/email/send", async (req, res) => {
    try {
      const { to, subject, html } = req.body;

      if (!to || !subject || !html) {
        return res.status(400).json({ error: "Missing email parameters" });
      }

      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("Email requested but SMTP not configured. Simulating email send:");
        console.log(`To: ${to}\nSubject: ${subject}\nHTML: ${html.substring(0, 50)}...`);
        return res.json({ status: "simulated", message: "Email simulated (SMTP not configured)" });
      }

      const info = await transporter.sendMail({
        from: `"Sricore Solutions" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      res.json({ status: "success", messageId: info.messageId });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
