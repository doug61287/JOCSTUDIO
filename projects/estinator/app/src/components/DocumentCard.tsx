import type { Document } from '../types';
import { Icon } from './Icon';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  return (
    <div 
      className={`
        flex items-center gap-4 p-4 bg-white rounded-xl border shadow-xs
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${document.issues ? 'border-l-4 border-l-warning-500' : 'border-gray-200'}
      `}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {document.thumbnail}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
          {document.name}
        </h4>
        <p className="text-xs text-gray-500">
          {document.size} • Analyzed
        </p>
      </div>
      
      {/* Status */}
      <div className="flex items-center">
        {document.issues ? (
          <span className="inline-flex items-center px-2.5 py-1 bg-error-500 text-white text-xs font-semibold rounded-full">
            {document.issues}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success-50 text-success-600 text-xs font-semibold rounded-full">
            <Icon name="check" className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
