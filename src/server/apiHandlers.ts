import type { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return keyId && keySecret
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function healthHandler(_req: Request, res: Response) {
  return res.status(200).json({ status: "ok" });
}

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({
        error: "Payment gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const { amount, currency = "INR", receipt, notes } = req.body || {};

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
      return res.status(400).json({
        error: "Amount must be a positive number within the supported limit",
      });
    }

    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({
        error: "Currency must be a valid three-letter currency code",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return res.status(200).json(order);
  } catch (error: unknown) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      error: getErrorMessage(error, "Failed to create order"),
    });
  }
}

export async function verifyPaymentHandler(req: Request, res: Response) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      typeof razorpay_order_id !== "string" || !razorpay_order_id ||
      typeof razorpay_payment_id !== "string" || !razorpay_payment_id ||
      typeof razorpay_signature !== "string" || !razorpay_signature
    ) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!razorpayKeySecret) {
      return res.status(503).json({
        error: "Payment verification unavailable. Missing gateway credentials.",
      });
    }

    const hmac = crypto.createHmac("sha256", razorpayKeySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");
    const receivedSignature = Buffer.from(razorpay_signature, "utf8");
    const expectedSignature = Buffer.from(generatedSignature, "utf8");

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Payment Successful</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear Customer,</p>
          <p>We have successfully received your payment against Order ID <strong>${razorpay_order_id}</strong>. Payment reference: <strong>${razorpay_payment_id}</strong>.</p>
          <p>A receipt will be generated and available in your portal dashboard shortly.</p>
          <p>Thank you for choosing Sricore Solutions.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Sricore Solutions. All rights reserved.
        </div>
      </div>
    `;

    if (process.env.SMTP_USER) {
      transporter.sendMail({
        from: `"Sricore Solutions Finance" <${process.env.SMTP_USER}>`,
        to: typeof req.body?.email === "string" && req.body.email
          ? req.body.email
          : process.env.SMTP_USER,
        subject: "Payment Confirmation - Sricore Solutions",
        html: emailHtml,
      }).catch((error: unknown) => console.error("Email error:", error));
    }

    return res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      error: getErrorMessage(error, "Failed to verify payment"),
    });
  }
}

export async function sendEmailHandler(req: Request, res: Response) {
  try {
    const { to, subject, html } = req.body || {};

    if (
      typeof to !== "string" || !to.trim() ||
      typeof subject !== "string" || !subject.trim() ||
      typeof html !== "string" || !html.trim()
    ) {
      return res.status(400).json({ error: "Missing email parameters" });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email requested but SMTP not configured. Simulating email send:");
      console.log(`To: ${to}\nSubject: ${subject}\nHTML: ${html.substring(0, 50)}...`);
      return res.status(200).json({
        status: "simulated",
        message: "Email simulated (SMTP not configured)",
      });
    }

    const info = await transporter.sendMail({
      from: `"Sricore Solutions" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return res.status(200).json({ status: "success", messageId: info.messageId });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: getErrorMessage(error, "Failed to send email"),
    });
  }
}
