import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon, HomeIcon } from '@heroicons/react/24/outline';
import './Navbar.css';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container container">
          <Link to="/" className="navbar-brand">AnimeWish</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <HomeIcon className="nav-icon" />
              <span>Home</span>
            </Link>
            <Link to="/wishlist" className="nav-link">
              <BookmarkIcon className="nav-icon" />
              <span>Wishlist</span>
            </Link>
            {currentUser ? (
              <button onClick={handleLogout} className="nav-link btn-link">
                Logout
              </button>
            ) : (
              <button onClick={openLoginModal} className="nav-link btn-link">
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
