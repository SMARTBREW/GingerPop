import nodemailer from "nodemailer";
import { inviteExpiresAt } from "@/lib/invitation-expiry";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function extractEmailAddress(from: string) {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

function formatFromAddress(adminName: string) {
  const base = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "quiz@app.local";
  const email = extractEmailAddress(base);
  return `"${adminName} via Ginger Pop" <${email}>`;
}

function formatExpiryDate(expiresAt?: Date) {
  const date = expiresAt ?? inviteExpiresAt();
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildInviteEmailContent({
  courseTitle,
  inviteLink,
  adminName,
  adminEmail,
  isQuizOnly,
  expiresAt,
}: {
  courseTitle: string;
  inviteLink: string;
  adminName: string;
  adminEmail?: string;
  isQuizOnly?: boolean;
  expiresAt?: Date;
}) {
  const inviterLine = adminEmail
    ? `<strong>${adminName}</strong> (${adminEmail})`
    : `<strong>${adminName}</strong>`;

  const instructions = isQuizOnly
    ? "You have been invited to complete an assessment."
    : "Complete the lessons and take the assessments at the end of each lesson.";

  const subject = `${adminName} invited you to "${courseTitle}" on Ginger Pop`;

  const expiryLabel = formatExpiryDate(expiresAt);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #2a1410; background: #fff7f2; padding: 24px;">
      <div style="padding: 0 0 16px; border-bottom: 1px solid #f0ddd4;">
        <span style="font-size: 18px; font-weight: 600; color: #2a1410;">Ginger</span><span style="font-size: 18px; font-weight: 600; color: #ff2d55;">Pop</span>
      </div>
      <div style="padding: 32px 0 24px;">
        <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #2a1410;">You're invited</h1>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #6b4c42;">
          Hi there,
        </p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #6b4c42;">
          ${inviterLine} has invited you to join <strong style="color: #f0651f;">"${courseTitle}"</strong> on Ginger Pop.
        </p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #6b4c42;">
          ${instructions}
        </p>
        <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.5; color: #a8897e;">
          This link is valid for <strong style="color: #2a1410;">2 weeks</strong> and expires on <strong style="color: #2a1410;">${expiryLabel}</strong>.
        </p>
        <a href="${inviteLink}" style="display: inline-block; background: #f0651f; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          ${isQuizOnly ? "Start assessment" : "Start learning"}
        </a>
        <p style="margin: 28px 0 0; font-size: 13px; line-height: 1.5; color: #a8897e;">
          Or copy and paste this link into your browser:<br />
          <a href="${inviteLink}" style="color: #ff2d55; word-break: break-all; overflow-wrap: anywhere;">${inviteLink}</a>
        </p>
      </div>
      <div style="padding-top: 16px; border-top: 1px solid #f0ddd4;">
        <p style="margin: 0; font-size: 12px; color: #a8897e;">
          This invitation was sent by ${adminName}${adminEmail ? ` (${adminEmail})` : ""}. If you weren't expecting this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `;

  const text = [
    `You're invited to "${courseTitle}" on Ginger Pop`,
    "",
    `${adminName}${adminEmail ? ` (${adminEmail})` : ""} has invited you to join this course.`,
    "",
    instructions,
    "",
    "This link is valid for 2 weeks and expires on " + expiryLabel + ".",
    "",
    `${isQuizOnly ? "Start assessment" : "Start learning"}: ${inviteLink}`,
    "",
    `This invitation was sent by ${adminName}${adminEmail ? ` (${adminEmail})` : ""}.`,
  ].join("\n");

  return { subject, html, text };
}

export async function sendCourseInviteEmail({
  to,
  courseTitle,
  inviteLink,
  adminName,
  adminEmail,
  isQuizOnly,
  expiresAt,
}: {
  to: string;
  courseTitle: string;
  inviteLink: string;
  adminName: string;
  adminEmail?: string;
  isQuizOnly?: boolean;
  expiresAt?: Date;
}) {
  const from = formatFromAddress(adminName);
  const { subject, html, text } = buildInviteEmailContent({
    courseTitle,
    inviteLink,
    adminName,
    adminEmail,
    isQuizOnly,
    expiresAt,
  });

  const transporter = getTransporter();

  if (!transporter) {
    console.log("\n📧 SMTP not configured — invite link for", to);
    console.log(`   Invited by: ${adminName}${adminEmail ? ` (${adminEmail})` : ""}`);
    console.log(`   Course: ${courseTitle}`);
    console.log(`   Link: ${inviteLink}\n`);
    return { sent: false, logged: true };
  }

  await transporter.sendMail({ from, to, subject, html, text });
  return { sent: true, logged: false };
}

/** @deprecated use sendCourseInviteEmail */
export async function sendInviteEmail({
  to,
  quizTitle,
  courseTitle,
  inviteLink,
  adminName,
  adminEmail,
  expiresAt,
}: {
  to: string;
  quizTitle?: string;
  courseTitle?: string;
  inviteLink: string;
  adminName: string;
  adminEmail?: string;
  expiresAt?: Date;
}) {
  return sendCourseInviteEmail({
    to,
    courseTitle: courseTitle ?? quizTitle ?? "Course",
    inviteLink,
    adminName,
    adminEmail,
    isQuizOnly: true,
    expiresAt,
  });
}
