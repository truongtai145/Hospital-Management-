import React from 'react';

const Banner = ({ title, breadcrumb }) => {
  return (
    <div className="relative w-full h-[300px] flex items-center bg-gray-100 overflow-hidden">
      {/* Ảnh nền mờ */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="absolute inset-0 bg-white/70"></div> {/* Lớp phủ trắng mờ */}
      </div>

      {/* Nội dung */}
      <div className="container mx-auto px-10 relative z-10">
        <p className="text-primary font-medium mb-2 uppercase tracking-wide text-sm">{breadcrumb}</p>
        <h1 className="text-5xl font-serif text-primary font-bold">{title}</h1>
      </div>

      {/* Họa tiết trang trí góc (Giả lập hình xanh bên trái như trong thiết kế) */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
    </div>
  );
};

export default Banner;