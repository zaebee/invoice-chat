
import React from 'react';
import { IBooking } from '../../../core/models';

// This is a placeholder component to demonstrate dynamic rendering.
interface EquipmentPreviewProps {
    data: any;
    lang: string;
}

const EquipmentPreview: React.FC<EquipmentPreviewProps> = ({ data, lang }) => {
    return (
        <div className="p-8 bg-white shadow-lg A4-aspect-ratio">
            <h1 className="text-3xl font-bold border-b pb-4 mb-4 text-gray-800">Equipment Rental Preview</h1>
            <div className="border-2 border-dashed border-green-300 rounded-lg bg-green-50 p-4">
                 <p className="text-sm text-green-600">
                    This is the placeholder preview for the 'equipment' domain.
                </p>
                <div className="mt-4 space-y-2 text-xs bg-white p-2 rounded">
                    <p><strong>Model:</strong> {data.equipmentItem?.model}</p>
                    <p><strong>Total Charge:</strong> {data.totalCharge} USD</p>
                </div>
            </div>
        </div>
    );
};

export default EquipmentPreview;
