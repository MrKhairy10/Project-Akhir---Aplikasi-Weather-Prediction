// Mengimpor modul yang diperlukan dari Express, HBS, dan Mongoose
const express = require("express");
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
const mongoose = require('mongoose');

// Mengimpor model LogInCollection serta modul untuk geocode dan prediksi cuaca
const LogInCollection = require("./utils/mongo");
const geocode = require("./utils/geoCode");
const forecast = require("./utils/prediksiCuaca");

// Membuat instance Express
const app = express();

// Menentukan port server
const port = process.env.PORT || 4040;

// Menggunakan middleware untuk parsing JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

// Menambahkan variabel lokal untuk status otentikasi pada setiap respons
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

// Menentukan path untuk views, partials, dan public
const viewPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");
const publicPath = path.join(__dirname, "../public");

// Mengatur view engine, path views, dan partials
app.set("view engine", "hbs");
app.set("views", viewPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicPath));

// Menghubungkan ke database MongoDB
mongoose.connect('mongodb://localhost:27017/Cuaca', { useNewUrlParser: true, useUnifiedTopology: true });

// Endpoint untuk render halaman signup
app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Halaman Akun Saya",
    name: "Mubarakh Khairy",
  });
});

// Endpoint untuk render halaman login
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Halaman Akun Saya",
    name: "Mubarakh Khairy",
  });
});

// Endpoint untuk menerima data signup dari form
app.post("/signup", async (req, res) => {
  try {
    // Validasi data yang diterima dari form
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).render("signup", { error: "Please fill in all fields." });
    }

    // Mencari atau membuat pengguna baru dalam database
    const result = await LogInCollection.findOneAndUpdate(
      { name: req.body.name },
      { $setOnInsert: { name: req.body.name, email: req.body.email, password: req.body.password } },
      { upsert: true, new: true }
    );

    // Mengirim respons sesuai hasil operasi database
    if (result) {
      res.status(201).render("login", { naming: req.body.name, success: "Account successfully created!" });
    } else {
      res.status(500).render("signup", { error: "Error creating or retrieving user." });
    }
  } catch (error) {
    res.status(500).render("signup", { error: "Error in signup: " + error.message });
  }
});

// Endpoint untuk menerima data login dari form
app.post("/login", async (req, res) => {
  try {
    // Validasi data yang diterima dari form
    if (!req.body.nameOrEmail || !req.body.password) {
      return res.status(400).render("login", { error: "Username or email and password are required." });
    }

    // Memeriksa keberadaan pengguna dalam database
    const check = await LogInCollection.findOne({
      $or: [{ name: req.body.nameOrEmail }, { email: req.body.nameOrEmail }]
    });

    // Mengirim respons sesuai hasil pemeriksaan
    if (check && check.password === req.body.password) {
      req.session.isAuthenticated = true; // Menetapkan status otentikasi dalam sesi
      res.status(201).render("index.hbs", { naming: check.name });
    } else {
      res.status(401).render("login", { error: "Incorrect username or password." });
    }
  } catch (error) {
    res.status(500).render("login", { error: "Error in login: " + error.message });
  }
});

// Endpoint untuk logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render("error", { error: "Error logging out." });
    }
    res.redirect("/");
  });
});

// Endpoint untuk halaman utama
app.get("/", (req, res) => {
  res.render("index", {
    title: "Aplikasi Cek Cuaca",
    name: "Mubarakh Khairy",
    isAuthenticated: req.session.isAuthenticated || false, // Melewatkan status otentikasi ke template
  });
});

// Endpoint untuk halaman tentang
app.get("/tentang", (req, res) => {
  res.render("tentang", {
    title: "Tentang Saya",
    name: "Mubarakh Khairy",
    isAuthenticated: req.session.isAuthenticated || false, // Melewatkan status otentikasi ke template
  });
});

// Endpoint untuk halaman project (memerlukan otentikasi)
app.get("/project", authenticateMiddleware, (req, res) => {
  res.render("project", {
    title: "Proyek Aplikasi Prediksi Cuaca",
    name: "Mubarakh Khairy",
    isAuthenticated: req.session.isAuthenticated || false, // Melewatkan status otentikasi ke template
  });
});

// Endpoint untuk halaman bantuan (memerlukan otentikasi)
app.get("/bantuan", authenticateMiddleware, (req, res) => {
  res.render("bantuan", {
    title: "Bantuan",
    teksBantuan: "Bantuan apa yang anda butuhkan?",
    name: "Mubarakh Khairy",
    isAuthenticated: req.session.isAuthenticated || false, // Melewatkan status otentikasi ke template
  });
});

// Endpoint untuk mendapatkan informasi cuaca (memerlukan otentikasi)
app.get("/infocuaca", authenticateMiddleware, (req, res) => {
  if (!req.query.address) {
    return res.send({
      error: "Kamu harus memasukan lokasi yang ingin dicari",
    });
  }
  geocode(
    req.query.address,
    (error, { latitude, longitude, location } = {}) => {
      if (error) {
        return res.send({ error });
      }
      forecast(latitude, longitude, (error, dataPrediksi) => {
        if (error) {
          return res.send({ error });
        }
        res.send({
          prediksiCuaca: dataPrediksi,
          lokasi: location,
          address: req.query.address,
        });
      });
    }
  );
});

// Endpoint untuk halaman akun (memerlukan otentikasi)
app.get("/akun", authenticateMiddleware, (req, res) => {
  res.render("akun", {
    title: "Halaman Akun Saya",
    name: "Mubarakh Khairy",
    isAuthenticated: req.session.isAuthenticated || false, // Melewatkan status otentikasi ke template
  });
});

// Endpoint untuk halaman 404 jika tidak ditemukan
app.get("*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Mubarakh Khairy",
    pesanError: "Halaman tidak ditemukan",
    isAuthenticated: req.session.isAuthenticated || false, // Melewatkan status otentikasi ke template
  });
});

// Middleware untuk otentikasi
function authenticateMiddleware(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect("/login");
  }
  next();
}

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
  console.log("Server is running on port", port);
});
