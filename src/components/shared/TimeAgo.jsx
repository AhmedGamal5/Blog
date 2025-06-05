import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const TimeAgo = ({ timestamp, className }) => {
  if (!timestamp) {
    return null;
  }

  const [timeAgo, setTimeAgo] = useState(
    () => formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  );

  useEffect(() => {
    const update = () => {
      try {
        const newTimeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        setTimeAgo(newTimeAgo);
      } catch (error) {
        console.error("Failed to format date:", error);
        setTimeAgo('Invalid date');
      }
    };

    update();

    const intervalId = setInterval(update, 60000);  

    return () => clearInterval(intervalId);
  }, [timestamp]);  

  return (
    <span className={className} title={new Date(timestamp).toLocaleString()}>
      {timeAgo}
    </span>
  );
};

export default TimeAgo;