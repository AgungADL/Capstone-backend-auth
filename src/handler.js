require('dotenv').config();
const Jwt = require('@hapi/jwt');
const Bcrypt = require('bcrypt');
const Nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { users, tokens } = require('./acount');

// send ke email pengguna
const transporter = Nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

// register
const registerHandler = async (request, h) => {
  try {
    const { username, email, password } = request.payload;

    if (users.find((u) => u.email === email)) {
      return h.response({ status: 'fail', message: 'Email sudah terdaftar' }).code(400);
    }

    const hashedPassword = await Bcrypt.hash(password, 10);
    const verificationCode = uuidv4();
    users.push({ username, email, password: hashedPassword, verified: false, verificationCode });
    await sendEmail(email, 'Verifikasi Email', `Halo. Sebelum kamu registrasi, verifikasi dulu dirimu. \nIni kode verifikasi kamu: ${verificationCode}`);
    return h.response({ status: 'success', message: 'Registrasi berhasil, cek email untuk verifikasi', data: {
      username: username,
      email: email,
      password: password,
      verificationCode: verificationCode
    } }).code(200);

  } catch (err) {
    console.error('Terjadi kesalahan:', err);
    return h.response({ status: 'error', message: 'Terjadi kesalahan pada server' }).code(500);
  }
};

// verifikasi email
const verifyEmailHandler = (request, h) => {
  const { email, code } = request.payload;
  const user = users.find((u) => u.email === email);
  if (!user || user.verificationCode !== code) {
    return h.response({ status: 'fail', message: 'kode verifikasi tidak valid' }).code(400);
  }
  user.verified = true;
  return h.response({ status: 'success', message: 'Email berhasil diverifikasi', data: { verified: user.verified } }).code(200);
};

// login
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;
  const user = users.find((u) => u.email === email);
  if (!user || !(await Bcrypt.compare(password, user.password))) {
    return h.response({ status: 'fail', message: 'Email atau kata sandi tidak valid' }).code(400);
  }

  if (!user.verified) {
    return h.response({ status: 'fail', message: 'Harap verifikasi email Anda terlebih dahulu' }).code(403);
  }
  const token = Jwt.token.generate({ email }, { key: process.env.JWT_SECRET, algorithm: 'HS256' });
  return h.response({ status: 'success', message: 'Login berhasil', data: { token: token } }).code(200);
};

// lupa pasword
const forgotPasswordHandler = async (request, h) => {
  const { email } = request.payload;
  const user = users.find((u) => u.email === email);
  if (!user) {
    return h.response({ status: 'fail', message: 'Email tidak terdaftar' }).code(400);
  }
  const resetToken = uuidv4();
  tokens[resetToken] = email;
  await sendEmail(email, 'Reset Password', `Reset token kamu: ${resetToken}`);
  return h.response({ status: 'success', message: 'Cek email kamu untuk melihat reset token', data: { resetToken: resetToken } }).code(200);
};

// reset pasword
const resetPasswordHandler = async (request, h) => {
  const { token, newPassword } = request.payload;
  const email = tokens[token];
  if (!email) {
    return h.response({ status: 'fail', message: 'Token tidak valid atau kedaluwarsa' }).code(400);
  }
  const user = users.find((u) => u.email === email);
  user.password = await Bcrypt.hash(newPassword, 10);
  delete tokens[token];
  return h.response({ status: 'success', message: 'Reset password berhasil', data: { newPassword: newPassword } }).code(200);
};

// buat cek aja
const getAllUserHandler = () => {
  const myuser = users;
  return {
    status: 'success',
    data: {
      users: myuser.map((user) => ({
        email: user.email,
        password: user.password,
        verified: user.verified,
        verificationCode: user.verificationCode
      })),
    },
  };
};

const getAllTokenHandler = () => {
  const mytoken = tokens;
  return {
    status: 'success',
    data: {
      tokens: mytoken
    },
  };
};

module.exports = {
  registerHandler,
  verifyEmailHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  getAllUserHandler,
  getAllTokenHandler
};