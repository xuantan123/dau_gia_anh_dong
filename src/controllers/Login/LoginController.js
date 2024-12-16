import Login from '../../models/Login/Login.js'; // Đảm bảo đường dẫn đúng
import bcrypt from 'bcrypt';
import { error } from 'console';
import jwt from 'jsonwebtoken'; 
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET; // Đảm bảo bạn đã thiết lập biến môi trường này

// Lưu trữ mã xác minh tạm thời
const verificationCodes = {};

// Cấu hình gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    }
});

export const register = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await Login.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại.' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = await Login.create({
            email,
            password: hashedPassword,
            role, 
            verified: false, 
        });

        // Tạo mã xác minh ngẫu nhiên
        const verificationCode = crypto.randomInt(1000, 9999).toString();
        verificationCodes[email] = verificationCode;

        // Gửi mã xác minh đến email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Xác minh tài khoản của bạn',
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                  <h2 style="text-align: center; color: #333;">Xác minh tài khoản</h2>
                  <p style="font-size: 16px; color: #555;">
                      Xin chào, <br>
                      Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác minh dưới đây:
                  </p>
                  <div style="text-align: center; margin: 20px 0;">
                      <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 2px dashed #4CAF50; border-radius: 5px;">
                          ${verificationCode}
                      </span>
                  </div>
                  <p style="font-size: 16px; color: #555;">Trân trọng,<br>Đội ngũ hỗ trợ Celestial.</p>
              </div>
          `,
      };
      

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.',
            user: { id: newUser.id, email: newUser.email, role: newUser.role , verified : newUser.verified}
        });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi!', error });
    }
};

export const getLoginInfoById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send('Thiếu id.');
    }

    try {
        const loginInfo = await Login.findOne({ where: { id: id } });

        if (!loginInfo) {
            return res.status(404).send({ message: 'Không tìm thấy thông tin đăng nhập với id đã cho.' });
        }

        return res.status(200).send(loginInfo);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin đăng nhập:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy thông tin đăng nhập.',
            error: error.message,
        });
    }
};

export const verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  if (verificationCodes[email] && verificationCodes[email] === code) {
      delete verificationCodes[email]; 

      await Login.update({ verified: true }, { where: { email } });
      
      return res.status(200).json({ 
        errorCode : 0,
        message: 'Xác minh email thành công!' 
      });
  } else {
      return res.status(400).json({ 
        errorCode : 4,
        message: 'Mã xác minh không đúng hoặc đã hết hạn.' 
      });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra email
    const user = await Login.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // Kiểm tra trạng thái xác minh
    if (!user.verified) {
      return res.status(403).json({ message: 'Bạn cần xác minh email trước khi đăng nhập.' });
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mật khẩu không đúng.' });
    }

    // Tạo token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '15m' });

    return res.status(200).json({
      errorCode: 0,
      message: 'Đăng nhập thành công!',
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Đã xảy ra lỗi!', error });
  }
};

