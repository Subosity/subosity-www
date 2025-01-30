// src/components/PaymentProviderDropdown.tsx
import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';

interface PaymentProvider {
    id: string;
    name: string;
    icon: string;
    is_public: boolean;
    is_default: boolean;
}

interface Props {
    value: PaymentProvider | null;
    onChange: (providerId: string) => void;
    onAddNew: () => void;
    error?: string;
    touched?: boolean;
}

const CustomOption = ({ children, ...props }: any) => (
    <components.Option {...props}>
        <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                    style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'var(--bs-gray-200)',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                    <img
                        src={props.data.icon}
                        alt=""
                        style={{
                            width: '150%',
                            height: '150%',
                            objectFit: 'contain',
                            padding: '4px'
                        }}
                    />
                </div>
                <span className="ms-2">{children}</span>
            </div>
        </div>
    </components.Option>
);

const selectStyles = {
    control: (base: any) => ({
        ...base,
        backgroundColor: 'var(--bs-body-bg)',
        borderColor: 'var(--bs-border-color)'
    }),
    input: (base: any) => ({
        ...base,
        color: 'var(--bs-body-color)'
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: 'var(--bs-body-bg)',
        borderColor: 'var(--bs-border-color)'
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused 
            ? 'var(--bs-primary)' 
            : 'var(--bs-body-bg)',
        color: state.isFocused 
            ? 'white' 
            : 'var(--bs-body-color)'
    }),
    singleValue: (base: any) => ({
        ...base,
        color: 'var(--bs-body-color)'
    })
};

const ADD_NEW_PROVIDER = {
    id: 'add-new',
    name: 'Add a new payment method...',
    isAddNew: true,
    icon: null,
    is_public: true,
    is_default: false
};

const PaymentProviderDropdown: React.FC<Props> = ({
    value,
    onChange,
    onAddNew,
    error,
    touched
}) => {
    const [providers, setProviders] = useState<PaymentProvider[]>([]);

    useEffect(() => {
        const fetchProviders = async () => {
            const { data, error } = await supabase
                .from('payment_provider')
                .select('*')
                .order('name');
            
            if (data) {
                setProviders(data);
            }
        };
        fetchProviders();
    }, []);

    return (
        <Select
            value={value}
            onChange={(option: any) => {
                if (option?.isAddNew) {
                    onAddNew();
                    return;
                }
                onChange(option?.id || '');
            }}
            options={[
                ...providers,
                ADD_NEW_PROVIDER
            ]}
            components={{ Option: CustomOption }}
            styles={selectStyles}
            isSearchable={true}
            placeholder="Select payment method..."
        />
    );
};

export default PaymentProviderDropdown;