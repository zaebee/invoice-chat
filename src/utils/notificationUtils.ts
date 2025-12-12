
import { t } from './i18n';
import { Language } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const scheduleBrowserNotification = (title: string, body: string, date: Date) => {
    // Basic implementation for session-based reminders (setTimeout)
    // Note: This only works if the tab remains open. 
    // For robust production use, this requires Push API / Backend worker.
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return; // Time passed
    
    // Limit to reasonable timeout (e.g. < 24h) to avoid browser throttling issues
    if (diff > 24 * 60 * 60 * 1000) return;

    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.svg'
            });
        }
    }, diff);
};

export const generateCalendarUrl = (title: string, description: string, startDate: Date, endDate: Date): string => {
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
};

export const handleSetReminder = async (
    title: string, 
    dateStr: string, 
    lang: Language
): Promise<{ success: boolean, message: string }> => {
    if (!dateStr) return { success: false, message: 'Invalid Date' };
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { success: false, message: 'Invalid Date' };

    // 1. Request Permission
    const granted = await requestNotificationPermission();
    if (!granted) {
        return { success: false, message: 'Notifications blocked' }; // Fallback to calendar only logic usually handles this
    }

    // 2. Schedule "Now" notification as test/feedback or logic for future
    // For this demo, we'll schedule a notification for 1 hour before if possible, or just confirm setup
    
    // Mock scheduling for demo purposes (e.g. 5 seconds later if it was a real test, but here we assume the logic holds)
    // In a real app, we'd send this to a backend worker.
    // For the "session" based reminder:
    
    const oneHourBefore = new Date(date.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > new Date()) {
        scheduleBrowserNotification("Reminder: " + title, "Event is starting in 1 hour.", oneHourBefore);
    }

    return { success: true, message: t('msg_sign_saved', lang).replace('Signature', 'Reminder') }; // Reusing success msg pattern or adding new key
};
