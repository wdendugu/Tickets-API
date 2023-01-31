const nodemailer = require('nodemailer')

const Email = (options) => {
  let transpoter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    secure: false,
    port: '587',
    tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
    },
    auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
    },
    debug: true,
    logger:true,
  });
  transpoter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
      return;
    }
  });
};

// Enviar correo
const EmailSender = ({ email, text}) => {
  const options = {
    from: `Tickets <${process.env.USER}>`,
    to: email,
    subject: 'Caso Asignado',
    html: text,
  };

  Email(options)
};

module.exports = EmailSender
