const { User } = require('../models');
const Bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email');
const Jwt = require('@hapi/jwt');

// Register handler
const registerHandler = async (request, h) => {
  try {
    const { username, email, password } = request.payload;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return h.response({ status: 'fail', message: 'Email sudah terdaftar' }).code(400);
    }

    const hashedPassword = await Bcrypt.hash(password, 10);
    const verificationCode = uuidv4();

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationCode,
    });

    await sendEmail(email, 'Verifikasi Email', `Kode verifikasi: ${verificationCode}`);
    return h.response({ status: 'success', message: 'Registrasi berhasil, cek email untuk verifikasi' }).code(200);
  } catch (err) {
    console.error(err);
    return h.response({ status: 'error', message: 'Terjadi kesalahan pada server' }).code(500);
  }
};

// Verify email handler
const verifyEmailHandler = async (request, h) => {
  const { email, code } = request.payload;

  const user = await User.findOne({ where: { email } });
  if (!user || user.verificationCode !== code) {
    return h.response({ status: 'fail', message: 'Kode verifikasi tidak valid' }).code(400);
  }

  user.verified = true;
  await user.save();

  return h.response({ status: 'success', message: 'Email berhasil diverifikasi' }).code(200);
};

// Login handler
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await Bcrypt.compare(password, user.password))) {
    return h.response({ status: 'fail', message: 'Email atau kata sandi tidak valid' }).code(400);
  }

  if (!user.verified) {
    return h.response({ status: 'fail', message: 'Harap verifikasi email Anda terlebih dahulu' }).code(403);
  }

  const token = Jwt.token.generate({ email }, { key: process.env.JWT_SECRET, algorithm: 'HS256' });
  return h.response({ status: 'success', message: 'Login berhasil', data: { token } }).code(200);
};

module.exports = {
  registerHandler,
  verifyEmailHandler,
  loginHandler,
};