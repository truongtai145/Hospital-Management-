import React from 'react';

const WelcomeSection = () => {
  const features = [
    "Đam mê chữa lành", "Chăm sóc 5 sao",
    "Nỗ lực hết mình", "Tin tưởng vào chúng tôi",
    "Luôn luôn ân cần", "Di sản của sự xuất sắc"
  ];

  return (
    <section className="py-20 container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row items-center gap-12">
       
        <div className="lg:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Doctors Team" 
            className="rounded-lg shadow-xl w-full object-cover h-[500px]"
          />
        </div>

     
        <div className="lg:w-1/2 space-y-6">
          <p className="text-secondary font-bold uppercase tracking-widest text-sm">Chào mừng đến với Meddical</p>
          <h2 className="text-4xl md:text-5xl text-primary font-serif font-bold leading-tight">
            Chăm sóc tốt nhất cho <br /> sức khỏe của bạn
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {features.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></span>
                <span className="text-primary font-medium text-lg">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-gray-500 leading-relaxed text-justify">
            Chúng tôi tự hào là đơn vị tiên phong trong lĩnh vực y tế với đội ngũ chuyên gia hàng đầu. 
            Mọi quy trình thăm khám đều được chuẩn hóa nhằm mang lại trải nghiệm an toàn, 
            hiệu quả và thân thiện nhất cho người bệnh. Sức khỏe của bạn là sứ mệnh của chúng tôi.
          </p>

          <p className="text-gray-500 leading-relaxed text-justify">
            Hệ thống trang thiết bị hiện đại chuẩn quốc tế cùng không gian khám chữa bệnh sang trọng 
            sẽ giúp bạn cảm thấy thoải mái như đang ở chính ngôi nhà của mình.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;