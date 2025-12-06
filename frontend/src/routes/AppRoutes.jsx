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

  //Render nested routes đệ quy
  const renderRoutes = (routes) => {
    return routes.map((route, index) => {
      const PageComponent = route.element;
      
      //  Kiểm tra nếu có children (nested routes)
      if (route.children && route.children.length > 0) {
        return (
          <Route
            key={route.path || index}
            path={route.path}
            element={<PageComponent />}
          >
            {/* Render tất cả children routes */}
            {route.children.map((child, childIndex) => {
              const ChildComponent = child.element;
              
              // Index route (route mặc định)
              if (child.index) {
                return (
                  <Route
                    key={`${route.path}-index`}
                    index
                    element={<ChildComponent />}
                  />
                );
              }
              
              // Named child route
              return (
                <Route
                  key={child.path || childIndex}
                  path={child.path}
                  element={<ChildComponent />}
                />
              );
            })}
          </Route>
        );
      }
      
      // Route thông thường 
      let ElementToRender;

      if (route.layout === "public") {
        // Nếu là public thì bọc trong MainLayout 
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
          key={route.path || index} 
          path={route.path} 
          element={ElementToRender} 
        />
      );
    });
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {renderRoutes(ROUTES_CONFIG)}
      </Routes>
    </Suspense>
  );
}