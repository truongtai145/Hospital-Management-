import React, { useState, useEffect } from 'react';
import { Users, Search, Calendar, Phone, Mail, MapPin, Heart, FileText, Loader, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterGender, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Lấy danh sách appointments của bác sĩ
      const response = await api.get('/doctor/appointments');
      
      if (response.data.success) {
        const appointments = response.data.data || [];
        
        // Lấy danh sách bệnh nhân unique từ appointments
        const uniquePatients = [];
        const patientIds = new Set();
        
        appointments.forEach(apt => {
          if (apt.patient && !patientIds.has(apt.patient.id)) {
            patientIds.add(apt.patient.id);
            uniquePatients.push({
              ...apt.patient,
              lastAppointment: apt.appointment_time,
              appointmentCount: appointments.filter(a => a.patient_id === apt.patient.id).length
            });
          }
        });
        
        setPatients(uniquePatients);
        setFilteredPatients(uniquePatients);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể tải danh sách bệnh nhân";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by gender
    if (filterGender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filterGender);
    }
    
    setFilteredPatients(filtered);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500">Đang tải danh sách bệnh nhân...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <AlertCircle size={64} className="text-red-500" />
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPatients}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Users className="text-blue-600" size={28} />
              Danh sách bệnh nhân
            </h2>
            <p className="text-gray-500">
              Quản lý thông tin bệnh nhân đã từng khám
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{filteredPatients.length}</p>
            <p className="text-sm text-gray-500">Bệnh nhân</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm bệnh nhân
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, số điện thoại, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Filter size={16} />
              Lọc theo giới tính
            </label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {patient.avatar_url ? (
                      <img 
                        src={patient.avatar_url} 
                        alt={patient.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      patient.full_name?.charAt(0)?.toUpperCase() || 'P'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{patient.full_name || 'N/A'}</h3>
                    <p className="text-sm text-blue-100">ID: #{patient.id}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    {patient.date_of_birth 
                      ? `${calculateAge(patient.date_of_birth)} tuổi (${new Date(patient.date_of_birth).toLocaleDateString('vi-VN')})`
                      : 'Chưa cập nhật'
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  <span>
                    {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{patient.phone || 'Chưa cập nhật'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{patient.user?.email || 'Chưa cập nhật'}</span>
                </div>

                {patient.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{patient.address}</span>
                  </div>
                )}

                {/* Medical Info */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  {patient.allergies && (
                    <div className="flex items-start gap-2 text-sm">
                      <Heart size={16} className="text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-700">Dị ứng:</p>
                        <p className="text-gray-600 line-clamp-2">{patient.allergies}</p>
                      </div>
                    </div>
                  )}

                  {patient.medical_history && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText size={16} className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-700">Tiền sử:</p>
                        <p className="text-gray-600 line-clamp-2">{patient.medical_history}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Số lần khám</p>
                    <p className="text-lg font-bold text-blue-600">{patient.appointmentCount || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Lần gần nhất</p>
                    <p className="text-xs font-medium text-green-600">
                      {patient.lastAppointment 
                        ? new Date(patient.lastAppointment).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/doctor-dashboard/patients/${patient.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all mt-3"
                >
                  Xem chi tiết
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={64} />
          <p className="text-gray-500 font-medium text-lg">
            {searchTerm || filterGender !== 'all' 
              ? 'Không tìm thấy bệnh nhân phù hợp'
              : 'Chưa có bệnh nhân nào'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || filterGender !== 'all'
              ? 'Thử thay đổi điều kiện tìm kiếm'
              : 'Bệnh nhân sẽ xuất hiện sau khi bạn có lịch hẹn'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;