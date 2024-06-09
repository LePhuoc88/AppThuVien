const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    const { recipient, subject, html } = req.body; 

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'letanphuoc08082002tpk@gmail.com', 
            pass: 'nmmnirigudvcyxgd' 
        }
    });

    const mailOptions = {
        from: 'Hệ thống Quản lý Thư Viện', 
        to: recipient,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});