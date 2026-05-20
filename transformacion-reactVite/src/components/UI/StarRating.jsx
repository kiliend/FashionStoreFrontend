// src/components/UI/StarRating.jsx
import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${!readonly && 'cursor-pointer'} transition-transform hover:scale-110`}
          disabled={readonly}
        >
          <span
            className={`${sizes[size]} ${
              (hoverRating || rating) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export const RatingAverage = ({ ratings }) => {
  if (!ratings || ratings.length === 0) return null;
  
  const average = ratings.reduce((sum, r) => sum + r.calificacion, 0) / ratings.length;
  const total = ratings.length;
  
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={average} readonly size="sm" />
      <span className="text-sm font-semibold text-[#b83267]">{average.toFixed(1)}</span>
      <span className="text-sm text-gray-500">({total} valoraciones)</span>
    </div>
  );
};

export default StarRating;
