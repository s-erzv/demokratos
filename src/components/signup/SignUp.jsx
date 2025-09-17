import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import FloatingLabelInput from '../styling/FloatingLabelInput.jsx';
import { auth, db } from '../../firebase.js'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import HighlightSlider from '../styling/HighlightSlider.jsx';

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
        <div className='w-full flex min-h-screen bg-black p-5 gap-10 '>
                {/* highlight */}
                <div className='w-5/12'>
                    <HighlightSlider />
                </div>

                {/* form */}
                <div className="space-y-3 px-3 lg:px-5 2xl:px-12 w-7/12 bg-white rounded-lg">
                    <div className="flex flex-col justify-center items-center mt-0 mb-2 md:mt-5 lg:mt-10">
                        <img src="/logo demokratos.svg" alt="logo demokratos" className='size-5 ' />   
                        <h2 className="text-black text-3xl md:text-4xl 2xl:text-7xl font-bold ">Buat akun baru</h2>
                        <p className="text-black text-xs 2xl:text-2xl 2xl:mt-5 2xl:mb-13 mt-2 mb-5 text-text  ">Gabung dan ikut berpartisipasi membangun negeri.</p>
                    </div>

                    {error && <p className="p-2 2xl:px-10 2xl:py-5 text-center text-red-800 bg-red-100 rounded-full text-sm md:text-base 2xl:text-2xl">{error}</p>}
                    {success && <p className="p-2 2xl:px-10 2xl:py-5 text-sm md:text-base 2xl:text-2xl text-center text-green-800 bg-green-100 rounded-full">{success}</p>}

                    <form onSubmit={handleSignUp} className="space-y-3 2xl:space-y-6 pt-2 sm:pt-4">
                        <FloatingLabelInput id="nik" label="Nomer Induk Kependudukan (NIK)" type="text" inputMode="numeric" value={nik} onChange={(e) => setNik(e.target.value)} />
                        <FloatingLabelInput id="fullName" label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        <FloatingLabelInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <FloatingLabelInput id="number" label="Nomer HP" type="tel" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value)} />
                        <FloatingLabelInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <FloatingLabelInput id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 2xl:py-5 font-bold bg-primary dark:text-button-dark dark:hover:bg-hover-button-dark
                            text-white text-sm md:text-base 2xl:text-3xl rounded-full hover:bg-hover-button focus:outline-none"
                        >
                            Buat Akun
                        </button>
                    </form>

                    <div className="mt-2 text-center text-xs text-text ">
                        <p>Sudah punya akun?{' '}
                            <button 
                                onClick={toggleAuthMode} 
                                className="font-semibold text-primary hover:underline"
                            >
                                masuk di sini
                            </button>
                        </p>
                    </div>

                </div>
        </div>
        
    );
}

export default SignUp;