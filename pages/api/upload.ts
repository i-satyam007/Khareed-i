import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { supabase } from '../../lib/supabase';

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
            maxFileSize: 5 * 1024 * 1024, // 5MB
        });

        const [fields, files] = await form.parse(req);
        const file = files.file?.[0];

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileData = fs.readFileSync(file.filepath);
        const fileName = `${Date.now()}_${file.originalFilename || 'image.jpg'}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, fileData, {
                contentType: file.mimetype || 'image/jpeg',
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return res.status(200).json({ url: publicUrlData.publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'File upload failed', details: (error as Error).message });
    }
}
