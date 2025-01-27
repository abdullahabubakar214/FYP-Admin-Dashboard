// components/Trends.js
import React, { useState, useEffect } from 'react';
import api from '../services/apiCalling';

function Trends() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await api.getEmergencyTrends();
        setTrends(response.data);
      } catch (err) {
        setError('Failed to fetch emergency trends');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) return <p>Loading trends...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Emergency Trends</h2>
      <ul>
        {trends.map((trend) => (
          <li key={trend.emergencyType}>
            {trend.emergencyType}: {trend.count}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Trends;
