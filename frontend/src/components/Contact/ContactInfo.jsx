import React from 'react';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';

const ContactInfo = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center mb-12">
     
        <h2 className="text-4xl text-primary">Liên hệ</h2>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-accent p-8 rounded text-primary hover:bg-primary hover:text-white transition group">
          <Phone className="w-8 h-8 mb-4 text-primary group-hover:text-white" />
          <h4 className="font-bold uppercase mb-2">Khẩn cấp</h4>
          <p>1800 1129</p>
          <p>1800 1999</p>
        </div>
        <div className="bg-primary p-8 rounded text-white">
          <MapPin className="w-8 h-8 mb-4" />
          <h4 className="font-bold uppercase mb-2">Địa điểm</h4>
          <p>0123 Quận 1, TP.HCM</p>
          <p> Việt Nam</p>
        </div>
        <div className="bg-accent p-8 rounded text-primary hover:bg-primary hover:text-white transition group">
          <Mail className="w-8 h-8 mb-4 text-primary group-hover:text-white" />
          <h4 className="font-bold uppercase mb-2">Email</h4>
          <p>admin@meddical.com</p>
          <p>info@meddical.com</p>
        </div>
        <div className="bg-accent p-8 rounded text-primary hover:bg-primary hover:text-white transition group">
          <Clock className="w-8 h-8 mb-4 text-primary group-hover:text-white" />
          <h4 className="font-bold uppercase mb-2">Giờ làm việc</h4>
          <p>T2-CN: 08:00 - 20:00</p>
          <p>Hỗ trợ 24/7</p>
        
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;