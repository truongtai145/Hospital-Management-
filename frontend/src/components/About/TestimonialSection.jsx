import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialSection = () => {
  return (
    <section 
      className="relative py-24 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" }}
    >
      {/* Lớp phủ màu xanh đậm */}
      <div className="absolute inset-0 bg-primary/80"></div>

      <div className="container mx-auto px-4 relative z-10 text-center text-white max-w-4xl">
        <Quote size={60} className="mx-auto mb-8 opacity-80" />
        
        <p className="text-xl md:text-3xl font-serif italic leading-relaxed mb-8">
          "Đội ngũ y bác sĩ tại Meddical không chỉ giỏi chuyên môn mà còn vô cùng tận tâm. 
          Họ đã chăm sóc tôi như người thân trong gia đình. Tôi thực sự biết ơn vì đã tìm được nơi khám chữa bệnh tuyệt vời như thế này."
        </p>
        
        <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
        <h4 className="text-xl font-bold uppercase">Nguyễn Văn A</h4>
        <p className="text-blue-200">Bệnh nhân khoa Tim mạch</p>

        {/* Dấu chấm chuyển slide (Giả lập) */}
        <div className="flex justify-center gap-3 mt-8">
            <span className="w-3 h-3 rounded-full bg-white cursor-pointer"></span>
            <span className="w-3 h-3 rounded-full bg-secondary cursor-pointer"></span>
            <span className="w-3 h-3 rounded-full bg-white opacity-50 cursor-pointer"></span>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;