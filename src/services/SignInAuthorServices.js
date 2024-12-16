import bcrypt from 'bcrypt';
import ProfileAuthor from '../models/author/ProfileAuthor';

export const handleAuthorSignIn = async (email, password) => {
    try {
        const isExit = await checkEmail(email);
        console.log('Email exists:', isExit);

        // Tìm kiếm user theo email và lấy cả id, email, password
        const signIn = await ProfileAuthor.findOne({
            where: { email: email },
            attributes: ['id', 'email', 'password'], // Lấy thêm id
            raw: true,
        });

        console.log('User được tìm thấy là', signIn);
        if (signIn) {
            // So sánh mật khẩu
            const check = await bcrypt.compare(password, signIn.password);
            console.log("Compare passwords:", check);
            if (check) {
                // Đăng nhập thành công, trả về id, email, password
                return {
                    errorCode: 0,
                    message: 'Login successful',
                    user: {
                        id: signIn.id,         // Trả về id
                        email: signIn.email,   // Trả về email
                        
                    }
                };
            } else {
                return {
                    errorCode: 3,
                    message: 'Wrong password',
                    user: {}
                };
            }
        } else {
            return {
                errorCode: 2,
                message: 'User not found',
                user: {}
            };
        }
    } catch (e) {
        console.error('Error during login:', e);
        throw e;
    }
};

export const checkEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await ProfileAuthor.findOne({
                where: { email: userEmail }
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};
