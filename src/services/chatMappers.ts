import { ChatMessage, NtfyMessage, MessageType, LeaseStatus } from '../types';
import { HistoryEvent } from './ownimaApi';
import { authService } from './authService';

export const ntfyToChatMessage = (ntfy: NtfyMessage, initialStatus: 'read' | 'sent' = 'read'): ChatMessage => {
    let senderId = 'other';
    const currentUser = authService.getUsername();

    // Strict Auth Matching
    if (currentUser && ntfy.title === currentUser) {
        senderId = 'me';
    } 
    // Fallback Legacy Matching
    else if (ntfy.title === 'Me') {
        senderId = 'me';
    }
    
    // Initial extraction with fallback
    let text = ntfy.message;
    let tags = ntfy.tags || [];
    let actions = ntfy.actions || [];
    let priority = ntfy.priority;

    // FIX: Check if the message body is actually a JSON string (Tunnelled Payload)
    // This handles cases where Ntfy server treats the JSON body as raw text
    if (typeof text === 'string' && (text.startsWith('{') || text.startsWith('['))) {
        try {
            const parsed = JSON.parse(text);
            // Check for our expected structure
            if (parsed && typeof parsed === 'object' && parsed.message) {
                text = parsed.message;
                if (parsed.tags && Array.isArray(parsed.tags)) tags = parsed.tags;
                if (parsed.actions && Array.isArray(parsed.actions)) actions = parsed.actions;
                if (parsed.priority !== undefined) priority = parsed.priority;
            }
        } catch (e) {
            // Not a JSON object, treat as normal text
        }
    }
    
    // System messages detection
    if (ntfy.title === 'System' || tags.includes('system')) senderId = 'system';

    let type: MessageType = 'text';
    let statusMetadata: LeaseStatus | undefined = undefined;
    let attachmentUrl: string | undefined = undefined;

    if (tags.includes('system')) {
        type = 'system';
        const statusTag = tags.find(t => t.startsWith('status:'));
        if (statusTag) {
            statusMetadata = statusTag.split(':')[1] as LeaseStatus;
        }
    }

    // Check for attachment
    if (ntfy.attachment) {
        type = 'image';
        // Use attachment URL directly. Usually absolute or relative to domain.
        attachmentUrl = ntfy.attachment.url;
    }
    
    // Store as raw timestamp (ms)
    const timestamp = ntfy.time * 1000;

    return {
        id: ntfy.id,
        senderId,
        text, // Use processed text
        timestamp,
        type,
        status: initialStatus,
        attachmentUrl,
        priority, // Use processed priority
        tags, // Use processed tags
        clickUrl: ntfy.click,
        actions, // Use processed actions
        metadata: {
            status: statusMetadata
        }
    };
};

export const historyToChatMessage = (event: HistoryEvent): ChatMessage => {
    // Map API confirmation event to System Message
    // Use meta.reason_hint as status key if available
    let statusKey: LeaseStatus | undefined = undefined;
    
    if (event.meta?.reason_hint) {
        // Map "reservation_pending" -> "pending"
        let hint = event.meta.reason_hint.replace('reservation_', '');
        hint = hint.replace('_by_', '_'); // Normalize "confirmation_by_rider" to "confirmation_rider"
        
        // Validate against known statuses or cast if dynamic
        statusKey = hint as LeaseStatus; 
    } else if (typeof event.status === 'string') {
        statusKey = event.status.toLowerCase().replace('status_', '') as LeaseStatus;
    }

    const timestamp = new Date(event.confirmation_date).getTime();

    // Friendly text based on status or note
    let text = event.confirmation_note || `Status changed`;
    
    // Clean up "Reason:" prefix if present
    if (text.startsWith('Reason: ')) {
        text = text.substring(8);
    }
    
    // Provide nice defaults if note is empty
    if (!event.confirmation_note && statusKey) {
        if (statusKey === 'collected') text = 'Vehicle collected by Rider';
        if (statusKey === 'completed') text = 'Lease completed successfully';
        if (statusKey === 'confirmed') text = 'Reservation confirmed';
        if (statusKey === 'pending') text = 'Reservation is pending';
        if (statusKey === 'confirmation_owner') text = 'Waiting for Owner confirmation';
        if (statusKey === 'confirmation_rider') text = 'Waiting for Rider confirmation';
    }

    return {
        id: `hist_${event.confirmation_date}_${Math.random()}`,
        senderId: 'system',
        text,
        timestamp,
        type: 'system',
        status: 'read',
        metadata: {
            status: statusKey
        }
    };
};