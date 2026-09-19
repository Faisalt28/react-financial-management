export async function sendOtpEmail({
  toEmail,
  otp,
  apiKey,
  fromEmail = 'AcheeZ <onboarding@resend.dev>',
}: {
  toEmail: string
  otp: string
  apiKey?: string
  fromEmail?: string
}): Promise<{ success: boolean; error?: string; devOtp?: string }> {
  // If no Resend API key configured yet, return development simulation
  if (!apiKey) {
    console.warn(`[DEV MODE] Resend API key not configured. OTP for ${toEmail} is: ${otp}`)
    return {
      success: true,
      devOtp: otp,
    }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `Kode Verifikasi Reset Password: ${otp}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
                .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .logo { font-size: 20px; font-weight: 700; color: #09090b; margin-bottom: 24px; text-align: center; }
                .title { font-size: 18px; font-weight: 600; color: #18181b; margin-bottom: 12px; text-align: center; }
                .desc { font-size: 14px; color: #71717a; line-height: 1.5; text-align: center; margin-bottom: 24px; }
                .otp-box { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #09090b; margin: 20px 0; }
                .footer { font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 24px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">AcheeZ</div>
                <div class="title">Reset Kata Sandi Anda</div>
                <div class="desc">Kami menerima permintaan untuk mereset kata sandi akun AcheeZ Anda. Gunakan kode verifikasi (OTP) di bawah ini untuk melanjutkan:</div>
                <div class="otp-box">${otp}</div>
                <div class="desc" style="margin-bottom:0">Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan berikan kode ini kepada siapapun.</div>
                <div class="footer">Jika Anda tidak meminta reset kata sandi, abaikan email ini.</div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('Resend API error:', errData)
      return { success: false, error: (errData as any).message || 'Gagal mengirim email verifikasi' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Failed to send email:', err)
    return { success: false, error: err.message || 'Gagal mengirim email' }
  }
}
