require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();

// Security middleware
app.use(helmet());

app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Anime Schema
const animeSchema = new mongoose.Schema({
  mal_id: Number,
  title: String,
  image_url: String,
  episodes: Number,
  score: Number,
  status: String,
  userId: String,
});

const Anime = mongoose.model('Anime', animeSchema);

// Jikan API Proxy
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }
    
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=1&limit=20`);
    
    // Map the response to match frontend expected fields
    const results = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images.jpg.image_url,
      episodes: anime.episodes || 0,
      score: anime.score || 0,
      airing: anime.airing || false,
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Jikan API error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      res.status(429).json({ error: 'Too many requests to anime database. Please try again later.' });
    } else if (error.response?.status === 404) {
      res.status(404).json({ error: 'No anime found for your search' });
    } else {
      res.status(500).json({ error: 'Failed to fetch anime data. Please try again.' });
    }
  }
});

// Wishlist Routes
app.post('/api/wishlist', async (req, res) => {
  try {
    let { mal_id, title, image_url, episodes, score, status, userId } = req.body;

    // Set default values if missing or undefined
    title = title || 'Unknown Title';
    episodes = episodes !== undefined && episodes !== null ? episodes : 0;
    score = score !== undefined && score !== null ? score : 0;
    image_url = image_url || '';
    status = status || '';
    userId = userId || '';

    const anime = new Anime({ mal_id, title, image_url, episodes, score, status, userId });
    await anime.save();
    res.status(201).json(anime);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/wishlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const animeList = await Anime.find({ userId });
    res.json(animeList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wishlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Anime.findByIdAndDelete(id);
    res.json({ message: 'Anime removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/wishlist/fix-missing-fields', async (req, res) => {
  try {
    const result = await Anime.updateMany(
      {
        $or: [
          { title: { $exists: false } },
          { title: null },
          { episodes: { $exists: false } },
          { episodes: null },
          { score: { $exists: false } },
          { score: null },
          { image_url: { $exists: false } },
          { image_url: null }
        ]
      },
      {
        $set: {
          title: 'Unknown Title',
          episodes: 0,
          score: 0,
          image_url: ''
        }
      }
    );
    res.json({ message: 'Wishlist entries updated', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
