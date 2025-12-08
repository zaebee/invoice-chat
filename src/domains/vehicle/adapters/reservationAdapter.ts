// src/domains/vehicle/adapters/reservationAdapter.ts

import { IBooking, IClient, IResource, GenericStatus } from '../../../core/models';
import { LeaseStatus } from '../../../types';

// --- HELPER INTERFACES ---
// These interfaces describe the shape of the raw API data we expect.
interface ApiOwnerProfile {
    id: string;
    username: string;
    name: string;
    address: string;
    rent_service_name?: string;
    bio?: string;
}

const AVATAR_BASE_URL = 'https://stage.ownima.com';

// --- HELPER FUNCTIONS (moved from ownimaApi.ts) ---

const humanizeSource = (source: string | null | undefined): string => {
    if (!source) return '';
    const map: Record<string, string> = {
        'SOURCE_ONLINE_RIDER_APP': 'Rider App',
        'SOURCE_ONLINE_BOOKING_WEB': 'Website',
        'SOURCE_OFFLINE_WALK_IN': 'Walk-in'
    };
    if (map[source]) return map[source];
    return source.replace(/^SOURCE_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const mapApiStatusToLeaseStatus = (rawStatus: string | undefined): LeaseStatus => {
    if (!rawStatus) return 'pending';
    const s = rawStatus.toUpperCase();
    if (s.includes('COLLECTED')) return 'collected';
    if (s.includes('COMPLETED')) return 'completed';
    if (s.includes('CONFIRMED')) return 'confirmed';
    if (s.includes('OVERDUE')) return 'overdue';
    if (s.includes('CANCELLED')) return 'cancelled';
    if (s.includes('MAINTENANCE')) return 'maintenance';
    if (s.includes('CONFLICT')) return 'conflict';
    if (s.includes('NO_RESPONSE')) return 'no_response';
    if (s.includes('CONFIRMATION')) {
        if (s.includes('RIDER')) return 'confirmation_rider';
        if (s.includes('OWNER')) return 'confirmation_owner';
        return 'pending';
    }
    if (s.includes('PENDING')) return 'pending';
    return 'pending';
};

export const mapLeaseStatusToGenericStatus = (status?: LeaseStatus): GenericStatus => {
    switch (status) {
        case 'pending':
        case 'confirmation_rider':
        case 'confirmation_owner':
        case 'no_response':
            return 'PENDING';
        case 'confirmed':
            return 'CONFIRMED';
        case 'collected':
        case 'maintenance':
        case 'overdue':
            return 'ACTIVE';
        case 'completed':
            return 'COMPLETED';
        case 'cancelled':
        case 'rejected':
        case 'conflict':
            return 'CANCELLED';
        default:
            return 'PENDING';
    }
};

const combineDateTime = (dateIso: string | undefined, timeStr: string | undefined): string | undefined => {
    if (!dateIso) return undefined;
    if (!timeStr) return dateIso;
    if (timeStr.includes('T')) return timeStr;
    const datePart = dateIso.split('T')[0];
    if (timeStr.includes(':')) {
        return `${datePart}T${timeStr}`;
    }
    return dateIso;
};

// --- PRIMARY ADAPTER FUNCTION ---

/**
 * Maps the raw API JSON response directly to the frontend's unified IBooking model.
 * This is the core of the Anti-Corruption Layer for the vehicle domain.
 * @param apiJson - The raw JSON object from the `/reservation/{id}` endpoint.
 * @param ownerProfile - The optional owner profile data.
 * @returns A domain-agnostic IBooking object.
 */
export const mapApiResponseToBooking = (apiJson: any, ownerProfile?: ApiOwnerProfile | null): IBooking => {
    const r = apiJson.reservation;
    if (!r) throw new Error("Invalid API response: 'reservation' object is missing.");

    const v = r.vehicle || {};
    const i = r.invoice || {};
    const p = r.pick_up || {};
    const d = r.drop_off || {};
    const rider = r.rider || {};
    const info = v.general_info || {};
    const specs = v.specification_info || {};

    // --- Map to IResource ---
    const vehicleImageUrl = v.picture?.cover_previews?.s || v.picture?.cover ?
        `${AVATAR_BASE_URL}${v.picture.cover_previews.s || v.picture.cover}` : undefined;

    const resource: IResource = {
        id: info.reg_number || r.id, // Use plate number as resource ID, fallback to reservation ID
        type: 'vehicle',
        name: `${info.brand || ''} ${info.model || ''}, ${info.year || ''}`.trim(),
        ownerId: r.owner_id,
        metadata: {
            details: [info.body_type, specs.transmission, info.color].filter(Boolean).join(' • '),
            plate: info.reg_number || '',
            imageUrl: vehicleImageUrl,
            // Vehicle-specific raw data can be stored here if needed later
        },
    };

    // --- Map to IClient ---
    const avatarUrl = rider.avatar ? `${AVATAR_BASE_URL}${rider.avatar}` : undefined;
    const client: IClient = {
        id: rider.id || [rider.name, rider.phone].join('-'), // Create a stable ID if none provided
        name: rider.name || 'Unknown Renter',
        contact: {
            phone: rider.phone,
            email: rider.email,
        },
        metadata: {
          avatarUrl: avatarUrl
        }
    };

    // --- Map to IBooking ---
    const reservationId = (r.humanized?.owner_id && r.humanized?.id) ?
        `${r.humanized.owner_id}-${r.humanized.id}` : r.id;

    const leaseStatus = mapApiStatusToLeaseStatus(r.humanized?.status || r.status);
    const genericStatus = mapLeaseStatusToGenericStatus(leaseStatus);

    const fromDate = new Date(combineDateTime(r.date_from, p.collect_time?.start) || Date.now());
    const toDate = new Date(combineDateTime(r.date_to, d.return_time?.end) || Date.now());

    // Time Formatting with Highlighting
    const formatTime = (timeObj: any, early: boolean, late: boolean) => {
        if (!timeObj || !timeObj.start || !timeObj.end) return '';
        let t = `${timeObj.start} - ${timeObj.end}`;
        if (early) t += ' (Early)';
        if (late) t += ' (Late)';
        return t;
    };


    return {
        id: reservationId,
        resource,
        client,
        status: genericStatus,
        dateFrom: fromDate,
        dateTo: toDate,
        totalPrice: i.total_price || r.total_price || 0,
        currency: r.currency || 'THB',
        originalData: r, // Store the original reservation object for reference
        metadata: {
            // Store domain-specific details that don't fit the core model
            source: humanizeSource(r.humanized?.source),
            deadline: r.deadline_timestamp ? r.deadline_timestamp * 1000 : undefined,
            pickupFee: (p.asked_early_pickup || p.asked_late_pickup) ? (p.extra_price || 0) : 0,
            dropoffFee: (d.asked_early_return || d.asked_late_return) ? (d.extra_price || 0) : 0,
            pickupTime: formatTime(p.collect_time, p.asked_early_pickup, p.asked_late_pickup),
            dropoffTime: formatTime(d.return_time, d.asked_early_return, d.asked_late_return),
            owner: {
                name: ownerProfile?.rent_service_name || ownerProfile?.name || 'Your Surname',
                contact: ownerProfile?.username || '+000000000',
                address: ownerProfile?.address || 'Address line'
            }
        }
    };
};
