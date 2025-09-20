import { Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Card = ({ title, description, category, imageUrl, votes, date, isAdmin, id, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition duration-300 hover:shadow-xl">
      <div className="h-40 w-full p-1.5 overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover rounded" 
        />
        {isAdmin && (
            <div className="absolute top-2 right-2 flex space-x-2">
                <Link 
                    to={`/edit-policy/${id}`} 
                    className="p-1 bg-white/90 text-primary rounded-full hover:bg-gray-200 transition-colors shadow-md"
                    aria-label="Edit Policy"
                >
                    <Edit size={18} />
                </Link>
                <button 
                    onClick={() => onDelete(id)}
                    className="p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
                    aria-label="Delete Policy"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block border border-primary bg-primary/80 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-xs text-gray-500">
            Voting berakhir {date}
          </span>
        </div>
        <h3 className="text-md font-bold text-gray-800 mb-2 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {description}
        </p>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Users size={16} className="text-secondary mr-1" />
            <span className="font-medium">{votes}</span>
            <span className="ml-1 text-xs">sudah berpartisipasi</span>
          </div>
          <Link 
            to={`/vote/${id}`} 
            className="text-xs font-medium px-4 py-2 bg-primary text-white rounded-full hover:bg-red-800 transition-colors"
          >
            Lihat Detail & Vote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;