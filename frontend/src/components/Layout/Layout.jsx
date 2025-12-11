import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import FloatingContact from '../FloatingContact/FloatingContact';
import Chat from '../Chat/Chat';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
       
       <FloatingContact />
      </main>
      <Footer />
 
    </div>
  );
};

export default Layout;