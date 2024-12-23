import { Sequelize } from 'sequelize';

// Lấy thông tin kết nối từ các biến môi trường hoặc trực tiếp từ Railway.
const DB_HOST = process.env.DB_HOST || 'containers-us-west-160.railway.app'; // Host của Railway
const DB_PORT = process.env.DB_PORT || '12345'; // Cổng của Railway
const DB_USER = process.env.DB_USER || 'root'; // Username của Railway
const DB_PASSWORD = process.env.DB_PASSWORD || 'yourpassword'; // Mật khẩu của Railway
const DB_NAME = process.env.DB_NAME || 'dau_gia_Gif'; // Tên cơ sở dữ liệu

// Cấu hình kết nối Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  port: DB_PORT,
  logging: console.log,
});

// Hàm kết nối tới cơ sở dữ liệu
let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Export kết nối database
module.exports = connectDB;
