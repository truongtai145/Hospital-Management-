import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES_CONFIG } from "./RoutesConfig";
import MainLayout from "../components/Layout/Layout";
import { Activity } from "lucide-react";

export default function AppRoutes() {
  
  // Component Loading khi đang tải trang Lazy
  const LoadingFallback = () => (
    <div className="flex h-screen w-full items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center gap-2">
        <Activity className="h-10 w-10 animate-spin text-secondary" />
        <p className="text-primary font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {ROUTES_CONFIG.map((route, index) => {
          const PageComponent = route.element;
          
          // Xử lý Layout
          let ElementToRender;

          if (route.layout === "public") {
            // Nếu là public thì bọc trong MainLayout (Header + Footer)
            ElementToRender = (
              <MainLayout>
                <PageComponent />
              </MainLayout>
            );
          } else {
            // Nếu là none thì render trần
            ElementToRender = <PageComponent />;
          }

          return (
            <Route 
              key={index} 
              path={route.path} 
              element={ElementToRender} 
            />
          );
        })}
      </Routes>
    </Suspense>
  );
}