import React, { useState, useEffect } from "react";
import Banner from "../../components/Banner/Banner";
import BlogPost from "../../components/Blog/BlogPost";
import BlogSidebar from "../../components/Blog/BlogSidebar";
import ContactInfo from "../../components/Contact/ContactInfo";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Icon cho nút chuyển trang

const generateMockPosts = () => {
  const basePosts = [
    {
      title: "Đam mê đặt bệnh nhân lên hàng đầu",
      desc: "Tại Meddical, chúng tôi tin rằng sự thấu hiểu và sẻ chia là liều thuốc tinh thần tốt nhất. Đội ngũ y bác sĩ luôn sẵn sàng lắng nghe để đưa ra phác đồ điều trị phù hợp nhất cho từng bệnh nhân.",
      img: "https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Cung cấp dịch vụ chăm sóc xuất sắc cho cộng đồng",
      desc: "Chúng tôi không ngừng nâng cấp trang thiết bị và cập nhật các phương pháp điều trị tiên tiến nhất thế giới để phục vụ cộng đồng. Sức khỏe của bạn là sứ mệnh của chúng tôi.",
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Tầm quan trọng của việc khám sức khỏe định kỳ",
      desc: "Đừng đợi đến khi có bệnh mới đi khám. Việc kiểm tra sức khỏe tổng quát 6 tháng/lần giúp phát hiện sớm các nguy cơ tiềm ẩn như tiểu đường, mỡ máu, tim mạch...",
      img: "https://images.unsplash.com/photo-1584982751601-97dcc096654c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Công nghệ AI trong chẩn đoán hình ảnh",
      desc: "Ứng dụng trí tuệ nhân tạo giúp các bác sĩ đọc kết quả X-Quang và MRI chính xác hơn gấp 3 lần, giảm thiểu sai sót và rút ngắn thời gian chờ đợi của bệnh nhân.",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Bí quyết dinh dưỡng cho người cao tuổi",
      desc: "Chế độ ăn uống đóng vai trò then chốt trong việc duy trì sức khỏe người già. Cùng chuyên gia dinh dưỡng của chúng tôi tìm hiểu tháp dinh dưỡng phù hợp.",
      img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    },
  ];

  // Nhân bản dữ liệu lên để test phân trang (Tạo 15 bài)
  return Array.from({ length: 15 }, (_, index) => {
    const randomPost = basePosts[index % basePosts.length];
    return {
      id: index + 1,
      title: `${randomPost.title} `,
      desc: randomPost.desc,
      img: randomPost.img,
      date: `Thứ 2, 0${(index % 9) + 1} Tháng 11, 2025`,
      author: index % 2 === 0 ? "Bởi Admin" : "Bởi Bác sĩ CKII",
      views: 100 + index * 5,
      likes: 50 + index * 2,
    };
  });
};

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  -useEffect(() => {
    const data = generateMockPosts();
    setPosts(data);
  }, []);

  //Cuộn lên đầu khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 400, behavior: "smooth" });
  }, [currentPage]);

  //  logic phan trang
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // chuyen trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white min-h-screen">
      <Banner breadcrumb="Trang chủ / Tin tức" title="Tin tức & Sự kiện" />

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* CỘT TRÁI (DANH SÁCH BÀI VIẾT) - Chiếm 2/3 */}
            <div className="lg:w-2/3">
              {currentPosts.map((post) => (
                <BlogPost key={post.id} {...post} />
              ))}

              {/* --- PHÂN TRANG (PAGINATION) --- */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 mt-12 select-none">
                  {/* Nút Prev */}
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"
                        : "bg-white border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* số trang */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-10 h-10 rounded-full font-medium transition-all ${
                          currentPage === number
                            ? "bg-primary text-white shadow-lg transform scale-105" // Active
                            : "bg-gray-100 text-gray-600 hover:bg-secondary hover:text-white" // Inactive
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}

                  {/* nút next */}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"
                        : "bg-white border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

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

export default NewsPage;
