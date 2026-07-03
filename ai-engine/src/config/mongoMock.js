// src/config/mongoMock.js
// Mocking MongoDB database context for Phase 1 standalone testing.
// Real structural schema match for Usman to swap seamlessly in main server.

const MOCK_PRODUCTS = [
  { id: "p1", name: "Premium Black Lawn Dress", price: 4500, originalPrice: 6000, category: "dress", gender: "women", colors: ["black"], sizes: ["S", "M", "L"], tags: ["summer", "casual"], salesCount: 150 },
  { id: "p2", name: "Midnight Silhouette Formal Dress", price: 4999, originalPrice: 4999, category: "dress", gender: "women", colors: ["black"], sizes: ["M", "L"], tags: ["formal", "trending"], salesCount: 300 },
  { id: "p3", name: "Classic Crimson Kurta", price: 3500, originalPrice: 4500, category: "kurta", gender: "women", colors: ["red"], sizes: ["S", "M"], tags: ["summer", "bestselling"], salesCount: 450 },
  { id: "p4", name: "Men's Slim Fit Charcoal Shirt", price: 2800, originalPrice: 3500, category: "shirt", gender: "men", colors: ["grey", "black"], sizes: ["M", "L", "XL"], tags: ["casual", "trending"], salesCount: 220 },
  { id: "p5", name: "Luxury Velvet Evening Gown", price: 12000, originalPrice: 15000, category: "dress", gender: "women", colors: ["black", "maroon"], sizes: ["S", "M"], tags: ["formal", "bestselling"], salesCount: 80 }
];

async function queryProducts(mongoFilter) {
  // Simulating exact MongoDB logical query operators ($lte, $in, $regex)
  return MOCK_PRODUCTS.filter(p => {
    if (mongoFilter.gender && p.gender !== mongoFilter.gender) return false;
    
    if (mongoFilter.price && mongoFilter.price.$lte && p.price > mongoFilter.price.$lte) return false;
    
    if (mongoFilter.category && mongoFilter.category.$regex) {
      const regex = new RegExp(mongoFilter.category.$regex, 'i');
      if (!regex.test(p.category)) return false;
    }
    
    if (mongoFilter.colors && mongoFilter.colors.$in) {
      const hasColor = mongoFilter.colors.$in.some(c => p.colors.includes(c));
      if (!hasColor) return false;
    }

    if (mongoFilter.tags && mongoFilter.tags.$in) {
      const hasTag = mongoFilter.tags.$in.some(t => p.tags.includes(t));
      if (!hasTag) return false;
    }
    
    if (mongoFilter.sizes && mongoFilter.sizes.$in) {
      const hasSize = mongoFilter.sizes.$in.some(s => p.sizes.includes(s));
      if (!hasSize) return false;
    }

    if (mongoFilter.$expr && mongoFilter.$expr.$lt) {
      // Discount query simulator: price < originalPrice
      if (p.price >= p.originalPrice) return false;
    }

    return true;
  });
}

module.exports = { queryProducts };