// src/AlertsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from './supabaseClient';

interface AlertsContextType {
    unreadCount: number;
    getUnreadCountForSubscription: (subscriptionId: string) => Promise<number>;
    handleDismiss: (alertId: string) => Promise<boolean>;
    handleSnooze: (alertId: string) => Promise<boolean>;
    fetchAlerts: (params: {
        subscriptionId?: string;
        filterType: 'all' | 'unread' | 'read';
    }) => Promise<{
        alerts: SubscriptionAlert[];
        counts: {
            all: number;
            unread: number;
            read: number;
        };
    }>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const { addToast } = useToast();

    const fetchUnreadCount = async () => {
        if (!user) return;
        
        const { count, error } = await supabase
            .from('subscription_alerts')
            .select('*', { count: 'exact' })
            .is('read_at', null)
            .eq('owner', user.id);

        if (!error && count !== null) {
            setUnreadCount(count);
        }
    };

    const getUnreadCountForSubscription = async (subscriptionId: string) => {
        if (!user) return 0;
        
        const { count, error } = await supabase
            .from('subscription_alerts')
            .select('*', { count: 'exact' })
            .eq('subscription_id', subscriptionId)
            .is('read_at', null);

        if (error) {
            console.error('Error getting subscription alerts count:', error);
            return 0;
        }

        return count || 0;
    };

    const handleDismiss = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from('subscription_alerts')
                .update({ read_at: new Date().toISOString() })
                .eq('id', alertId);

            if (error) throw error;
            await fetchUnreadCount(); // Update count after dismissal
            addToast('Alert dismissed', 'success');
            return true; // Return success status
        } catch (error) {
            console.error('Error dismissing alert:', error);
            addToast('Failed to dismiss alert', 'error');
            return false;
        }
    };

    const handleSnooze = async (alertId: string) => {
        try {
            const { data } = await supabase
                .from('subscription_alerts')
                .select('*')
                .eq('id', alertId)
                .single();

            if (!data) return;

            const { error: insertError } = await supabase
                .from('subscription_alerts')
                .insert([{
                    subscription_id: data.subscription_id,
                    owner: user?.id,
                    title: data.title,
                    description: data.description,
                    severity: data.severity,
                    sent_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }]);

            if (insertError) throw insertError;

            const { error: updateError } = await supabase
                .from('subscription_alerts')
                .update({ read_at: new Date().toISOString() })
                .eq('id', alertId);

            if (updateError) throw updateError;
            
            await fetchUnreadCount(); // Update count after snooze
            addToast('Alert snoozed for 24 hours', 'success');
            return true; // Return success status
        } catch (error) {
            console.error('Error snoozing alert:', error);
            addToast('Failed to snooze alert', 'error');
            return false;
        }
    };

    const fetchAlerts = async ({ subscriptionId, filterType }: {
        subscriptionId?: string;
        filterType: 'all' | 'unread' | 'read';
    }) => {
        if (!user) return { alerts: [], counts: { all: 0, unread: 0, read: 0 } };

        try {
            // Build base query
            let query = supabase
                .from('subscription_alerts')
                .select(`
                    *,
                    subscription:subscription_id (
                        subscription_provider (
                            name,
                            icon
                        )
                    )
                `)
                .eq('owner', user.id)  // Add this line to filter by user
                .order('created_at', { ascending: false });

            // Only add subscription filter if ID is provided
            if (subscriptionId) {
                query = query.eq('subscription_id', subscriptionId);
            }

            const { data: allAlerts, error } = await query;

            if (error) throw error;

            // Calculate counts from the fetched data
            const counts = {
                all: allAlerts?.length || 0,
                unread: allAlerts?.filter(a => !a.read_at).length || 0,
                read: allAlerts?.filter(a => a.read_at).length || 0
            };

            // Filter alerts based on type
            let filteredAlerts = allAlerts || [];
            if (filterType === 'unread') {
                filteredAlerts = filteredAlerts.filter(a => !a.read_at);
            } else if (filterType === 'read') {
                filteredAlerts = filteredAlerts.filter(a => a.read_at);
            }

            return {
                alerts: filteredAlerts,
                counts
            };
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return { alerts: [], counts: { all: 0, unread: 0, read: 0 } };
        }
    };

    // Fetch initial count when user changes
    useEffect(() => {
        fetchUnreadCount();
    }, [user]);

    return (
        <AlertsContext.Provider value={{ 
            unreadCount, 
            getUnreadCountForSubscription,
            handleDismiss,
            handleSnooze,
            fetchAlerts
        }}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlerts = () => {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error('useAlerts must be used within AlertsProvider');
    }
    return context;
};