const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'emirhankurtulus.com',
  port: 465,
  secure: true,
  auth: {
    user: 'hello@emirhankurtulus.com',
    pass: 'Kalamoz.53',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function testMail() {
  try {
    console.log('Sending test email via MailEnable SMTP...');
    const info = await transporter.sendMail({
      from: 'hello@emirhankurtulus.com', // Plain email address matching MailEnable account
      to: 'hello@emirhankurtulus.com', // sending to self first to verify inbox delivery
      subject: 'Prompt2Form Direct SMTP Test',
      text: 'This is a test email sent using plain SMTP address format.',
      html: '<b>This is a test email sent using plain SMTP address format.</b>',
    });
    console.log('Success! MessageId:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('SMTP Error:', err);
  }
}

testMail();
