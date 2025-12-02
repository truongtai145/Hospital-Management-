import React from 'react';
import Banner from '../../components/Banner/Banner';
import NewsSection from '../../components/About/NewsSection';
import Contactinfo from '../../components/Contact/ContactInfo';

import { Phone, MapPin, Mail, Clock, Send } from 'lucide-react';

const ContactPage = () => {
  
  // Xử lý gửi form 
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!");
  };

  return (
    <div className="bg-white min-h-screen">
      

      <Banner breadcrumb="Trang chủ / Liên hệ" title="Liên hệ với chúng tôi" />

      
      <section className="w-full">
        <iframe 
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424168645758!2d106.6970891!3d10.7787834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x1787491df6ed1d64!2zTmhhdCBoYW4gVm8gLCBRdWF1biAxLCBIaC4gSGljaW1pbmggQ2l0eQ!5e0!3m2!1sen!2s!4v1626078345719!5m2!1sen!2s" 
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
        ></iframe>
      </section>

    
      <section className="py-20 container mx-auto px-4 max-w-7xl">
        
       
        <div className="mb-10 text-center md:text-left">
            <h4 className="text-secondary font-bold uppercase tracking-widest text-sm mb-2">Giữ liên lạc</h4>
            <h2 className="text-4xl text-primary font-serif font-bold">Liên hệ</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/*from liên hệ */}
          <div className="lg:w-1/2 bg-primary rounded-lg overflow-hidden text-white flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Họ và tên" 
                  className="bg-transparent border-b border-white/30 w-full py-3 focus:outline-none focus:border-secondary transition-colors placeholder-gray-400"
                  required
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="bg-transparent border-b border-white/30 w-full py-3 focus:outline-none focus:border-secondary transition-colors placeholder-gray-400"
                  required
                />
              </div>
              
              <input 
                  type="text" 
                  placeholder="Tiêu đề" 
                  className="bg-transparent border-b border-white/30 w-full py-3 focus:outline-none focus:border-secondary transition-colors placeholder-gray-400"
              />
              
              <textarea 
                  rows="5" 
                  placeholder="Nội dung tin nhắn"
                  className="bg-transparent border-b border-white/30 w-full py-3 focus:outline-none focus:border-secondary transition-colors placeholder-gray-400 resize-none"
                  required
              ></textarea>
            </form>

            {/* Nút Submit nằm dính đáy */}
            <button 
                onClick={handleSubmit}
                className="w-full bg-blue-200 text-primary font-bold py-5 uppercase hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2"
            >
                Gửi tin nhắn <Send size={18} />
            </button>
          </div>

          {/* --- CỘT PHẢI: GRID THÔNG TIN (2x2) --- */}
          <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Emergency */}
            <div className="bg-blue-100 p-8 rounded-lg flex flex-col items-start justify-center hover:shadow-lg transition-all">
               <Phone className="text-primary w-8 h-8 mb-4" />
               <h4 className="font-bold text-primary uppercase mb-2">Khẩn cấp</h4>
               <p className="text-gray-600">(237) 681-812-255</p>
               <p className="text-gray-600">(237) 666-331-894</p>
            </div>

            {/* Card 2: Location (Màu đậm theo thiết kế hình 3) */}
            <div className="bg-primary p-8 rounded-lg flex flex-col items-start justify-center hover:shadow-lg transition-all text-white">
               <MapPin className="w-8 h-8 mb-4" />
               <h4 className="font-bold uppercase mb-2">Địa chỉ</h4>
               <p className="text-blue-200">0123 Quận 1, TP.HCM</p>
               <p className="text-blue-200">9876 Việt Nam</p>
            </div>

            {/* Card 3: Email */}
            <div className="bg-blue-100 p-8 rounded-lg flex flex-col items-start justify-center hover:shadow-lg transition-all">
               <Mail className="text-primary w-8 h-8 mb-4" />
               <h4 className="font-bold text-primary uppercase mb-2">Email</h4>
               <p className="text-gray-600 text-sm">fildineesoe@gmail.com</p>
               <p className="text-gray-600 text-sm">myebstudios@gmail.com</p>
            </div>

            {/* Card 4: Working Hours */}
            <div className="bg-blue-100 p-8 rounded-lg flex flex-col items-start justify-center hover:shadow-lg transition-all">
               <Clock className="text-primary w-8 h-8 mb-4" />
               <h4 className="font-bold text-primary uppercase mb-2">Giờ làm việc</h4>
               <p className="text-gray-600 text-sm">T2-T7: 09:00 - 20:00</p>
               <p className="text-gray-600 text-sm">Chủ nhật: Cấp cứu</p>
            </div>

          </div>
        </div>
      </section>
       <NewsSection />
        <Contactinfo />
    </div>
  );
};

export default ContactPage;