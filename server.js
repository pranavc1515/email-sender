const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test email configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Routes

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Email Sender API is running',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, body, html } = req.body;

        // Validation
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient email (to) is required'
            });
        }

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: 'Email subject is required'
            });
        }

        if (!body && !html) {
            return res.status(400).json({
                success: false,
                message: 'Email body or HTML content is required'
            });
        }

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: body || '',
            html: html || body || ''
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Send email to multiple recipients
app.post('/api/send-bulk-email', async (req, res) => {
    try {
        const { recipients, subject, body, html } = req.body;

        // Validation
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipients array is required and must not be empty'
            });
        }

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: 'Email subject is required'
            });
        }

        if (!body && !html) {
            return res.status(400).json({
                success: false,
                message: 'Email body or HTML content is required'
            });
        }

        const results = [];
        const errors = [];

        // Send emails to each recipient
        for (const recipient of recipients) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: recipient,
                    subject: subject,
                    text: body || '',
                    html: html || body || ''
                };

                const info = await transporter.sendMail(mailOptions);
                results.push({
                    recipient,
                    success: true,
                    messageId: info.messageId
                });
            } catch (error) {
                errors.push({
                    recipient,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Bulk email operation completed. ${results.length} successful, ${errors.length} failed.`,
            results,
            errors,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Bulk email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk emails',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Email Sender API is running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/`);
    console.log(`Send email: POST http://localhost:${PORT}/api/send-email`);
    console.log(`Send bulk email: POST http://localhost:${PORT}/api/send-bulk-email`);
});
