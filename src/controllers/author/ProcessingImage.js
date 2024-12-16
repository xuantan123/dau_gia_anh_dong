// Import các thư viện cần thiết
import cloudinary from "cloudinary";
import path from 'path';
import fs from 'fs';

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm upload ảnh lên Cloudinary
const uploadImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error('No file uploaded');
    }

    const result = await cloudinary.uploader.upload(imageFile.path);
    return result.secure_url; // Trả về URL của ảnh
};

export const uploadImageAPI = async (req, res) => {
    try {
        const imageFile = req.file; 

        if (!imageFile) {
            return res.status(400).json({
                message: 'No image file uploaded'
            });
        }

        const imageUrl = await uploadImage(imageFile);

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            errorCode: 1,
            message: 'Image upload failed',
            error: error.message
        });
    }
};
