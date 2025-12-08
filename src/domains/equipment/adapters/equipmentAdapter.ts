
import { IBooking, IResource, IClient, GenericStatus } from '../../core/models';

// Mock raw data structure for an "Equipment" API response
interface ApiEquipmentLease {
    leaseId: string;
    equipmentItem: {
        serialNumber: string;
        model: string;
        category: string;
        hourlyRate: number;
    };
    customer: {
        id: string;
        fullName: string;
        phone: string;
    };
    hoursBooked: number;
    totalCharge: number;
    startDate: string; // ISO String
    endDate: string; // ISO String
    status: 'REQUESTED' | 'RENTED' | 'RETURNED' | 'CANCELLED';
}

/**
 * Maps the mock API response for an equipment lease to the unified IBooking model.
 * @param lease - The mock ApiEquipmentLease object.
 * @returns A domain-agnostic IBooking object.
 */
export const mapEquipmentLeaseToBooking = (lease: ApiEquipmentLease): IBooking => {
    const resource: IResource = {
        id: lease.equipmentItem.serialNumber,
        type: 'equipment',
        name: lease.equipmentItem.model,
        ownerId: 'equipment-depot-1',
        metadata: {
            category: lease.equipmentItem.category,
            hourlyRate: lease.equipmentItem.hourlyRate,
        },
    };

    const client: IClient = {
        id: lease.customer.id,
        name: lease.customer.fullName,
        contact: { phone: lease.customer.phone },
    };

    const statusMap: Record<ApiEquipmentLease['status'], GenericStatus> = {
        REQUESTED: 'PENDING',
        RENTED: 'ACTIVE',
        RETURNED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
    };

    return {
        id: lease.leaseId,
        resource,
        client,
        status: statusMap[lease.status],
        dateFrom: new Date(lease.startDate),
        dateTo: new Date(lease.endDate),
        totalPrice: lease.totalCharge,
        currency: 'USD',
        originalData: lease,
    };
};
