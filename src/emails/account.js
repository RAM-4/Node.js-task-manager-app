const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'hamard91@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'hamard91@gmail.com',
    subject: 'We are sad you are leaving us :(',
    text: 'But so be it !'
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
