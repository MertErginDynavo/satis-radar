// E-posta servisi - Nodemailer ile gerçek e-posta gönderimi
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// SMTP Transporter oluştur
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

// E-posta gönderme helper fonksiyonu
async function sendEmail(to, subject, html, text) {
  try {
    // Eğer EMAIL_USER ayarlanmamışsa, sadece console'a yaz
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'demo@satisradar.com') {
      console.log('📧 E-posta gönderimi (DEMO MODE - SMTP ayarlanmamış):');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('---');
      return { success: true, mode: 'demo' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Satış Radar <noreply@satisradar.com>',
      to,
      subject,
      html,
      text
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ E-posta gönderildi:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendTrialEndingEmail(hotelName, adminEmail) {
  const subject = `${hotelName} - Satış Radar Deneme Süreniz Sona Eriyor`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af;">Merhaba ${hotelName} ekibi,</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Satış Radar 7 günlük deneme süreniz bugün sona eriyor ⏳
      </p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-weight: bold; margin-bottom: 10px;">Deneme boyunca:</p>
        <ul style="line-height: 1.8;">
          <li>Follow-up'larınızı tek ekranda yönettiniz</li>
          <li>Tekliflerinizi ve gelir potansiyelinizi takip ettiniz</li>
          <li>Ekibinizin performansını raporladınız</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Kullanmaya devam etmek için yıllık aboneliğinizi şimdi kolayca başlatabilirsiniz.
      </p>
      
      <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;">🔹 <strong>Yıllık Paket:</strong> 1.990 TL + KDV (4 kullanıcı dahil)</p>
        <p style="margin: 5px 0;">🔹 <strong>Ek Kullanıcı:</strong> 350 TL + KDV / yıl</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.PAYMENT_URL || 'http://localhost:3000/subscription'}" 
           style="background-color: #1e40af; color: white; padding: 15px 40px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; 
                  display: inline-block;">
          👉 Aboneliği Başlat
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Herhangi bir sorunuz olursa bize dilediğiniz zaman ulaşabilirsiniz.
      </p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        İyi satışlar dileriz,<br>
        <strong>Satış Radar Ekibi</strong>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        © 2024 Satış Radar. Tüm hakları saklıdır.<br>
        <a href="mailto:destek@satisradar.com" style="color: #1e40af;">destek@satisradar.com</a>
      </p>
    </div>
  `;

  const text = `
Merhaba ${hotelName} ekibi,

Satış Radar 7 günlük deneme süreniz bugün sona eriyor ⏳

Deneme boyunca:
- Follow-up'larınızı tek ekranda yönettiniz
- Tekliflerinizi ve gelir potansiyelinizi takip ettiniz
- Ekibinizin performansını raporladınız

Kullanmaya devam etmek için yıllık aboneliğinizi şimdi kolayca başlatabilirsiniz.

🔹 Yıllık Paket: 1.990 TL + KDV (4 kullanıcı dahil)
🔹 Ek Kullanıcı: 350 TL + KDV / yıl

👉 Aboneliği başlatmak için: ${process.env.PAYMENT_URL || 'http://localhost:3000/subscription'}

Herhangi bir sorunuz olursa bize dilediğiniz zaman ulaşabilirsiniz.

İyi satışlar dileriz,
Satış Radar Ekibi
  `;

  return await sendEmail(adminEmail, subject, html, text);
}

export async function sendTrialEndedEmail(hotelName, adminEmail) {
  const subject = `${hotelName} - Satış Radar Deneme Süreniz Sona Erdi`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af;">Merhaba ${hotelName} ekibi,</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Satış Radar 7 günlük deneme süreniz sona erdi.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Satış süreçlerinizi dijitalleştirmeye devam etmek için aboneliğinizi başlatabilirsiniz.
      </p>
      
      <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;">🔹 <strong>Yıllık Paket:</strong> 1.990 TL + KDV (4 kullanıcı dahil)</p>
        <p style="margin: 5px 0;">🔹 <strong>Ek Kullanıcı:</strong> 350 TL + KDV / yıl</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.PAYMENT_URL || 'http://localhost:3000/subscription'}" 
           style="background-color: #1e40af; color: white; padding: 15px 40px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; 
                  display: inline-block;">
          Aboneliği Başlat
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Sorularınız için: <a href="mailto:destek@satisradar.com">destek@satisradar.com</a>
      </p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        İyi satışlar dileriz,<br>
        <strong>Satış Radar Ekibi</strong>
      </p>
    </div>
  `;

  const text = `
Merhaba ${hotelName} ekibi,

Satış Radar 7 günlük deneme süreniz sona erdi.

Satış süreçlerinizi dijitalleştirmeye devam etmek için aboneliğinizi başlatabilirsiniz.

🔹 Yıllık Paket: 1.990 TL + KDV (4 kullanıcı dahil)
🔹 Ek Kullanıcı: 350 TL + KDV / yıl

Aboneliği başlatmak için: ${process.env.PAYMENT_URL || 'http://localhost:3000/subscription'}

Sorularınız için: destek@satisradar.com

İyi satışlar dileriz,
Satış Radar Ekibi
  `;

  return await sendEmail(adminEmail, subject, html, text);
}

export async function sendWelcomeEmail(hotelName, adminEmail, adminName) {
  const subject = `${hotelName} - Satış Radar'a Hoş Geldiniz! 🎉`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af;">Merhaba ${adminName},</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Satış Radar'a hoş geldiniz! 🎉
      </p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>${hotelName}</strong> için 7 günlük ücretsiz deneme süreniz başladı.
      </p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-weight: bold; margin-bottom: 10px;">Hemen başlayın:</p>
        <ul style="line-height: 1.8;">
          <li>Follow-up'larınızı ekleyin ve takip edin</li>
          <li>Firma ve acenta bilgilerinizi kaydedin</li>
          <li>Ekip üyelerinizi davet edin (4 kullanıcı dahil)</li>
          <li>Raporlarınızı görüntüleyin</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" 
           style="background-color: #1e40af; color: white; padding: 15px 40px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; 
                  display: inline-block;">
          Hemen Başla
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Yardıma mı ihtiyacınız var? Bize <a href="mailto:destek@satisradar.com">destek@satisradar.com</a> adresinden ulaşabilirsiniz.
      </p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        İyi satışlar dileriz,<br>
        <strong>Satış Radar Ekibi</strong>
      </p>
    </div>
  `;

  const text = `
Merhaba ${adminName},

Satış Radar'a hoş geldiniz! 🎉

${hotelName} için 7 günlük ücretsiz deneme süreniz başladı.

Hemen başlayın:
- Follow-up'larınızı ekleyin ve takip edin
- Firma ve acenta bilgilerinizi kaydedin
- Ekip üyelerinizi davet edin (4 kullanıcı dahil)
- Raporlarınızı görüntüleyin

Hemen başlamak için: ${process.env.APP_URL || 'http://localhost:3000'}

Yardıma mı ihtiyacınız var? Bize destek@satisradar.com adresinden ulaşabilirsiniz.

İyi satışlar dileriz,
Satış Radar Ekibi
  `;

  return await sendEmail(adminEmail, subject, html, text);
}

// Kullanıcı davet e-postası
export async function sendUserInviteEmail(hotelName, userEmail, userName, tempPassword, inviterName) {
  const subject = `${hotelName} - Satış Radar'a Davet Edildiniz`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af;">Merhaba ${userName},</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>${inviterName}</strong> sizi <strong>${hotelName}</strong> ekibine Satış Radar'a davet etti! 🎉
      </p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-weight: bold; margin-bottom: 10px;">Giriş Bilgileriniz:</p>
        <p style="margin: 5px 0;"><strong>E-posta:</strong> ${userEmail}</p>
        <p style="margin: 5px 0;"><strong>Geçici Şifre:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 4px;">${tempPassword}</code></p>
      </div>
      
      <p style="font-size: 14px; color: #dc2626; line-height: 1.6;">
        ⚠️ İlk girişinizde şifrenizi değiştirmenizi öneririz.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" 
           style="background-color: #1e40af; color: white; padding: 15px 40px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; 
                  display: inline-block;">
          Giriş Yap
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Sorularınız için: <a href="mailto:destek@satisradar.com">destek@satisradar.com</a>
      </p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        İyi satışlar dileriz,<br>
        <strong>Satış Radar Ekibi</strong>
      </p>
    </div>
  `;

  const text = `
Merhaba ${userName},

${inviterName} sizi ${hotelName} ekibine Satış Radar'a davet etti! 🎉

Giriş Bilgileriniz:
E-posta: ${userEmail}
Geçici Şifre: ${tempPassword}

⚠️ İlk girişinizde şifrenizi değiştirmenizi öneririz.

Giriş yapmak için: ${process.env.APP_URL || 'http://localhost:3000'}/login

Sorularınız için: destek@satisradar.com

İyi satışlar dileriz,
Satış Radar Ekibi
  `;

  return await sendEmail(userEmail, subject, html, text);
}

// Şifre sıfırlama e-postası
export async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const subject = 'Satış Radar - Şifre Sıfırlama';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af;">Merhaba ${userName},</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Şifre sıfırlama talebiniz alındı. Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #1e40af; color: white; padding: 15px 40px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; 
                  display: inline-block;">
          Şifremi Sıfırla
        </a>
      </div>
      
      <p style="font-size: 14px; color: #dc2626; line-height: 1.6;">
        ⚠️ Bu link 1 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      </p>
      
      <p style="font-size: 12px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
        Link çalışmıyorsa, aşağıdaki URL'i tarayıcınıza kopyalayın:<br>
        <code style="background: #f3f4f6; padding: 5px; display: block; margin-top: 10px; word-break: break-all;">${resetUrl}</code>
      </p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        İyi satışlar dileriz,<br>
        <strong>Satış Radar Ekibi</strong>
      </p>
    </div>
  `;

  const text = `
Merhaba ${userName},

Şifre sıfırlama talebiniz alındı. Aşağıdaki linke tıklayarak yeni şifrenizi oluşturabilirsiniz.

${resetUrl}

⚠️ Bu link 1 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.

İyi satışlar dileriz,
Satış Radar Ekibi
  `;

  return await sendEmail(userEmail, subject, html, text);
}
