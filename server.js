const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Email Sender API',
            version: '1.0.0',
            description: 'A REST API for sending emails using Gmail SMTP. Supports single and bulk email sending with both plain text and HTML content.',
            contact: {
                name: 'API Support',
                email: 'pranavc1515@gmail.com'
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
            {
                url: 'https://email-sender-rho-two.vercel.app',
                description: 'Production server',
            },
        ],
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints',
            },
            {
                name: 'Email',
                description: 'Email sending operations',
            },
        ],
    },
    apis: ['./server.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Email Sender API Documentation'
}));

// Test email configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Routes

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email Sender API is running
 *                 status:
 *                   type: string
 *                   example: success
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T12:00:00.000Z
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Email Sender API is running',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

/**
 * @swagger
 * /api/send-email:
 *   post:
 *     summary: Send email to a single recipient
 *     description: Send an email to a single recipient with optional plain text and HTML content
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *                 example: recipient@example.com
 *               subject:
 *                 type: string
 *                 description: Email subject
 *                 example: Test Email
 *               body:
 *                 type: string
 *                 description: Plain text email body (optional if html is provided)
 *                 example: This is a test email
 *               html:
 *                 type: string
 *                 description: HTML email content (optional if body is provided)
 *                 example: <h1>This is a test email</h1><p>With HTML content</p>
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *                 messageId:
 *                   type: string
 *                   example: <abc123@mail.gmail.com>
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T12:00:00.000Z
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Recipient email (to) is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send email
 *                 error:
 *                   type: string
 *                   example: Error message details
 */
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

/**
 * @swagger
 * /api/send-bulk-email:
 *   post:
 *     summary: Send email to multiple recipients
 *     description: Send the same email to multiple recipients in bulk
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - subject
 *             properties:
 *               recipients:
 *                 type: array
 *                 description: Array of recipient email addresses
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["recipient1@example.com", "recipient2@example.com", "recipient3@example.com"]
 *               subject:
 *                 type: string
 *                 description: Email subject
 *                 example: Bulk Test Email
 *               body:
 *                 type: string
 *                 description: Plain text email body (optional if html is provided)
 *                 example: This is a bulk test email
 *               html:
 *                 type: string
 *                 description: HTML email content (optional if body is provided)
 *                 example: <h1>Bulk Test Email</h1><p>This email was sent to multiple recipients</p>
 *     responses:
 *       200:
 *         description: Bulk email operation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bulk email operation completed. 2 successful, 1 failed.
 *                 results:
 *                   type: array
 *                   description: Array of successfully sent emails
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipient:
 *                         type: string
 *                         format: email
 *                       success:
 *                         type: boolean
 *                       messageId:
 *                         type: string
 *                 errors:
 *                   type: array
 *                   description: Array of failed email attempts
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipient:
 *                         type: string
 *                         format: email
 *                       success:
 *                         type: boolean
 *                       error:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T12:00:00.000Z
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Recipients array is required and must not be empty
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send bulk emails
 *                 error:
 *                   type: string
 *                   example: Error message details
 */
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
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
