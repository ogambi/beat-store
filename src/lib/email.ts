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
      <div style="margin:0;padding:48px 18px;background:#07040d;background-image:radial-gradient(circle at top, rgba(139,47,247,.12), transparent 34%), linear-gradient(180deg, rgba(139,47,247,.08) 0%, rgba(139,47,247,0) 34%);color:#f5f3f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
        <div style="max-width:620px;margin:0 auto;border-radius:28px;border:1px solid rgba(255,255,255,.08);background:#111015;box-shadow:0 24px 80px rgba(0,0,0,.42);overflow:hidden;">
          <div style="padding:34px 28px 20px;text-align:center;background:linear-gradient(180deg,rgba(139,47,247,.10),rgba(139,47,247,0));">
            <p style="margin:0 0 10px;color:#8B2FF7;font-size:12px;letter-spacing:2.8px;text-transform:uppercase;font-weight:600;">Gambino.flp</p>
            <h1 style="margin:0;color:#ffffff;font-size:36px;line-height:1.04;font-weight:700;letter-spacing:-0.03em;">Your drum kit is ready</h1>
          </div>
          <div style="padding:0 28px 30px;">
            <div style="padding:24px 22px;border-radius:22px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.025);">
              <p style="margin:0 0 10px;color:#8B2FF7;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Order complete</p>
              <p style="margin:0;color:#e9e6ef;font-size:18px;line-height:1.75;letter-spacing:-0.01em;">
                Thank you for your purchase. <strong style="color:#ffffff;font-weight:700;">${params.beatTitle}</strong> is unlocked and ready to download.
              </p>
            </div>
            <div style="margin:22px 0 18px;padding:26px 20px;border-radius:22px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);text-align:center;">
              <a href="${params.downloadUrl}" style="display:inline-block;padding:15px 30px;border-radius:999px;background:#b8302a;border:1px solid rgba(255,255,255,.10);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.02em;box-shadow:0 10px 26px rgba(139,47,247,.14);">
                Download Kit
              </a>
              <p style="margin:16px 0 0;color:#9b93aa;font-size:13px;line-height:1.7;">
                If the button does not open, copy and paste this link into your browser:
              </p>
              <p style="margin:10px 0 0;color:#c9c4d4;font-size:12px;line-height:1.75;word-break:break-all;">
                ${params.downloadUrl}
              </p>
            </div>
            <p style="margin:0;color:#9b93aa;font-size:13px;line-height:1.8;text-align:center;">
              For support, contact <strong style="color:#ffffff;font-weight:600;">gambinoflpp@gmail.com</strong> or send an Instagram DM to <strong style="color:#ffffff;font-weight:600;">@gambino.flp</strong>.
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
