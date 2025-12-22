import React from 'react';
import { Search } from 'lucide-react';


const SidebarWidget = ({ title, children }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
    <div className="bg-primary text-white p-4 text-xl font-serif font-bold">
      {title}
    </div>
    <div className="p-6 bg-white">
      {children}
    </div>
  </div>
);

const BlogSidebar = () => {
  
  const recentPosts = [
    {
      img: "https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      date: "05 Tháng 9, 2023",
      title: "10 dấu hiệu cảnh báo bệnh tim mạch bạn không nên phớt lờ"
    },
    {
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      date: "02 Tháng 9, 2023",
      title: "Chế độ dinh dưỡng khoa học cho người bệnh tiểu đường"
    },
    {
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      date: "28 Tháng 8, 2023",
      title: "Tầm quan trọng của việc khám sức khỏe tổng quát định kỳ"
    },
    {
        img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
        date: "20 Tháng 8, 2023",
        title: "Công nghệ mới trong phẫu thuật mắt Lasik an toàn"
      },
  ];

 
  const categories = [
    { name: "Phẫu thuật & Chỉnh hình", count: 3 },
    { name: "Chăm sóc sức khỏe", count: 15 },
    { name: "Tin tức Y tế", count: 8 },
    { name: "Góc Chuyên gia", count: 10 },
    { name: "Nhi khoa", count: 5 },
  ];

  return (
    <div className="w-full">
      
      <div className="bg-primary p-8 rounded-lg mb-8 flex flex-col gap-2">
         <h3 className="text-white font-serif text-2xl mb-2">Tìm kiếm</h3>
         <div className="relative">
             <input 
                type="text" 
                placeholder="Nhập từ khóa tìm kiếm..." 
                className="w-full p-4 pr-12 rounded focus:outline-none text-gray-700"
             />
             <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-secondary transition">
                <Search />
             </button>
         </div>
      </div>

      
      <SidebarWidget title="Bài viết mới">
        <div className="space-y-6">
          {recentPosts.map((post, idx) => (
            <div key={idx} className="flex gap-4 group cursor-pointer">
              <img 
                src={post.img} 
                alt="thumbnail" 
                className="w-20 h-20 object-cover rounded shadow-sm group-hover:opacity-80 transition"
              />
              <div>
                <p className="text-secondary text-xs font-bold mb-1">{post.date}</p>
                <h4 className="text-primary font-bold text-sm leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </SidebarWidget>

     
      <SidebarWidget title="Danh mục">
        <ul className="space-y-4">
          {categories.map((cat, idx) => (
            <li key={idx} className="flex justify-between items-center group cursor-pointer border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-600 font-medium group-hover:text-primary transition-colors text-sm">
                {cat.name}
              </span>
              <span className="bg-blue-100 text-primary text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold group-hover:bg-secondary group-hover:text-white transition">
                {cat.count}
              </span>
            </li>
          ))}
        </ul>
      </SidebarWidget>
    </div>
  );
};

export default BlogSidebar;