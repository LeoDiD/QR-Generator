const express = require('express');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route to generate QR code
app.post('/generate', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        // Generate QR code as a data URL with default colors and settings
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
            width: 300, // Set the width of the QR code
            margin: 1,  // Set the margin around the QR code
        });

        // Send the QR code as a data URL
        res.json({ qrCodeDataUrl });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Error generating QR code');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
