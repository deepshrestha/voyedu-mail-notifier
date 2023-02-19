require('dotenv').config()
const chokidar = require('chokidar');
const express = require('express');
const path = require("path")
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const { sendInvoiceEmail, sendAppointmentEmail } = require('./src/helpers/MailSender');
const Customer = require('./src/models/Customer');
const Booking = require('./src/models/Booking');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.body)
    // req.body.bookingId = 1;
    fs.mkdirSync(`uploads/invoices/${req.body.bookingId}`, { recursive: true });
    cb(null, `uploads/invoices/${req.body.bookingId}`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now()+".pdf")
  }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;
    
var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
    
        // Set the filetypes, it is optional
        var filetypes = /pdf/;
        var mimetype = filetypes.test(file.mimetype);
        
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        console.log("error")
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
}).single("invoice"); 

app.use(upload); 

app.post('/email-api/invoice', (req, res) => {
  upload(req, res, function (err) {
    /* if(err) {
      console.log("error", err)
      res.send(err)
    }
    else {
      res.send("Success, Image uploaded!")
    } */
  })
  // res.json({message: req.body})
});

app.post('/email-api/appointment', (req, res) => {
  const booking = new Booking({
    booking_id: req.body.bookingId
  });

  Booking.getAppointmentDetails(booking, async (err, data) => {
    if (err)
        res.status(500).send({
            success: false,
            message:
                err.message || "Some error occurred."
        });
    else {
      let isEmailSent = await sendAppointmentEmail(data);
      if(isEmailSent) res.send({success: true, "message": "Success" });
      else res.send({success: false, "message": "Error sending email" });
    }
  })
})

const watcher = chokidar.watch('./uploads')

watcher
  .on('add', async path => {
    const customer = new Customer({
      booking_id: path.split("\\")[2] ? path.split("\\")[2]: path.split("/")[2]
    });
    Customer.findByBookingId(customer, async (err, email) => {
      if(err) {
        switch (err.kind) {
          case "not_found":
              console.log(`User not found.`)
              break;
          
          default:
            console.log(err)
            console.log(`Internal server error`)
            break;
        }
      } else {
        let mailSuccess = await sendInvoiceEmail(email, path)
        if(mailSuccess) {
          // fs.unlink(path, (err) => {
          //   if (err) throw err //handle your error the way you want to;
          // });
          await unlinkAsync(path)
          console.log("finished")
        }
      }
    });
    
    
  })
  .on('unlink', async path => {
    console.log(`File ${path} has been removed`)
  });

const port = 3002;

app.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});
