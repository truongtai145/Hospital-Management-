import React from 'react';
import Button from '../Button/Button';

const Appointment = () => {
  return (
    <section className="relative py-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516574187841-69301976e495?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" }}>
      <div className="absolute inset-0 bg-white/80"></div>
      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row">
        <div className="md:w-1/2 pr-10 pt-10">
          <h2 className="text-4xl text-secondary font-bold mb-4">Đặt lịch khám</h2>
          <h3 className="text-5xl text-primary font-serif mb-6">Đặt lịch hẹn</h3>
          <p className="text-gray-600 mb-15">
        Quan tâm bản thân bắt đầu bằng một cuộc hẹn dành riêng cho bạn. Chỉ cần vài phút để đặt lịch, bạn đã chủ động dành thời gian chăm sóc sức khỏe và tinh thần của mình. Sự ưu tiên nhỏ hôm nay sẽ mang lại những thay đổi tích cực cho ngày mai. Hãy để chúng tôi đồng hành cùng bạn trong hành trình yêu thương chính mình.
          </p>
        </div>
        
        <div className="md:w-1/2 bg-primary p-8 rounded-lg shadow-2xl">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Họ và tên" className="p-3 bg-transparent border border-gray-500 text-white placeholder-gray-300 focus:outline-none focus:border-secondary" />
            <select className="p-3 bg-transparent border border-gray-500 text-white focus:outline-none focus:border-secondary">
              <option className="text-black">Giới tính</option>
              <option className="text-black">Nam</option>
              <option className="text-black">Nữ</option>
            </select>
            <input type="email" placeholder="Email" className="p-3 bg-transparent border border-gray-500 text-white placeholder-gray-300 focus:outline-none focus:border-secondary" />
            <input type="tel" placeholder="Số điện thoại" className="p-3 bg-transparent border border-gray-500 text-white placeholder-gray-300 focus:outline-none focus:border-secondary" />
            <select className="p-3 bg-transparent border border-gray-500 text-white focus:outline-none focus:border-secondary">
              <option className="text-black">Chọn Bác sĩ</option>
            </select>
            <select className="p-3 bg-transparent border border-gray-500 text-white focus:outline-none focus:border-secondary">
              <option className="text-black">Chọn Khoa</option>
            </select>
            <textarea placeholder="Tin nhắn" rows="4" className="md:col-span-2 p-3 bg-transparent border border-gray-500 text-white placeholder-gray-300 focus:outline-none focus:border-secondary"></textarea>
            <button className="md:col-span-2 bg-accent text-primary font-bold py-3 uppercase hover:bg-white transition">Gửi đi</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Appointment;