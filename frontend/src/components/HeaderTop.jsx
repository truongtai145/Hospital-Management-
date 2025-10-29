// src/components/HeaderTop.jsx
export default function HeaderTop() {
  return (
    <div className="bg-blue-900 text-white text-sm py-2">
      <div className="max-w-[1200px] mx-auto flex justify-between">
        <div>
          🇻🇳 Hà Nội: <b>024 7106 6858</b> - <b>024 3872 3872</b>
          &nbsp;|&nbsp;
          🇻🇳 HCM: <b>028 7102 6789</b> - <b>093 180 6858</b>
        </div>
        <div className="flex gap-4">
          <a href="#">Dành cho khách hàng</a>
          <a href="#">Hỏi đáp</a>
          <a href="#">Đặt lịch khám</a>
        </div>
      </div>
    </div>
  );
}
