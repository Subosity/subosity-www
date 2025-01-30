import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form, ButtonGroup, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faSave,
    faCalendarDay,
    faRepeat,
    faCheck,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { RRule } from 'rrule';
import { parseRRule, generateRRule, getDetailedDescription } from '../utils/recurrenceUtils';

interface Props {
    show: boolean;
    onHide: () => void;
    initialRule?: string;
    onSave: (rule: string, description: string) => void;
    subscription?: {
        startDate?: string;
    };
    onStartDateChange?: (date: string) => void;
    initialStartDate?: Date;
}

interface RuleConfig {
    frequency: string;
    interval: number;
    byDay?: string[];      // MO,TU,WE etc
    byMonthDay?: number[]; // 1,15,-1 etc
    byMonth?: number[];    // 1-12
    bySetPos?: number;     // 1,-1 etc for first, last
}

interface ValidationErrors {
    interval?: string;
    byMonthDay?: string;
    byMonth?: string;
    byDay?: string;
    bySetPos?: string;
}

const RecurrenceModal: React.FC<Props> = ({
    show,
    onHide,
    initialRule,
    onSave,
    subscription,
    onStartDateChange,
    initialStartDate
}) => {
    const initializeFromStartDate = () => {
        if (subscription?.startDate) {
            const date = new Date(subscription.startDate);
            return {
                month: date.getMonth() + 1,
                day: date.getDate()
            };
        }
        return { month: 1, day: 1 };
    };

    const [ruleConfig, setRuleConfig] = useState<RuleConfig>(() => {
        const parsedConfig = parseRRule(initialRule);
        // If this is a pattern-based rule (has bySetPos and byDay), ensure Pattern mode is selected
        if (parsedConfig.bySetPos !== undefined && parsedConfig.byDay?.length) {
            return {
                ...parsedConfig,
                byMonthDay: undefined // Explicitly clear byMonthDay to ensure Pattern mode
            };
        }
        // If this is a specific date rule (has byMonthDay), ensure Specific Date mode is selected
        if (parsedConfig.byMonthDay?.length) {
            return {
                ...parsedConfig,
                bySetPos: undefined, // Explicitly clear bySetPos to ensure Specific Date mode
                byDay: undefined     // Explicitly clear byDay to ensure Specific Date mode
            };
        }
        return parsedConfig;
    });

    // Ensure the correct toggle is selected based on the parsed rule
    useEffect(() => {
        setRuleConfig(parseRRule(initialRule));
    }, [initialRule]);

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isValid, setIsValid] = useState(true);

    const frequencyOptions = [
        // { value: 'DAILY', label: 'Daily' },
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

    // const getRuleDescription = () => {
    //     const freq = ruleConfig.frequency.toLowerCase().replace('ly', '');
    //     let desc = `Repeats every ${ruleConfig.interval} ${freq}${ruleConfig.interval > 1 ? 's' : ''}`;

    //     if (ruleConfig.frequency === 'WEEKLY' && ruleConfig.byDay?.length) {
    //         const days = ruleConfig.byDay.map(d => {
    //             switch (d) {
    //                 case 'MO': return 'Monday';
    //                 case 'TU': return 'Tuesday';
    //                 case 'WE': return 'Wednesday';
    //                 case 'TH': return 'Thursday';
    //                 case 'FR': return 'Friday';
    //                 case 'SA': return 'Saturday';
    //                 case 'SU': return 'Sunday';
    //                 default: return d;
    //             }
    //         });
    //         desc += ` on ${days.join(', ')}`;
    //     }

    //     if (ruleConfig.frequency === 'MONTHLY') {
    //         if (ruleConfig.byMonthDay) {
    //             desc += ` on day ${ruleConfig.byMonthDay[0]}`;
    //         } else if (ruleConfig.byDay && ruleConfig.bySetPos) {
    //             const pos = ruleConfig.bySetPos === 1 ? 'first' :
    //                 ruleConfig.bySetPos === -1 ? 'last' :
    //                     `${ruleConfig.bySetPos}${['th', 'st', 'nd', 'rd'][ruleConfig.bySetPos % 10] || 'th'}`;
    //             const day = ruleConfig.byDay[0].replace('MO', 'Monday')
    //                 .replace('TU', 'Tuesday')
    //                 .replace('WE', 'Wednesday')
    //                 .replace('TH', 'Thursday')
    //                 .replace('FR', 'Friday')
    //                 .replace('SA', 'Saturday')
    //                 .replace('SU', 'Sunday');
    //             desc += ` on the ${pos} ${day}`;
    //         }
    //     }

    //     return desc;
    // };

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
                                updateRuleConfig({
                                    ...ruleConfig,
                                    byDay: selected ? selected.map(s => s.value) : []
                                });
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
                                onClick={() => updateRuleConfig({
                                    ...ruleConfig,
                                    byMonthDay: [1],
                                    byDay: undefined,
                                    bySetPos: undefined
                                })}
                            >
                                Day of month
                            </Button>
                            <Button
                                variant={ruleConfig.byDay ? 'primary' : 'outline-primary'}
                                onClick={() => updateRuleConfig({
                                    ...ruleConfig,
                                    byMonthDay: undefined,
                                    byDay: ['MO'],
                                    bySetPos: 1
                                })}
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
       onChange={(e) => {
           const value = parseInt(e.target.value);
           if (value >= 1 && value <= 31) {
               updateRuleConfig({
                   ...ruleConfig,
                   byMonthDay: [value]
               });
               setErrors({
                   ...errors,
                   byMonthDay: undefined
               });
           } else {
               setErrors({
                   ...errors,
                   byMonthDay: 'Please enter a valid day of the month (1-31).'
               });
           }
       }}
       isInvalid={!!errors.byMonthDay}
       style={{
           backgroundColor: 'var(--bs-body-bg)',
           color: 'var(--bs-body-color)',
           borderColor: 'var(--bs-border-color)'
       }}
   />
   <Form.Control.Feedback type="invalid">
       {errors.byMonthDay}
   </Form.Control.Feedback>
</Form.Group>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Position</Form.Label>
                                    <Select
                                        options={monthPositions}
                                        value={monthPositions.find(p => p.value === Number(ruleConfig.bySetPos))}
                                        onChange={(selected) => updateRuleConfig({
                                            ...ruleConfig,
                                            bySetPos: selected?.value
                                        })}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Day</Form.Label>
                                    <Select
                                        options={weekDays}
                                        value={weekDays.find(d => ruleConfig.byDay?.includes(d.value))}
                                        onChange={(selected) => updateRuleConfig({
                                            ...ruleConfig,
                                            byDay: selected ? [selected.value] : undefined
                                        })}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </>
                );

            case 'YEARLY':
                const { month, day } = initializeFromStartDate();
                return (
                    <>
                        <ButtonGroup className="mb-3 w-100">
                            <Button
                                variant={ruleConfig.byMonthDay ? 'primary' : 'outline-primary'}
                                onClick={() => updateRuleConfig({
                                    ...ruleConfig,
                                    byMonthDay: [day],
                                    byMonth: [month],
                                    byDay: undefined,
                                    bySetPos: undefined
                                })}
                            >
                                Specific Date
                            </Button>
                            <Button
                                variant={ruleConfig.byDay ? 'primary' : 'outline-primary'}
                                onClick={() => updateRuleConfig({
                                    ...ruleConfig,
                                    byMonthDay: undefined,
                                    byMonth: [month],
                                    byDay: ['MO'],
                                    bySetPos: 1
                                })}
                            >
                                Pattern
                            </Button>
                        </ButtonGroup>

                        {ruleConfig.byMonthDay ? (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Month</Form.Label>
                                    <Select
                                        options={Array.from({ length: 12 }, (_, i) => ({
                                            value: i + 1,
                                            label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
                                        }))}
                                        value={{
                                            value: ruleConfig.byMonth?.[0] || 1,
                                            label: new Date(2000, (ruleConfig.byMonth?.[0] || 1) - 1, 1).toLocaleString('default', { month: 'long' })
                                        }}
                                        onChange={(selected) => updateRuleConfig({
                                            ...ruleConfig,
                                            byMonth: [selected?.value || 1]
                                        })}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Day</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        max={31}
                                        value={ruleConfig.byMonthDay[0]}
                                        onChange={(e) => updateRuleConfig({
                                            ...ruleConfig,
                                            byMonthDay: [parseInt(e.target.value)]
                                        })}
                                        style={{
                                            backgroundColor: 'var(--bs-body-bg)',
                                            color: 'var(--bs-body-color)',
                                            borderColor: 'var(--bs-border-color)'
                                        }}
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Month</Form.Label>
                                    <Select
                                        options={Array.from({ length: 12 }, (_, i) => ({
                                            value: i + 1,
                                            label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
                                        }))}
                                        value={{
                                            value: ruleConfig.byMonth?.[0] || 1,
                                            label: new Date(2000, (ruleConfig.byMonth?.[0] || 1) - 1, 1).toLocaleString('default', { month: 'long' })
                                        }}
                                        onChange={(selected) => updateRuleConfig({
                                            ...ruleConfig,
                                            byMonth: [selected?.value || 1]
                                        })}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Position</Form.Label>
                                    <Select
                                        options={monthPositions}
                                        value={monthPositions.find(p => p.value === Number(ruleConfig.bySetPos))}
                                        onChange={(selected) => updateRuleConfig({
                                            ...ruleConfig,
                                            bySetPos: selected?.value
                                        })}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Day</Form.Label>
                                    <Select
                                        options={weekDays}
                                        value={weekDays.find(d => ruleConfig.byDay?.includes(d.value))}
                                        onChange={(selected) => updateRuleConfig({
                                            ...ruleConfig,
                                            byDay: selected ? [selected.value] : undefined
                                        })}
                                        styles={selectStyles}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </>
                );
        }
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
    };

    const getDayWithSuffix = (day: number) => {
        const j = day % 10,
            k = day % 100;
        if (j === 1 && k !== 11) {
            return day + "st";
        }
        if (j === 2 && k !== 12) {
            return day + "nd";
        }
        if (j === 3 && k !== 13) {
            return day + "rd";
        }
        return day + "th";
    };

    const validateRuleConfig = (config: RuleConfig): ValidationErrors => {
        const errors: ValidationErrors = {};

        // Validate interval
        if (!config.interval || config.interval < 1) {
            errors.interval = 'Interval must be at least 1';
        }

        if (config.frequency === 'YEARLY') {
            // Common validation for both modes
            if (!config.byMonth || config.byMonth[0] < 1 || config.byMonth[0] > 12) {
                errors.byMonth = 'Month must be between 1 and 12';
            }

            // Specific date mode validation
            if (config.byMonthDay) {
                if (!config.byMonthDay[0] || config.byMonthDay[0] < 1 || config.byMonthDay[0] > 31) {
                    errors.byMonthDay = 'Day must be between 1 and 31';
                }
                // Check days in month
                if (config.byMonth && config.byMonthDay) {
                    const daysInMonth = new Date(2000, config.byMonth[0], 0).getDate();
                    if (config.byMonthDay[0] > daysInMonth) {
                        errors.byMonthDay = `Selected month only has ${daysInMonth} days`;
                    }
                }
            }
            // Pattern mode validation
            else if (config.byDay) {
                if (!config.byDay.length) {
                    errors.byDay = 'Please select a day of the week';
                }
                if (config.bySetPos === undefined || config.bySetPos < -1 || config.bySetPos > 4) {
                    errors.bySetPos = 'Please select a valid position (1st-4th or last)';
                }
            }
            // Must choose either specific date or pattern
            else {
                errors.byMonthDay = 'Please select either a specific date or pattern';
            }
        }

        return errors;
    };

    const updateRuleConfig = (newConfig: RuleConfig) => {
        setRuleConfig(newConfig);
        const newErrors = validateRuleConfig(newConfig);
        setErrors(newErrors);
        setIsValid(Object.keys(newErrors).length === 0);
    };

    const handleSave = () => {
        const rrule = generateRRule(ruleConfig);
        const description = getDetailedDescription(rrule);
        onSave(rrule, description);
        onHide();
    };

    const getPreviewText = () => {
        const previewRule = generateRRule(ruleConfig);
        return getDetailedDescription(previewRule);
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
                            onChange={(option) => updateRuleConfig({
                                ...ruleConfig,
                                frequency: option?.value || 'MONTHLY'
                            })}
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
                            onChange={(e) => updateRuleConfig({
                                ...ruleConfig,
                                interval: parseInt(e.target.value) || 1
                            })}
                            style={{
                                backgroundColor: 'var(--bs-body-bg)',
                                color: 'var(--bs-body-color)',
                                borderColor: 'var(--bs-border-color)'
                            }}
                        />
                    </Form.Group>

                    {renderFrequencyOptions()}

                </Form>
                <Alert
                    variant={isValid ? 'success' : 'danger'}
                    className="mt-3 shadow-sm"
                >
                    <FontAwesomeIcon
                        icon={isValid ? faCheck : faExclamationTriangle}
                        className="me-2"
                    />
                    {isValid ? (
                        getPreviewText()
                    ) : (
                        <div>
                            <strong>Please correct the following errors:</strong>
                            <ul className="mb-0 mt-1">
                                {Object.entries(errors).map(([key, error]) => (
                                    <li key={key}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Alert>
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!isValid}
                    >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default RecurrenceModal;