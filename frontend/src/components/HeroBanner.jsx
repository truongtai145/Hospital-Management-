// src/components/HeroBanner.jsx
import banner from "../assets/images/banner1.png";

export default function HeroBanner() {
  return (
    <div className="relative">
      <img src={banner} className="w-full object-cover" />

      <div className="absolute top-1/4 left-16 text-blue-900">
        <h1 className="text-4xl font-bold">
          ĐẸP RẠNG NGỜI CÙNG SUPERB (SOFWAVE)
        </h1>
        <p className="text-xl mt-3">Da căng, mờ nhăn, hết sần ✨</p>

        <div className="mt-4 bg-pink-500 text-white px-6 py-3 rounded-full text-lg font-semibold inline-block">
          🎁 Quà tặng lên đến 10 TRIỆU ĐỒNG
        </div>
      </div>
    </div>
  );
}
