import type { Room } from '../types';
import type { ViewMode } from '../types';
import { Icon } from './Icon';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  viewMode: ViewMode;
}

export const RoomCard = ({ room, onClick, viewMode }: RoomCardProps) => {
  const getThumbnailGradient = () => {
    return room.issues > 0 
      ? 'from-warning-400 to-warning-600' 
      : 'from-primary-400 to-primary-600';
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onClick}
        className={`
          flex items-center gap-4 p-4 bg-white rounded-xl border shadow-card
          transition-all duration-200 cursor-pointer
          hover:translate-x-1 hover:shadow-md
          ${room.issues > 0 ? 'border-l-4 border-l-warning-500' : 'border-gray-200'}
        `}
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {room.thumbnail}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <strong className="text-base font-semibold text-gray-900">Room {room.number}</strong>
            <span className="text-sm text-gray-500">— {room.name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{room.area} SF</span>
            <span>•</span>
            <span>{room.doors.length} doors</span>
            <span>•</span>
            <span>{Object.values(room.finishes).filter(Boolean).length} finishes</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          {room.issues > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error-500 text-white text-sm font-semibold rounded-full">
              {room.issues} issues
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-50 text-success-600 text-sm font-semibold rounded-full">
              <Icon name="check" className="w-4 h-4" />
              Verified
            </span>
          )}
          <Icon name="chevronRight" className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl overflow-hidden border shadow-card cursor-pointer
        transition-all duration-300 ease-smooth
        hover:-translate-y-1 hover:shadow-card-hover
        ${room.issues > 0 ? 'border-warning-300 hover:border-warning-400' : 'border-gray-200 hover:border-primary-300'}
      `}
    >
      {/* Thumbnail */}
      <div className={`h-[120px] bg-gradient-to-br ${getThumbnailGradient()} flex items-center justify-center text-5xl relative`}>
        {room.thumbnail}
        {room.issues > 0 && (
          <div className="absolute top-4 right-4 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
            {room.issues}
          </div>
        )}
      </div>
      
      {/* Body */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Room {room.number}</h3>
            <p className="text-sm text-gray-500">{room.name}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-6 mb-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-bold text-gray-900">{room.area}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">SF</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-bold text-gray-900">{room.doors.length}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Doors</span>
          </div>
        </div>
        
        {/* Finishes */}
        <div className="flex flex-wrap gap-2">
          {room.finishes.floor && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
              {room.finishes.floor}
            </span>
          )}
          {room.finishes.walls && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
              {room.finishes.walls}
            </span>
          )}
          {room.finishes.ceiling && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
              {room.finishes.ceiling}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
