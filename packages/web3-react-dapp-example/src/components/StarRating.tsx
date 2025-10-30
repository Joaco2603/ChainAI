import React from 'react';
import styled from 'styled-components';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarsContainer = styled.div<{ interactive?: boolean }>`
  display: flex;
  gap: 4px;
  cursor: ${(props) => (props.interactive ? 'pointer' : 'default')};
`;

const Star = styled.span<{
  filled: boolean;
  size: number;
  interactive?: boolean;
}>`
  font-size: ${(props) => props.size}px;
  color: ${(props) => (props.filled ? '#FFD700' : '#4A5568')};
  transition: color 0.2s ease;
  user-select: none;

  ${(props) =>
    props.interactive &&
    `
    &:hover {
      color: #FFA500;
      transform: scale(1.1);
    }
  `}
`;

const RatingText = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #a0aec0;
`;

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StarsContainer interactive={interactive} onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;

          return (
            <Star
              key={index}
              filled={isFilled}
              size={size}
              interactive={interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
            >
              {isFilled ? '★' : '☆'}
            </Star>
          );
        })}
      </StarsContainer>
      {!interactive && rating > 0 && (
        <RatingText>
          {rating.toFixed(1)} / {maxRating}
        </RatingText>
      )}
    </div>
  );
};
