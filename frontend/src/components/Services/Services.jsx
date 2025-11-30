import React from 'react';
import { Activity, Heart, TestTube, Thermometer } from 'lucide-react';

const Services = () => {
  const servicesList = [
    { icon: <Activity />, label: "Kiểm tra miễn phí" },
    { icon: <Heart />, label: "Điện tâm đồ", active: true },
    { icon: <TestTube />, label: "Xét nghiệm DNA" },
    { icon: <Thermometer />, label: "Ngân hàng máu" },
  ];

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-bold uppercase tracking-widest text-sm">Sự chăm sóc bạn có thể tin tưởng</p>
          <h2 className="text-4xl text-primary">Dịch vụ của chúng tôi</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Menu */}
          <div className="md:w-1/4 flex flex-col gap-1">
            {servicesList.map((item, idx) => (
              <button 
                key={idx} 
                className={`flex flex-col items-center justify-center py-8 px-4 transition-all duration-300 border-b md:border-b-0 md:border-r border-gray-100
                  ${item.active ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-accent'}`}
              >
                <div className="w-8 h-8 mb-2">{item.icon}</div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            <button className="bg-primary text-white py-4 mt-4 rounded hover:bg-blue-900">Xem tất cả</button>
          </div>

          {/* Content */}
          <div className="md:w-3/4 flex flex-col md:flex-row items-center gap-8">
            <div className="space-y-6 md:w-1/2">
              <h3 className="text-3xl text-primary">Đam mê đặt bệnh nhân lên hàng đầu</h3>
              <ul className="grid grid-cols-2 gap-4 text-gray-600">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-secondary rounded-full"></span>Đam mê chữa lành</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-secondary rounded-full"></span>Chăm sóc 5 sao</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-secondary rounded-full"></span>Tất cả nỗ lực</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-secondary rounded-full"></span>Tin tưởng vào chúng tôi</li>
              </ul>
              <p className="text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare.
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
               <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" className="rounded-lg shadow-md w-full h-48 object-cover translate-y-8" alt="Service 1"/>
               <img src="https://images.unsplash.com/photo-1576091160550-2187d80aeff2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" className="rounded-lg shadow-md w-full h-48 object-cover" alt="Service 2"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;