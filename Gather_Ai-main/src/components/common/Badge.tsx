import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Truck, 
  Send, 
  ShieldCheck, 
  Sprout, 
  XCircle 
} from 'lucide-react';
import { WasteStatus, CropStageName } from '../../types';

interface BadgeProps {
  status: WasteStatus | CropStageName | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  let bg = 'bg-[#EAF1E7] text-[#183E2E] border-[#E2E8DF]';
  let Icon = Clock;

  switch (status) {
    // Waste & Request Statuses
    case 'Draft':
      bg = 'bg-[#F8F8F2] text-[#68766D] border-[#E2E8DF]';
      Icon = FileText;
      break;
    case 'Registered':
      bg = 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/30';
      Icon = FileText;
      break;
    case 'Matching Available':
      bg = 'bg-[#D7E8A3]/40 text-[#183E2E] border-[#85B96F]/50';
      Icon = CheckCircle2;
      break;
    case 'Request Prepared':
      bg = 'bg-[#D7E8A3] text-[#183E2E] border-[#85B96F]';
      Icon = FileText;
      break;
    case 'Request Sent':
    case 'Awaiting Response':
      bg = 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      Icon = Send;
      break;
    case 'Accepted':
      bg = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
      Icon = CheckCircle2;
      break;
    case 'Collection Scheduled':
      bg = 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      Icon = Truck;
      break;
    case 'Collection Confirmed':
      bg = 'bg-[#2F8059] text-white border-[#2F8059]';
      Icon = ShieldCheck;
      break;
    case 'Recovery Reported':
      bg = 'bg-[#183E2E] text-[#D7E8A3] border-[#183E2E]';
      Icon = CheckCircle2;
      break;
    case 'Declined':
    case 'Cancelled':
      bg = 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
      Icon = XCircle;
      break;

    // Crop Stages
    case 'Germination & Seedling':
      bg = 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/40';
      Icon = Sprout;
      break;
    case 'Vegetative Growth':
      bg = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
      Icon = Sprout;
      break;
    case 'Flowering & Fruit Set':
      bg = 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]';
      Icon = Sprout;
      break;
    case 'Ripening & Maturation':
      bg = 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]';
      Icon = Clock;
      break;
    case 'Harvest Window Active':
      bg = 'bg-[#245C43] text-white border-[#245C43] animate-pulse';
      Icon = AlertTriangle;
      break;
    case 'Post-Harvest / Surplus Phase':
      bg = 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]';
      Icon = AlertTriangle;
      break;

    // Priority / Attention
    case 'High':
    case 'Immediate':
    case 'Attention Needed':
      bg = 'bg-[#FEE2E2] text-[#B94C3D] border-[#FCA5A5]';
      Icon = AlertTriangle;
      break;
    case 'Routine handling':
      bg = 'bg-[#EAF1E7] text-[#2F8059] border-[#85B96F]/30';
      Icon = CheckCircle2;
      break;
    case 'Monitor closely':
      bg = 'bg-[#FEF3C7] text-[#D99A36] border-[#FDE68A]';
      Icon = AlertTriangle;
      break;
    case 'Prioritise assessment or sale':
      bg = 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]';
      Icon = AlertTriangle;
      break;

    default:
      bg = 'bg-[#EAF1E7] text-[#1D2922] border-[#E2E8DF]';
      Icon = Clock;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs whitespace-nowrap ${bg} ${sizeClasses} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
};
