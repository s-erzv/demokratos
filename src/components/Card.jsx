import { Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Card = ({ title, description, category, imageUrl, votes, date, isAdmin, id, onDelete }) => {
  return (
    // Tambahkan flex flex-col h-full agar card menyesuaikan tinggi dengan konten
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition duration-300 hover:shadow-xl flex flex-col h-full"> 
      <div className="h-40 w-full p-1.5 overflow-hidden relative flex-shrink-0">
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
      
      {/* Container utama konten kartu */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow"> 
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <span className="inline-block border border-primary bg-primary text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full mb-1 sm:mb-0">
            {category}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">
            Voting berakhir {date}
          </span>
        </div>
        
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 truncate" title={title}>
          {title}
        </h3>
        
       <p className="text-xs sm:text-sm text-gray-600 mb-4 whitespace-normal">
          {description.length > 100 
            ? description.substring(0, 70) + "..." 
            : description}
        </p>

        
        {/* Footer: Dibuat flex-shrink-0 agar selalu di bagian bawah */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 flex-shrink-0">
          
          <div className="flex items-center text-xs text-gray-500">
            <Users size={14} className="text-red-500 mr-1" />
            <span className="font-semibold">{votes}</span>
            <span className="ml-1 text-[10px] sm:text-xs">berpartisipasi</span>
          </div>
          
          <Link 
            to={`/vote/${id}`} 
            className="text-[10px] sm:text-xs font-medium px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-full hover:bg-red-800 transition-colors"
          >
            Lihat Detail & Vote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;