import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import FloatingLabelInput from '../styling/FloatingLabelInput.jsx';
import { auth, db } from '../../firebase.js'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import HighlightSlider from '../styling/HighlightSlider.jsx';
import { useNavigate } from 'react-router-dom'; 

function SignUp({ toggleAuthMode }) {
    const [nik, setNik] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const createUserDocument = async (user, additionalData) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userData = {
            uid: user.uid,
            fullName: additionalData.fullName,
            nik: additionalData.nik,
            email: user.email,
            phoneNumber: additionalData.number,
            photoURL: user.photoURL || null, 
            createdAt: serverTimestamp(),
            role: 'user',
        };
        await setDoc(userDocRef, userData, { merge: true });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setSuccess('');

        if (!fullName.trim() || !nik || !email || !number || !password) {
            setError("Semua kolom wajib diisi.");
            return;
        }
        if (nik.length !== 16) {
            setError("NIK harus terdiri dari 16 digit.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak cocok.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { user } = userCredential;

            await updateProfile(user, {
                displayName: fullName
            });

            const additionalData = { fullName, nik, number };

            await createUserDocument(user, additionalData);
            setSuccess("Pendaftaran berhasil!");
            
            navigate('/', { replace: true }); 

        } catch (err) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('Email ini sudah terdaftar.');
                    break;
                case 'auth/invalid-email':
                    setError('Format email tidak valid.');
                    break;
                case 'auth/weak-password':
                    setError('Password terlalu lemah. Minimal 6 karakter.');
                    break;
                default:
                    setError('Gagal mendaftar. Silakan coba lagi.');
                    console.error("Error pendaftaran:", err);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className='w-full flex h-screen p-0 md:p-2 bg-black overflow-hidden gap-2'>
            
            {/* Kolom Kiri: Slider Highlight */}
            <div className='w-0 md:w-5/12 hidden md:block h-full'>
              <HighlightSlider />
            </div>

            {/* Kolom Kanan: Formulir Pendaftaran */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-none md:rounded-3xl shadow-lg h-full md:h-full overflow-y-auto">
              
              <div className="w-full max-w-sm flex flex-col items-center text-center">
                <div className=" size-16 mb-4 flex items-center justify-center overflow-hidden">
                    <img src="/demokratos.svg" alt="Logo Demokratos" className='w-full h-full p-2' />
                </div>   
                
                <h2 className="text-3xl font-bold text-gray-800">Buat akun baru</h2>
                <p className="text-sm text-gray-500 mt-2 mb-6">Gabung dan ikut berpartisipasi membangun negeri.</p>
              </div>

              {error && <p className="p-2 text-center text-red-800 bg-red-100 rounded-full text-xs w-full max-w-sm">{error}</p>}
              {success && <p className="p-2 text-xs text-center text-green-800 bg-green-100 rounded-full w-full max-w-sm">{success}</p>}

              <form onSubmit={handleSignUp} className="space-y-4 w-full max-w-sm">
                <FloatingLabelInput id="nik" label="Nomer Induk Kependudukan (NIK)" type="text" inputMode="numeric" value={nik} onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, '').slice(0, 16))} />
                <FloatingLabelInput id="fullName" label="Nama Lengkap" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <FloatingLabelInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <FloatingLabelInput id="number" label="Nomer HP" type="tel" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value)} />
                <FloatingLabelInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <FloatingLabelInput id="confirmPassword" label="Konfirmasi Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 font-bold bg-primary text-white text-base rounded-lg hover:bg-red-800 transition-colors disabled:bg-gray-400"
                >
                    {loading ? 'Mendaftar...' : 'Buat Akun'}
                </button>
              </form>

              <div className="text-center text-sm text-gray-600 mt-4">
                <p>Sudah punya akun?{' '}
                    <button 
                        onClick={() => navigate("/signin")} 
                        className="font-semibold text-primary hover:underline"
                    >
                        Masuk di sini
                    </button>
                </p>
              </div>

            </div>
        </div>
    );
}

export default SignUp;