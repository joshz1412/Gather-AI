import React, { useState } from 'react';
import { 
  History, 
  Filter, 
  Sprout, 
  RefreshCw, 
  Building2, 
  Truck, 
  FileText, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { ActivityLog } from '../../types';
import { Badge } from '../common/Badge';

interface ActivityViewProps {
  activityLogs: ActivityLog[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ activityLogs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredLogs = activityLogs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const getCategoryIcon = (category: ActivityLog['category']) => {
    switch (category) {
      case 'harvest':
        return Sprout;
      case 'waste':
        return RefreshCw;
      case 'match':
        return Building2;
      case 'request':
        return FileText;
      case 'collection':
        return ShieldCheck;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8DF]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Traceable Audit History</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#183E2E]">
              Operational Activity Log
            </h2>
            <p className="text-sm text-[#68766D] mt-1">
              Complete chronological audit trail of crop updates, surplus registrations, partner matches, and verified collections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#68766D]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-medium text-[#183E2E]"
            >
              <option value="all">All Events ({activityLogs.length})</option>
              <option value="harvest">Harvest Events</option>
              <option value="waste">Waste Registrations</option>
              <option value="match">Partner Matches</option>
              <option value="request">Request Actions</option>
              <option value="collection">Collections</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
        <div className="relative border-l-2 border-[#E2E8DF] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {filteredLogs.map((log) => {
            const Icon = getCategoryIcon(log.category);

            return (
              <div key={log.id} className="relative group">
                {/* Node icon marker */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-[#EAF1E7] border-2 border-white text-[#245C43] flex items-center justify-center shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="bg-[#FAFAF7] hover:bg-white border border-[#E2E8DF] rounded-2xl p-4 sm:p-5 transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                      {log.title}
                    </h4>
                    <span className="text-[11px] text-[#68766D] font-medium shrink-0">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#68766D] leading-relaxed mb-3">
                    {log.description}
                  </p>

                  {log.statusBadge && (
                    <div className="flex items-center gap-2">
                      <Badge status={log.statusBadge} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
