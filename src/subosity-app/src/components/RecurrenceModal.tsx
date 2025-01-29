import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft, 
    faSave, 
    faCalendarDay,
    faRepeat
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

interface Props {
    show: boolean;
    onHide: () => void;
    initialRule?: string;
    onSave: (rule: string, description: string) => void; // Modified to include description
}

interface RuleConfig {
    frequency: string;
    interval: number;
    byDay?: string[];      // MO,TU,WE etc
    byMonthDay?: number[]; // 1,15,-1 etc
    byMonth?: number[];    // 1-12
    bySetPos?: number;     // 1,-1 etc for first, last
}

const RecurrenceModal: React.FC<Props> = ({ show, onHide, initialRule, onSave }) => {
    // Parse initial rule if exists
    const parseInitialRule = (rule?: string) => {
        if (!rule) {
            return {
                frequency: 'MONTHLY',
                interval: 1,
                byMonthDay: [1]  // Default to 1st of month
            };
        }

        const parts = rule.replace('RRULE:', '').split(';');
        const config: RuleConfig = {
            frequency: parts.find(p => p.startsWith('FREQ='))?.split('=')[1] || 'MONTHLY',
            interval: parseInt(parts.find(p => p.startsWith('INTERVAL='))?.split('=')[1] || '1'),
        };

        // Check if rule uses BYMONTHDAY or BYDAY
        const byMonthDay = parts.find(p => p.startsWith('BYMONTHDAY='))?.split('=')[1];
        const byDay = parts.find(p => p.startsWith('BYDAY='))?.split('=')[1];
        const bySetPos = parts.find(p => p.startsWith('BYSETPOS='))?.split('=')[1];

        if (byMonthDay) {
            config.byMonthDay = byMonthDay.split(',').map(Number);
        } else if (byDay) {
            config.byDay = byDay.split(',');
            if (bySetPos) {
                config.bySetPos = parseInt(bySetPos);
            }
        } else {
            // Default to day of month if neither specified
            config.byMonthDay = [1];
        }

        return config;
    };

    const [ruleConfig, setRuleConfig] = useState<RuleConfig>(() => 
        parseInitialRule(initialRule)
    );

    const frequencyOptions = [
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'YEARLY', label: 'Yearly' }
    ];

    const weekDays = [
        { value: 'MO', label: 'Monday' },
        { value: 'TU', label: 'Tuesday' },
        { value: 'WE', label: 'Wednesday' },
        { value: 'TH', label: 'Thursday' },
        { value: 'FR', label: 'Friday' },
        { value: 'SA', label: 'Saturday' },
        { value: 'SU', label: 'Sunday' }
    ];

    const monthPositions = [
        { value: 1, label: 'First' },
        { value: 2, label: 'Second' },
        { value: 3, label: 'Third' },
        { value: 4, label: 'Fourth' },
        { value: -1, label: 'Last' }
    ];

    const selectStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: 'var(--bs-body-bg)',
            borderColor: 'var(--bs-border-color)',
            color: 'var(--bs-body-color)'
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: 'var(--bs-body-bg)',
            border: '1px solid var(--bs-border-color)'
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused 
                ? 'var(--bs-primary)' 
                : 'var(--bs-body-bg)',
            color: state.isFocused 
                ? 'white' 
                : 'var(--bs-body-color)',
            ':active': {
                backgroundColor: 'var(--bs-primary)'
            }
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'var(--bs-body-color)'
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: 'var(--bs-primary)',
            color: 'white'
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: 'white'
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: 'white',
            ':hover': {
                backgroundColor: 'var(--bs-primary-dark)',
                color: 'white'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: 'var(--bs-body-color)'
        })
    };

    const generateRRule = () => {
        let parts = [`FREQ=${ruleConfig.frequency}`];
        parts.push(`INTERVAL=${ruleConfig.interval}`);
        
        if (ruleConfig.byDay?.length) {
            parts.push(`BYDAY=${ruleConfig.byDay.join(',')}`);
        }
        if (ruleConfig.byMonthDay?.length) {
            parts.push(`BYMONTHDAY=${ruleConfig.byMonthDay.join(',')}`);
        }
        if (ruleConfig.byMonth?.length) {
            parts.push(`BYMONTH=${ruleConfig.byMonth.join(',')}`);
        }
        if (ruleConfig.bySetPos) {
            parts.push(`BYSETPOS=${ruleConfig.bySetPos}`);
        }
        
        return `RRULE:${parts.join(';')}`;
    };

    const getRuleDescription = () => {
        const freq = ruleConfig.frequency.toLowerCase().replace('ly', '');
        let desc = `Repeats every ${ruleConfig.interval} ${freq}${ruleConfig.interval > 1 ? 's' : ''}`;
    
        if (ruleConfig.frequency === 'WEEKLY' && ruleConfig.byDay?.length) {
            const days = ruleConfig.byDay.map(d => {
                switch(d) {
                    case 'MO': return 'Monday';
                    case 'TU': return 'Tuesday';
                    case 'WE': return 'Wednesday';
                    case 'TH': return 'Thursday';
                    case 'FR': return 'Friday';
                    case 'SA': return 'Saturday';
                    case 'SU': return 'Sunday';
                    default: return d;
                }
            });
            desc += ` on ${days.join(', ')}`;
        }
    
        if (ruleConfig.frequency === 'MONTHLY') {
            if (ruleConfig.byMonthDay) {
                desc += ` on day ${ruleConfig.byMonthDay[0]}`;
            } else if (ruleConfig.byDay && ruleConfig.bySetPos) {
                const pos = ruleConfig.bySetPos === 1 ? 'first' : 
                           ruleConfig.bySetPos === -1 ? 'last' : 
                           `${ruleConfig.bySetPos}${['th','st','nd','rd'][ruleConfig.bySetPos % 10] || 'th'}`;
                const day = ruleConfig.byDay[0].replace('MO', 'Monday')
                                             .replace('TU', 'Tuesday')
                                             .replace('WE', 'Wednesday')
                                             .replace('TH', 'Thursday')
                                             .replace('FR', 'Friday')
                                             .replace('SA', 'Saturday')
                                             .replace('SU', 'Sunday');
                desc += ` on the ${pos} ${day}`;
            }
        }
    
        return desc;
    };

    const renderFrequencyOptions = () => {
        switch (ruleConfig.frequency) {
            case 'WEEKLY':
                return (
                    <Form.Group className="mb-3">
                        <Form.Label>Repeat on</Form.Label>
                        <Select
                            isMulti
                            options={weekDays}
                            value={weekDays.filter(d => ruleConfig.byDay?.includes(d.value))}
                            onChange={(selected) => {
                                setRuleConfig(prev => ({
                                    ...prev,
                                    byDay: selected.map(s => s.value)
                                }));
                            }}
                            styles={selectStyles}
                        />
                    </Form.Group>
                );

            case 'MONTHLY':
                return (
                    <>
                        <ButtonGroup className="mb-3 w-100">
                            <Button 
                                variant={ruleConfig.byMonthDay ? 'primary' : 'outline-primary'}
                                onClick={() => setRuleConfig(prev => ({
                                    ...prev,
                                    byMonthDay: [1],
                                    byDay: undefined,
                                    bySetPos: undefined
                                }))}
                            >
                                Day of month
                            </Button>
                            <Button
                                variant={ruleConfig.byDay ? 'primary' : 'outline-primary'}
                                onClick={() => setRuleConfig(prev => ({
                                    ...prev,
                                    byMonthDay: undefined,
                                    byDay: ['MO'],
                                    bySetPos: 1
                                }))}
                            >
                                Day of week
                            </Button>
                        </ButtonGroup>
                        
                        {ruleConfig.byMonthDay ? (
                            <Form.Group className="mb-3">
                                <Form.Label>Day of month</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={ruleConfig.byMonthDay[0]}
                                    onChange={(e) => setRuleConfig(prev => ({
                                        ...prev,
                                        byMonthDay: [parseInt(e.target.value)]
                                    }))}
                                    style={{
                                        backgroundColor: 'var(--bs-body-bg)',
                                        color: 'var(--bs-body-color)',
                                        borderColor: 'var(--bs-border-color)'
                                    }}
                                />
                            </Form.Group>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Position</Form.Label>
                                    <Select
                                        options={monthPositions}
                                        value={monthPositions.find(p => p.value === ruleConfig.bySetPos)}
                                        onChange={(selected) => setRuleConfig(prev => ({
                                            ...prev,
                                            bySetPos: selected?.value
                                        }))}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Day</Form.Label>
                                    <Select
                                        options={weekDays}
                                        value={weekDays.find(d => ruleConfig.byDay?.includes(d.value))}
                                        onChange={(selected) => setRuleConfig(prev => ({
                                            ...prev,
                                            byDay: selected ? [selected.value] : undefined
                                        }))}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </>
                );

            // Add YEARLY options...
        }
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div>
                    <Offcanvas.Title>
                        <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                        Edit Recurrence Rule
                    </Offcanvas.Title>
                    <div style={{ fontSize: '0.85em', opacity: 0.6 }}>
                        Define when this subscription repeats
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Frequency</Form.Label>
                        <Select
                            value={frequencyOptions.find(o => o.value === ruleConfig.frequency)}
                            onChange={(option) => setRuleConfig(prev => ({
                                ...prev,
                                frequency: option?.value || 'MONTHLY'
                            }))}
                            options={frequencyOptions}
                            styles={selectStyles}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Repeat every</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={ruleConfig.interval}
                            onChange={(e) => setRuleConfig(prev => ({
                                ...prev,
                                interval: parseInt(e.target.value) || 1
                            }))}
                            style={{
                                backgroundColor: 'var(--bs-body-bg)',
                                color: 'var(--bs-body-color)',
                                borderColor: 'var(--bs-border-color)'
                            }}
                        />
                    </Form.Group>

                    {renderFrequencyOptions()}

                    <div className="alert alert-info">
                        <FontAwesomeIcon icon={faRepeat} className="me-2" />
                        {getRuleDescription()}
                    </div>
                </Form>
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button variant="primary" onClick={() => {
                        const rrule = generateRRule();
                        const description = getRuleDescription();
                        onSave(rrule, description);
                        onHide();
                    }}>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default RecurrenceModal;