import auctionContract from "../../config/smartContract";
import AuctionItem from "../../models/author/AuctionAuthor";
import cloudinary from "cloudinary";
import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';
import Login from "../../models/Login/Login";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error('Photos are required');
    }
    
    const result = await cloudinary.v2.uploader.upload(imageFile.path);
    return result.secure_url;
};

export const createAuctionItem = async (req, res) => {
    try {
        const {
            productname,
            description,
            startingPrice,
            durationInMinutes,
            loginId,
            startTime,
            imageUrl,
        } = req.body;

        if (!productname || !loginId || !startingPrice || durationInMinutes === undefined || !description || !startTime || !imageUrl) {
            return res.status(400).json({
                message: 'Product name, Login ID, starting price, duration, description, start time, and image URL cannot be null'
            });
        }
        const loginRecord = await Login.findByPk(loginId);
        if (!loginRecord || loginRecord.role !== 'author') {
            return res.status(403).json({
                message: 'Only authors are allowed to create auction items'
            });
        }
        if (!isValidUrl(imageUrl)) {
            return res.status(400).json({
                message: 'Invalid image URL'
            });
        }

        if (isNaN(startingPrice) || startingPrice <= 0) {
            return res.status(401).json({
                message: 'Starting price must be a positive number'
            });
        }

        const durationInSeconds = parseInt(durationInMinutes, 10) * 60;
        if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
            return res.status(400).json({
                message: 'Duration must be a positive number'
            });
        }

        const startDate = new Date(startTime);
        const endTimeInSeconds = Math.floor(startDate.getTime() / 1000) + durationInSeconds;

        // Create the auction item in MySQL
        const newProduct = await AuctionItem.create({
            loginId, 
            productName: productname,
            description,
            startingPrice,
            startTime: startDate,
            endTime: endTimeInSeconds,
            active: true,
            imageUrl,
        });

        res.status(200).json({
            errorCode: 0,
            message: 'Create successful auction item',
            product: newProduct,
        });
    } catch (error) {
        console.error('Error when creating auction item:', error);
        res.status(500).json({
            errorCode: 3,
            message: 'Auction item creation failed',
            error: error.message,
        });
    }
};

function isValidUrl(url) {
  const pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
    '([a-z0-9-]+\\.)+[a-z0-9]{2,6}' + // domain name and extension
    '(\\/[^\\s]*)?$', 'i'); // path
  return pattern.test(url);
}

// Lấy hình ảnh
export const getImage = (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(__dirname, '../../uploads', filename);

        if (fs.existsSync(imagePath)) {
            const ext = path.extname(filename).toLowerCase();
            let mimeType;

            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                default:
                    mimeType = 'application/octet-stream';
            }

            res.setHeader('Content-Type', mimeType);
            res.sendFile(imagePath);
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving image',
            error: error.message,
        });
    }
};

export const checkAuctionStatus = async (req, res) => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const auctionItems = await AuctionItem.findAll();

        const updates = auctionItems.map(async (auction) => {
            const isActive = auction.endTime > currentTime; // Kiểm tra trạng thái active
            
            // Cập nhật vào cơ sở dữ liệu
            await AuctionItem.update(
                { active: isActive }, // Giá trị mới
                { where: { id: auction.id } } // Điều kiện để tìm bản ghi cần cập nhật
            );

            // Trả về bản ghi đã cập nhật
            return { ...auction.toJSON(), active: isActive }; // Chuyển đổi đối tượng thành JSON và thêm trạng thái active
        });

        // Đợi tất cả các cập nhật hoàn thành
        const updatedAuctionItems = await Promise.all(updates);

        // Gửi phản hồi với danh sách các đấu giá đã cập nhật
        res.status(200).json(updatedAuctionItems);
    } catch (error) {
        console.error('Error checking auction status:', error);
        res.status(500).json({
            errorCode: 3,
            message: 'Failed to check auction status',
            error: error.message,
        });
    }
};
export const getAuction = async(req,res) => {
   const {id} = req.params;

   try{
    const product = await AuctionItem.findOne({where:{id}});

    if(!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
   }catch(error){
    res.status(500).json({ message: 'Error fetching product details', error });
   }
};


// Lấy thông tin sản phẩm theo authorId
export const getProductsByAuthorId = async (req, res) => {
    try {
        const { loginId } = req.params;

        if (!loginId) {
            return res.status(400).json({ message: 'Author ID cannot be blank' });
        }

        // Tìm tất cả sản phẩm theo authorId
        const products = await AuctionItem.findAll({
            where: { loginId }
        });

        if (products.length > 0) {
            res.status(200).json({
                errorCode: 0,
                message: 'Get products successfully',
                products,
            });
        } else {
            res.status(404).json({ message: 'No products found for this author ID' });
        }
    } catch (error) {
        res.status(500).json({
            errorCode: 3,
            message: 'Error when retrieving products',
            error: error.message,
        });
    }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'ID cannot be empty' });
        }

        const product = await AuctionItem.findByPk(id);

        if (product) {
            await product.destroy();
            res.status(200).json({ message: 'Product deletion successful' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Product deletion failed',
            error: error.message,
        });
    }
};
// Chỉnh sửa sản phẩm
export const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            productname, 
            description, 
            startingPrice, 
            durationInMinutes, 
            active,
            startTime 
        } = req.body;
        const imageFile = req.file;

        if (!id) {
            return res.status(400).json({ message: 'ID cannot be empty' });
        }

        const product = await AuctionItem.findByPk(id);

        if (product) {
            product.productName = productname || product.productName;
            product.description = description || product.description;
            product.startingPrice = startingPrice || product.startingPrice;
            product.active = active !== undefined ? active : product.active;

            if (startTime) {
                const startDate = new Date(startTime);
                if (isNaN(startDate.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid start time format. Please use a valid date format (YYYY-MM-DDTHH:mm:ss).'
                    });
                }
                product.startTime = startDate;

                if (durationInMinutes !== undefined) {
                    const durationInSeconds = parseInt(durationInMinutes, 10) * 60;
                    if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
                        return res.status(400).json({
                            message: 'Duration must be a positive number'
                        });
                    }
                    const newEndTime = Math.floor(startDate.getTime() / 1000) + durationInSeconds;
                    product.endTime = newEndTime;
                }
            } else if (durationInMinutes !== undefined) {
                const durationInSeconds = parseInt(durationInMinutes, 10) * 60;
                if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
                    return res.status(400).json({
                        message: 'Duration must be a positive number'
                    });
                }
                const currentTime = Math.floor(Date.now() / 1000);
                const newEndTime = currentTime + durationInSeconds;
                product.endTime = newEndTime;
            }

            if (imageFile) {
                const imageUrl = await uploadImage(imageFile);
                product.imageUrl = imageUrl;
            }

            await product.save();

            res.status(200).json({
                errorCode: 0,
                message: 'Product update successful',
                product,
            });
        } else {
            res.status(404).json({ 
                errorCode: 1,
                message: 'Product not found' 
            });
        }
    } catch (error) {
        res.status(500).json({
            errorCode: 3,
            message: 'Product update failed',
            error: error.message,
        });
    }
};

