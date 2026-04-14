import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.resendApiKey);

export async function sendDownloadEmail(params: {
  to: string;
  beatTitle: string;
  downloadUrl: string;
  expiresAtIso: string;
}) {
  const result = await resend.emails.send({
    from: env.emailFrom,
    to: params.to,
    subject: "Gambino.flp Drum Kit",
    html: `
      <div style="margin:0;padding:40px 16px;background:#090312;background-image:radial-gradient(circle at top, rgba(92,28,145,.32), transparent 40%), radial-gradient(circle at bottom, rgba(209,63,52,.16), transparent 36%);color:#f7f2ff;font-family:Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;border:1px solid rgba(214,187,113,.28);background:linear-gradient(180deg,#120421 0%,#0b0315 100%);box-shadow:0 24px 60px rgba(0,0,0,.45);overflow:hidden;">
          <div style="padding:18px 24px;border-bottom:1px solid rgba(214,187,113,.18);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0));text-align:center;">
            <p style="margin:0 0 8px;color:#d6bb71;font-size:12px;letter-spacing:4px;text-transform:uppercase;font-weight:700;">Gambino.flp</p>
            <h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.05;font-weight:800;">Your drum kit is ready</h1>
          </div>
          <div style="padding:28px 24px 30px;">
            <div style="margin:0 0 22px;padding:18px 20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);">
              <p style="margin:0 0 8px;color:#cdbde9;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Order complete</p>
              <p style="margin:0;color:#f7f2ff;font-size:18px;line-height:1.7;">
                Thank you for your purchase. <strong style="color:#fff6d8;">${params.beatTitle}</strong> is unlocked and ready to download.
              </p>
            </div>
            <div style="margin:24px 0;padding:28px 18px;border:1px solid rgba(214,187,113,.18);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));text-align:center;">
              <a href="${params.downloadUrl}" style="display:inline-block;padding:16px 34px;background:linear-gradient(180deg,#d13f34 0%,#8d1713 100%);border:1px solid rgba(255,255,255,.12);color:#fff;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;box-shadow:0 14px 30px rgba(141,23,19,.35);">
                Download Kit
              </a>
              <p style="margin:14px 0 0;color:#9f8ec0;font-size:13px;line-height:1.7;">
                If the button does not open, copy and paste this link into your browser:
              </p>
              <p style="margin:10px 0 0;color:#cbbde6;font-size:12px;line-height:1.7;word-break:break-all;">
                ${params.downloadUrl}
              </p>
            </div>
            <p style="margin:0;color:#a998c8;font-size:13px;line-height:1.8;text-align:center;">
              For support, contact <strong style="color:#fff6d8;">gambinoflpp@gmail.com</strong> or send an Instagram DM to <strong style="color:#fff6d8;">@gambino.flp</strong>.
            </p>
          </div>
        </div>
      </div>
    `
  });

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
}
