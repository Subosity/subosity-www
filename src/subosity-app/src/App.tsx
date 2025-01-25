import React from 'react';
import { ToastProvider } from './ToastContext';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Home from './pages/Home'
import MySubscriptions from './pages/MySubscriptions'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ChangePassword from './pages/auth/ChangePassword'
import Profile from './pages/auth/Profile'
import Preferences from './pages/auth/Preferences'
import SubscriptionDetail from './pages/SubscriptionDetail'

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <ThemeProvider>
                    <BrowserRouter>
                        <div className="d-flex flex-column min-vh-100">
                            <Navigation />
                            <main className="flex-grow-1">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/privacy" element={<Privacy />} />
                                    <Route path="/terms" element={<Terms />} />
                                    <Route path="/mysubscriptions" element={<MySubscriptions />} />
                                    <Route path="/subscription/:id" element={<SubscriptionDetail />} />

                                    {/* Auth Routes */}
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/change-password" element={<ChangePassword />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/preferences" element={<Preferences />} />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                    </BrowserRouter>
                </ThemeProvider>
            </AuthProvider>
        </ToastProvider>
    );
};

export default App;