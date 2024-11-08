const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');  // For file operations
const crypto = require('crypto');  // To create a unique filename for each QR code
const multer = require('multer'); // For handling file uploads

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

// Route to generate QR code
app.post('/generate', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        // Generate QR code as a data URL
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
            width: 300, // Set the width of the QR code
            margin: 1,  // Set the margin around the QR code
        });

        // Create a unique filename using a hash
        const fileName = `qrcode_${crypto.randomBytes(16).toString('hex')}.png`;
        const filePath = path.join(__dirname, 'public', fileName);  // Save image in the public directory
        
        // Write the image data (base64) to a PNG file
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''); // Strip the base64 prefix
        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error('Error writing QR code image file:', err);
                return res.status(500).send('Error generating QR code image');
            }

            // Send the URL of the saved image for the user to download
            res.json({ 
                qrCodeUrl: `/${fileName}`,  // This is for displaying the image
                downloadUrl: `/${fileName}` // This is for downloading the image
            });
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Error generating QR code');
    }
});

// Batch QR Code Generation Route
app.post('/generate-batch', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const outputDir = 'public/qr_codes/'; // Output directory for generated QR codes

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    // Read the uploaded file
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file.');
        }

        // Split the file content into lines
        const lines = data.split('\n');

        // Generate QR codes for each line
        const qrCodePromises = lines.map(async (line) => {
            if (line.trim()) {
                try {
                    const qrCodeDataUrl = await QRCode.toDataURL(line.trim());
                    const fileName = `qrcode_${crypto.randomBytes(16).toString('hex')}.png`;
                    const qrCodePath = path.join(outputDir, fileName);
                    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
                    
                    // Write the QR code image to the output directory
                    await fs.promises.writeFile(qrCodePath, base64Data, 'base64');
                } catch (error) {
                    console.error(`Error generating QR code for "${line}":`, error);
                }
            }
        });

        // Wait for all QR codes to be generated
        await Promise.all(qrCodePromises);

        // Send response
        res.json({ message: 'QR codes generated successfully!', outputDir: '/qr_codes/' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});