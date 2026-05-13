import { useState } from 'react';
import { useApi } from './useApi.js';

export const useSubscription = () => {
  const { request, loading, error } = useApi();
  const [feedUrl, setFeedUrl] = useState(null);

  const subscribe = async (regNumber) => {
    try {
      const data = await request('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ reg_number: regNumber }),
      });
      setFeedUrl(data.feed_url);
    } catch (err) {
      console.error('Subscription failed', err);
    }
  };

  return { subscribe, feedUrl, loading, error };
};
