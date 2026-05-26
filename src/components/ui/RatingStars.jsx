import React from 'react';

export const RatingStars = ({ value = 0, reviews = 0 }) => {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="rating-stars">
      {stars.map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          fill={value >= star ? 'var(--primary)' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          className="rating-icon"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="rating-value">{value.toFixed(1)}</span>
      <span className="rating-count">({reviews} reviews)</span>
    </div>
  );
};
