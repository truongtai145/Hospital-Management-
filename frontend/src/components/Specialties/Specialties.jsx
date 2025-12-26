import React from 'react';
import { Heart, Brain, Bone, Eye, Stethoscope, Droplet, Wind, Activity } from 'lucide-react';

const SpecialtyCard = ({ icon, title, isHighlight = false }) => (
  <div className={`relative border border-gray-200 p-8 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 group overflow-hidden ${
    isHighlight ? 'bg-blue-600' : 'bg-white hover:bg-blue-600'
  }`}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className={`relative z-10 w-14 h-14 mb-4 transition-all duration-300 ${
      isHighlight ? 'text-white scale-110' : 'text-blue-600 group-hover:text-white group-hover:scale-110'
    }`}>
      {icon}
    </div>
    <h4 className={`relative z-10 font-semibold text-center transition-colors duration-300 ${
      isHighlight ? 'text-white' : 'text-gray-800 group-hover:text-white'
    }`}>
      {title}
    </h4>
  </div>
);

const Specialties = () => {
  const specialties = [
    { icon: <Brain className="w-full h-full" />, title: "Thần kinh học", highlight: false },
    { icon: <Bone className="w-full h-full" />, title: "Xương khớp", highlight: true },
    { icon: <Activity className="w-full h-full" />, title: "Ung bướu", highlight: false },
    { icon: <Stethoscope className="w-full h-full" />, title: "Tai Mũi Họng", highlight: false },
    { icon: <Eye className="w-full h-full" />, title: "Nhãn khoa", highlight: false },
    { icon: <Heart className="w-full h-full" />, title: "Tim mạch", highlight: false },
    { icon: <Wind className="w-full h-full" />, title: "Phổi học", highlight: false },
    { icon: <Droplet className="w-full h-full" />, title: "Thận học", highlight: false }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3 animate-pulse">
            Luôn ân cần
          </p>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Các chuyên khoa
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 shadow-2xl rounded-lg overflow-hidden">
          {specialties.map((specialty, index) => (
            <SpecialtyCard
              key={index}
              icon={specialty.icon}
              title={specialty.title}
              isHighlight={specialty.highlight}
            />
          ))}
        </div>
        
       
      </div>
    </section>
  );
};

export default Specialties;