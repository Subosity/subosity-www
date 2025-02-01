import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import PWAInstall from './components/PWAInstall'

const AppContent: React.FC = () => {

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navigation
            />
            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/pricing" element={<Pricing />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AppContent />
                <PWAInstall />
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;