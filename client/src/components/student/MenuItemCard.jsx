import React from 'react';
import { Plus } from 'lucide-react';

const MenuItemCard = ({ item, onAddToCart }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-md flex-shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/300x200/4A64F0/white?text=${item.name.replace(
            /\s/g,
            '+'
          )}`;
        }}
      />
      <div className="flex-grow">
        <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        <p className="text-md font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
      </div>
      <button
        onClick={onAddToCart}
        className="flex-shrink-0 bg-primary-light/10 text-primary p-2 rounded-full hover:bg-primary-light/20 transition-colors"
        aria-label={`Add ${item.name} to cart`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MenuItemCard;