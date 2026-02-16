import type { Room } from '../types';
import { Icon } from './Icon';

interface RoomDetailProps {
  room: Room;
  onBack: () => void;
}

export const RoomDetail = ({ room, onBack }: RoomDetailProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Icon name="arrowLeft" className="w-5 h-5" />
            Back to Rooms
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room {room.number}</h1>
            <span className="text-sm text-gray-500">{room.name} • {room.area} SF</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 bg-gradient-to-b from-primary-600 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
            Generate RFI
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Finishes Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">🔨 Finishes</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(room.finishes).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      {key}
                    </span>
                    <span className="block text-base font-medium text-gray-900">
                      {value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Doors Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">🚪 Doors ({room.doors.length})</h3>
              <div className="space-y-3">
                {room.doors.map((door) => (
                  <div 
                    key={door.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      door.hardware 
                        ? 'bg-gray-50 border-transparent' 
                        : 'bg-error-50 border-error-200'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <strong className="text-base font-semibold text-gray-900">
                        {door.number}
                      </strong>
                      <span className="text-sm text-gray-500">
                        {door.size} • {door.type}
                      </span>
                    </div>
                    <div>
                      {door.hardware ? (
                        <span className="inline-flex items-center px-3 py-1.5 bg-success-50 text-success-600 text-sm font-semibold rounded-lg">
                          {door.hardware}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 bg-error-100 text-error-600 text-sm font-semibold rounded-lg">
                          <Icon name="alert" className="w-4 h-4 mr-1.5" />
                          No Hardware
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-b from-primary-600 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                  Generate RFI →
                </button>
                <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Add to Takeoff →
                </button>
                <button className="w-full px-4 py-3 bg-transparent text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                  Export Room Data →
                </button>
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Room Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Room Number</span>
                  <span className="font-medium text-gray-900">{room.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Area</span>
                  <span className="font-medium text-gray-900">{room.area} SF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Doors</span>
                  <span className="font-medium text-gray-900">{room.doors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issues</span>
                  <span className={`font-medium ${room.issues > 0 ? 'text-error-600' : 'text-success-600'}`}>
                    {room.issues > 0 ? `${room.issues} found` : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoomDetail;
