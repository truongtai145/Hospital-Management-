import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { 
  Loader, AlertCircle, Linkedin, Facebook, Instagram, 
  Award, GraduationCap, Star, Search, Filter
} from 'lucide-react';
import Banner from '../../components/Banner/Banner';

// Component DoctorCard với thiết kế giống hình mẫu
const DoctorCard = ({ doctor }) => {
  // Kiểm tra doctor có tồn tại không
  if (!doctor) {
    return null;
  }

  const { id, avatar_url, full_name, specialization, department, experience_years, consultation_fee } = doctor;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
      {/* Doctor Image */}
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
        {avatar_url ? (
          <img
            src={avatar_url}
            alt={full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
            <span className="text-white text-6xl font-bold">
              {full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Experience Badge */}
        {experience_years && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Award className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-gray-700">{experience_years}+ năm</span>
          </div>
        )}
      </div>

      {/* Doctor Info */}
      <div className="p-6 flex-1 flex flex-col" style={{ backgroundColor: '#E8F0F9' }}>
        {/* Name */}
        <h3 className="text-xl font-bold text-primary mb-2 text-center">
          {full_name}
        </h3>

        {/* Specialization */}
        <p className="text-center text-gray-700 font-semibold uppercase tracking-wider text-sm mb-4" style={{ color: '#3C4B6D' }}>
          {specialization || 'Bác sĩ đa khoa'}
        </p>

        {/* Department */}
        {department && (
          <div className="flex items-center justify-center gap-2 mb-4 text-gray-600 text-sm">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <span>{department.name}</span>
          </div>
        )}

        {/* Consultation Fee */}
        {consultation_fee && (
          <div className="flex items-center justify-center gap-2 mb-4 bg-white/60 py-2 px-4 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">
              Phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(consultation_fee)}
            </span>
          </div>
        )}

        {/* Social Links */}
        <div className="flex justify-center gap-3 mb-6 mt-auto">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: '#3C4B6D' }}
          >
            <Linkedin className="w-5 h-5 text-white" />
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: '#3C4B6D' }}
          >
            <Facebook className="w-5 h-5 text-white" />
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: '#3C4B6D' }}
          >
            <Instagram className="w-5 h-5 text-white" />
          </a>
        </div>

        {/* View Profile Button */}
        <Link
          to={`/doctors/${id}`}
          className="w-full py-3 text-center text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: '#3C4B6D' }}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

// Component chính - Trang Bác sĩ
const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load doctors và departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch doctors
        const doctorsResponse = await api.get('/doctors');
        if (doctorsResponse.data.success) {
          setDoctors(doctorsResponse.data.data);
          setFilteredDoctors(doctorsResponse.data.data);
          
          // Extract unique departments
          const uniqueDepts = doctorsResponse.data.data
            .map(d => d.department)
            .filter((dept, index, self) => 
              dept && self.findIndex(d => d?.id === dept?.id) === index
            );
          setDepartments(uniqueDepts);
        } else {
          throw new Error("Không thể lấy dữ liệu bác sĩ.");
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách bác sĩ.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter doctors khi thay đổi department hoặc search
  useEffect(() => {
    let result = doctors;

    // Filter by department
    if (selectedDepartment !== 'all') {
      result = result.filter(doctor => doctor.department?.id === parseInt(selectedDepartment));
    }

    // Filter by search term
    if (searchTerm.trim()) {
      result = result.filter(doctor =>
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(result);
  }, [selectedDepartment, searchTerm, doctors]);

  // Render loading state
  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Banner title="Đội ngũ Bác sĩ" breadcrumb="Trang chủ / Bác sĩ" />
        <div className="min-h-[500px] flex justify-center items-center">
          <Loader size={48} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Banner title="Đội ngũ Bác sĩ" breadcrumb="Trang chủ / Bác sĩ" />
        <div className="py-20 text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold">Có lỗi xảy ra</h3>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Banner */}
      <Banner title="Đội ngũ Bác sĩ" breadcrumb="Trang chủ / Bác sĩ" />

      {/* Header Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-secondary font-bold uppercase tracking-widest text-sm">Chăm sóc tin cậy</p>
          <h2 className="text-5xl font-serif text-primary mt-2 mb-4">Gặp gỡ các Chuyên gia của chúng tôi</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp, luôn sẵn sàng chăm sóc sức khỏe của bạn
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="all">Tất cả chuyên khoa</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div className="text-gray-600 text-sm">
              Tìm thấy <span className="font-bold text-primary">{filteredDoctors.length}</span> bác sĩ
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredDoctors.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">{doctors.length}+</h3>
              <p className="text-blue-200">Bác sĩ chuyên nghiệp</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">{departments.length}+</h3>
              <p className="text-blue-200">Chuyên khoa</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">15+</h3>
              <p className="text-blue-200">Năm kinh nghiệm</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-blue-200">Bệnh nhân hài lòng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorsPage;