# Capstone-backend-auth

# 📆 NeuroFin Backend API

API backend untuk fitur autentikasi user seperti **register, login**, dan **verifikasi email** menggunakan **Node.js**, **Hapi**, **Nodemailer**, dan **JWT**.

---

## 🚀 Fitur

- Registrasi user (email, password, username, verifikasi email)
- Login user dengan email dan password
- Kirim email verifikasi menggunakan Gmail SMTP
- Simpan data user dalam bentuk array (prototipe)
- Penggunaan `.env` untuk variabel rahasia (env vars)

---

## 📂 Struktur Folder

```

project-root/
├── src
    ├── handler.js
    ├── router.js
    ├── acount.js
    └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚖️ Setup & Jalankan

### 1. Clone project
```bash
git clone https://github.com/AgungADL/Capstone-backend-auth.git
cd Capstone-backend-auth
```

### 2. Install dependencies
```bash
npm install
```

### 3. Buat file `.env`
Buat file `.env` dan isi berdasarkan `.env.example`:

```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=yourapppassword
JWT_SECRET=yourjwtsecret
```

---

## 📊 Endpoint API

| Endpoint     | Method | Body                                                              | Deskripsi              |
|--------------|--------|-------------------------------------------------------------------|-------------------------|
| `/register`  | POST   | `{ username, email, password }`                                   | Registrasi user baru    |
| `/login`     | POST   | `{ email, password }`                                             | Login user              |
| `/verify`    | POST   | `{ email, code }`                                                 | Verifikasi email        |

---

## 🤖 Contoh Test Postman

```js
pm.test('status code harus 200', () => {
    pm.response.to.have.status(200);
});

pm.test('response harus berupa JSON', () => {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

pm.test('response memiliki status dan message', () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property('status');
    pm.expect(json).to.have.property('message');
});
```


