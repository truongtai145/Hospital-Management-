import React from 'react';
import { Calendar, User, Eye, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


const BlogPost = ({ id, img, date, author, views, likes, title, desc }) => {
  return (
    <div className="mb-12 group">
   
      <div className="overflow-hidden rounded-lg mb-6 cursor-pointer">
        <Link to={`/news/${id}`}>
          <img 
            src={img} 
            alt={title} 
            className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

  
      <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-secondary" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} className="text-secondary" />
          <span>{author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-secondary" />
          <span>{views}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-secondary" />
          <span>{likes}</span>
        </div>
      </div>

     
      <Link to={`/news/${id}`}>
        <h3 className="text-3xl font-serif text-primary font-bold mb-4 hover:text-secondary transition-colors cursor-pointer">
          {title}
        </h3>
      </Link>

      <p className="text-gray-500 leading-relaxed mb-6 text-justify">
        {desc}
      </p>

     
      <Link 
        to={`/news/${id}`} 
        className="inline-flex items-center gap-2 bg-blue-100 text-primary px-6 py-3 rounded-full font-medium hover:bg-secondary hover:text-white transition-all"
      >
        Xem chi tiết <ArrowRight size={18} />
      </Link>
    </div>
  );
};

export default BlogPost;