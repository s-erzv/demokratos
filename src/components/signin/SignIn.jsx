import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import FloatingLabelInput from '../styling/FloatingLabelInput.jsx';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../../firebase.js';
import HighlightSlider from '../styling/HighlightSlider.jsx';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../hooks/AuthContext.jsx'; 

function SignIn({ toggleAuthMode }) {
    const [nik, setNik] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
    
    const navigate = useNavigate(); 
    const { refreshUserData } = useAuth(); 

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if ((!nik && !email) || !password) {
            setError("Harap isi data login Anda.");
            setLoading(false);
            return;
        }

        try {
            let userEmailToLogin;
            if (nik) {
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
                userEmailToLogin = email;
            }

            await signInWithEmailAndPassword(auth, userEmailToLogin, password);
            
            await refreshUserData(); 
            setSuccess("Login berhasil!");
            
            navigate('/', { replace: true }); 

        } catch (err) {
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
        setError('');
        setSuccess('');
    
        if (!email) {
            setError('Silakan isi kolom email Anda terlebih dahulu.');
            return;
        }
    
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Format email yang Anda masukkan tidak valid.');
            return;
        }
    
        setIsForgotPasswordView(true);
    };

    const handleSendResetEmail = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
    
        try {
            await sendPasswordResetEmail(auth, email);
    
            setSuccess('Tautan untuk mereset password telah dikirim ke email Anda.');
            setIsForgotPasswordView(false);
    
        } catch (err) {
            setError('Gagal mengirim email. Pastikan email yang Anda masukkan sudah terdaftar.');
            console.error("Error sending reset email:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className='w-full flex h-screen p-0 md:p-2 bg-black overflow-hidden gap-2'>
         
        <div className='w-0 md:w-5/12 hidden md:block h-full'>
          <HighlightSlider />
        </div>
 
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-none md:rounded-3xl shadow-lg h-full md:h-full overflow-y-auto">
          
          <div className="w-full max-w-sm flex flex-col items-center text-center">
             
            <div className=" size-16 mb-4 flex items-center justify-center overflow-hidden">
                 <img src="/demokratos.svg" alt="Logo Demokratos" className='w-full h-full p-2' />
            </div>   
            
            <p className="text-gray-600 text-sm">Selamat datang di Aplikasi</p>
            <h2 className="text-3xl font-bold text-primary">Demokratos</h2>
            <p className="text-sm text-gray-500 mt-2 mb-6">ruang partisipasi warga untuk Indonesia lebih baik.</p>
          </div>

          {error && <p className="p-2 text-center text-red-800 bg-red-100 rounded-full text-xs w-full max-w-sm">{error}</p>}
          {success && <p className="p-2 text-xs text-center text-green-800 bg-green-100 rounded-full w-full max-w-sm">{success}</p>}
 
          <form onSubmit={handleSignIn} className="space-y-4 w-full max-w-sm">
            <FloatingLabelInput
              id="nik" 
              label="Nomor Induk Kependudukan (NIK)" 
              type="text" 
              pattern="[0-9]*"
              inputMode="numeric"
              value={nik} 
              onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, '').slice(0, 16))} />

            <FloatingLabelInput
              id="email" 
              label="Email Aktif" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} />

            <FloatingLabelInput 
              id="password" 
              label="Kata Sandi" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} />

            <div className="text-right text-xs text-gray-600 mb-2">
              <button 
                type="button"
                onClick={handleForgotPasswordClick}
                className="hover:underline"
              >
                Lupa Kata Sandi?
              </button> 
            </div>

            <button
              type="submit"
              className="w-full py-3 font-bold bg-primary text-white text-base rounded-lg hover:bg-red-800 transition-colors"
            >
              Masuk Sekarang
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Belum punya akun?{' '}
              <button 
                onClick={toggleAuthMode} 
                className="font-semibold text-primary hover:underline"
              >
                Daftar di sini
              </button>
            </p>
          </div>
 
          <div 
            className={`absolute inset-0 flex flex-col justify-center items-center transition-all duration-500 ease-in-out bg-white rounded-none md:rounded-3xl z-40 ${isForgotPasswordView ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            <div className="bg-white p-8 rounded-2xl w-full max-w-sm text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Lupa Password?</h2>
              <p className="text-sm text-gray-600 mb-6">Kami akan mengirimkan tautan ke <br/> 
                <span className="font-semibold text-gray-800">{email}</span>
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsForgotPasswordView(false)} 
                  className="flex-1 py-2 font-bold text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  Kembali
                </button>
                <button 
                  onClick={handleSendResetEmail} 
                  disabled={loading} 
                  className="flex-1 py-2 font-bold text-sm bg-primary text-white rounded-full hover:bg-red-800 disabled:bg-gray-400"
                >
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