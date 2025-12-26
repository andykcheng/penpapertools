import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategory } from '../tools/registry';

const ToolPage = () => {
  const { categoryId, toolId } = useParams();
  const category = getCategory(categoryId);
  
  if (!category) {
    return <div>Category not found</div>;
  }

  const tool = category.tools.find(t => t.id === toolId);

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const ToolComponent = tool.component;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/category/${categoryId}`}>&larr; Back to {category.name}</Link>
      </div>
      <h1>{tool.name}</h1>
      <Suspense fallback={<div>Loading tool...</div>}>
        <ToolComponent />
      </Suspense>
    </div>
  );
};

export default ToolPage;
