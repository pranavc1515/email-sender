// Test script for Email Sender API
// Run this file to test the API endpoints

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

// Test data
const testEmail = {
    to: 'test@example.com', // Replace with your test email
    subject: 'Test Email from API',
    body: 'This is a test email sent from the Email Sender API',
    html: `
    <h1>Test Email</h1>
    <p>This is a test email sent from the <strong>Email Sender API</strong>.</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
    <hr>
    <p><em>This is an automated test email.</em></p>
  `
};

const testBulkEmail = {
    recipients: ['test1@example.com', 'test2@example.com'], // Replace with test emails
    subject: 'Bulk Test Email from API',
    body: 'This is a bulk test email sent from the Email Sender API',
    html: `
    <h1>Bulk Test Email</h1>
    <p>This is a bulk test email sent from the <strong>Email Sender API</strong>.</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
    <hr>
    <p><em>This is an automated bulk test email.</em></p>
  `
};

// Test functions
async function testHealthCheck() {
    console.log('🔍 Testing Health Check...');
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        console.log('✅ Health Check Response:', data);
        return true;
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        return false;
    }
}

async function testSendEmail() {
    console.log('\n📧 Testing Send Single Email...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testEmail)
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Email Sent Successfully!');
            console.log('Message ID:', data.messageId);
            console.log('Timestamp:', data.timestamp);
        } else {
            console.error('❌ Email Sending Failed:', data.message);
        }

        return data.success;
    } catch (error) {
        console.error('❌ Email Sending Error:', error.message);
        return false;
    }
}

async function testSendBulkEmail() {
    console.log('\n📬 Testing Send Bulk Email...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/send-bulk-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testBulkEmail)
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Bulk Email Operation Completed!');
            console.log('Message:', data.message);
            console.log('Successful:', data.results.length);
            console.log('Failed:', data.errors.length);

            if (data.results.length > 0) {
                console.log('Successful Recipients:');
                data.results.forEach(result => {
                    console.log(`  - ${result.recipient} (ID: ${result.messageId})`);
                });
            }

            if (data.errors.length > 0) {
                console.log('Failed Recipients:');
                data.errors.forEach(error => {
                    console.log(`  - ${error.recipient}: ${error.error}`);
                });
            }
        } else {
            console.error('❌ Bulk Email Sending Failed:', data.message);
        }

        return data.success;
    } catch (error) {
        console.error('❌ Bulk Email Sending Error:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Email Sender API Tests...\n');

    // Test health check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
        console.log('\n❌ API is not running. Please start the server first with: npm start');
        return;
    }

    // Test single email
    await testSendEmail();

    // Test bulk email
    await testSendBulkEmail();

    console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testHealthCheck,
    testSendEmail,
    testSendBulkEmail,
    runTests
};
