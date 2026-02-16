import type { Insight } from '../types';
import { Icon } from './Icon';

interface InsightCardProps {
  insight: Insight;
  onAction: () => void;
}

export const InsightCard = ({ insight, onAction }: InsightCardProps) => {
  const getSeverityConfig = () => {
    switch (insight.severity) {
      case 'critical':
        return {
          icon: '🔴',
          borderColor: 'border-l-error-500',
          bgGradient: 'from-error-50',
        };
      case 'warning':
        return {
          icon: '🟡',
          borderColor: 'border-l-warning-500',
          bgGradient: 'from-warning-50',
        };
      case 'success':
        return {
          icon: '🟢',
          borderColor: 'border-l-success-500',
          bgGradient: 'from-success-50',
        };
      case 'info':
      default:
        return {
          icon: '🔵',
          borderColor: 'border-l-info-500',
          bgGradient: 'from-info-50',
        };
    }
  };

  const config = getSeverityConfig();

  return (
    <div 
      className={`
        bg-white rounded-xl p-5 border shadow-xs
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        border-l-4 ${config.borderColor}
        bg-gradient-to-r ${config.bgGradient} to-white
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{config.icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {insight.category}
        </span>
      </div>
      
      {/* Title */}
      <h4 className="text-base font-semibold text-gray-900 mb-2">
        {insight.title}
      </h4>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
        {insight.description}
      </p>
      
      {/* Room numbers */}
      {insight.roomNumbers && (
        <div className="text-xs text-gray-500 font-medium mb-4">
          Rooms: {insight.roomNumbers.join(', ')}
        </div>
      )}
      
      {/* Action Button */}
      <button
        onClick={onAction}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg text-sm font-semibold text-primary-600 transition-all duration-200"
      >
        {insight.action}
        <Icon name="chevronRight" className="w-4 h-4" />
      </button>
    </div>
  );
};

export default InsightCard;
