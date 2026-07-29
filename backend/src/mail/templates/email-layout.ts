export const BRAND = {
  primary: '#C0612B', // rust orange from the Gobadi cattle mark
  primaryDark: '#9C4E22',
  text: '#4E4540',
  textMuted: '#8A8078',
  background: '#F3F1EC',
  card: '#FFFFFF',
  border: '#E7E1D8',
};

export const LOGO_CID = 'gobadi-logo';

interface EmailLayoutOptions {
  preheader: string;
  heading: string;
  bodyHtml: string;
}

// Table-based, inline-styled layout for maximum email-client compatibility
// (Outlook desktop in particular ignores most CSS outside of inline attrs).
export function renderEmailLayout({
  preheader,
  heading,
  bodyHtml,
}: EmailLayoutOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gobadi</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.background}; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="cid:${LOGO_CID}" width="56" height="56" alt="Gobadi" style="display:block; border-radius:14px;" />
                <div style="margin-top:8px; font-size:20px; font-weight:700; color:${BRAND.text}; letter-spacing:0.2px;">Gobadi</div>
              </td>
            </tr>
            <tr>
              <td style="background-color:${BRAND.card}; border:1px solid ${BRAND.border}; border-radius:16px; padding:32px 28px;">
                <h1 style="margin:0 0 16px; font-size:18px; color:${BRAND.text};">${heading}</h1>
                <div style="font-size:15px; line-height:1.6; color:${BRAND.text};">
                  ${bodyHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:24px; font-size:12px; color:${BRAND.textMuted};">
                Gobadi App &middot; This is an automated message, please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="border-radius:10px; background-color:${BRAND.primary};"><a href="${href}" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">${label}</a></td></tr></table>`;
}

export function renderOtpCode(otp: string): string {
  return `<div style="margin:20px 0; text-align:center;"><span style="display:inline-block; padding:14px 28px; border-radius:12px; background-color:${BRAND.background}; border:1px dashed ${BRAND.primary}; font-size:28px; font-weight:700; letter-spacing:8px; color:${BRAND.primaryDark};">${otp}</span></div>`;
}
