import React from "react";
import Contactinfo from "../../components/Contact/ContactInfo";
import Doctors from "../../components/Doctors/Doctors";
const Doctor = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="relative w-full h-[300px] flex items-center bg-gray-100 overflow-hidden">
        {/* Đè style inline để thay ảnh nền khác cho trang About */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-primary/60"></div>
        </div>
        
      </div>
      <Doctors />
      <Contactinfo />
    </div>
  );
};

 
export default Doctor;
