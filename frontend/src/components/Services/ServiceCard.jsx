import React from 'react';
import { ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ img, title, desc, icon }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative mt-10">
      
      {/* 1. Phần Ảnh */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        {/* Lớp phủ màu khi hover */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 2. Phần Nội dung */}
      <div className="relative p-6 pt-12 flex-grow flex flex-col">
        
        {/* 3. Icon Tròn Nổi (Floating Icon) */}
        <div className="absolute -top-10 right-6 w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-secondary transition-colors duration-300 z-10 border-4 border-white">
          {icon || <Activity size={32} />}
        </div>

        <h3 className="text-2xl font-serif text-primary font-bold mb-3 group-hover:text-secondary transition-colors">
            {title}
        </h3>
        
        <p className="text-gray-500 mb-6 text-sm leading-relaxed line-clamp-3">
          {desc}
        </p>

        <Link 
          to="#" 
          className="mt-auto inline-flex items-center text-secondary font-bold hover:text-primary transition-colors gap-2 text-sm uppercase tracking-wide"
        >
          Xem chi tiết <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;