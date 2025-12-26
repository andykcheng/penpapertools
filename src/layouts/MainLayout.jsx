import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getAllCategories } from '../tools/registry';
import './MainLayout.css';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const categories = getAllCategories();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Menu">
          ☰
        </button>
        <span className="mobile-title">Dev Tools</span>
      </div>

      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          Dev Tools
          <button className="close-btn" onClick={closeMobileMenu} aria-label="Close menu">×</button>
        </div>
        <nav className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} 
            end
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          {categories.map(category => (
            <NavLink 
              key={category.id} 
              to={`/category/${category.id}`}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMobileMenu}
            >
              {category.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
