import React, { useState } from 'react'
import md5 from 'md5'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

interface UserAvatarProps {
    email?: string | null;
    size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ email, size = 32 }) => {
    const [gravatarError, setGravatarError] = useState(false)

    const getInitials = (email: string) => {
        if (!email) return '??'
        const parts = email.split('@')
        return parts[0].substring(0, 2).toUpperCase()
    }

    if (!email) {
        return (
            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" 
                 style={{ width: `${size}px`, height: `${size}px` }}>
                <FontAwesomeIcon icon={faUser} className="text-light" style={{ fontSize: `${size/2}px` }} />
            </div>
        )
    }

    const hash = md5(email.toLowerCase().trim())
    const gravatarUrl = `https://secure.gravatar.com/avatar/${hash}?s=${size}&d=mp`

    return (
        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" 
             style={{ width: `${size}px`, height: `${size}px` }}>
            {!gravatarError ? (
                <img
                    src={gravatarUrl}
                    onError={() => setGravatarError(true)}
                    alt="User avatar"
                    className="rounded-circle"
                    style={{ width: `${size}px`, height: `${size}px`, objectFit: 'cover' }}
                />
            ) : (
                <span style={{ 
                    color: 'var(--bs-body-color)',
                    fontSize: `${size/2}px`,
                    fontWeight: 'bold'
                }}>
                    {getInitials(email)}
                </span>
            )}
        </div>
    )
}

export default UserAvatar