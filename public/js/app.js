// Mengambil referensi ke elemen-elemen HTML
const weatherform = document.querySelector("form"); // Formulir pencarian cuaca
const search = document.querySelector("input"); // Input tempat pencarian
const pesanSatu = document.querySelector("#pesan-1"); // Elemen pesan 1
const pesanDua = document.querySelector("#pesan-2"); // Elemen pesan 2

// Menambahkan event listener untuk menanggapi pengajuan formulir
weatherform.addEventListener("submit", (e) => {
  e.preventDefault(); // Mencegah pengajuan formulir yang menyebabkan pengambilan halaman baru

  // Mengambil nilai dari input tempat pencarian
  const location = search.value;

  // Mengubah pesan-pesan untuk memberi umpan balik kepada pengguna
  pesanSatu.textContent = "Sedang mencari lokasi ..";
  pesanDua.textContent = "";

  // Menggunakan fetch API untuk mengambil data cuaca dari server
  fetch("/infocuaca?address=" + location).then((response) => {
    // Mengonversi respons ke format JSON
    response.json().then((data) => {
      // Menangani data yang diterima dari server
      if (data.error) {
        pesanSatu.textContent = data.error; // Menampilkan pesan error jika terjadi kesalahan
      } else {
        pesanSatu.textContent = data.lokasi; // Menampilkan lokasi cuaca
        pesanDua.textContent = data.prediksiCuaca; // Menampilkan prediksi cuaca
      }
    });
  });
});
