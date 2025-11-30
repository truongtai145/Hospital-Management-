import React from 'react';
import Button from '../Button/Button';
import { Calendar, Users, Wallet } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gray-50 pb-20">
      {/* Background Banner Image */}
      <div 
        className="absolute inset-0 w-full h-[80%] bg-cover bg-center opacity-10 z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')" }}
      ></div>

      <div className="container mx-auto px-4 relative z-10 pt-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6">
          <p className="text-secondary font-bold tracking-widest uppercase">Chăm sóc trọn đời</p>
          <h1 className="text-5xl md:text-6xl text-primary font-serif leading-tight">
            Tiên phong trong <br /> Y tế Xuất sắc
          </h1>
          <Button variant="primary" className="mt-4">Dịch vụ của chúng tôi</Button>
        </div>
        
        {/* Doctor Image */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-end">
          <img 
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="Doctor" 
            className="h-[500px] object-cover rounded-tl-[100px] rounded-br-[100px] shadow-xl"
          />
        </div>
      </div>

      {/* Floating Info Cards */}
      <div className="container mx-auto px-4 mt-[-50px] relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 shadow-xl rounded-lg overflow-hidden">
          <div className="bg-primary p-8 text-white flex justify-between items-center hover:bg-blue-900 transition">
            <span className="text-lg font-medium">Đặt lịch hẹn</span>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
          <div className="bg-accent p-8 text-primary flex justify-between items-center hover:bg-blue-200 transition">
            <span className="text-lg font-medium">Tìm bác sĩ</span>
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <div className="bg-secondary p-8 text-white flex justify-between items-center hover:bg-blue-400 transition">
            <span className="text-lg font-medium">Thanh toán</span>
            <Wallet className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>
      
      {/* Welcome Text */}
      <div className="text-center max-w-2xl mx-auto mt-20 px-4">
        <p className="text-secondary font-bold uppercase tracking-widest text-sm mb-2">Chào mừng đến với Meddical</p>
        <h2 className="text-4xl text-primary mb-6">Nơi tuyệt vời để nhận sự chăm sóc</h2>
        <p className="text-gray-500 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Convallis felis vitae tortor augue.
        </p>
        <a href="#" className="text-secondary font-medium flex items-center justify-center gap-2 hover:underline">
          Xem thêm &rarr;
        </a>
      </div>
    </section>
  );
};

export default Hero;