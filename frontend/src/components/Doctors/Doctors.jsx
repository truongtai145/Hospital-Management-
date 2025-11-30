import React from 'react';
import { Linkedin, Facebook, Instagram } from 'lucide-react';

const DoctorCard = ({ img, name, role }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
    <div className="relative overflow-hidden">
        <img src={img} alt={name} className="w-full h-80 object-cover object-top transition duration-500 group-hover:scale-110" />
    </div>
    <div className="p-6 text-center bg-blue-50 group-hover:bg-primary transition duration-300">
      <h4 className="text-xl font-bold text-primary group-hover:text-white">{name}</h4>
      <p className="text-secondary font-bold uppercase text-sm mb-4 group-hover:text-white/80">{role}</p>
      <div className="flex justify-center gap-4 text-primary group-hover:text-white">
        <Linkedin className="w-5 h-5 cursor-pointer" />
        <Facebook className="w-5 h-5 cursor-pointer" />
        <Instagram className="w-5 h-5 cursor-pointer" />
      </div>
    </div>
    <div className="bg-primary text-white text-center py-3 text-sm font-medium cursor-pointer hover:bg-secondary transition">Xem hồ sơ</div>
  </div>
);

const Doctors = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-secondary font-bold uppercase tracking-widest text-sm">Chăm sóc tin cậy</p>
        <h2 className="text-4xl text-primary">Bác sĩ của chúng tôi</h2>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <DoctorCard 
          img="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
          name="Bs. Nguyễn Văn A"
          role="Thần kinh học"
        />
        <DoctorCard 
          img="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
          name="Bs. Trần Thị B"
          role="Thần kinh học"
        />
        <DoctorCard 
          img="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
          name="Bs. Lê Văn C"
          role="Thần kinh học"
        />
      </div>
    </section>
  );
};

export default Doctors;