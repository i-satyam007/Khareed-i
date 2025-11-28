import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({
            keepExtensions: true,
            maxFileSize: 4 * 1024 * 1024, // 4MB limit for Vercel serverless
        });

        const [fields, files] = await form.parse(req);
        const file = files.file?.[0];

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read file buffer
        const fileData = fs.readFileSync(file.filepath);
        // Convert to base64
        const base64Data = fileData.toString('base64');
        const mimeType = file.mimetype || 'image/jpeg';
        const fileUrl = `data:${mimeType};base64,${base64Data}`;

        return res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'File upload failed', details: (error as Error).message });
    }
}
