const db = require('../utils/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const {backendBase} = require('../utils/homeUrl')
const mailService = require('../utils/email/sendEmail')
const User = require('../dataaccess/user')
const Token = require('../dataaccess/token')
// const { createClient } = require('redis');
const config = require('../utils/config');
const client = require('../utils/redis');

const bcryptSalt = process. env.BCRYPT_SALT;
// const JWTSecret = process.env.SECRET;
const clientURL = `/eventHub/PasswordReset/ui_assets/index.html`;
const logUrl = process.env.NODE_ENV === 'development' ? 'https://localhost:3000/eventHub/assets/acm_logo.png' : 'https://acm.gettysburg.edu/eventHub/assets/acm_logo.png'

const requestPasswordReset = async (email) => {
    const user = await User.getByEmail( email );
    if (!user) throw new Error("Email does not exist");
  
    // let token = await Token.getByUserId(user.user_id);
    // if (token) await Token.deleteById(token.id);

    const key = `passwordReset:${user.user_id}`
    await client.del(key)
  
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  
    // await Token.create(user.user_id, hash)

    await client.set(key, hash)
    await client.expire(key, 60 * 60) // 1 hour

    const prefix = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://acm.gettysburg.edu'
  
    const link = `${prefix}${clientURL}?token=${resetToken}&id=${user.user_id}`;
  
    mailService.sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.first_name,
        link: link,
        logoUrl: logUrl
      },
      "/templates/requestResetPassword.handlebars"
    );
    return { link };
};

const resetPassword = async (userId, token, password) => {
    // let passwordResetToken = await Token.getByUserId(userId);
  
    // if (!passwordResetToken) {
    //     throw new Error("Invalid or expired password reset token");
    // }
    
  
    // console.log(passwordResetToken.token, token);

    const key = `passwordReset:${userId}`
    const hashedToken = await client.get(key);

    if(!hashedToken) throw new Error("Hashed Token missing!");

    const isValid = await bcrypt.compare(token, hashedToken);
    if (!isValid) throw new Error("Invalid or expired password reset token");
  
    const hash = await bcrypt.hash(password, Number(bcryptSalt));
  
    const user = await User.updatePasswordById(hash, userId)
    mailService.sendEmail(
        user.email,
        "Password Reset Request",
        {
            name: user.first_name,
            logoUrl: logUrl
        },
        "/templates/requestResetPassword.handlebars"
    );
    // await Token.deleteById(passwordResetToken.id)
    await client.del(key)
    return {message: "Password reset successfully"}
}

module.exports = {requestPasswordReset, resetPassword}