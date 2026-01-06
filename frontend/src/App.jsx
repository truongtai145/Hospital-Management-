/* eslint-disable no-undef */

import { BrowserRouter as Router } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ScrollToTop from "./routes/ScrollToTop"; 
import AppRoutes from "./routes/AppRoutes";    
import { ToastContainer } from 'react-toastify';
import { queryClient } from './config/queryClient';

// QUAN TRỌNG: Phải import dòng CSS này thì thông báo mới đẹp được
import 'react-toastify/dist/ReactToastify.css'; 

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer 
        position="top-right" 
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>

      {/* React Query Devtools - chỉ hiện ở development */}
     
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

export default App;