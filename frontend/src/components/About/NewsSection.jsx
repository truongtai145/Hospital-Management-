import React from 'react';
import { Eye, Heart } from 'lucide-react';

const NewsCard = ({ image }) => (
  <div className="flex gap-4 bg-white p-4 rounded-lg hover:shadow-md transition-shadow group cursor-pointer">
    <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-md">
      <img src={image} alt="News" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
    </div>
    <div className="flex flex-col justify-center">
      <p className="text-secondary text-xs font-bold mb-1">Thứ 2, 05/09/2023 | Bởi Admin</p>
      <h3 className="text-primary font-bold text-lg leading-tight mb-2 group-hover:text-secondary transition-colors">
        Tiêu đề bài viết y tế sẽ nằm ở đây, không quá dài
      </h3>
      <div className="flex gap-4 text-gray-400 text-sm mt-auto">
         <span className="flex items-center gap-1"><Eye size={14}/> 68</span>
         <span className="flex items-center gap-1"><Heart size={14}/> 86</span>
      </div>
    </div>
  </div>
);

const NewsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-secondary font-bold uppercase tracking-widest text-sm">Thông tin tốt hơn, Sức khỏe tốt hơn</p>
          <h2 className="text-4xl text-primary font-serif">Tin tức y tế</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái */}
            <div className="space-y-6">
                <NewsCard image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" />
                <NewsCard image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" />
            </div>
            {/* Cột phải */}
            <div className="space-y-6">
                <NewsCard image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" />
                <NewsCard image="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" />
            </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;