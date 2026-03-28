import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.resendApiKey);

export async function sendDownloadEmail(params: {
  to: string;
  beatTitle: string;
  downloadUrl: string;
  expiresAtIso: string;
}) {
  const expiresAt = new Date(params.expiresAtIso).toUTCString();

  await resend.emails.send({
    from: env.emailFrom,
    to: params.to,
    subject: `${params.beatTitle} is ready`,
    html: `
      <div style="margin:0;padding:32px 20px;background:#090312;color:#f5f0ff;font-family:Georgia,'Times New Roman',serif;">
        <div style="max-width:640px;margin:0 auto;border:1px solid rgba(214,187,113,.4);background:linear-gradient(180deg,#120421 0%,#090312 100%);box-shadow:0 0 0 1px rgba(255,255,255,.04) inset;">
          <div style="padding:28px 28px 18px;border-bottom:1px solid rgba(214,187,113,.22);text-align:center;">
            <p style="margin:0 0 10px;color:#d6bb71;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Gambinoflp</p>
            <h1 style="margin:0;color:#fff6d8;font-size:30px;line-height:1.1;">Your order is ready</h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 16px;color:#e9ddff;font-size:16px;line-height:1.7;">
              Thank you for your purchase. Your download for <strong style="color:#fff6d8;">${params.beatTitle}</strong> is unlocked and ready.
            </p>
            <div style="margin:24px 0;padding:20px;border:1px solid rgba(214,187,113,.2);background:rgba(255,255,255,.03);text-align:center;">
              <a href="${params.downloadUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(180deg,#d13f34 0%,#8d1713 100%);color:#fff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                Download Kit
              </a>
              <p style="margin:14px 0 0;color:#cbbde6;font-size:12px;line-height:1.6;word-break:break-all;">
                ${params.downloadUrl}
              </p>
            </div>
            <p style="margin:0 0 12px;color:#cbbde6;font-size:14px;line-height:1.7;">
              This private download link expires on <strong style="color:#fff6d8;">${expiresAt}</strong>.
            </p>
            <p style="margin:0;color:#9f8ec0;font-size:13px;line-height:1.7;">
              For support, contact <strong style="color:#fff6d8;">gambinoflpp@gmail.com</strong> or send an Instagram DM to <strong style="color:#fff6d8;">@gambino.flp</strong>.
            </p>
          </div>
        </div>
      </div>
    `
  });
}
