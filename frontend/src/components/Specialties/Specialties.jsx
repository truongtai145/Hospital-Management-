import React from 'react';
import { Heart, Brain, Bone, Eye } from 'lucide-react';

const SpecialtyCard = ({ icon, title }) => (
  <div className="border border-gray-200 p-8 flex flex-col items-center justify-center hover:shadow-lg transition bg-white group hover:bg-primary">
    <div className="w-12 h-12 text-secondary mb-4 group-hover:text-white">{icon}</div>
    <h4 className="text-primary font-medium group-hover:text-white">{title}</h4>
  </div>
);

const Specialties = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-secondary font-bold uppercase tracking-widest text-sm">Luôn ân cần</p>
        <h2 className="text-4xl text-primary">Các chuyên khoa</h2>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-0">
         <SpecialtyCard icon={<Brain />} title="Thần kinh học" />
         <div className="bg-primary p-8 flex flex-col items-center justify-center">
            <Bone className="w-12 h-12 text-white mb-4" />
            <h4 className="text-white font-medium">Xương khớp</h4>
         </div>
         <SpecialtyCard icon={<Heart />} title="Ung bướu" />
         <SpecialtyCard icon={<Eye />} title="Tai Mũi Họng" />
         <SpecialtyCard icon={<Eye />} title="Nhãn khoa" />
         <SpecialtyCard icon={<Heart />} title="Tim mạch" />
         <SpecialtyCard icon={<Heart />} title="Phổi học" />
         <SpecialtyCard icon={<Heart />} title="Thận học" />
      </div>
    </section>
  );
};

export default Specialties;