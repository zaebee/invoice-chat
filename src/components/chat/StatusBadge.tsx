
import { LeaseStatus, Language } from '../../types';
import { t } from '../../utils/i18n';
import { STATUS_CONFIG } from './ChatUtils';

export const StatusBadge = ({ status, lang = 'en', className = "" }: { status: LeaseStatus, lang?: Language, className?: string }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${className}`}>
            {config.icon}
            <span>{t(config.labelKey, lang)}</span>
        </div>
    );
};
