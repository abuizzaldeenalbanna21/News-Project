import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageProvider';
import App from './App';
import Home from './Pages/home.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import User from './Pages/User.jsx';
import Journalist from './Pages/Journalist.jsx';
import Admin from './Pages/Admin.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/news" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/journalist" element={<Journalist />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
);
