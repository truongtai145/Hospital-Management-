import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Mỗi lần pathname (route) đổi → scroll về đầu trang.
 * Có xử lý cả hash (#id) nếu bạn dùng anchor trong trang.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // nếu có hash (#section), cuộn tới element đó
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }

    // mặc định: cuộn về top
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
