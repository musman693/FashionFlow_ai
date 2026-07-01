require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const Product = require('../models/Product');

const fakeProducts = [
  { name: 'Classic White T-Shirt', description: 'Essential cotton blend white t-shirt.', category: 'Tops', price: 19.99, sizes: ['S', 'M', 'L', 'XL'], colors: ['White'], stock: 150 },
  { name: 'Slim Fit Blue Jeans', description: 'Comfortable stretch denim jeans.', category: 'Bottoms', price: 49.99, sizes: ['30', '32', '34', '36'], colors: ['Blue', 'Dark Blue'], stock: 85 },
  { name: 'Leather Biker Jacket', description: 'Real leather jacket with zipper details.', category: 'Outerwear', price: 199.99, sizes: ['M', 'L', 'XL'], colors: ['Black', 'Brown'], stock: 20 },
  { name: 'Running Sneakers', description: 'Lightweight breathable running shoes.', category: 'Footwear', price: 89.99, sizes: ['8', '9', '10', '11', '12'], colors: ['Black/White', 'Grey'], stock: 60 },
  { name: 'Summer Floral Dress', description: 'Breezy summer dress with floral pattern.', category: 'Dresses', price: 39.99, sizes: ['XS', 'S', 'M', 'L'], colors: ['Floral Print', 'Red Floral'], stock: 45 },
  { name: 'Graphic Hoodie', description: 'Cozy fleece hoodie with vintage graphic.', category: 'Tops', price: 55.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy', 'Grey'], stock: 110 },
  { name: 'Chino Shorts', description: 'Casual cotton shorts perfect for warm weather.', category: 'Bottoms', price: 29.99, sizes: ['30', '32', '34'], colors: ['Khaki', 'Navy'], stock: 90 },
  { name: 'Winter Wool Coat', description: 'Heavy wool blend coat for cold weather.', category: 'Outerwear', price: 149.99, sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Charcoal', 'Camel'], stock: 30 },
  { name: 'Formal Oxford Shoes', description: 'Classic leather lace-up oxford shoes.', category: 'Footwear', price: 120.00, sizes: ['8', '9', '10', '11'], colors: ['Black', 'Brown'], stock: 40 },
  { name: 'Evening Maxi Dress', description: 'Elegant floor-length evening dress.', category: 'Dresses', price: 110.00, sizes: ['S', 'M', 'L'], colors: ['Black', 'Navy', 'Burgundy'], stock: 25 },
  { name: 'V-Neck Sweater', description: 'Soft cashmere v-neck sweater.', category: 'Tops', price: 79.99, sizes: ['S', 'M', 'L', 'XL'], colors: ['Grey', 'Black', 'Olive'], stock: 55 },
  { name: 'Cargo Pants', description: 'Utility cargo pants with multiple pockets.', category: 'Bottoms', price: 45.00, sizes: ['30', '32', '34', '36', '38'], colors: ['Olive', 'Khaki'], stock: 75 },
  { name: 'Denim Jacket', description: 'Classic washed denim jacket.', category: 'Outerwear', price: 69.99, sizes: ['S', 'M', 'L', 'XL'], colors: ['Light Wash', 'Medium Wash'], stock: 65 },
  { name: 'Canvas Sneakers', description: 'Everyday casual canvas sneakers.', category: 'Footwear', price: 35.00, sizes: ['7', '8', '9', '10', '11', '12'], colors: ['White', 'Black'], stock: 120 },
  { name: 'Wrap Midi Dress', description: 'Flattering wrap-style midi dress.', category: 'Dresses', price: 59.99, sizes: ['S', 'M', 'L', 'XL'], colors: ['Green', 'Black', 'Polka Dot'], stock: 50 },
  { name: 'Striped Polo Shirt', description: 'Cotton pique polo shirt with horizontal stripes.', category: 'Tops', price: 34.99, sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Navy/White', 'Red/White'], stock: 80 },
  { name: 'Pleated Skirt', description: 'Midi length pleated skirt.', category: 'Bottoms', price: 42.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Beige', 'Pink'], stock: 45 },
  { name: 'Puffer Vest', description: 'Lightweight quilted puffer vest.', category: 'Outerwear', price: 55.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Red'], stock: 40 },
  { name: 'Hiking Boots', description: 'Waterproof durable hiking boots.', category: 'Footwear', price: 135.00, sizes: ['9', '10', '11', '12'], colors: ['Brown', 'Grey'], stock: 35 },
  { name: 'Bodycon Dress', description: 'Fitted mini dress for nights out.', category: 'Dresses', price: 45.00, sizes: ['XS', 'S', 'M'], colors: ['Black', 'Red'], stock: 60 },
  { name: 'Basic Tank Top', description: 'Ribbed cotton blend tank top.', category: 'Tops', price: 12.99, sizes: ['S', 'M', 'L'], colors: ['White', 'Black', 'Grey'], stock: 200 }
];

async function seedProducts() {
  try {
    await connectDatabase();
    
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    console.log(`Seeding ${fakeProducts.length} products...`);
    await Product.insertMany(fakeProducts);
    
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedProducts();
