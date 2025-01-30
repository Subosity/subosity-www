import { RRule } from 'rrule';

export interface RuleConfig {
    frequency: string;
    interval: number;
    byDay?: string[];      // MO,TU,WE etc
    byMonthDay?: number[]; // 1,15,-1 etc
    byMonth?: number[];    // 1-12
    bySetPos?: number;     // 1,-1 etc for first, last
}

export const WEEKDAYS = [
    { value: 'MO', label: 'Monday' },
    { value: 'TU', label: 'Tuesday' },
    { value: 'WE', label: 'Wednesday' },
    { value: 'TH', label: 'Thursday' },
    { value: 'FR', label: 'Friday' },
    { value: 'SA', label: 'Saturday' },
    { value: 'SU', label: 'Sunday' }
];

const getPositionText = (pos: number): string => {
    if (pos === -1) return 'last';
    return ['first', 'second', 'third', 'fourth'][pos - 1] || `${pos}th`;
};

const getMonthName = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

const getDayWithSuffix = (day: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

const getWeekdayName = (day: string): string => {
    return WEEKDAYS.find(d => d.value === day)?.label || day;
};

export const parseRRule = (rule?: string): RuleConfig => {
    if (!rule) {
        return {
            frequency: 'MONTHLY',
            interval: 1,
            byMonthDay: [1]
        };
    }

    try {
        const rrule = RRule.fromString(rule);
        const config: RuleConfig = {
            frequency: rrule.options.freq === RRule.YEARLY ? 'YEARLY' :
                rrule.options.freq === RRule.MONTHLY ? 'MONTHLY' :
                    rrule.options.freq === RRule.WEEKLY ? 'WEEKLY' : 'DAILY',
            interval: rrule.options.interval || 1,
            byMonth: rrule.options.bymonth
        };

        // Determine if this is a pattern-based or specific date rule
        if (rrule.options.bysetpos !== undefined && rrule.options.byweekday) {
            // Pattern mode (e.g., "first Monday")
            config.bySetPos = rrule.options.bysetpos;
            // Convert weekday numbers to strings
            const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
            config.byDay = rrule.options.byweekday.map(day => weekdayMap[day]);
            config.byMonthDay = undefined;
        } else if (rrule.options.bymonthday) {
            // Specific date mode
            config.byMonthDay = rrule.options.bymonthday;
            config.byDay = undefined;
            config.bySetPos = undefined;
        } else if (rrule.options.byweekday) {
            // Weekly mode with multiple weekdays
            const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
            config.byDay = rrule.options.byweekday.map(day => weekdayMap[day]);
        }

        return config;
    } catch (error) {
        console.error('Error parsing RRULE:', error);
        return {
            frequency: 'MONTHLY',
            interval: 1,
            byMonthDay: [1]
        };
    }
};

export const generateRRule = (config: RuleConfig): string => {
    const options: Partial<RRule.Options> = {
        freq: RRule[config.frequency],
        interval: config.interval,
    };

    if (config.frequency !== 'WEEKLY' && config.byMonth?.length) {
        options.bymonth = config.byMonth;
    }

    if (config.byDay?.length) {
        options.byweekday = config.byDay.map(day => RRule[day.toUpperCase()]);
    }

    if (config.frequency !== 'WEEKLY' && config.byMonthDay?.length) {
        options.bymonthday = config.byMonthDay;
    }

    if (config.frequency !== 'WEEKLY' && config.bySetPos !== undefined) {
        options.bysetpos = config.bySetPos;
    }

    const rule = new RRule(options);
    return rule.toString();
};

export const getNextOccurrence = (rule: string): Date | null => {
    if (!rule) return null;
    try {
        const rrule = RRule.fromString(rule);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const nextOccurrence = rrule.after(now, true);
        if (nextOccurrence) {
            const adjustedDate = new Date(nextOccurrence);
            adjustedDate.setDate(adjustedDate.getDate() + 1);
            return adjustedDate;
        }
        return null;
    } catch (error) {
        console.error('Error parsing RRULE:', error);
        return null;
    }
};

export const getUiFriendlyText = (rule: string): string => {
    if (!rule) return '';

    try {
        const ruleConfig = RRule.fromString(rule);
        const parts: string[] = [];
        const interval = ruleConfig.options.interval || 1;

        switch (ruleConfig.options.freq) {
            case RRule.YEARLY:
                parts.push(`Every ${interval > 1 ? `${interval} years` : 'year'}`);

                // By Pattern
                if (ruleConfig.options.bysetpos?.[0] && ruleConfig.options.byweekday) {
                    const position = ruleConfig.options.bysetpos[0] === -1 ? 'last' :
                        ['first', 'second', 'third', 'fourth'][ruleConfig.options.bysetpos[0] - 1] ||
                        `${ruleConfig.options.bysetpos[0]}th`;

                    // Convert weekday number to string representation
                    const weekdayNum = ruleConfig.options.byweekday[0];
                    const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
                    const weekday = WEEKDAYS.find(d => d.value === weekdayMap[weekdayNum])?.label;

                    const month = getMonthName(ruleConfig.options.bymonth?.[0] || 1);
                    parts.push(`on the ${position} ${weekday} in ${month}`);
                }
                // By Specific Date
                else if (ruleConfig.options.bymonthday?.length && ruleConfig.options.bymonth?.length) {
                    const month = getMonthName(ruleConfig.options.bymonth[0]);
                    const day = getDayWithSuffix(ruleConfig.options.bymonthday[0]);
                    parts.push(`on ${month} ${day}`);
                }
                break;

            case RRule.MONTHLY:
                parts.push(`Every ${interval > 1 ? `${interval} months` : 'month'}`);

                // By Pattern
                if (ruleConfig.options.bysetpos?.[0] && ruleConfig.options.byweekday) {
                    const position = ruleConfig.options.bysetpos[0] === -1 ? 'last' :
                        ['first', 'second', 'third', 'fourth'][ruleConfig.options.bysetpos[0] - 1] ||
                        `${ruleConfig.options.bysetpos[0]}th`;

                    // Convert weekday number to string representation
                    const weekdayNum = ruleConfig.options.byweekday[0];
                    const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
                    const weekday = WEEKDAYS.find(d => d.value === weekdayMap[weekdayNum])?.label;

                    parts.push(`on the ${position} ${weekday}`);
                }
                // By Specific Date
                else if (ruleConfig.options.bymonthday?.length && ruleConfig.options.bymonth?.length) {
                    const day = getDayWithSuffix(ruleConfig.options.bymonthday[0]);
                    parts.push(`on the ${day}`);
                }
                break;

            case RRule.WEEKLY:
                parts.push(`Every ${interval > 1 ? `${interval} weeks` : 'week'}`);

                if (ruleConfig.options.byweekday?.length) {
                    const weekdays = ruleConfig.options.byweekday.map(day => {
                        const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
                        return WEEKDAYS.find(d => d.value === weekdayMap[day])?.label;
                    }).filter(Boolean);

                    if (weekdays.length) {
                        parts.push(`on ${weekdays.join(', ')}`);
                    }
                }
                break;
        }

        return parts.join(' ');
    } catch (error) {
        console.error('Error generating description:', error);
        return 'Invalid recurrence rule';
    }
};

export const getDetailedDescription = (rule: string): string => {
    if (!rule) return '';

    try {
        const ruleConfig = RRule.fromString(rule);
        const parts: string[] = [];
        const interval = ruleConfig.options.interval || 1;

        switch (ruleConfig.options.freq) {
            case RRule.YEARLY:
                parts.push(`Every ${interval > 1 ? `${interval} years` : 'year'}`);

                // By Pattern
                if (ruleConfig.options.bysetpos?.[0] && ruleConfig.options.byweekday) {
                    const position = ruleConfig.options.bysetpos[0] === -1 ? 'last' :
                        ['first', 'second', 'third', 'fourth'][ruleConfig.options.bysetpos[0] - 1] ||
                        `${ruleConfig.options.bysetpos[0]}th`;

                    // Convert weekday number to string representation
                    const weekdayNum = ruleConfig.options.byweekday[0];
                    const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
                    const weekday = WEEKDAYS.find(d => d.value === weekdayMap[weekdayNum])?.label;

                    const month = getMonthName(ruleConfig.options.bymonth?.[0] || 1);
                    parts.push(`on the ${position} ${weekday} in ${month}`);
                }
                // By Specific Date
                else if (ruleConfig.options.bymonthday?.length && ruleConfig.options.bymonth?.length) {
                    const month = getMonthName(ruleConfig.options.bymonth[0]);
                    const day = getDayWithSuffix(ruleConfig.options.bymonthday[0]);
                    parts.push(`on ${month} ${day}`);
                }
                break;

            case RRule.MONTHLY:
                parts.push(`Every ${interval > 1 ? `${interval} months` : 'month'}`);
            
                // By Pattern
                if (ruleConfig.options.bysetpos?.[0] && ruleConfig.options.byweekday) {
                    const position = ruleConfig.options.bysetpos[0] === -1 ? 'last' :
                        ['first', 'second', 'third', 'fourth'][ruleConfig.options.bysetpos[0] - 1] ||
                        `${ruleConfig.options.bysetpos[0]}th`;
            
                    // Convert weekday number to string representation
                    const weekdayNum = ruleConfig.options.byweekday[0];
                    const weekdayMap = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
                    const weekday = WEEKDAYS.find(d => d.value === weekdayMap[weekdayNum])?.label;
            
                    parts.push(`on the ${position} ${weekday}`);
                }
                // By Specific Date
                else if (ruleConfig.options.bymonthday?.length) {
                    const day = getDayWithSuffix(ruleConfig.options.bymonthday[0]);
                    parts.push(`on the ${day}`);
                }
                break;
            case RRule.WEEKLY:
                parts.push(`Every ${interval > 1 ? `${interval} weeks` : 'week'}`);

                if (ruleConfig.options.byweekday?.length) {
                    const weekdayMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const weekdays = ruleConfig.options.byweekday.map(day => weekdayMap[day]);

                    if (weekdays.length) {
                        parts.push(`on ${weekdays.join(', ')}`);
                    }
                }
                break;
        }

        return parts.join(' ');
    } catch (error) {
        console.error('Error generating description:', error);
        return 'Invalid recurrence rule';
    }
};

export const getYearlyOccurrences = (rule: string, startDate: Date, endDate: Date): number => {
  if (!rule) return 0;
  
  try {
    const rrule = RRule.fromString(rule);
    // Get all occurrences between start and end date
    const occurrences = rrule.between(startDate, endDate, true);
    return occurrences.length;
  } catch (error) {
    console.error('Error calculating occurrences:', error);
    return 0;
  }
};