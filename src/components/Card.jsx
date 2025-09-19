import { Users } from 'lucide-react';

const Card = ({ title, description, category, imageUrl, votes, date }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition duration-300 hover:shadow-xl">
      <div className="h-40 w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full uppercase">
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
          <button className="text-xs font-semibold px-3 py-1 bg-primary text-white rounded hover:bg-red-800 transition-colors">
            Lihat Detail & Vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;