import React from 'react';
import { Send, Linkedin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-bold uppercase mb-6 tracking-widest">Meddical</h2>
          <p className="text-blue-200">Tiên phong trong Y tế Xuất sắc, Chăm sóc Tin cậy.</p>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-6">Liên kết quan trọng</h4>
          <ul className="space-y-2 text-blue-200">
            <li><a href="#" className="hover:text-white">Đặt lịch hẹn</a></li>
            <li><a href="#" className="hover:text-white">Bác sĩ</a></li>
            <li><a href="#" className="hover:text-white">Dịch vụ</a></li>
            <li><a href="#" className="hover:text-white">Giới thiệu</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-6">Liên hệ</h4>
          <ul className="space-y-2 text-blue-200">
            <li>Gọi: (237) 681-812-255</li>
            <li>Email: fildineesoe@gmail.com</li>
            <li>Địa chỉ: 0123 Quận 1, TP.HCM</li>
            <li>Việt Nam</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-6">Bản tin</h4>
          <div className="flex items-center bg-blue-100 rounded overflow-hidden">
            <input type="text" placeholder="Nhập email của bạn" className="bg-transparent px-4 py-3 text-primary w-full focus:outline-none placeholder-blue-400" />
            <button className="bg-secondary p-3 text-white hover:bg-blue-600">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8 border-t border-blue-800 flex flex-col md:flex-row justify-between items-center text-blue-200 text-sm">
        <p>© 2025 Tên bệnh viện. All Rights Reserved by PNTEC-LTD</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Linkedin className="w-5 h-5 cursor-pointer hover:text-white" />
          <Facebook className="w-5 h-5 cursor-pointer hover:text-white" />
          <Instagram className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;