import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/AuthContext'; 
import { LogOut, UserCircle, Hash, Mail, Smartphone, MapPin, Edit3, Save, Loader2, UploadCloud } from 'lucide-react';
import { useProfile } from '../hooks/useProfile'; 

const Profile = () => {
  const { userData, logout } = useAuth();
  
  const { 
    isEditing, 
    setIsEditing, 
    loading, 
    error, 
    success, 
    formData, 
    setFormData, 
    updateProfile, 
    provinces,
    cities,
    districts,
    villages,
    fetchCities,
    fetchDistricts,
    fetchVillages,
  } = useProfile();

  const [photoFile, setPhotoFile] = useState(null);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white shadow-md">Admin Pemerintah</span>;
      case 'user':
        return <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white shadow-md">Warga Terverifikasi</span>;
      default:
        return <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-600 text-white shadow-md">Guest</span>;
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleLocationChange = (e, level) => {
    const selectedValue = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption ? selectedOption.getAttribute('id') : ''; 
    const name = e.target.name;

    setFormData(prev => ({ ...prev, [name]: selectedValue }));

    if (level === 'provinsi') {
        fetchCities(selectedId);
        setFormData(prev => ({ ...prev, provinsiId: selectedId, kotaName: '', kotaId: '', kecamatanName: '', kecamatanId: '', kelurahanName: '' }));
    } else if (level === 'kota') {
        fetchDistricts(selectedId);
        setFormData(prev => ({ ...prev, kotaId: selectedId, kecamatanName: '', kecamatanId: '', kelurahanName: '' }));
    } else if (level === 'kecamatan') {
        fetchVillages(selectedId);
        setFormData(prev => ({ ...prev, kecamatanId: selectedId, kelurahanName: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return; 
    const success = await updateProfile(photoFile);
    if (success) {
      setPhotoFile(null);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
        setPhotoFile(e.target.files[0]);
    }
  };

  const ReadOnlyInputStyle = "w-full bg-transparent text-gray-800 focus:outline-none disabled:text-gray-500 disabled:placeholder-gray-500";
  const InputWrapperStyle = "flex items-center rounded-xl border-2 border-gray-200 bg-gray-100 p-3 shadow-inner"; 
  const IconStyle = "text-gray-400 mr-3";
  const LabelStyle = "block text-sm font-medium text-gray-700 mb-1";
  
  const photoPreviewUrl = photoFile ? URL.createObjectURL(photoFile) : userData?.photoURL;

  const currentDate = new Date().toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  return (
    <MainLayout>
      <div className="w-full mx-auto space-y-8">
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col items-center text-center">
            <input 
                type="file" 
                id="photo-upload" 
                accept="image/*"
                className="hidden" 
                onChange={handleFileChange}
                disabled={!isEditing || loading}
            />

            <label htmlFor="photo-upload" className="cursor-pointer relative group block mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shadow-inner relative">
                    
                    {photoPreviewUrl ? (
                        <img src={photoPreviewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <UserCircle size={60} />
                          <span className="text-xs mt-1 font-medium">UNGGAH</span>
                        </div>
                    )}
                    
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <UploadCloud size={24} className="text-white" />
                        </div>
                    )}
                </div>
            </label>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{userData?.fullName || 'Nama Pengguna'}</h3>
            <div className="mb-6">{getRoleBadge(userData?.role)}</div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center p-3 rounded-xl shadow-md transition-colors text-sm font-semibold ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label={isEditing ? "Simpan" : "Edit"}
                >
                    {isEditing ? <Save size={18} className='mr-2' /> : <Edit3 size={18} className='mr-2' />}
                    {isEditing ? 'Simpan' : 'Edit'}
                </button>
                
                <button
                    type="button"
                    onClick={logout}
                    className="flex-1 flex items-center justify-center p-3 rounded-xl shadow-md bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold"
                    aria-label="Keluar"
                >
                    <LogOut size={18} className='mr-2' />
                    Keluar
                </button>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 w-full overflow-hidden relative"
               style={{ 
                   backgroundImage: 'url(/bg-profile.svg)', 
                   backgroundPosition: 'right', 
                   backgroundRepeat: 'no-repeat'
               }}
          >
            

            <div className="relative z-10">

              <div className="border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Kartu Kependudukan Digital - Demokratos</h1>
                <img src="/demokratos.svg" alt="Demokratos" className="w-6 h-6 sm:w-8 sm:h-8 opacity-70" />
              </div>

              <div className="p-6 sm:p-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email</label>
                    <p className="text-base font-medium text-gray-800 mt-1 break-all">
                      {userData?.email || 'belum@diisi.com'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">No. Telepon</label>
                    <p className="text-base font-medium text-gray-800 mt-1">
                      {formData.phoneNumber || '(+62) - - - - - - - - -'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2 pt-2 border-t border-gray-100">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">NIK</label>
                    <p className="font-mono text-xl font-extrabold text-red-700 mt-1 leading-snug">
                      {userData?.nik || '- - - - - - - - - - - - - - - -'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Domisili</label>
                    <div className="flex items-start text-sm sm:text-base text-gray-700 mt-1">
                        <MapPin size={16} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p>
                          {formData.kelurahanName && `${formData.kelurahanName}`}
                          {formData.kecamatanName && `, ${formData.kecamatanName}`}
                          {formData.kotaName && `, ${formData.kotaName}`}
                          {formData.provinsiName && `, ${formData.provinsiName}`}
                          {!formData.kelurahanName && !formData.kecamatanName && !formData.kotaName && !formData.provinsiName && 'Belum diatur'}
                        </p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full">
            
            <div className='flex justify-between items-center border-b pb-3 mb-6'>
                <h2 className="text-2xl font-bold text-gray-800">Formulir Pembaruan Data Diri</h2>
            </div>

            {error && <p className="p-2 mb-4 text-center text-red-700 bg-red-100 rounded-lg">{error}</p>}
            {success && <p className="p-2 mb-4 text-center text-green-700 bg-green-100 rounded-lg">{success}</p>}
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            <div className="space-y-6">
              
              <div>
                <label htmlFor="fullName" className={LabelStyle}>Nama Lengkap</label>
                <div className={InputWrapperStyle}>
                    <UserCircle size={20} className={IconStyle} />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      className={ReadOnlyInputStyle}
                      value={formData.fullName}
                      onChange={handleFormChange}
                      readOnly={!isEditing}
                      placeholder='Nama Lengkap'
                    />
                </div>
              </div>

              <div>
                <label htmlFor="nik" className={LabelStyle}>NIK (Nomor Induk Kependudukan)</label>
                <div className={InputWrapperStyle}>
                    <Hash size={20} className={IconStyle} />
                    <input
                      type="text"
                      id="nik"
                      name="nik"
                      className={ReadOnlyInputStyle}
                      value={userData?.nik || 'Belum diisi'}
                      readOnly
                    />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={LabelStyle}>Email</label>
                 <div className={InputWrapperStyle}>
                    <Mail size={20} className={IconStyle} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={ReadOnlyInputStyle}
                      value={userData?.email || 'Belum diisi'}
                      readOnly
                    />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className={LabelStyle}>Nomor Telepon</label>
                 <div className={InputWrapperStyle}>
                    <Smartphone size={20} className={IconStyle} />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className={ReadOnlyInputStyle}
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      readOnly={!isEditing}
                      placeholder='Nomor HP Aktif'
                    />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              
              <div>
                <label htmlFor="provinsiName" className={LabelStyle}>Provinsi</label>
                <div className={InputWrapperStyle}>
                    <MapPin size={20} className={IconStyle} />
                    <select 
                        id="provinsiName" 
                        name="provinsiName"
                        value={formData.provinsiName}
                        onChange={(e) => handleLocationChange(e, 'provinsi')}
                        disabled={!isEditing || loading}
                        className={ReadOnlyInputStyle}
                    >
                        <option value="">{loading && !provinces.length ? 'Memuat Provinsi...' : (formData.provinsiName || 'Pilih Provinsi')}</option>
                        {provinces.map(p => (
                            <option key={p.id} id={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div>
                <label htmlFor="kotaName" className={LabelStyle}>Kota/Kabupaten</label>
                <div className={InputWrapperStyle}>
                    <MapPin size={20} className={IconStyle} />
                    <select 
                        id="kotaName" 
                        name="kotaName"
                        value={formData.kotaName}
                        onChange={(e) => handleLocationChange(e, 'kota')}
                        disabled={!isEditing || loading || !formData.provinsiName}
                        className={ReadOnlyInputStyle}
                    >
                      <option value="">{formData.provinsiName ? (loading ? 'Memuat Kota...' : (formData.kotaName || 'Pilih Kota/Kabupaten')) : 'Pilih Provinsi dulu'}</option>
                      {cities.map(c => (
                            <option key={c.id} id={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div>
                <label htmlFor="kecamatanName" className={LabelStyle}>Kecamatan</label>
                <div className={InputWrapperStyle}>
                    <MapPin size={20} className={IconStyle} />
                    <select 
                        id="kecamatanName" 
                        name="kecamatanName"
                        value={formData.kecamatanName}
                        onChange={(e) => handleLocationChange(e, 'kecamatan')}
                        disabled={!isEditing || loading || !formData.kotaName}
                        className={ReadOnlyInputStyle}
                    >
                      <option value="">{formData.kotaName ? (loading ? 'Memuat Kecamatan...' : (formData.kecamatanName || 'Pilih Kecamatan')) : 'Pilih Kota dulu'}</option>
                      {districts.map(d => (
                            <option key={d.id} id={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div>
                <label htmlFor="kelurahanName" className={LabelStyle}>Kelurahan</label>
                <div className={InputWrapperStyle}>
                    <MapPin size={20} className={IconStyle} />
                    <select 
                        id="kelurahanName" 
                        name="kelurahanName"
                        value={formData.kelurahanName}
                        onChange={handleFormChange}
                        disabled={!isEditing || loading || !formData.kecamatanName}
                        className={ReadOnlyInputStyle}
                    >
                      <option value="">{formData.kecamatanName ? (loading ? 'Memuat Kelurahan...' : (formData.kelurahanName || 'Pilih Kelurahan')) : 'Pilih Kecamatan dulu'}</option>
                      {villages.map(v => (
                            <option key={v.id} id={v.id} value={v.name}>{v.name}</option>
                        ))}
                    </select>
                </div>
              </div>
            </div>
          </div>
          
          {isEditing && (
            <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full md:w-auto md:ml-auto flex items-center justify-center py-3 px-6 rounded-xl shadow-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
                {loading ? <Loader2 size={20} className="mr-2 animate-spin" /> : 'Simpan Perubahan'}
            </button>
          )}
          
        </form>

      </div>
    </MainLayout>
  );
};

export default Profile;