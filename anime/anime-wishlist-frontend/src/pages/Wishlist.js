import { useState, useEffect } from 'react';
import axios from 'axios';
import AnimeCard from '../components/AnimeCard';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Added states for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/wishlist/${currentUser.uid}`);
        console.log('Fetched wishlist data:', response.data);
        const mappedWishlist = response.data.map(item => ({
          _id: item._id,
          mal_id: item.mal_id,
          title: item.title || item.name || 'Unknown Title',
          image_url: item.image_url || item.image || '',
          episodes: item.episodes !== undefined ? item.episodes : 'N/A',
          score: item.score !== undefined ? item.score : 'N/A',
          status: item.status || '',
          userId: item.userId || '',
        }));
        setWishlist(mappedWishlist);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/wishlist/${id}`);
      setWishlist(wishlist.filter(anime => anime._id !== id));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Added search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      setSearchResults([]);
      return;
    }
    setSearchError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/search?query=${encodeURIComponent(searchQuery)}`);
      console.log('Search results:', response.data);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setSearchError('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search anime');
      setSearchResults([]);
    }
  };

  // Added add to wishlist handler
  const addToWishlist = async (anime) => {
    if (!currentUser) {
      setSearchError('Please login to add to wishlist');
      return;
    }
    try {
      const animeData = {
        mal_id: anime.mal_id,
        title: anime.title || 'Unknown Title',
        image_url: anime.image_url || '',
        episodes: anime.episodes !== undefined ? anime.episodes : 'N/A',
        score: anime.score !== undefined ? anime.score : 'N/A',
        status: anime.airing ? 'Airing' : 'Finished',
        userId: currentUser.uid,
      };
      console.log('Adding to wishlist:', animeData);
      const response = await axios.post('http://localhost:5000/api/wishlist', animeData);
      setWishlist([...wishlist, response.data]);
      setSearchError('');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setSearchError('Failed to add anime to wishlist');
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Please login to view your wishlist</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-header">Your Anime Wishlist</h1>
      <p className="wishlist-subheader">Search and add your favorite anime to your wishlist</p>
      <div className="wishlist-search">
        <input
          type="text"
          placeholder="Search for anime..."
          className="wishlist-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="wishlist-search-button" onClick={handleSearch}>Search</button>
      </div>
      {searchError && <p className="wishlist-search-error">{searchError}</p>}
      {searchResults.length > 0 && (
        <div className="wishlist-search-results">
          {searchResults.map((anime) => (
            <div key={anime.mal_id} className="wishlist-search-result-item">
              <AnimeCard anime={anime} />
              <button onClick={() => addToWishlist(anime)}>Add to Wishlist</button>
            </div>
          ))}
        </div>
      )}
      {wishlist.length > 0 ? (
        <div className="wishlist-anime-container">
          {wishlist.map((anime) => (
            <AnimeCard 
              key={anime._id} 
              anime={anime} 
              isInWishlist
              onRemoveFromWishlist={() => removeFromWishlist(anime._id)}
            />
          ))}
        </div>
      ) : (
        <div className="wishlist-empty">
          <p>Your wishlist is empty</p>
        </div>
      )}
    </div>
  );
}
