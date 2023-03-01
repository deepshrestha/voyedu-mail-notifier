const nodemailer = require("nodemailer");
const fs = require('fs');


// create reusable transporter object using the default SMTP transport
var smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // use SSL
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
};
var transporter = nodemailer.createTransport(smtpConfig);

// setup e-mail data with unicode symbols
var mailOptions = {
  from: '"Voyedu " <admin@voyedu>', // sender address
  to: "", // list of receivers
  subject: "", // Subject line
  text: "", // plaintext body
  html: "", // html body
  attachments: []
};

exports.sendAppointmentEmail = (data) => {
  return new Promise((resolve,reject)=>{
    mailOptions.to = process.env.SERVICE_PROVIDER_EMAIL;
    mailOptions.subject = `Regarding booking appointment`;
    mailOptions.html = `<div> Dear user, <br/><br/> 
      A new booking appointment has been created for date <strong>${data.date}</strong> at <strong>${data.time}</strong> 
      <br/>

      Thank you. <br/><br/> Regards, <br/>Voyedu
      </div>`;
    // send mail with defined transport object
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        // res.status(500).send({"message" : "An error has occurred while sending email"});
        console.log("An error has occurred while sending email")
        resolve(false);
      }
      else {
        // res.status(200).send({"message" : "OTP has been sent successfully. Please check your email."});
        console.log("Appointment mail has been sent successfully")
        resolve(true)
      }
    });

  })
}

exports.sendInvoiceEmail = (email, path) => {
  return new Promise((resolve,reject)=>{
    mailOptions.to = email;
    mailOptions.subject = `Regarding invoice for booking`;
    mailOptions.html = `<div> Dear user, <br/><br/> Your booking invoice has been attached with this email <br/>
    Please find it.
    <br/>

    Thank you. <br/><br/> Regards, <br/>Voyedu
    </div>`;
    mailOptions.attachments.push({
        filename: `invoice-${new Date().getTime()}.pdf`,
        content: fs.createReadStream(path)
    });
    // send mail with defined transport object
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        // res.status(500).send({"message" : "An error has occurred while sending email"});
        console.log(error);
        console.log("An error has occurred while sending email")
        resolve(false);
      }
      else {
        // res.status(200).send({"message" : "OTP has been sent successfully. Please check your email."});
        console.log("Invoice mail has been sent successfully")
        /* return new Promise((resolveFile, rejectFile) => {
            fs.unlink(path, (err) => {
                if (err) throw err //handle your error the way you want to;
                if(!err) console.log("resolving....")
                if(!err) resolve(true);
            });
        }) */
        // await unlinkAsync(path)
        resolve(true)
      }
    });
  });
};

