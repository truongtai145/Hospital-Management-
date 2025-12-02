import React from "react";
import Banner from "../../components/Banner/Banner";
import Contactinfo from "../../components/Contact/ContactInfo";
import TestimonialSection from "../../components/About/TestimonialSection";
import NewsSection from "../../components/About/NewsSection";
import Doctors from "../../components/Doctors/Doctors";
const Doctor = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="relative w-full h-[300px] flex items-center bg-gray-100 overflow-hidden">
        {/* Đè style inline để thay ảnh nền khác cho trang About */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-primary/60"></div>
        </div>
        <div className="container mx-auto px-10 relative z-10 text-white">
          <p className="font-medium mb-2 uppercase tracking-wide text-sm opacity-90">
            Trang chủ / Bác Sĩ
          </p>
          <h1 className="text-5xl font-serif font-bold">Về chúng tôi</h1>
        </div>
      </div>
      <Doctors />
      <TestimonialSection />
      <NewsSection />
      <Contactinfo />
    </div>
  );
};

 
export default Doctor;
