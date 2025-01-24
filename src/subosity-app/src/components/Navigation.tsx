import React, { useState } from 'react'
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
    faHome
} from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { Dropdown } from 'react-bootstrap'
import UserAvatar from './UserAvatar'

const Navigation = () => {
    const [gravatarError, setGravatarError] = useState(false)
    const { theme, setTheme } = useTheme()
    const { user, logout } = useAuth()
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const isDarkMode = theme === 'dark' || (theme === 'auto' && prefersDark)

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
            case 'light': return faSun
            case 'dark': return faMoon
            default: return faCircleHalfStroke
        }
    }

    const cycleTheme = () => {
        const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto']
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex])
    }

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
        </nav>
    )
}

export default Navigation