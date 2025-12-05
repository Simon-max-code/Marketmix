// Category-Specific Display Rules
// Defines which options (colors/sizes) should be shown for each product category

const CATEGORY_RULES = {
  phones: {
    showColors: true,
    showSizes: false,
    displayName: 'Phones'
  },
  clothes: {
    showColors: true,
    showSizes: true,
    displayName: 'Clothes'
  },
  electronics: {
    showColors: false,
    showSizes: false,
    displayName: 'Electronics'
  },
  laptops: {
    showColors: true,
    showSizes: false,
    displayName: 'Laptops'
  },
  shoes: {
    showColors: true,
    showSizes: true,
    displayName: 'Shoes'
  },
  beauty: {
    showColors: false,
    showSizes: false,
    displayName: 'Beauty & Cosmetics'
  },
  furniture: {
    showColors: false,
    showSizes: false,
    displayName: 'Furniture'
  },
  bags: {
    showColors: true,
    showSizes: false,
    displayName: 'Bags'
  },
  watches: {
    showColors: true,
    showSizes: false,
    displayName: 'Watches'
  },
  groceries: {
    showColors: false,
    showSizes: false,
    displayName: 'Groceries'
  },
  kids: {
    showColors: true,
    showSizes: true,
    displayName: 'Kids & Babies'
  },
  jewelry: {
    showColors: true,
    showSizes: false,
    displayName: 'Jewelry'
  },
  sports: {
    showColors: false,
    showSizes: false,
    displayName: 'Sports & Fitness'
  },
  home: {
    showColors: false,
    showSizes: false,
    displayName: 'Home & Kitchen'
  },
  automotive: {
    showColors: false,
    showSizes: false,
    displayName: 'Automotive'
  }
};

// Get category rules by category name (case-insensitive)
function getCategoryRules(category) {
  const key = (category || '').toLowerCase().trim();
  return CATEGORY_RULES[key] || { showColors: false, showSizes: false, displayName: category };
}
