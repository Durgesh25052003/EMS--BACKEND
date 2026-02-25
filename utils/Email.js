const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

class Email {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.RESEND_FROM;
  }

  async sendMailWelcome(toEmail, subject, name, email, password, loginlink) {
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'utils', 'emailTemplate.html'), 'utf-8')
    const content = emailTemplate.replace(/{name}/g, name)
      .replace(/{email}/g, email)
      .replace(/{login_link}/g, `${loginlink}`)
      .replace(/{password}/g, password)

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: toEmail,
        subject: subject,
        html: content
      });
      if (error) throw error;
      console.log('Welcome email sent successfully:', data?.id);
    } catch (error) {
      console.error('Email error:', error?.message || error);
    }
  }

  async sendMailForgetPassword(toEmail, subject, name, reset_link) {
    const emailTemplateResetPass = fs.readFileSync(path.join(__dirname, '..', 'utils', 'emailTemplateResetPass.html'), 'utf-8')
    
    const content = emailTemplateResetPass.replace(/{name}/g, name)
      .replace(/{reset_link}/g, reset_link)

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: toEmail,
        subject: subject,
        html: content
      });
      if (error) throw error;
      console.log('Reset password email sent successfully:', data?.id);
    } catch (error) {
      console.error('Email error:', error?.message || error);
    }
  }
}

module.exports = Email;