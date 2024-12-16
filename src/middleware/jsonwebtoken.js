// jwt.js
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET; // Lấy từ biến môi trường

// Tạo token
export const createToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '2m' });
};

// Xác thực token
export const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};
