import { useState } from "react";
const ExpandableText = ({ text, limit = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null; 
  }

  const needsTruncation = text.length > limit;

  const truncatedText = needsTruncation
    ? text.slice(0, limit) + '...'
    : text;

  const displayText = isExpanded ? text : truncatedText;

  return (
    <p className="text-gray-800 text-md mb-4 leading-relaxed dark:text-gray-600  font-semibold">
      {displayText}
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600  ml-1 font-msm focus:outline-none cursor-pointer text-sm"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </p>
  );
};

export default ExpandableText;