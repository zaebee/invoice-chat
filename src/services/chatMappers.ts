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
    
    // System messages detection
    if (ntfy.title === 'System' || ntfy.tags?.includes('system')) senderId = 'system';

    let type: MessageType = 'text';
    let statusMetadata: LeaseStatus | undefined = undefined;
    let attachmentUrl: string | undefined = undefined;

    if (ntfy.tags?.includes('system')) {
        type = 'system';
        const statusTag = ntfy.tags?.find(t => t.startsWith('status:'));
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
        text: ntfy.message, // Ntfy usually uses filename as message for uploads if not specified
        timestamp,
        type,
        status: initialStatus,
        attachmentUrl,
        priority: ntfy.priority,
        tags: ntfy.tags,
        clickUrl: ntfy.click,
        actions: ntfy.actions,
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