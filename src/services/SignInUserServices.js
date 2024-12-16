import bcrypt from 'bcrypt';
import ProfileUser from '../models/user/ProfileUser'; 
import { reject } from 'bcrypt/promises.js';
import { where } from 'sequelize';

export const handleUserSignIn = async (email, password) => {
    try {
        const userData = {};

        const isExit = await checkEmail(email);
        console.log('Email exists:', isExit);
        const signIn = await ProfileUser.findOne({
            where: { email: email },
            attributes: ['email', 'password'],
            raw: true,
        });
        console.log('User found is', signIn);
        if (signIn) {
            const check = await bcrypt.compare(password, signIn.password);
            console.log("Compare passwords:", check);
            if (check) {
                return {
                    errorCode: 0,
                    message: 'Login successful',
                    user: signIn
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
export const checkEmail = (userEmail) =>{
    return new Promise(async(resole , reject) => {
        try{
            const user = await ProfileUser.findOne({
                where: {email : userEmail}
            })
          if(user){
            resole(true)
          }else{
            resole(false)
          }
        }catch(e){
            reject(e);
        }
    })
}
