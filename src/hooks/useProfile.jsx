import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const INDONESIA_API_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api/';

export const useProfile = () => {
  const { userData, currentUser, refreshUserData } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    phoneNumber: userData?.phoneNumber || '',
    provinsiName: userData?.provinsiName || '', 
    kotaName: userData?.kotaName || '',
    kecamatanName: userData?.kecamatanName || '',
    kelurahanName: userData?.kelurahanName || '',
    provinsiId: userData?.provinsiId || '',
    kotaId: userData?.kotaId || '',
    kecamatanId: userData?.kecamatanId || '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        provinsiName: userData.provinsiName || '',
        kotaName: userData.kotaName || '',
        kecamatanName: userData.kecamatanName || '',
        kelurahanName: userData.kelurahanName || '',
        provinsiId: userData.provinsiId || '',
        kotaId: userData.kotaId || '',
        kecamatanId: userData.kecamatanId || '',
      });
    }
  }, [userData]);


  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(`${INDONESIA_API_BASE_URL}provinces.json`);
        const data = await response.json();
        setProvinces(data);
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
      }
    };
    fetchProvinces();
  }, []);

  const fetchCities = useCallback(async (provinceId) => {
    if (!provinceId) return setCities([]);
    try {
      const response = await fetch(`${INDONESIA_API_BASE_URL}regencies/${provinceId}.json`);
      const data = await response.json();
      setCities(data);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
  }, []);

  const fetchDistricts = useCallback(async (cityId) => {
    if (!cityId) return setDistricts([]);
    try {
      const response = await fetch(`${INDONESIA_API_BASE_URL}districts/${cityId}.json`);
      const data = await response.json();
      setDistricts(data);
    } catch (err) {
      console.error("Failed to fetch districts:", err);
    }
  }, []);

  const fetchVillages = useCallback(async (districtId) => {
    if (!districtId) return setVillages([]);
    try {
      const response = await fetch(`${INDONESIA_API_BASE_URL}villages/${districtId}.json`);
      const data = await response.json();
      setVillages(data);
    } catch (err) {
      console.error("Failed to fetch villages:", err);
    }
  }, []);
  
  useEffect(() => {
    if (userData?.provinsiId) {
        fetchCities(userData.provinsiId);
    }
    if (userData?.kotaId) {
        fetchDistricts(userData.kotaId);
    }
    if (userData?.kecamatanId) {
        fetchVillages(userData.kecamatanId);
    }
  }, [userData, fetchCities, fetchDistricts, fetchVillages]);


  // LOGIC UTAMA UNTUK UPDATE PROFIL
  const updateProfile = useCallback(async (photoFile) => {
    if (!currentUser) {
      setError("Anda harus login untuk menyimpan perubahan.");
      return false;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userDocRef = doc(db, 'users', currentUser.uid);
    let photoURL = userData?.photoURL;

    try {
      // 1. Upload Foto Profil (Jika ada file baru)
      if (photoFile) {
        setSuccess("Mengunggah foto profil...");
        // Path: profile_photos/{UID}_{Timestamp}
        const storageRef = ref(storage, `profile_photos/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(storageRef, photoFile); 
        photoURL = await getDownloadURL(storageRef);
      }

      // 2. Kumpulkan data untuk Firestore
      const updateData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        
        provinsiName: formData.provinsiName,
        provinsiId: formData.provinsiId,
        kotaName: formData.kotaName,
        kotaId: formData.kotaId,
        kecamatanName: formData.kecamatanName,
        kecamatanId: formData.kecamatanId,
        kelurahanName: formData.kelurahanName,
        
        photoURL, // Simpan URL foto baru/lama
        updatedAt: new Date(),
      };
      
      // 3. Update Firestore
      await updateDoc(userDocRef, updateData);

      // 4. Refresh data di AuthContext (penting agar userData di Profile segera terupdate)
      await refreshUserData(); 

      setSuccess("Profil berhasil diperbarui!");
      setIsEditing(false);
      return true;

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(`Gagal menyimpan perubahan: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, userData, refreshUserData, formData]);

  return {
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
  };
};