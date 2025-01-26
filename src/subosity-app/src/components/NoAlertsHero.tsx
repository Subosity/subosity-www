import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBellSlash } from '@fortawesome/free-solid-svg-icons';

interface NoAlertsHeroProps {
    filterType: 'all' | 'read' | 'unread';
}

const NoAlertsHero: React.FC<NoAlertsHeroProps> = ({ filterType }) => {
    const messages = {
        all: "No alerts found",
        read: "No read alerts found",
        unread: "No unread alerts found"
    };

    const descriptions = {
        all: "When new alerts arrive for this subscription, they'll appear here.",
        read: "Alerts you've marked as read will appear here.",
        unread: "You're all caught up! No unread alerts for this subscription."
    };

    return (
        <div className="text-center py-5">
            <FontAwesomeIcon
                icon={faBellSlash}
                size="4x"
                className="mb-3 text-secondary"
            />
            <h4>{messages[filterType]}</h4>
            <p className="text-muted">{descriptions[filterType]}</p>
        </div>
    );
};

export default NoAlertsHero;