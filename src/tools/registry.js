// Configuration for category display names and descriptions
const categoriesConfig = {
  encoding: {
    name: 'Encoding',
    description: 'Tools for encoding and decoding data'
  },
  encryption: {
    name: 'Encryption',
    description: 'Tools for encrypting and decrypting data'
  },
  time: {
    name: 'Time',
    description: 'Tools for time conversion and manipulation'
  },
  viewer: {
    name: 'Viewer',
    description: 'Tools for viewing different data formats'
  },
  misc: {
    name: 'Miscellaneous',
    description: 'Various utility tools'
  }
};

const toolsRegistry = {};

// Eagerly load all tool files to get metadata and components
// This allows us to build the registry automatically
const modules = import.meta.glob('./**/*.jsx', { eager: true });

for (const path in modules) {
  const module = modules[path];
  const metadata = module.metadata;
  const Component = module.default;

  // Skip if no metadata or default export
  if (!metadata || !Component) continue;

  // Determine category ID
  // Priority: metadata.category > folder name > 'misc'
  let categoryId = metadata.category;
  if (!categoryId) {
    const pathParts = path.split('/');
    // path is like "./encoding/Utf8ToBase64.jsx" -> ['.', 'encoding', 'Utf8ToBase64.jsx']
    categoryId = pathParts.length > 2 ? pathParts[1] : 'misc';
  }

  // Initialize category if it doesn't exist
  if (!toolsRegistry[categoryId]) {
    toolsRegistry[categoryId] = {
      id: categoryId,
      name: categoriesConfig[categoryId]?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      description: categoriesConfig[categoryId]?.description || '',
      tools: []
    };
  }

  // Add tool to category
  toolsRegistry[categoryId].tools.push({
    ...metadata,
    component: Component
  });
}

export const getCategory = (id) => toolsRegistry[id];
export const getAllCategories = () => Object.values(toolsRegistry);
