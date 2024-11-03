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
        const qrCodeDataUrl = await QRCode.toDataURL(url);
        res.json({ qrCodeDataUrl });
    } catch (error) {
        res.status(500).send('Error generating QR code');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});