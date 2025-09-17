import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import FloatingLabelInput from '../styling/FloatingLabelInput.jsx';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../../firebase.js';
import HighlightSlider from '../styling/HighlightSlider.jsx';

function SignIn({ toggleAuthMode }) {
    const [nik, setNik] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validasi input dasar
        if ((!nik && !email) || !password) {
            setError("Harap isi data login Anda.");
            setLoading(false);
            return;
        }

        try {
            let userEmailToLogin;

            // Logika baru: Prioritaskan NIK jika diisi, jika tidak, gunakan Email.
            if (nik) {
                // Pengguna login menggunakan NIK
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("nik", "==", nik));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error("auth/user-not-found");
                }
                
                querySnapshot.forEach((doc) => {
                    userEmailToLogin = doc.data().email;
                });

            } else {
                // Pengguna login menggunakan Email
                userEmailToLogin = email;
            }

            // Lakukan sign in dengan email yang sudah didapatkan
            await signInWithEmailAndPassword(auth, userEmailToLogin, password);
            setSuccess("Login berhasil!");

        } catch (err) {
            // Error handling yang lebih umum untuk login
            switch (err.message || err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('NIK, Email, atau Password salah.');
                    break;
                default:
                    setError('Gagal masuk. Periksa kembali data Anda.');
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordClick = () => {
        // Bersihkan pesan error/sukses lama
        setError('');
        setSuccess('');
    
        // 1. Validasi: Cek apakah kolom email sudah diisi
        if (!email) {
            setError('Silakan isi kolom email Anda terlebih dahulu.');
            return; // Hentikan fungsi jika email kosong
        }
    
        // 2. Validasi: Cek apakah format email valid
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Format email yang Anda masukkan tidak valid.');
            return; // Hentikan fungsi jika format salah
        }
    
        // 3. Jika semua validasi lolos, tampilkan view/pop-up konfirmasi
        setIsForgotPasswordView(true);
    };

    const handleSendResetEmail = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
    
        try {
            // Kirim email reset menggunakan fungsi bawaan Firebase
            await sendPasswordResetEmail(auth, email);
    
            // Beri pesan sukses dan tutup pop-up
            setSuccess('Tautan untuk mereset password telah dikirim ke email Anda.');
            setIsForgotPasswordView(false);
    
        } catch (err) {
            // Tangani kemungkinan error (misalnya, email tidak terdaftar)
            setError('Gagal mengirim email. Pastikan email yang Anda masukkan sudah terdaftar.');
            console.error("Error sending reset email:", err);
        } finally {
            // Pastikan loading selalu berhenti, baik berhasil maupun gagal
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
                        <p>selamat datang di aplikasi</p>
                        <h2 className="text-black text-3xl md:text-4xl 2xl:text-7xl font-bold ">Demokratos</h2>
                        <p className="text-black text-xs 2xl:text-2xl 2xl:mt-5 2xl:mb-13 mt-2 mb-5 text-text  ">ruang partisipasi warga untuk Indonesia lebih baik.</p>
                    </div>

                    {error && <p className="p-2 2xl:px-10 2xl:py-5 text-center text-red-800 bg-red-100 rounded-full text-sm md:text-base 2xl:text-2xl">{error}</p>}
                    {success && <p className="p-2 2xl:px-10 2xl:py-5 text-sm md:text-base 2xl:text-2xl text-center text-green-800 bg-green-100 rounded-full">{success}</p>}

                    <form onSubmit={handleSignIn} className="space-y-3 2xl:space-y-6 pt-2 sm:pt-4">
                        <FloatingLabelInput
                        id="nik" 
                        label="nik" 
                        type="text" 
                        pattern="[0-9]*"
                        inputMode= "numeric"
                        value={nik} 
                        onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, '').slice(0, 16))} />


                        <FloatingLabelInput
                        id="email" 
                        label="Email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} />

                        <FloatingLabelInput 
                        id="password" 
                        label="Password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} />

                        <button
                            type="submit"
                            className="w-full py-2 2xl:py-5 font-bold bg-primary dark:text-button-dark dark:hover:bg-hover-button-dark
                            text-white text-sm md:text-base 2xl:text-3xl rounded-full hover:bg-hover-button focus:outline-none"
                        >
                            Masuk Sekarang
                        </button>
                    </form>

                    

                    <div className="sm:mt-5 md:mt-3 mb-3 2xl:mt-6 2xl:text-2xl text-center text-xs md:text-sm text-gray-600 dark:text-text-dark">
                        <button 
                            onClick={handleForgotPasswordClick}
                            className="hover:underline"
                            >Lupa Kata sandi?</button> 
                    </div>


                    <div className="mt-2 text-center text-xs text-text md:hidden">
                        <p>Don't have an account?{' '}
                            <button 
                                onClick={toggleAuthMode} 
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>

                    <div 
                    className={`absolute inset-0 flex flex-col justify-center items-center transition-all duration-500 ease-in-out 
                    ${isForgotPasswordView ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

                        <div className="bg-white dark:bg-bg-dark p-8 rounded-2xl w-full text-center 2xl:px-15">
                            <h2 className="text-2xl dark:text-white font-bold mb-2 2xl:text-5xl 2xl:mb-5">Lupa Password?</h2>
                            <p className="text-text dark:text-text-dark mb-6 2xl:text-2xl">Kami akan mengirimkan tautan ke <br/> 
                            <span className="font-semibold text-gray-800 dark:text-white">{email}</span></p>

                            <div className="flex gap-4 2xl:mt-10">
                                <button 
                                onClick={() => setIsForgotPasswordView(false)} 
                                className="w-full py-2 2xl:py-3 font-bold 2xl:text-xl bg-gray-200 dark:bg-neutral-500 dark:text-white dark:hover:bg-neutral-400 text-gray-700 rounded-full hover:bg-gray-300">
                                    Kembali</button>
                                <button 
                                onClick={handleSendResetEmail} 
                                disabled={loading} 
                                className="w-full py-2 font-bold 2xl:text-xl bg-primary 
                                dark:text-button-dark dark:hover:bg-hover-button-dark text-white rounded-full hover:bg-hover-button dark:bg-">
                                    {loading ? 'Mengirim...' : 'Ya, Kirim'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            
            
        </div>
        
    );
}

export default SignIn;