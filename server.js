const express = require('express');
const QRCode = require('qrcode');
const { createCanvas } = require('canvas'); // Import the canvas library
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
    const { url, foregroundColor, backgroundColor, shape } = req.body; // Get colors and shape from request

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        // Generate QR code as a data URL
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
            color: {
                dark: foregroundColor || '#000000',  // Default to black if not provided
                light: backgroundColor || '#FFFFFF',  // Default to white if not provided
            },
            width: 300, // Set the width of the QR code
            margin: 1,  // Set the margin around the QR code
        });

        // Create a canvas to draw the QR code
        const img = new Image();
        img.src = qrCodeDataUrl;

        const canvas = createCanvas(300, 300);
        const ctx = canvas.getContext('2d');

        // Draw the QR code on the canvas
        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            // Apply shape variation
            if (shape === 'circle') {
                ctx.globalCompositeOperation = 'destination-in'; // Keep only the QR code shape
                ctx.beginPath();
                ctx.arc(150, 150, 150, 0, Math.PI * 2, true); // Draw a circle
                ctx.fill();
            }

            // Send the modified QR code as a data URL
            const modifiedQrCodeDataUrl = canvas.toDataURL();
            res.json({ qrCodeDataUrl: modifiedQrCodeDataUrl });
        };
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Error generating QR code');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});