import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Wallet, ArrowRight } from 'lucide-react';
import Button from '../Button/Button';

// URL hình ảnh mẫu
const heroDoctorImage =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
const teamImage =
  'https://images.unsplash.com/photo-1622253694268-23c2fe005d52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

const Hero = () => {
  return (
    <>
      <section className="w-full bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          {/* Nội dung chính Hero */}
          <div className="flex flex-col lg:flex-row items-center pt-24 pb-12 lg:pb-32">
            {/* Bên trái - Nội dung chữ */}
            <div className="lg:w-1/2 text-center lg:text-left z-10">
              <p className="font-bold text-sm uppercase tracking-widest text-secondary mb-4">
                CHĂM SÓC CUỘC SỐNG
              </p>
              <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight font-medium">
                Dẫn đầu về <br /> chất lượng y tế
              </h1>
              <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto lg:mx-0">
                Chúng tôi mang đến dịch vụ chăm sóc sức khỏe hiện đại, tận tâm
                và luôn đặt sức khỏe của bạn lên hàng đầu.
              </p>
              <div className="mt-10">
                <Link to="/services">
                  <Button
                    variant="primary"
                    className="px-10 py-4 font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Xem dịch vụ
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bên phải - Hình ảnh */}
            <div className="lg:w-1/2 flex items-center justify-center mt-12 lg:mt-0">
              <div className="relative w-[450px] h-[500px]">
                {/* Background shape */}
                <div className="absolute top-0 right-0 w-full h-full bg-blue-100 rounded-3xl transform -rotate-6"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-primary/80 rounded-3xl transform rotate-6"></div>

                {/* Hình bác sĩ */}
                <img
                  src={heroDoctorImage}
                  alt="Bác sĩ đang mỉm cười"
                  className="absolute top-0 right-0 w-full h-full object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Các thẻ thông tin (floating cards) */}
          <div className="relative z-20 pb-20 lg:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 shadow-2xl rounded-xl overflow-hidden text-center lg:text-left">
              <Link
                to="/appointment"
                className="group bg-primary p-8 text-white flex flex-col md:flex-row items-center gap-4 hover:bg-blue-900 transition-colors duration-300"
              >
                <Calendar
                  className="w-10 h-10 text-white/70 group-hover:text-white transition-colors duration-300"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="font-bold text-xl">Đặt lịch hẹn</h3>
                  <p className="text-sm text-white/80 mt-1">
                    Nhanh chóng – tiện lợi – bất cứ lúc nào.
                  </p>
                </div>
              </Link>

              <Link
                to="/doctors"
                className="group bg-slate-100 p-8 text-primary flex flex-col md:flex-row items-center gap-4 hover:bg-slate-200 transition-colors duration-300"
              >
                <Users
                  className="w-10 h-10 text-primary/70 group-hover:text-primary transition-colors duration-300"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="font-bold text-xl">Tìm bác sĩ</h3>
                  <p className="text-sm text-primary/80 mt-1">
                    Đội ngũ chuyên gia hàng đầu luôn sẵn sàng.
                  </p>
                </div>
              </Link>

              <Link
                to="/payment"
                className="group bg-secondary p-8 text-white flex flex-col md:flex-row items-center gap-4 hover:bg-blue-400 transition-colors duration-300"
              >
                <Wallet
                  className="w-10 h-10 text-white/70 group-hover:text-white transition-colors duration-300"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="font-bold text-xl">Thanh toán</h3>
                  <p className="text-sm text-white/80 mt-1">
                    An toàn – minh bạch – dễ dàng.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center">
          <p className="font-bold text-sm uppercase tracking-widest text-secondary mb-4">
            CHÀO MỪNG ĐẾN VỚI MEDDICAL
          </p>
          <h2 className="text-4xl lg:text-5xl font-serif text-primary font-medium mb-6">
            Nơi chăm sóc sức khỏe đáng tin cậy
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-500 leading-relaxed mb-10">
            Tại Meddical, chúng tôi mang đến chất lượng chăm sóc sức khỏe vượt
            trội nhờ đội ngũ bác sĩ tận tâm và công nghệ tiên tiến. Sứ mệnh của
            chúng tôi là cải thiện sức khỏe và cuộc sống của bạn.
          </p>
          <Link
            to="/about"
            className="text-primary font-bold flex items-center justify-center gap-2 group hover:text-secondary transition-colors"
          >
            Tìm hiểu thêm
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="mt-16">
            <img
              src={teamImage}
              alt="Đội ngũ bác sĩ"
              className="rounded-2xl shadow-xl w-full max-w-5xl mx-auto"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
