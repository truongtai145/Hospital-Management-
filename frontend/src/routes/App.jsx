import { BrowserRouter as Router } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import AppRoutes from "./AppRoutes";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
}
