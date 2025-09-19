import { useState, useEffect } from 'react';

// Data untuk konten slide, bisa kamu ganti sesuai kebutuhan
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop',
    title: 'Partisipasi Warga Digital',
    description: 'Suarakan aspirasi Anda secara langsung melalui platform digital yang mudah diakses.',
  },
  {
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop',
    title: 'Transparansi Penuh',
    description: 'Ikuti setiap perkembangan dari usulan yang Anda ajukan dengan transparan dan akuntabel.',
  },
  {
    image: 'https://images.unsplash.com/photo-1516542949236-8a2045a49346?q=80&w=2070&auto=format&fit=crop',
    title: 'Kolaborasi untuk Perubahan',
    description: 'Bergabunglah dengan ribuan warga lain untuk membangun Indonesia yang lebih baik.',
  },
];

const HighlightSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Atur interval untuk slide otomatis setiap 5 detik
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // 5000 ms = 5 detik

    // Membersihkan interval saat komponen dilepas
    return () => clearInterval(interval);
  }, []);

  return (
    // Kontainer utama, disembunyikan di layar kecil (lg:block)
    <div className="hidden lg:block bg-gray-900 relative overflow-hidden rounded-lg">
      {/* Kontainer untuk semua slide, digeser dengan 'transform' */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* Mapping data slide */}
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 h-screen relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gelap agar teks lebih mudah dibaca */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-12">
              <h3 className="text-white text-4xl font-bold mb-4">
                {slide.title}
              </h3>
              <p className="text-gray-300 text-lg">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Indikator titik (dots) di bagian bawah */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              currentSlide === index ? 'bg-white' : 'bg-gray-500'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HighlightSlider;