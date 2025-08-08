import React, { useState } from 'react';
import './AnimeCard.css';

const fallbackImage = 'https://via.placeholder.com/200x280?text=No+Image';

export default function AnimeCard({ anime, isInWishlist, onAddToWishlist, onRemoveFromWishlist }) {
  const [imgSrc, setImgSrc] = useState(anime.image_url || fallbackImage);

  const handleError = () => {
    setImgSrc(fallbackImage);
  };

  console.log('AnimeCard anime prop:', anime);
  return (
    <div className="anime-card">
      <img 
        src={imgSrc} 
        alt={anime.title} 
        className="anime-image"
        onError={handleError}
      />
      {anime.status && (
        <div className="anime-badge">{anime.status}</div>
      )}
      <div className="anime-content">
        <h3 className="anime-title">{anime.title}</h3>
        <div className="anime-meta">
          <span>Episodes: {anime.episodes || 'N/A'}</span>
          <span>Score: {anime.score || 'N/A'}</span>
        </div>
        {isInWishlist ? (
          <button
            onClick={onRemoveFromWishlist}
            className="anime-btn"
          >
            Remove from Wishlist
          </button>
        ) : (
          <button
            onClick={onAddToWishlist}
            className="anime-btn"
          >
            Add to Wishlist
          </button>
        )}
      </div>
    </div>
  );
}
