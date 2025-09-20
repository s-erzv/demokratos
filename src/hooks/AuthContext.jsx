import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; 
 
const AuthContext = createContext();
 
export const useAuth = () => {
  return useContext(AuthContext);
};
 
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);  
  const [userData, setUserData] = useState(null);  
  const [loading, setLoading] = useState(true);
 
  const fetchUserData = async (user) => {
    if (!user) {
      setUserData(null);
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
        
        // [FIX BARU 2] Paksa refresh token ID untuk mengambil custom claim (role)
        // yang telah diatur oleh Cloud Function.
        await user.getIdToken(true); 
        
      } else {
        console.warn("User document not found in Firestore.");
        setUserData({ role: 'guest' });  
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
      setUserData(null);
    }
  };

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await fetchUserData(user); 
      setLoading(false);  
    });
 
    return unsubscribe;
  }, []);
 
  const logout = () => {
    signOut(auth);
  };

  const value = {
    currentUser,
    userData, 
    loading,
    logout,
    isAdmin: userData?.role === 'admin',
    isUser: userData?.role === 'user', 
    refreshUserData: () => fetchUserData(currentUser),
  };

  return (
    <AuthContext.Provider value={value}> 
      {!loading && children}
    </AuthContext.Provider>
  );
};
 
export default AuthContext;