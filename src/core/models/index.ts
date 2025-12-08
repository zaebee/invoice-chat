// src/core/models/index.ts

/**
 * Represents the generic status of a booking, decoupled from any specific domain.
 */
export type GenericStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * Represents a generic rentable resource.
 * This can be a vehicle, a piece of equipment, a property, etc.
 */
export interface IResource {
  id: string;
  type: string; // e.g., 'vehicle', 'equipment', 'property'
  name: string;
  ownerId: string;
  metadata: Record<string, any>; // For domain-specific fields like mileage, color, etc.
}

/**
 * Represents a generic client or customer.
 */
export interface IClient {
  id: string;
  name: string;
  contact: {
    phone?: string;
    email?: string;
  };
}

/**
 * The unified, domain-agnostic booking model.
 * This is the central entity the frontend will work with.
 */
export interface IBooking {
  id: string;
  resource: IResource;
  client: IClient;
  status: GenericStatus;
  dateFrom: Date;
  dateTo: Date;
  totalPrice: number;
  currency: string;
  // This will hold the original, domain-specific data object for reference
  // and for passing back to the backend if needed.
  originalData?: any;
}
