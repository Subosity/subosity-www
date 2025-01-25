import React, { useState, useEffect } from 'react'
import md5 from 'md5'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSun,
    faMoon,
    faCircleHalfStroke,
    faUser,
    faGear,
    faPalette,
    faHandHoldingDollar,
    faHome,
    faBell
} from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { Button, Dropdown } from 'react-bootstrap'
import UserAvatar from './UserAvatar'
import SubscriptionAlertsModal from './SubscriptionAlertsModal'
import { supabase } from '../supabaseClient'
import { Theme } from 'react-select'

const Navigation = () => {
    const [gravatarError, setGravatarError] = useState(false);
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    
    // Move this into useEffect to stay reactive to theme changes
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [showAlerts, setShowAlerts] = useState(false);

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = theme === 'Dark' || (theme === 'Auto' && prefersDark);
        setIsDarkMode(isDark);
    }, [theme]); // Re-run when theme changes

    useEffect(() => {
        const fetchUnreadAlertsCount = async () => {
            const { count, error } = await supabase
                .from('subscription_alerts')
                .select('*', { count: 'exact' })
                .is('read_at', null);

            if (!error && count !== null) {
                setUnreadAlerts(count);
            }
        };

        fetchUnreadAlertsCount();
        
        // Subscribe to realtime changes
        const subscription = supabase
            .channel('subscription_alerts')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'subscription_alerts'
            }, () => {
                fetchUnreadAlertsCount();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getInitials = (email: string) => {
        if (!email) return '??'
        const parts = email.split('@')
        return parts[0].substring(0, 2).toUpperCase()
    }

    const getAvatarContent = () => {
        if (!user?.email) return (
            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}>
                <FontAwesomeIcon icon={faUser} className="text-light" />
            </div>
        )

        const email = user.email.toLowerCase().trim()
        const hash = md5(email)
        const gravatarUrl = `https://secure.gravatar.com/avatar/${hash}?s=32&d=mp`

        return (
            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}>
                {!gravatarError ? (
                    <img
                        src={gravatarUrl}
                        onError={() => setGravatarError(true)}
                        alt="User avatar"
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                ) : (
                    <span style={{
                        color: 'var(--bs-navbar-color)',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {getInitials(email)}
                    </span>
                )}
            </div>
        )
    }

    const getThemeIcon = () => {
        switch (theme) {
            case 'Light': return faSun
            case 'Dark': return faMoon
            default: return faCircleHalfStroke
        }
    }

    const cycleTheme = () => {
        const themes: Theme[] = ['Auto', 'Light', 'Dark'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <nav className={`navbar navbar-expand-lg ${isDarkMode ? 'navbar-dark' : 'navbar-light'}`}
            style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-navbar-color)' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src="/favicon.svg" className="me-2" style={{ height: '22px' }} />
                    <span>Subosity</span>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <FontAwesomeIcon icon={faHome} className="me-2" />
                            Home</Link>
                        </li>
                        {user && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/mysubscriptions">
                                <FontAwesomeIcon icon={faHandHoldingDollar} className="me-2" />
                                Subscriptions</Link>
                            </li>
                        )}
                    </ul>
                </div>
                <div className="ms-auto d-flex align-items-center">
                    {user && (
                        <div className="position-relative me-3">
                            <Button
                                variant="link"
                                className="nav-link p-0"
                                onClick={() => setShowAlerts(true)}
                            >
                                <FontAwesomeIcon icon={faBell} />
                                {unreadAlerts > 0 && (
                                    <span 
                                        className="position-absolute badge rounded-pill bg-danger d-flex align-items-center justify-content-center"
                                        style={{ 
                                            fontSize: '0.75em',
                                            padding: '0.75em 0.6em 1.0em 0.5em',
                                            minWidth: '1.5em',
                                            height: '1.5em',
                                            transform: 'scale(0.8) translate(50%, -50%)',
                                            top: '0',
                                            right: '0'
                                        }}
                                    >
                                        {unreadAlerts}
                                        <span className="visually-hidden">unread alerts</span>
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}
                    {user ? (
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="nav-link p-0 d-flex align-items-center" id="user-dropdown">
                                <UserAvatar email={user?.email} size={32} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                                style={{
                                    backgroundColor: 'var(--bs-navbar-bg)',
                                    marginLeft: '1rem',
                                    minWidth: '200px'
                                }}>
                                <Dropdown.Item as={Link} to="/profile" className="text-inherit">
                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                    My Account
                                </Dropdown.Item>
                                <Dropdown.Item as={Link} to="/preferences" className="text-inherit">
                                    <FontAwesomeIcon icon={faGear} className="me-2" />
                                    Preferences
                                </Dropdown.Item>
                                <Dropdown.Item onClick={cycleTheme} className="text-inherit">
                                    <FontAwesomeIcon icon={getThemeIcon()} className="me-2" />
                                    Theme ({theme})
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={logout} className="text-inherit">
                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    ) : (
                        <>
                            <button
                                className="btn btn-link nav-link"
                                onClick={cycleTheme}
                                aria-label="Toggle theme"
                            >
                                <FontAwesomeIcon icon={getThemeIcon()} className="me-2" />
                                Theme
                            </button>
                            <span className="ms-2 me-2">|</span>
                            <Link className="nav-link" to="/signup">Sign Up</Link>
                            <span className="ms-2 me-2">|</span>
                            <Link className="nav-link" to="/login">Login</Link>
                        </>
                    )}
                </div>
            </div>
            <SubscriptionAlertsModal 
                show={showAlerts}
                onHide={() => setShowAlerts(false)}
            />
        </nav>
    )
}

export default Navigation