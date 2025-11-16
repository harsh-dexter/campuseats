import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../../store/cartSlice';
import apiClient from '../../api/apiClient';
import MenuItemCard from '../../components/student/MenuItemCard';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin } from 'lucide-react';

const CanteenMenu = () => {
  const { id: canteenId } = useParams();
  const [canteen, setCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { canteen: cartCanteen } = useSelector((state) => state.cart);

  useEffect(() => {
    const fetchCanteenAndMenu = async () => {
      try {
        setLoading(true);
        const [canteenRes, menuRes] = await Promise.all([
          apiClient.get(`/student/canteens/${canteenId}`),
          apiClient.get(`/student/canteens/${canteenId}/menu`),
        ]);
        setCanteen(canteenRes.data);
        setMenuItems(menuRes.data);
      } catch (error) {
        toast.error('Failed to fetch canteen details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCanteenAndMenu();
  }, [canteenId]);

  const handleAddToCart = (item) => {
    // Check if adding from a *different* canteen
    if (cartCanteen && cartCanteen._id !== canteen._id) {
      if (window.confirm('Your cart contains items from another canteen. Would you like to clear it and add this item?')) {
        dispatch(clearCart());
        dispatch(addToCart({ item, canteenInfo: canteen }));
        toast.success(`${item.name} added to cart!`);
      } else {
        return; // User cancelled
      }
    } else {
      // If no canteen or same canteen, just add
      dispatch(addToCart({ item, canteenInfo: canteen }));
      toast.success(`${item.name} added to cart!`);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!canteen) {
    return <p className="text-center text-gray-600">Canteen not found.</p>;
  }

  return (
    <div className="pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
      >
        <ArrowLeft size={18} />
        Back to Canteens
      </Link>
      
      {/* Canteen Header */}
      <div className="relative mb-6">
        <img
          src={canteen.imageUrl}
          alt={canteen.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent rounded-lg p-4 flex flex-col justify-end">
          <h1 className="text-3xl font-bold text-white">{canteen.name}</h1>
          <p className="text-gray-200 flex items-center gap-2">
            <MapPin size={16} />
            {canteen.location}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Menu</h2>
      <div className="space-y-4">
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))
        ) : (
          <p className="text-gray-600">This canteen has no items available.</p>
        )}
      </div>
    </div>
  );
};

export default CanteenMenu;