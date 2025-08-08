import { useState } from 'react';
import axios from 'axios';
import AnimeCard from '../components/AnimeCard';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const searchAnime = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      setAnimeList(response.data);
      
      if (response.data.length === 0) {
        setError('No anime found for your search');
      }
    } catch (error) {
      console.error('Error searching anime:', error);
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.response?.status >= 400) {
        setError('Invalid search query. Please try a different term.');
      } else {
        setError('Failed to search anime. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (anime) => {
    if (!currentUser) return alert('Please login to add to wishlist');
    try {
      await axios.post('/api/wishlist', {
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.image_url,
        episodes: anime.episodes,
        score: anime.score,
        status: anime.airing ? 'Airing' : 'Finished',
        userId: currentUser.uid,
      });
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAnime();
    }
  };

  return (
    <div className="home-container">
      <div className="search-section">
        <h1>Anime Wishlist</h1>
        <p>Search and add your favorite anime to your wishlist</p>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button onClick={searchAnime} disabled={loading} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="anime-grid">
        {animeList.map((anime) => (
          <AnimeCard
            key={anime.mal_id}
            anime={anime}
            onAddToWishlist={addToWishlist}
            isLoggedIn={!!currentUser}
          />
        ))}
      </div>

      {animeList.length === 0 && !loading && (
        <div className="empty-state">
          <p>Search for anime to add to your wishlist!</p>
        </div>
      )}
    </div>
  );
}
