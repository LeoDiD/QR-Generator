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
    const { url, foregroundColor, backgroundColor } = req.body; // Get colors from request

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        // Generate QR code with specified colors
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
            color: {
                dark: foregroundColor || '#000000',  // Default to black if not provided
                light: backgroundColor || '#FFFFFF',  // Default to white if not provided
            },
        });
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