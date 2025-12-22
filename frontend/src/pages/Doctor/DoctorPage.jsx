import React from "react";
import Contactinfo from "../../components/Contact/ContactInfo";
import Doctors from "../../components/Doctors/Doctors";
import Banner from "../../components/Banner/Banner";

const Doctor = () => {
  return (
    <div className="bg-white min-h-screen">
      
      <Banner
        title="Đội ngũ Bác sĩ"
        breadcrumb="Trang chủ / Bác sĩ"
        background="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
      />

      <Doctors />
      <Contactinfo />
    </div>
  );
};

export default Doctor;
