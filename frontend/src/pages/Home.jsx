import React from "react";
import Hero from "../components/Hero/Hero";
import Specialties from "../components/Specialties/Specialties";
import Services from "../components/Services/Services";
import Doctors from "../components/Doctors/Doctors";
import Appointment from "../components/Appointment/Appointment";
import ContactInfo from "../components/Contact/ContactInfo";

/**
 * Trang Home tổng hợp các section công khai.
 * Header/Footer đã được MainLayout bọc sẵn nên trang chỉ cần render các section chính.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Specialties />
      <Services />
      <Doctors />
      <Appointment />
      <ContactInfo />
    </>
  );
}

