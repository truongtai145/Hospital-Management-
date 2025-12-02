import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // 1. Import useParams và Link
import { Calendar, User, Eye, Heart, ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import BlogSidebar from '../../components/Blog/BlogSideBar';
import ContactInfo from '../../components/Contact/ContactInfo';

// --- 2. GIẢ LẬP DATABASE BÀI VIẾT (MOCK DATA) ---
// Trong thực tế, bạn sẽ gọi API để lấy thông tin bài viết theo ID
const allPosts = [
  {
    id: 1,
    title: "Đam mê đặt bệnh nhân lên hàng đầu: Sứ mệnh và Trách nhiệm",
    date: "Thứ 2, 05/09/2023",
    author: "Bác sĩ CKII Nguyễn Văn A",
    views: 1234,
    likes: 86,
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    content: `Tại Meddical, chúng tôi hiểu rằng mỗi bệnh nhân đều mang trong mình những lo lắng và hy vọng riêng. Chính vì vậy, phương châm "Đặt lợi ích người bệnh lên hàng đầu" không chỉ là khẩu hiệu...`,
    quote: "Y đức là phẩm chất quan trọng nhất của người thầy thuốc.",
    details: "Việc xây dựng mối quan hệ tin cậy giữa bác sĩ và bệnh nhân là yếu tố then chốt. Chúng tôi dành thời gian lắng nghe kỹ lưỡng từng triệu chứng..."
  },
  {
    id: 2,
    title: "Cung cấp dịch vụ chăm sóc xuất sắc cho cộng đồng",
    date: "Thứ 3, 06/09/2023",
    author: "Admin",
    views: 890,
    likes: 120,
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    content: "Chúng tôi không ngừng nâng cấp trang thiết bị và cập nhật các phương pháp điều trị tiên tiến nhất thế giới. Sức khỏe cộng đồng là mục tiêu dài hạn...",
    quote: "Sự hài lòng của người bệnh là thước đo thành công của chúng tôi.",
    details: "Hệ thống phòng khám vệ tinh được mở rộng giúp người dân tiếp cận dịch vụ y tế dễ dàng hơn..."
  },
  {
    id: 3,
    title: "Tầm quan trọng của việc khám sức khỏe định kỳ",
    date: "Thứ 4, 07/09/2023",
    author: "Bác sĩ Trần Thị B",
    views: 567,
    likes: 45,
    img: "https://images.unsplash.com/photo-1584982751601-97dcc096654c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    content: "Đừng đợi đến khi có bệnh mới đi khám. Việc kiểm tra sức khỏe tổng quát 6 tháng/lần giúp phát hiện sớm các nguy cơ tiềm ẩn như tiểu đường, mỡ máu...",
    quote: "Phòng bệnh hơn chữa bệnh - Nguyên tắc vàng trong y khoa.",
    details: "Các gói khám được thiết kế linh hoạt phù hợp với từng độ tuổi và giới tính..."
  },
  // Bạn có thể thêm id: 4, 5, 6... vào đây
];

const SingleNewsPage = () => {
  // 1. Lấy ID từ URL
  const { id } = useParams();
  
  // 3. Tìm bài viết tương ứng
  // Lưu ý: id từ URL là chuỗi (string), cần ép kiểu sang số (Number) để so sánh
  const currentId = Number(id);
  const post = allPosts.find(p => p.id === currentId);

  // Xử lý bài trước / bài sau
  const prevPost = allPosts.find(p => p.id === currentId - 1);
  const nextPost = allPosts.find(p => p.id === currentId + 1);

  // Scroll lên đầu trang mỗi khi chuyển bài viết
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Nếu không tìm thấy bài viết (VD nhập id=999)
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-3xl font-bold text-primary">Bài viết không tồn tại</h2>
        <Link to="/news" className="text-secondary hover:underline">Quay lại trang tin tức</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. CUSTOM BANNER - HIỂN THỊ DỮ LIỆU ĐỘNG TỪ 'post' */}
      <div className="relative w-full h-[400px] flex items-center bg-gray-900 overflow-hidden">
        {/* Ảnh nền động theo bài viết */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${post.img}')` }}
        >
          <div className="absolute inset-0 bg-primary/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <p className="text-blue-200 font-medium mb-3 uppercase tracking-wide text-sm">
            Trang chủ / Tin tức / Chi tiết
          </p>
          
          <h1 className="text-4xl md:text-5xl font-serif text-white font-bold mb-6 leading-tight max-w-4xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-secondary" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-secondary" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-secondary" />
              <span>{post.views} Lượt xem</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-secondary" />
              <span>{post.likes} Yêu thích</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG CHI TIẾT */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* CỘT TRÁI */}
            <div className="lg:w-2/3">
              
              <div className="rounded-lg overflow-hidden mb-8 shadow-lg">
                <img 
                  src={post.img} 
                  alt={post.title} 
                  className="w-full h-auto object-cover"
                />
              </div>

              <article className="text-gray-600 leading-loose text-justify space-y-6 text-lg">
                <p>{post.content}</p>

                {/* Quote Block */}
                {post.quote && (
                  <div className="bg-blue-50 border-l-4 border-secondary p-8 my-8 rounded-r-lg relative italic text-primary font-serif text-xl">
                    <Quote className="absolute top-4 left-4 text-secondary/20 w-12 h-12 -z-10" />
                    "{post.quote}"
                  </div>
                )}

                <p>{post.details}</p>
                
                <p>
                  Cam kết của chúng tôi là mang lại dịch vụ y tế chuẩn quốc tế ngay tại Việt Nam, để mỗi người dân 
                  đều được hưởng sự chăm sóc sức khỏe tốt nhất với chi phí hợp lý.
                </p>
              </article>

              {/* Nút điều hướng Bài trước / Bài sau */}
              <div className="border-t border-b border-gray-200 py-8 mt-12 flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Nút Bài trước (Chỉ hiện nếu có prevPost) */}
                {prevPost ? (
                  <Link to={`/news/${prevPost.id}`} className="group flex items-center gap-4 bg-blue-50 hover:bg-primary hover:text-white px-6 py-4 rounded-lg transition-all w-full sm:w-1/2">
                    <ArrowLeft className="text-secondary group-hover:text-white transition-colors" />
                    <div className="text-left">
                      <span className="block text-xs uppercase text-gray-400 group-hover:text-blue-200 font-bold mb-1">Bài trước</span>
                      <span className="font-serif font-bold text-primary group-hover:text-white line-clamp-1">{prevPost.title}</span>
                    </div>
                  </Link>
                ) : <div className="w-full sm:w-1/2"></div>}

                {/* Nút Bài sau (Chỉ hiện nếu có nextPost) */}
                {nextPost ? (
                  <Link to={`/news/${nextPost.id}`} className="group flex items-center justify-end gap-4 bg-blue-50 hover:bg-primary hover:text-white px-6 py-4 rounded-lg transition-all w-full sm:w-1/2">
                    <div className="text-right">
                      <span className="block text-xs uppercase text-gray-400 group-hover:text-blue-200 font-bold mb-1">Bài tiếp theo</span>
                      <span className="font-serif font-bold text-primary group-hover:text-white line-clamp-1">{nextPost.title}</span>
                    </div>
                    <ArrowRight className="text-secondary group-hover:text-white transition-colors" />
                  </Link>
                ) : <div className="w-full sm:w-1/2"></div>}

              </div>
            </div>

            {/* CỘT PHẢI (SIDEBAR) */}
            <div className="lg:w-1/3">
              <BlogSidebar />
            </div>

          </div>
        </div>
      </section>

      <ContactInfo />
    </div>
  );
};

export default SingleNewsPage;