import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Items from './pages/Items';
import VideoUpload from './pages/VideoUpload';
import VideoList from './pages/VideoList';

function App() {
  const [isLoading, setIsLoading] = useState(true);
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
      <Route path="/items" element={<Items />} />
      <Route path="/videos" element={<VideoList />} />
      <Route path="/videos/upload" element={<VideoUpload />} />
    </Routes>
  );
}

export default App;