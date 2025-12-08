// src/components/Pagination/Pagination.jsx

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Sinh danh sách số trang (tự động rút gọn nếu trang quá nhiều)
  const getPageNumbers = () => {
    let pages = [];

    if (totalPages <= 7) {
      // Nếu tổng số trang nhỏ hơn hoặc bằng 7 → hiện tất cả
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        // Đầu danh sách
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        // Cuối danh sách
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        // Ở giữa
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 mt-6">

      {/* Hiển thị thông tin */}
      <span className="text-sm text-gray-700">
        Hiển thị{" "}
        <strong>{startIndex}</strong> – <strong>{endIndex}</strong> /{" "}
        <strong>{totalItems}</strong> kết quả
      </span>

      {/* Các nút điều hướng */}
      <div className="flex items-center gap-2">

        {/* Về trang đầu */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 border rounded-lg bg-white disabled:opacity-40 hover:bg-blue-50 transition"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Trang trước */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border rounded-lg bg-white disabled:opacity-40 hover:bg-blue-50 transition"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Danh sách số trang */}
        {pages.map((pg, index) =>
          pg === "..." ? (
            <span
              key={index}
              className="px-3 py-1 text-gray-500 select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(pg)}
              className={`px-3 py-1 rounded-lg border transition
              ${
                currentPage === pg
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-blue-50"
              }`}
            >
              {pg}
            </button>
          )
        )}

        {/* Trang sau */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border rounded-lg bg-white disabled:opacity-40 hover:bg-blue-50 transition"
        >
          <ChevronRight size={18} />
        </button>

        {/* Về trang cuối */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 border rounded-lg bg-white disabled:opacity-40 hover:bg-blue-50 transition"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
