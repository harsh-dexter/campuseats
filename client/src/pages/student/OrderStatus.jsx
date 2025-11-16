import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import OrderTimeline from '../../components/student/OrderTimeline';
import toast from 'react-hot-toast';

// Poll every 5 seconds
const POLLING_INTERVAL = 5000;

const OrderStatus = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrder = async (isPoll = false) => {
    try {
      if (!isPoll) {
        setLoading(true);
      }
      const { data } = await apiClient.get(`/student/orders/${orderId}`);
      setOrder(data);

      // If order is complete, stop polling
      if (data.orderStatus === 'completed' || data.orderStatus === 'cancelled') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    } catch (error) {
      if (!isPoll) {
        toast.error('Failed to fetch order details');
      }
      console.error('Poll/Fetch error:', error);
    } finally {
      if (!isPoll) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Setup polling
  useEffect(() => {
    // Start polling
    intervalRef.current = setInterval(() => fetchOrder(true), POLLING_INTERVAL);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);
  
  const getUpiUrl = () => {
    if (!order?.canteen?.upiId) return '#';
    const params = new URLSearchParams();
    params.set('pa', order.canteen.upiId);
    params.set('pn', order.canteen.name.replace(/\s/g, '+'));
    params.set('am', order.totalAmount.toFixed(2));
    params.set('cu', 'INR');
    params.set('tn', `Order #${order._id.slice(-6)}`);
    return `upi://pay?${params.toString()}`;
  };

  if (loading) {
    return <Spinner />;
  }

  if (!order) {
    return <p className="text-center text-gray-600">Order not found.</p>;
  }

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Order Status
      </h1>
      <p className="text-gray-500 mb-6">
        Order ID: <span className="font-mono">#{order._id.slice(-10)}</span>
      </p>

      {/* Payment Status */}
      {order.paymentMethod === 'upi' && order.paymentStatus === 'pending' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6" role="alert">
          <h3 className="font-bold">Payment Pending</h3>
          <p>Your order will be accepted after you complete the payment.</p>
          <a
            href={getUpiUrl()}
            className="mt-2 inline-block px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600"
          >
            Pay ${order.totalAmount.toFixed(2)} with UPI
          </a>
        </div>
      )}

      {/* Order Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Order from {order.canteen.name}
        </h2>
        <OrderTimeline
          statusHistory={order.statusHistory}
          currentStatus={order.orderStatus}
        />
      </div>
      
      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Items</h2>
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item._id} className="flex justify-between py-3">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500"> x {item.quantity}</span>
              </div>
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <hr className="my-3"/>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;