import React from "react";
import { Activity, Heart, TestTube, Thermometer } from "lucide-react";

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
        {/* --- Phần tiêu đề Section --- */}
        <div className="text-center mb-16">
          <p className="text-secondary font-bold uppercase tracking-widest text-lg mb-3">
            {/* Đã tăng từ text-sm lên text-lg */}
            Sự chăm sóc bạn có thể tin tưởng
          </p>
          <h2 className="text-5xl text-primary font-serif">
            {/* Đã tăng từ text-4xl lên text-5xl */}
            Dịch vụ của chúng tôi
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Menu */}
          <div className="md:w-1/4 flex flex-col gap-1">
            {servicesList.map((item, idx) => (
              <button
                key={idx}
                className={`flex flex-col items-center justify-center py-8 px-6 transition-all duration-300 border-b md:border-b-0 md:border-r border-gray-100 text-lg
                  ${
                    item.active
                      ? "bg-primary text-white scale-105 shadow-lg rounded-l" 
                      : "bg-white text-primary hover:bg-accent hover:scale-105"
                  }`}
              >
                {/* Tăng kích thước icon một chút để cân đối với chữ */}
                <div className="w-10 h-10 mb-3">{item.icon}</div>
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
            <button className="bg-primary text-white text-lg font-medium py-5 mt-6 rounded shadow-lg hover:bg-blue-900 transition-colors">
              Xem tất cả
            </button>
          </div>

          {/* Content */}
          <div className="md:w-3/4 flex flex-col md:flex-row items-center gap-10">
            <div className="space-y-8 md:w-1/2">
              <h3 className="text-4xl text-primary font-serif">
                {/* Tăng từ text-3xl lên text-4xl */}
                Đam mê đặt bệnh nhân lên hàng đầu
              </h3>
              
              {/* Tăng cỡ chữ danh sách lên text-lg */}
              <ul className="grid grid-cols-2 gap-6 text-gray-700 text-lg font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></span>
                  Đam mê chữa lành
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></span>
                  Chăm sóc 5 sao
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></span>
                  Tất cả nỗ lực
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></span>
                  Tin tưởng chúng tôi
                </li>
              </ul>

              {/* Tăng cỡ chữ đoạn văn và giãn dòng */}
              <p className="text-gray-500 text-lg leading-loose text-justify">
                "Với sứ mệnh phụng sự sức khỏe cộng đồng, chúng tôi không ngừng
                nỗ lực nâng cao chuyên môn và cập nhật công nghệ hiện đại nhất.
                Mỗi quy trình thăm khám đều được tối ưu hóa để mang lại trải
                nghiệm thoải mái, chính xác và hiệu quả điều trị cao nhất."
              </p>
            </div>

            {/* Ảnh minh họa */}
            <div className="md:w-1/2 grid grid-cols-2 gap-4 relative">
               {/* Trang trí background nhẹ sau ảnh */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-blue-50 -z-10 rounded-full blur-2xl opacity-60"></div>
              
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                className="rounded-xl shadow-lg w-full h-56 object-cover translate-y-10 hover:scale-105 transition-transform duration-500"
                alt="Service 1"
              />
              <img
                src="https://images.unsplash.com/photo-1576091160550-2187d80aeff2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                className="rounded-xl shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                alt="Service 2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;