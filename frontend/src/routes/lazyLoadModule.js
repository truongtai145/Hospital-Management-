// src/routes/lazyLoadModule.js
import { lazy } from 'react';

/**
 * Helper để lazy load component từ module index.js
 * @param {Function} moduleImport - Dynamic import function
 * @param {string} componentName - Tên component trong module
 * @returns {React.LazyExoticComponent}
 */
export const lazyLoadFromModule = (moduleImport, componentName) => {
  return lazy(() => 
    moduleImport().then(module => ({
      default: module[componentName]
    }))
  );
};

/**
 * Prefetch module trước để load nhanh hơn
 * @param {Function} moduleImport - Dynamic import function
 */
export const prefetchModule = (moduleImport) => {
  moduleImport();
};

// Usage examples:
/*
// Lazy load component từ Admin module
const AdminDashboard = lazyLoadFromModule(
  () => import('../pages/Admin'),
  'AdminDashboard'
);

// Prefetch Admin module khi hover
onMouseEnter={() => prefetchModule(() => import('../pages/Admin'))}
*/