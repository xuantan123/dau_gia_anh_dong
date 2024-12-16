import Registration from '../../models/user/Registration.js';
import Login from '../../models/Login/Login.js'; // Import Login model
import Auction from '../../models/author/AuctionAuthor.js'; // Auction model

export const registerUserForAuction = async (req, res) => {
  console.log("Function called");
  console.log(req.body);

  const { userId, auctionId } = req.body;
  console.log("UserId: ", userId);
  try {
    // Kiểm tra xem người dùng và đấu giá có tồn tại không
    const user = await Login.findByPk(userId); // Sử dụng Login thay vì Info
    const auction = await Auction.findByPk(auctionId);

    if (!user || !auction) {
      return res.status(404).json({
        errorCode: 1,
        message: 'User or auction not found',
      });
    }

    // Kiểm tra nếu người dùng là author hay không
    if (user.role === 'author') {
      return res.status(403).json({
        errorCode: 2,
        message: 'Authors cannot register for auctions',
      });
    }

    // Tạo mới một bản ghi đăng ký
    const registration = await Registration.create({ userId, auctionId });

    res.status(201).json({
      errorCode: 0,
      message: 'User registered for auction successfully',
      data: registration,
    });
  } catch (error) {
    console.error("Server error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({
      message: "Đã xảy ra lỗi!",
      error: error.message || error,
    });
  }
};

export const getRegisteredAuctions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Login.findByPk(userId); 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const registrations = await Registration.findAll({
      where: { userId },
      attributes: ['id', 'auctionId'],  
    });
    
    if (registrations.length === 0) {
      return res.status(404).json({ message: 'No auctions registered for this user' });
    }
    const auctionIds = registrations.map(reg => reg.auctionId);

    const registeredAuctions = await Auction.findAll({
      where: {
        id: auctionIds,
      },
    });

    const auctionsWithRegistrationId = registeredAuctions.map(auction => {

      const registration = registrations.find(reg => reg.auctionId === auction.id);
      
      return {
        ...auction.toJSON(),  
        registrationId: registration.id, 
      };
    });

    return res.status(200).json(auctionsWithRegistrationId);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const deleteRegisterById = async (req, res) => {
  const { id } = req.params; 

  try {
    const registration = await Registration.findByPk(id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    await registration.destroy();

    return res.status(200).json({
      errorCode: 0,
      message: 'Registration deleted successfully',
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      message: 'An error occurred while deleting the registration!',
      error: error.message || error,
    });
  }
};
