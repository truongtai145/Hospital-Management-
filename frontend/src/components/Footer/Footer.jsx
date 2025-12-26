import React from 'react';
import { Send, Linkedin, Facebook, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 pt-20 pb-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold uppercase mb-4 tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Meddical
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-4"></div>
            </div>
            <p className="text-blue-100 leading-relaxed">
              Tiên phong trong Y tế Xuất sắc, Chăm sóc Tin cậy.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="https://www.linkedin.com/in/t%C3%A0i-tr%C6%B0%C6%A1ng-074a77355/" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/home.php" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/taitruong6488/" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Liên kết quan trọng</h4>
            <ul className="space-y-3">
              {['Đặt lịch hẹn', 'Bác sĩ', 'Dịch vụ', 'Giới thiệu'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-blue-100 hover:text-white hover:pl-2 transition-all duration-300 inline-block group">
                    <span className="inline-block mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-blue-100 group">
                <Phone className="w-5 h-5 mt-1 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white">Gọi ngay</p>
                  <p>1800 1129</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-blue-100 group">
                <Mail className="w-5 h-5 mt-1 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <p className="break-all">fildineesoe@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-blue-100 group">
                <MapPin className="w-5 h-5 mt-1 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white">Địa chỉ</p>
                  <p>123 Quận 1, TP.HCM</p>
                  <p>Việt Nam</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-white">Nhận tin tức</h4>
            <p className="text-blue-100 mb-4 text-sm">
              Đăng ký để nhận thông tin mới nhất về dịch vụ và ưu đãi.
            </p>
            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn" 
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                />
                <button className="absolute right-1 top-1 bottom-1 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <Clock className="w-4 h-4" />
                <span>Thời gian làm việc: 24/7</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-blue-200 text-sm">
            <p className="text-center md:text-left">
              © 2025 <span className="font-semibold text-white">MEDDICAL</span>. All Rights Reserved by Trương Anh Tài.
            </p>
            <p className="text-center md:text-right">
              Thiết kế bởi Trương Anh Tài
            </p>
           
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;