// src/components/SubscriptionTimeline.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClock, 
    faCheckCircle, 
    faBan, 
    faTimesCircle, 
    faPause 
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

interface TimelineEvent {
    state: string;
    start_date: string;
    end_date: string | null;
}

interface Props {
    subscriptionId: string;
}

const SubscriptionTimeline: React.FC<Props> = ({ subscriptionId }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const getStateInfo = (state: string) => {
        switch (state) {
            case 'trial':
                return { icon: faClock, color: 'var(--bs-info)', label: 'Trial' };
            case 'active':
                return { icon: faCheckCircle, color: 'var(--bs-success)', label: 'Active' };
            case 'canceled':
                return { icon: faBan, color: 'var(--bs-danger)', label: 'Canceled' };
            case 'expired':
                return { icon: faTimesCircle, color: 'var(--bs-secondary)', label: 'Expired' };
            case 'paused':
                return { icon: faPause, color: 'var(--bs-warning)', label: 'Paused' };
            default:
                return { icon: faClock, color: 'var(--bs-secondary)', label: state };
        }
    };

    const getDuration = (startDate: string, endDate: string | null) => {
        const start = moment(startDate);
        const end = endDate ? moment(endDate) : moment();
        return moment.duration(end.diff(start)).humanize();
    };

    useEffect(() => {
        const fetchTimeline = async () => {
            const { data, error } = await supabase
                .from('subscription_history')
                .select('*')
                .eq('subscription_id', subscriptionId)
                .order('start_date', { ascending: true });

            if (error) {
                console.error('Error fetching timeline:', error);
                return;
            }

            setEvents(data);
            setLoading(false);
        };

        fetchTimeline();
    }, [subscriptionId]);

    if (loading) return <div>Loading timeline...</div>;

    return (
        <div className="subscription-timeline p-3 rounded bg-body-tertiary border">
            <h6 className="mb-3">Subscription Timeline</h6>
            <div className="timeline-container position-relative d-flex align-items-center" 
                style={{ 
                    minHeight: '100px',  // Increased from 60px to accommodate scaled final node
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingTop: '1rem',
                    paddingBottom: '1rem'
                }}>
                {/* Line connecting dots */}
                <div 
                    className="timeline-line position-absolute" 
                    style={{
                        height: '3px',
                        backgroundColor: 'transparent',
                        borderTop: '3px dotted var(--bs-border-color)',
                        width: '100%',
                        zIndex: 1
                    }}
                />
                
                {/* State change dots */}
                <div className="d-flex justify-content-between w-100" 
                    style={{ minWidth: events.length * 150 + 'px', zIndex: 2 }}>
                    {events.map((event, index) => {
                        const stateInfo = getStateInfo(event.state);
                        const nextEvent = events[index + 1];
                        const duration = nextEvent ? getDuration(event.start_date, nextEvent.start_date) : 
                            getDuration(event.start_date, null);

                        return (
                            <div key={`${event.state}-${event.start_date}`} 
                                className="position-relative" 
                                style={{ flex: 1 }}>
                                <div className="timeline-point d-flex flex-column align-items-center">
                                    {duration && index < events.length - 1 && (
                                        <div 
                                            className="d-none d-md-block position-absolute text-body-secondary px-2 rounded"
                                            style={{
                                                fontSize: '0.75em',
                                                left: '100%',
                                                top: '50%', // Move to vertical center
                                                transform: 'translate(-50%, -50%)', // Center both horizontally and vertically
                                                backgroundColor: 'var(--bs-body-bg)',
                                                border: '1px solid var(--bs-border-color)',
                                                zIndex: 3,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {duration}
                                        </div>
                                    )}
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                                        style={{
                                            width: index === events.length - 1 ? '40px' : '32px',
                                            height: index === events.length - 1 ? '40px' : '32px',
                                            backgroundColor: stateInfo.color,
                                            color: 'white',
                                            transform: index === events.length - 1 ? 'scale(1.25)' : 'none',
                                            transition: 'all 0.2s ease-in-out'
                                        }}>
                                        <FontAwesomeIcon icon={stateInfo.icon} />
                                    </div>
                                    <div className="text-center" 
                                        style={{
                                            transform: index === events.length - 1 ? 'scale(1.25)' : 'none',
                                            transition: 'all 0.2s ease-in-out'
                                        }}>
                                        <div className="fw-bold" style={{ fontSize: '0.8em' }}>
                                            {stateInfo.label}
                                        </div>
                                        <div className="text-body-secondary" style={{ fontSize: '0.75em' }}>
                                            {new Date(event.start_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionTimeline;