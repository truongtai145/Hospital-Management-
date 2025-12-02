import React from 'react';
import Banner from '../../components/Banner/Banner';
import ServiceCard from '../../components/Services/ServiceCard';
import ContactGrid from '../../components/Contact/ContactInfo';

import { HeartPulse, Stethoscope, Microscope, Baby, Eye, Brain } from 'lucide-react';

const ServicePage = () => {
  // Dữ liệu mẫu (Giả lập từ API)
  const services = [
    {
      id: 1,
      title: 'Khám tổng quát',
      desc: 'Dịch vụ khám sức khỏe tổng quát giúp phát hiện sớm các nguy cơ tiềm ẩn. Quy trình nhanh chóng, chính xác với đội ngũ chuyên gia hàng đầu.',
      img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <Stethoscope size={32} />
    },
    {
      id: 2,
      title: 'Tim mạch',
      desc: 'Chẩn đoán và điều trị các bệnh lý tim mạch với trang thiết bị hiện đại. Đo điện tâm đồ, siêu âm tim và tư vấn lối sống lành mạnh.',
      img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <HeartPulse size={32} />
    },
    {
      id: 3,
      title: 'Xét nghiệm ADN',
      desc: 'Hệ thống phòng lab đạt chuẩn quốc tế. Cung cấp các xét nghiệm di truyền, xét nghiệm máu và phân tích sinh hóa chính xác tuyệt đối.',
      img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <Microscope size={32} />
    },
    {
      id: 4,
      title: 'Nhi khoa',
      desc: 'Chăm sóc sức khỏe toàn diện cho trẻ sơ sinh và trẻ nhỏ. Tiêm chủng, khám dinh dưỡng và điều trị các bệnh lý thường gặp ở trẻ.',
      img: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <Baby size={32} />
    },
    {
      id: 5,
      title: 'Nhãn khoa',
      desc: 'Điều trị các tật khúc xạ, phẫu thuật Lasik và các bệnh lý về mắt. Mang lại đôi mắt sáng khỏe cho mọi lứa tuổi.',
      img: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <Eye size={32} />
    },
    {
      id: 6,
      title: 'Thần kinh',
      desc: 'Chuyên khoa thần kinh với các phác đồ điều trị tiên tiến cho đau đầu, mất ngủ, và các rối loạn thần kinh khác.',
      img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <Brain size={32} />
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Banner */}
      <Banner breadcrumb="Trang chủ / Dịch vụ" title="Dịch vụ của chúng tôi" />

      {/* 2. Danh sách dịch vụ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((item) => (
              <ServiceCard 
                key={item.id}
                title={item.title}
                desc={item.desc}
                img={item.img}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Phần Contact Grid (Thông tin liên hệ) */}
      <ContactGrid />
    </div>
  );
};

export default ServicePage;