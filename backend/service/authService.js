const db = require('../utils/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const {backendBase} = require('../utils/homeUrl')
const mailService = require('../utils/email/sendEmail')
const User = require('../dataaccess/user')
const Token = require('../dataaccess/token')

const bcryptSalt = process. env.BCRYPT_SALT;
// const JWTSecret = process.env.SECRET;
const clientURL = `${backendBase}/PasswordReset/ui_assets/index.html`;

const requestPasswordReset = async (email) => {
    const user = await User.getByEmail( email );
    if (!user) throw new Error("Email does not exist");
  
    let token = await Token.getByUserId(user.user_id);
    if (token) await Token.deleteById(token.id);
  
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  
    await Token.create(user.user_id, hash)
  
    const link = `${clientURL}?token=${resetToken}&id=${user.user_id}`;
  
    mailService.sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.first_name,
        link: link,
      },
      "/templates/requestResetPassword.handlebars"
    );
    return { link };
};

const resetPassword = async (userId, token, password) => {
    let passwordResetToken = await Token.getByUserId(userId);
  
    if (!passwordResetToken) {
        throw new Error("Invalid or expired password reset token");
    }
  
    console.log(passwordResetToken.token, token);
  
    const isValid = await bcrypt.compare(passwordResetToken.token, token);
  
    if (!isValid) {
        console.log("toke is not the same")
        throw new Error("Invalid or expired password reset token");
    }
  
    const hash = await bcrypt.hash(password, Number(bcryptSalt));
  
    await User.updatePasswordById(hash, userId)
}

module.exports = {requestPasswordReset, resetPassword}