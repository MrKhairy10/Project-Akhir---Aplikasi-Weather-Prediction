// Mengimpor modul 'postman-request' yang digunakan untuk membuat permintaan HTTP
const request = require('postman-request');

// Fungsi geocode untuk mendapatkan informasi koordinat dari suatu alamat
const geocode = (address, callback) => {
  // Membentuk URL untuk permintaan ke API geocoding dari Mapbox
  const url =
    'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
    encodeURIComponent(address) +
    '.json?access_token=pk.eyJ1IjoicHJvc2thOTkiLCJhIjoiY2xuNHI5ZmV5MDNpcTJ1cW1rZmUyOGV1dSJ9.RH2Q5UG7Q53Q0dZG26eziw';

  // Mengirim permintaan HTTP ke API geocoding menggunakan modul 'postman-request'
  request({ url: url, json: true }, (error, response) => {
    // Menangani kesalahan saat melakukan permintaan
    if (error) {
      callback('Tidak dapat terkoneksi ke layanan', undefined);
    } else if (response.body.features.length === 0) {
      // Menangani kasus ketika tidak ada hasil geocoding ditemukan
      callback('Tidak dapat menemukan lokasi. Lakukan pencarian lokasi yang lain', undefined);
    } else {
      // Menangani kasus ketika geocoding berhasil
      const { center, place_name } = response.body.features[0];
      const latitude = center[1];
      const longitude = center[0];
      const location = place_name;

      // Memanggil callback dengan mengirimkan informasi koordinat dan lokasi
      callback(undefined, { latitude, longitude, location });
    }
  });
};

// Mengekspor fungsi geocode agar dapat digunakan di file lain
module.exports = geocode;
