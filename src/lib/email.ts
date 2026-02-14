import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.resendApiKey);

export async function sendDownloadEmail(params: {
  to: string;
  beatTitle: string;
  downloadUrl: string;
  expiresAtIso: string;
}) {
  await resend.emails.send({
    from: env.emailFrom,
    to: params.to,
    subject: `Your beat is ready: ${params.beatTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
        <h2>Thank you for your order</h2>
        <p>Your purchase for <strong>${params.beatTitle}</strong> is confirmed.</p>
        <p>
          Download your archive here:<br />
          <a href="${params.downloadUrl}">${params.downloadUrl}</a>
        </p>
        <p>This link expires on ${new Date(params.expiresAtIso).toUTCString()}.</p>
      </div>
    `
  });
}
