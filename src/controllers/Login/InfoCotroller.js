import Info from '../../models/Login/Info'; 
import Login from '../../models/Login/Login';

const convertGender = (gender) => {
  console.log('Converting gender:', gender);
  if (gender === 'Male') return true; //1 là nam
  if (gender === 'Female') return false; //0 là nữ
  return null; 
};

export const createInfo = async (req, res) => {
  const { fullname, nickname, dateOfBirth, gender, country, walletAddress, loginId } = req.body;

  try {
    // Kiểm tra xem loginId có tồn tại trong bảng Login không
    const loginEntry = await Login.findOne({ where: { id: loginId } });

    if (!loginEntry) {
      return res.status(400).json({ message: 'loginId không hợp lệ!' });
    }

    // Kiểm tra xem loginId đã tồn tại trong bảng Info chưa
    const existingInfo = await Info.findOne({ where: { loginId } });

    if (existingInfo) {
      return res.status(400).json({ message: 'loginId đã được sử dụng!' });
    }

    const GenderEdit = convertGender(gender);

    // Tạo thông tin mới
    const newInfo = await Info.create({
      fullname,
      nickname,
      dateOfBirth,
      gender: GenderEdit,
      country,
      walletAddress,
      loginId,
    });

    return res.status(201).json({ message: 'Thông tin được nhập thành công!', info: newInfo });
  } catch (error) {
    return res.status(500).json({ message: 'Đã xảy ra lỗi!', error });
  }
};


export const updateInfo = async (req, res) => {
  const { id } = req.params; // ID của thông tin cần sửa
  const { fullname, nickname, dateOfBirth, gender, country, walletAddress } = req.body;

  try {
    const info = await Info.findByPk(id);
    if (!info) {
      return res.status(404).json({ 
        errorCode : 4,
        message: 'Thông tin không tồn tại.' 
      });
    }

    const updatedData = {};

    if (fullname !== undefined) {
      updatedData.fullname = fullname;
    }
    if (nickname !== undefined) {
      updatedData.nickname = nickname;
    }
    if (dateOfBirth !== undefined) {
      updatedData.dateOfBirth = dateOfBirth;
    }
    if (gender !== undefined) {
      updatedData.gender = convertGender(gender); 
    }
    if (country !== undefined) {
      updatedData.country = country;
    }
    if (walletAddress !== undefined) {

      const existingInfo = await Info.findOne({ where: { walletAddress } });
      if (existingInfo && existingInfo.id !== id) {
        
        return res.status(400).json({ 
          errorCode:5,
          message: 'walletAddress đã tồn tại, vui lòng chọn giá trị khác.' 
        });
      }
      updatedData.walletAddress = walletAddress;
    }

    await info.update(updatedData);

    return res.status(200).json({ 
      errorCode : 0 ,
      message: 'Thông tin đã được cập nhật!', 
      info });
  } catch (error) {
    return res.status(500).json({ 
      errorCode : 3 ,
      message: 'Đã xảy ra lỗi!', 
      error });
  }
};

// Xóa thông tin
export const deleteInfo = async (req, res) => {
  const { id } = req.params; 

  try {
    const info = await Info.findByPk(id);
    if (!info) {
      return res.status(404).json({ message: 'Thông tin không tồn tại.' });
    }

    await info.destroy();

    return res.status(200).json({ message: 'Thông tin đã được xóa!' });
  } catch (error) {
    return res.status(500).json({ message: 'Đã xảy ra lỗi!', error });
  }
};
export const getFullnameById = async (req, res) => {
  const id = req.params.id; 
  console.log("Login ID requested:", id);

  try {
      const info = await Info.findOne({
          where: { id }, 
      });

      if (info) {
          res.status(200).json({
              errorCode: 0,
              message: 'Get fullname successfully',
              data: {
                  fullname: info.fullname,
              }
          });
      } else {
          // Nếu không tìm thấy
          res.status(404).json({
              errorCode: 1,
              message: 'Info not found'
          });
      }
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
          errorCode: 2,
          message: 'Server error',
          error: error.message
      });
  }
};
export const getFullnameByLoginId = async (req, res) => {
  const loginId = req.params.loginId; 
  console.log("Login ID requested:", loginId);

  try {
      const info = await Info.findOne({
          where: { loginId }, 
      });

      if (info) {
          res.status(200).json({
              errorCode: 0,
              message: 'Get fullname successfully',
              data: info,
          });
      } else {
          res.status(404).json({
              errorCode: 1,
              message: 'Info not found'
          });
      }
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
          errorCode: 2,
          message: 'Server error',
          error: error.message
      });
  }
};
