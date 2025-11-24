import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        try {
            // Ensure upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        } catch (error) {
            console.error('Directory creation error:', error);
            return res.status(500).json({ message: 'Failed to create upload directory' });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            filename: (name: string, ext: string, part: any, form: any) => {
                return `${Date.now()}_${part.originalFilename?.replace(/\s/g, '_') || 'image'}`;
            }
        });

        try {
            const [fields, files] = await form.parse(req);

            // Handle different formidable versions/structures
            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

            if (!uploadedFile) {
                console.error('No file found in request:', files);
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const imageUrl = `/uploads/${path.basename(uploadedFile.filepath)}`;
            return res.status(200).json({ url: imageUrl });
        } catch (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ message: 'Error uploading file', error: String(err) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
