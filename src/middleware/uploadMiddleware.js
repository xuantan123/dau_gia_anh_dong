import multer from 'multer';
import path from 'path';

// Cấu hình multer để lưu file tạm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Lưu file tạm vào thư mục /uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // Đặt tên file theo timestamp để tránh trùng lặp
  },
});

// File filter để đảm bảo chỉ cho phép các loại ảnh hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and GIF are allowed!'), false);
  }
};

// Khởi tạo upload middleware với multer
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

export default upload;
