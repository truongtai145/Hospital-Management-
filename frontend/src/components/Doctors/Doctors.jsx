import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import {
  Loader,
  AlertCircle,
  Linkedin,
  Facebook,
  Instagram,
  Award,
  GraduationCap,
  Star,
  Search,
  Filter
} from 'lucide-react';
import Banner from '../../components/Banner/Banner';
import Pagination from '../Pagination/Pagination';

/* =========================
   Doctor Card Component
========================= */
const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  const {
    id,
    avatar_url,
    full_name,
    specialization,
    department,
    experience_years,
    consultation_fee
  } = doctor;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-80 bg-blue-100">
        {avatar_url ? (
          <img src={avatar_url} alt={full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-white text-6xl font-bold">
            {full_name.charAt(0)}
          </div>
        )}

        {experience_years && (
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow">
            <Award className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold">{experience_years}+ năm</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1 bg-[#E8F0F9]">
        <h3 className="text-xl font-bold text-center mb-2">{full_name}</h3>

        <p className="text-center text-sm font-semibold uppercase mb-3">
          {specialization || 'Bác sĩ đa khoa'}
        </p>

        {department && (
          <div className="flex justify-center gap-2 text-sm mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>{department.name}</span>
          </div>
        )}

        {consultation_fee && (
          <div className="flex justify-center gap-2 bg-white py-2 rounded mb-4">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(consultation_fee)}
            </span>
          </div>
        )}

        {/* Social */}
        <div className="flex justify-center gap-3 mt-auto mb-4">
          {[Linkedin, Facebook, Instagram].map((Icon, i) => (
            <div
              key={i}
              className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white"
            >
              <Icon size={18} />
            </div>
          ))}
        </div>

        <Link
          to={`/doctors/${id}`}
          className="bg-primary text-white py-2 rounded text-center font-semibold"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

/* =========================
   Doctors Page
========================= */
const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===== PAGINATION STATE ===== */
  const ITEMS_PER_PAGE = 6; // số bác sĩ mỗi trang
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctors');

        if (!res.data.success) throw new Error('Không tải được bác sĩ');

        setDoctors(res.data.data);
        setFilteredDoctors(res.data.data);

        const uniqueDepartments = res.data.data
          .map(d => d.department)
          .filter(
            (dept, index, self) =>
              dept && self.findIndex(d => d?.id === dept?.id) === index
          );

        setDepartments(uniqueDepartments);
      } catch (err) {
        const msg = err.response?.data?.message || 'Có lỗi xảy ra';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  /* =========================
     FILTER + SEARCH
  ========================= */
  useEffect(() => {
    let result = doctors;

    if (selectedDepartment !== 'all') {
      result = result.filter(
        d => d.department?.id === parseInt(selectedDepartment)
      );
    }

    if (searchTerm.trim()) {
      result = result.filter(
        d =>
          d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(result);
    setCurrentPage(1); // 👈 reset trang khi filter/search
  }, [selectedDepartment, searchTerm, doctors]);

  /* =========================
     PAGINATION LOGIC
  ========================= */
  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        <AlertCircle size={40} />
        <span className="ml-2">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Banner title="Đội ngũ Bác sĩ" breadcrumb="Trang chủ / Bác sĩ" />

      {/* FILTER */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4 flex flex-wrap gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded"
              placeholder="Tìm kiếm bác sĩ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="all">Tất cả chuyên khoa</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="py-10">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedDoctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {/* PAGINATION BUTTONS */}
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          >
            «
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`px 4 py-2 rounded border ${
                safeCurrentPage === page ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage === totalPages}
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          >
            »
          </button>
        </div>
      </section>
    </div>
  );
};

export default DoctorsPage;
