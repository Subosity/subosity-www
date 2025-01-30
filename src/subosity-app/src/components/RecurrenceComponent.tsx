import React from 'react';
import { Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarCheck, 
    faCalendarXmark, 
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Subscription } from '../types';
import moment from 'moment';
import { RRule } from 'rrule';
import { getNextOccurrence } from '../utils/recurrenceUtils';

interface Props {
    subscription: Subscription;
    mode: 'text' | 'badge';
    thresholds?: {
        warning: number;  // days
        urgent: number;   // days
    };
}

const defaultThresholds = {
    warning: 30,  // 30 days
    urgent: 15    // 15 days
};

const RecurrenceComponent: React.FC<Props> = ({ 
    subscription, 
    mode, 
    thresholds = defaultThresholds 
}) => {
    const getSeverity = (nextDate: Date | null): 'success' | 'warning' | 'danger' => {
        if (!nextDate) return 'danger';
        
        const daysUntil = moment(nextDate).diff(moment(), 'days');
        
        if (daysUntil > thresholds.warning) return 'success';
        if (daysUntil > thresholds.urgent) return 'warning';
        return 'danger';
    };

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'success': return faCalendarCheck;
            case 'warning': return faExclamationTriangle;
            case 'danger': return faCalendarXmark;
            default: return faCalendarCheck;
        }
    };

    if (mode === 'text') {
        return (
            <span className="text-body-secondary">
                {subscription.recurrenceRuleUiFriendly}
            </span>
        );
    }

    const nextDate = getNextOccurrence(subscription.recurrenceRule || '');
    const severity = getSeverity(nextDate);

    return (
        <Badge 
            bg={severity} 
            className="d-inline-flex align-items-center"
            title={nextDate ? 
                `${moment(nextDate).format('MMMM D, YYYY')}\n${moment(nextDate).fromNow()}` 
                : 'Invalid Rule'
            }
        >
            <FontAwesomeIcon icon={getIcon(severity)} className="me-1" />Next:&nbsp;
            {nextDate ? moment(nextDate).format('MMM D, YYYY') : 'Invalid Rule'}
        </Badge>
    );
};

export default RecurrenceComponent;