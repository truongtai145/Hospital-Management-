import React from 'react';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';

const ContactInfo = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-secondary font-bold uppercase tracking-widest text-sm">Giữ liên lạc</p>
        <h2 className="text-4xl text-primary">Liên hệ</h2>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-accent p-8 rounded text-primary hover:bg-primary hover:text-white transition group">
          <Phone className="w-8 h-8 mb-4 text-primary group-hover:text-white" />
          <h4 className="font-bold uppercase mb-2">Khẩn cấp</h4>
          <p>(237) 681-812-255</p>
          <p>(237) 666-331-894</p>
        </div>
        <div className="bg-primary p-8 rounded text-white">
          <MapPin className="w-8 h-8 mb-4" />
          <h4 className="font-bold uppercase mb-2">Địa điểm</h4>
          <p>0123 Quận 1, TP.HCM</p>
          <p>9876 Việt Nam</p>
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
          <p>T2-T7: 09:00 - 20:00</p>
          <p>CN: Chỉ cấp cứu</p>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;