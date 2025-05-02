import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import useAuthStore from './store/AuthStore';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));
  
  useEffect(() => {
    // Simulate loading (will be replaced with actual loading logic)
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;