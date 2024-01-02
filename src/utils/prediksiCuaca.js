// Mengimpor modul 'postman-request' untuk membuat permintaan HTTP
const request = require("postman-request");

// Fungsi forecast untuk mendapatkan informasi prediksi cuaca berdasarkan koordinat geografis
const forecast = (geoCoordinates, callback) => {
  // Mendapatkan latitude dan longitude dari objek geoCoordinates
  const { latitude, longitude } = geoCoordinates;

  // Membentuk URL untuk permintaan ke API Weatherstack berdasarkan koordinat geografis
  const url =
    "http://api.weatherstack.com/current?access_key=6da52f1684b303ac1508518a293ea8a0&query=" +
    encodeURIComponent(latitude) +
    "," +
    encodeURIComponent(longitude) +
    "&units=m";

  // Mengirim permintaan HTTP ke API Weatherstack menggunakan modul 'postman-request'
  request({ url: url, json: true }, (error, response) => {
    // Menangani kesalahan saat melakukan permintaan
    if (error) {
      callback("Tidak dapat terkoneksi ke layanan", undefined);
    } else if (response.body.error) {
      // Menangani kasus ketika tidak ada hasil prediksi cuaca ditemukan
      callback("Tidak dapat menemukan lokasi", undefined);
    } else {
      // Menangani kasus ketika prediksi cuaca berhasil ditemukan
      callback(
        undefined,
        "Info Cuaca di " +
          response.body.location.name +
          ", " +
          response.body.location.country +
          ": " +
          "Keadaan cuaca saat ini: " +
          response.body.current.weather_descriptions[0] +
          ". " +
          "Suhu saat ini: " +
          response.body.current.temperature +
          "°C. " +
          "Deskripsi Cuaca " +
          response.body.current.weather_descriptions +
          " " +
          "Kecepatan angin: " +
          response.body.current.wind_speed +
          " km/jam. " +
          "Ketebalan lapisan awan: " +
          response.body.current.cloudcover +
          "%. " +
          "Titik geo koordinat: " +
          response.body.location.lat +
          ", " +
          response.body.location.lon
      );
    }
  });
};

// Mengekspor fungsi forecast agar dapat digunakan di file lain
module.exports = forecast;
