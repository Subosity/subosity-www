import React from 'react';
import { Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClock, 
    faCheckCircle, 
    faBan, 
    faTimesCircle, 
    faPause, 
    faQuestion 
} from '@fortawesome/free-solid-svg-icons';

interface Props {
    state: string;
}

const SubscriptionStateDisplay: React.FC<Props> = ({ state }) => {
    const getStateDisplay = (state: string) => {
        switch (state) {
            case 'trial':
                return { icon: faClock, color: 'info', label: 'Trial' };
            case 'active':
                return { icon: faCheckCircle, color: 'success', label: 'Active' };
            case 'canceled':
                return { icon: faBan, color: 'danger', label: 'Canceled' };
            case 'expired':
                return { icon: faTimesCircle, color: 'secondary', label: 'Expired' };
            case 'paused':
                return { icon: faPause, color: 'warning', label: 'Paused' };
            default:
                return { icon: faQuestion, color: 'secondary', label: state };
        }
    };

    const stateInfo = getStateDisplay(state);

    return (
        <Badge bg={stateInfo.color} style={{ fontSize: '0.75em', minWidth: '6.5em' }}>
            <FontAwesomeIcon icon={stateInfo.icon} className="me-1" />
            {stateInfo.label}
        </Badge>
    );
};

export default SubscriptionStateDisplay;