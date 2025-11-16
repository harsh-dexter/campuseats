import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus } from 'lucide-react';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartTotal,
} from '../../store/cartSlice';
import { selectUser } from '../../store/authSlice'; // Import the selector

const Cart = () => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // FIX: Replaced useAuth() with useSelector(selectUser)
  const user = useSelector(selectUser);
  // ---

  // useSelector calls are now correct
  const { cartItems, canteen } = useSelector((state) => state.cart);
  const cartTotal = useSelector(selectCartTotal);


  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        canteenId: canteen._id,
        orderItems: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
      };

      const { data: newOrder } = await apiClient.post('/student/orders', orderData);

      toast.success('Order placed successfully!');
      dispatch(clearCart());
      
      // Navigate to the order status page
      navigate(`/order/${newOrder._id}`);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const getUpiUrl = () => {
    if (!canteen?.upiId) return '#';
    const params = new URLSearchParams();
    params.set('pa', canteen.upiId);
    params.set('pn', canteen.name.replace(/\s/g, '+'));
    params.set('am', cartTotal.toFixed(2));
    params.set('cu', 'INR');
    params.set('tn', `Order from ${canteen.name}`);
    return `upi://pay?${params.toString()}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">Your cart is empty</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Browse Canteens
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Cart</h1>
      <h2 className="text-xl font-semibold text-primary mb-6">
        From: {canteen?.name}
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-primary font-medium">
                ${item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity - 1 }))}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity + 1 }))}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => dispatch(removeFromCart(item._id))}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Service Fee</span>
          <span className="font-medium">$0.00</span>
        </div>
        <hr className="my-2"/>
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-primary-light/10 has-[:checked]:border-primary">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-3 font-medium text-gray-700">Pay with UPI</span>
          </label>
          <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-primary-light/10 has-[:checked]:border-primary">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-3 font-medium text-gray-700">Pay with Cash at Counter</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {paymentMethod === 'upi' && (
          <Button
            href={getUpiUrl()}
            variant="secondary"
            className="w-full text-center"
            disabled={!canteen?.upiId || loading}
          >
            {canteen?.upiId ? 'Pay with UPI App' : 'UPI Not Available'}
          </Button>
        )}
        <Button
          onClick={handlePlaceOrder}
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Placing Order...' : `Place Order (Pay ${paymentMethod === 'upi' ? 'at Counter' : 'Cash'})`}
        </Button>
        <p className="text-sm text-center text-gray-500">
          {paymentMethod === 'upi'
            ? 'After paying, click "Place Order". Your order status will be pending until payment is confirmed by the canteen.'
            : 'You will pay at the counter when you pick up your order.'}
        </p>
      </div>
    </div>
  );
};

export default Cart;