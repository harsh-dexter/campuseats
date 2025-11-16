import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import CanteenCard from '../../components/student/CanteenCard';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const Home = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/student/canteens');
        setCanteens(data);
      } catch (error) {
        toast.error('Failed to fetch canteens');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCanteens();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Choose a Canteen
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canteens.length > 0 ? (
          canteens.map((canteen) => (
            <CanteenCard key={canteen._id} canteen={canteen} />
          ))
        ) : (
          <p className="text-gray-600">No open canteens found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;