import React from 'react';

// Reuse Components (Tận dụng lại component cũ)
import Banner from '../../components/Banner/Banner'; 
import ContactGrid from '../../components/Contact/ContactInfo';

// Import New Components (Component mới làm ở trên)
import WelcomeSection from '../../components/About/WelcomeSection';
import TestimonialSection from '../../components/About/TestimonialSection';
import NewsSection from '../../components/About/NewsSection';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Banner Header (Ảnh khác với trang service) */}
      <div className="relative w-full h-[300px] flex items-center bg-gray-100 overflow-hidden">
        {/* Đè style inline để thay ảnh nền khác cho trang About */}
        <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" }}
        >
            <div className="absolute inset-0 bg-primary/60"></div> {/* Phủ lớp màu tối hơn chút */}
        </div>
        <div className="container mx-auto px-10 relative z-10 text-white">
            <p className="font-medium mb-2 uppercase tracking-wide text-sm opacity-90">Trang chủ / Giới thiệu</p>
            <h1 className="text-5xl font-serif font-bold">Về chúng tôi</h1>
        </div>
      </div>

      {/* 2. Welcome Section (Ảnh 2 bác sĩ & List) */}
      <WelcomeSection />

      {/* 3. Testimonial (Quote nền xanh) */}
      <TestimonialSection />

      {/* 4. News Section (Tin tức) */}
      <NewsSection />

      {/* 5. Contact Info (4 ô xanh dưới cùng) */}
      <ContactGrid />
    </div>
  );
};

export default AboutPage;