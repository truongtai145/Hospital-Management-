// src/components/MainNavbar.jsx
export default function MainNavbar() {
  return (
    <div className="shadow-md bg-white">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between py-3">
        <img src="/logo512.png" alt="logo" className="h-10" />

        <ul className="flex gap-6 text-blue-900 font-semibold">
          <li>GIỚI THIỆU</li>
          <li>CHUYÊN KHOA</li>
          <li>CHUYÊN GIA – BÁC SĨ</li>
          <li>DỊCH VỤ ĐẶC BIỆT</li>
          <li>TIỆN NGHI</li>
          <li>THÀNH TỰU</li>
          <li>TIN TỨC</li>
          <li>LIÊN HỆ</li>
        </ul>
      </div>
    </div>
  );
}
