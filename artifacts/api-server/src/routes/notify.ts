import { Router } from "express";
import nodemailer from "nodemailer";
import twilio from "twilio";

const router = Router();

function buildEmailContent(body: Record<string, unknown>) {
  const { type, name, email, phone, code, docTitle, fileName, docs, loanType, employment, goal, profileItems, estimate, scenarios } = body as {
    type: string;
    name?: string;
    email?: string;
    phone?: string;
    code?: string;
    docTitle?: string;
    fileName?: string;
    docs?: string[];
    loanType?: string;
    employment?: string;
    goal?: string;
    profileItems?: string[];
    estimate?: string;
    scenarios?: string[];
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (type === "document") {
    return {
      subject: `LoansBetter — New Document: ${docTitle} — ${code}`,
      text: [
        `New Document Uploaded`,
        ``,
        `From: ${name || "Client"}`,
        email ? `Email: ${email}` : null,
        phone ? `Phone: ${phone}` : null,
        ``,
        `Document: ${docTitle}`,
        `File: ${fileName}`,
        ``,
        `Client Code: ${code}`,
        `Date: ${dateStr}`,
        ``,
        `--`,
        `Sent automatically via LoansBetter`,
      ]
        .filter((l) => l !== null)
        .join("\n"),
    };
  }

  if (type === "profile") {
    const profileLines = profileItems && profileItems.length > 0
      ? profileItems.map((item) => `  • ${item}`)
      : ["  None"];
    const scenarioLines = scenarios && scenarios.length > 0
      ? scenarios.map((s) => `  • ${s}`)
      : null;
    return {
      subject: `LoansBetter — ${name || "Client"} — ${code}`,
      text: [
        `LoansBetter Client Summary`,
        ``,
        `From: ${name || "Client"}`,
        email ? `Email: ${email}` : null,
        phone ? `Phone: ${phone}` : null,
        ``,
        `Goal: ${goal || "Not specified"}`,
        `Employment: ${employment || "Not specified"}`,
        `Client Code: ${code}`,
        `Date: ${dateStr}`,
        ``,
        `PROFILE:`,
        ...profileLines,
        ``,
        `ESTIMATE:`,
        `  ${estimate || "Not available"}`,
        ...(scenarioLines ? [``, `SCENARIOS EXPLORED:`, ...scenarioLines] : []),
        ``,
        `--`,
        `Submitted via LoansBetter`,
      ]
        .filter((l) => l !== null)
        .join("\n"),
    };
  }

  const docLines = docs && docs.length > 0 ? docs.map((d) => `  • ${d}`) : ["  None"];
  return {
    subject: `LoansBetter — ${name || "Client"} — ${code}`,
    text: [
      `LoansBetter Document Submission`,
      ``,
      `From: ${name || "Client"}`,
      email ? `Email: ${email}` : null,
      phone ? `Phone: ${phone}` : null,
      ``,
      `Client Code: ${code}`,
      `Loan Type: ${loanType || "Not specified"}`,
      `Employment: ${employment || "Not specified"}`,
      `Date: ${dateStr}`,
      ``,
      `UPLOADED DOCUMENTS (${docs?.length ?? 0}):`,
      ...docLines,
      ``,
      `--`,
      `Submitted via LoansBetter`,
    ]
      .filter((l) => l !== null)
      .join("\n"),
  };
}

function buildSmsBody(body: Record<string, unknown>): string {
  const { type, name, code, docTitle, fileName, docs, loanType } = body as {
    type: string;
    name?: string;
    code?: string;
    docTitle?: string;
    fileName?: string;
    docs?: string[];
    loanType?: string;
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (type === "document") {
    return [
      `LoansBetter — ${name || "Client"}`,
      `New document uploaded: ${docTitle}`,
      `File: ${fileName}`,
      `Client Code: ${code}`,
      `Date: ${dateStr}`,
    ].join("\n");
  }

  const docLines = docs && docs.length > 0 ? docs.map((d) => `• ${d}`).join("\n") : "None";
  return [
    `LoansBetter — ${name || "Client"}`,
    `Submission confirmed for ${loanType || "mortgage"}.`,
    ``,
    `Documents submitted (${docs?.length ?? 0}):`,
    docLines,
    ``,
    `Client Code: ${code}`,
    `Date: ${dateStr}`,
  ].join("\n");
}

router.post("/notify", async (req, res) => {
  const { email, phone } = req.body as { email?: string; phone?: string };

  const gmailUser = process.env["GMAIL_USER"];
  const gmailPass = process.env["GMAIL_APP_PASSWORD"];
  const twilioSid = process.env["TWILIO_ACCOUNT_SID"];
  const twilioToken = process.env["TWILIO_AUTH_TOKEN"];
  const twilioPhone = process.env["TWILIO_PHONE_NUMBER"];

  const results: { email?: string; sms?: string; errors: string[] } = { errors: [] };
  const { subject, text } = buildEmailContent(req.body as Record<string, unknown>);

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      const to = ["parkpreston11@gmail.com"];
      if (email && email !== gmailUser) to.push(email);

      await transporter.sendMail({
        from: `"LoansBetter" <${gmailUser}>`,
        to: to.join(", "),
        subject,
        text,
      });
      results.email = "sent";
    } catch (err) {
      req.log.error({ err }, "Email send failed");
      results.errors.push(`Email failed: ${String(err)}`);
    }
  } else {
    results.errors.push("Email not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing)");
  }

  if (phone && !email && twilioSid && twilioToken && twilioPhone) {
    try {
      const client = twilio(twilioSid, twilioToken);
      await client.messages.create({
        body: buildSmsBody(req.body as Record<string, unknown>),
        from: twilioPhone,
        to: phone,
      });
      results.sms = "sent";
    } catch (err) {
      req.log.error({ err }, "SMS send failed");
      results.errors.push(`SMS failed: ${String(err)}`);
    }
  }

  res.json({ ok: true, ...results });
});

export default router;
