import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">User Directory</h1>
        <p className="header-subtitle">Browse through millions of users efficiently</p>
      </div>
    </header>
  );
};

export default Header;
