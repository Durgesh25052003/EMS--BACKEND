const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class Email {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // App Password, not regular password
      }
    });
  }

  async sendMailWelcome(toEmail, subject, name, email, password, loginlink) {
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'utils', 'emailTemplate.html'), 'utf-8')
    console.log(loginlink)
    const content = emailTemplate.replace(/{name}/g, name)
      .replace(/{email}/g, email)
      .replace(/{login_link}/g, `${loginlink}`)
      .replace(/{password}/g, password)

    try {
      const info = await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: subject,
        html: content
      });
      console.log('Welcome email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  async sendMailForgetPassword(toEmail, subject, name, reset_link) {
    const emailTemplateResetPass = fs.readFileSync(path.join(__dirname, '..', 'utils', 'emailTemplateResetPass.html'), 'utf-8')
    
    const content = emailTemplateResetPass.replace(/{name}/g, name)
      .replace(/{reset_link}/g, reset_link)

    try {
      const info = await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: subject,
        html: content
      });
      console.log('Reset password email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Email error:', error);
    }
  }
}

module.exports = Email;