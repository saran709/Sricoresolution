import type { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { z } from "zod";
import dotenv from "dotenv";
import { applyApiSecurityHeaders, escapeHtml } from "./apiMiddleware";

dotenv.config();

let cachedTransporter: Transporter | null = null;
let cachedRazorpayClient: Razorpay | null = null;
let cachedRazorpayCredKey = "";

function getMailTransporter(): Transporter | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 15_000,
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keyId || !keySecret) return null;

  const credKey = `${keyId}:${keySecret}`;
  if (!cachedRazorpayClient || cachedRazorpayCredKey !== credKey) {
    cachedRazorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    cachedRazorpayCredKey = credKey;
  }
  return cachedRazorpayClient;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const CREATE_ORDER_SCHEMA = z.object({
  amount: z.number().finite().positive().max(10_000_000),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, "Currency must be a valid three-letter code")
    .default("INR"),
  receipt: z.string().trim().max(64).optional(),
  notes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const VERIFY_PAYMENT_SCHEMA = z.object({
  razorpay_order_id: z.string().trim().min(1).max(128),
  razorpay_payment_id: z.string().trim().min(1).max(128),
  razorpay_signature: z.string().trim().min(1).max(256),
  email: z.string().trim().email().max(254).optional(),
});

const SEND_EMAIL_SCHEMA = z.object({
  to: z.string().trim().email("Recipient must be a valid email address").max(254),
  subject: z.string().trim().min(1, "Email subject is required").max(200),
  html: z.string().trim().max(100_000).optional(),
  body: z.string().trim().max(50_000).optional(),
  text: z.string().trim().max(50_000).optional(),
});

export function healthHandler(_req: Request, res: Response) {
  applyApiSecurityHeaders(res);
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    services: {
      paymentGatewayConfigured: Boolean(
        process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
      ),
      smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    },
  });
}

export async function createOrderHandler(req: Request, res: Response) {
  applyApiSecurityHeaders(res);
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({
        error:
          "Payment gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const parsed = CREATE_ORDER_SCHEMA.safeParse(req.body || {});
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return res.status(400).json({
        error: issue ? issue.message : "Invalid order creation parameters.",
      });
    }

    const { amount, currency, receipt, notes } = parsed.data;
    const normalizedNotes: Record<string, string | number> = {};
    if (notes) {
      for (const [k, v] of Object.entries(notes)) {
        normalizedNotes[k] = typeof v === "boolean" ? String(v) : v;
      }
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: normalizedNotes,
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
  applyApiSecurityHeaders(res);
  try {
    const parsed = VERIFY_PAYMENT_SCHEMA.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || "Missing or invalid payment fields",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
    } = parsed.data;

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

    const safeOrderId = escapeHtml(razorpay_order_id);
    const safePaymentId = escapeHtml(razorpay_payment_id);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #d97706; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Payment Successful</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear Customer,</p>
          <p>We have successfully received your payment against Order ID <strong>${safeOrderId}</strong>. Payment reference: <strong>${safePaymentId}</strong>.</p>
          <p>A receipt will be generated and available in your portal dashboard shortly.</p>
          <p>Thank you for choosing Sricore Solutions.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Sricore Solutions. All rights reserved.
        </div>
      </div>
    `;

    const transporter = getMailTransporter();
    if (transporter && process.env.SMTP_USER) {
      transporter
        .sendMail({
          from: `"Sricore Solutions Finance" <${process.env.SMTP_USER}>`,
          to: email || process.env.SMTP_USER,
          subject: "Payment Confirmation - Sricore Solutions",
          html: emailHtml,
        })
        .catch((error: unknown) => console.error("Email dispatch error:", error));
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
  applyApiSecurityHeaders(res);
  try {
    const parsed = SEND_EMAIL_SCHEMA.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || "Missing or invalid email parameters",
      });
    }

    const { to, subject, html, body, text } = parsed.data;
    const rawText = body || text || "";
    const resolvedHtml =
      html ||
      (rawText
        ? `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${escapeHtml(
            rawText
          )}</div>`
        : "");

    if (!resolvedHtml) {
      return res.status(400).json({ error: "Email content (html or body) is required" });
    }

    const sanitizedSubject = subject.replace(/[\r\n]+/g, " ").trim();
    const transporter = getMailTransporter();

    if (!transporter || !process.env.SMTP_USER) {
      return res.status(200).json({
        status: "simulated",
        message: "Email simulated (SMTP not configured)",
      });
    }

    const info = await transporter.sendMail({
      from: `"Sricore Solutions" <${process.env.SMTP_USER}>`,
      to,
      subject: sanitizedSubject,
      html: resolvedHtml,
      text: rawText || undefined,
    });

    return res.status(200).json({ status: "success", messageId: info.messageId });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: getErrorMessage(error, "Failed to send email"),
    });
  }
}
