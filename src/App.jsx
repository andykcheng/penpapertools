import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ToolPage from './pages/ToolPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="tool/:categoryId/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
