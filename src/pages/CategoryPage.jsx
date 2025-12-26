import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategory } from '../tools/registry';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = getCategory(categoryId);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div>
      <h1>{category.name}</h1>
      <p>{category.description}</p>
      <div className="tools-grid">
        {category.tools.map(tool => (
          <Link key={tool.id} to={`/tool/${category.id}/${tool.id}`} className="tool-card">
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
