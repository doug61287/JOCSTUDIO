interface StatCardProps {
  value: string | number;
  label: string;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'critical';
  icon?: string;
}

export const StatCard = ({ value, label, trend, variant = 'default', icon }: StatCardProps) => {
  const getTopBarGradient = () => {
    switch (variant) {
      case 'success':
        return 'from-success-500 to-success-600';
      case 'warning':
        return 'from-warning-500 to-warning-600';
      case 'critical':
        return 'from-error-500 to-error-600';
      default:
        return 'from-primary-500 to-primary-600';
    }
  };

  const getTrendClasses = () => {
    if (!trend) return '';
    if (trend.includes('✓') || trend.includes('analyzed')) return 'text-success-600';
    if (trend.includes('↑') || trend.includes('critical')) return 'text-error-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-card relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTopBarGradient()}`} />
      
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      
      <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
        {value}
      </div>
      
      {trend && (
        <div className={`text-sm font-medium flex items-center gap-1 ${getTrendClasses()}`}>
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatCard;
