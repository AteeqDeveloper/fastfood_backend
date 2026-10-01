require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    Category.deleteMany({}),
    MenuItem.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log('Creating users...');
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@restaurant.com',
    password: 'Admin123!',
    phone: '+923000000001',
    role: 'super_admin',
  });

  const restaurantAdmin1 = await User.create({
    name: 'Ali Khan',
    email: 'ali@pizzahut.com',
    password: 'Admin123!',
    phone: '+923000000002',
    role: 'restaurant_admin',
  });

  const restaurantAdmin2 = await User.create({
    name: 'Sara Ahmed',
    email: 'sara@burgerking.com',
    password: 'Admin123!',
    phone: '+923000000003',
    role: 'restaurant_admin',
  });

  const customer1 = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    phone: '+923001234567',
    role: 'customer',
  });

  const customer2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123!',
    phone: '+923009876543',
    role: 'customer',
  });

  const customer3 = await User.create({
    name: 'Ahmed Raza',
    email: 'ahmed@example.com',
    password: 'Password123!',
    phone: '+923001112233',
    role: 'customer',
  });

  console.log('Creating restaurants...');
  const restaurantsData = [
    {
      name: 'Pizza Palace',
      description: 'Best pizzas in town with authentic Italian recipes',
      owner: restaurantAdmin1._id,
      phone: '+92211234567',
      email: 'contact@pizzapalace.com',
      address: '123 Main Boulevard',
      city: 'Karachi',
      openingTime: '10:00',
      closingTime: '23:00',
      isOpen: true,
      isActive: true,
    },
    {
      name: 'Burger Hub',
      description: 'Gourmet burgers and crispy fries',
      owner: restaurantAdmin2._id,
      phone: '+92217654321',
      email: 'hello@burgerhub.com',
      address: '45 Food Street',
      city: 'Lahore',
      openingTime: '11:00',
      closingTime: '00:00',
      isOpen: true,
      isActive: true,
    },
    {
      name: 'Desi Delights',
      description: 'Traditional Pakistani and Indian cuisine',
      owner: restaurantAdmin1._id,
      phone: '+92511234567',
      email: 'info@desidelights.com',
      address: '78 Blue Area',
      city: 'Islamabad',
      openingTime: '09:00',
      closingTime: '22:00',
      isOpen: true,
      isActive: true,
    },
  ];

  const restaurants = await Restaurant.insertMany(restaurantsData);

  const categoryNames = [
    ['Pizza', 'Pasta', 'Appetizers', 'Drinks', 'Desserts', 'Deals'],
    ['Burgers', 'Sides', 'Chicken', 'Drinks', 'Desserts', 'Combos'],
    ['Biryani', 'Curries', 'BBQ', 'Breads', 'Drinks', 'Desserts'],
  ];

  console.log('Creating categories and menu items...');
  for (let r = 0; r < restaurants.length; r++) {
    const restaurant = restaurants[r];
    const cats = [];
    for (let i = 0; i < categoryNames[r].length; i++) {
      const cat = await Category.create({
        restaurant: restaurant._id,
        name: categoryNames[r][i],
        description: `${categoryNames[r][i]} from ${restaurant.name}`,
        sortOrder: i + 1,
        isActive: true,
      });
      cats.push(cat);
    }

    // At least 10 menu items per restaurant
    const menuTemplates = [
      { name: 'Classic Item 1', price: 450, discountPrice: 399 },
      { name: 'Signature Special', price: 650, discountPrice: 599 },
      { name: 'Family Pack', price: 1200, discountPrice: null },
      { name: 'Spicy Delight', price: 550, discountPrice: 499 },
      { name: 'Cheesy Supreme', price: 700, discountPrice: null },
      { name: 'Crispy Combo', price: 800, discountPrice: 749 },
      { name: 'Veggie Option', price: 400, discountPrice: 350 },
      { name: 'Premium Selection', price: 900, discountPrice: 849 },
      { name: 'Daily Deal', price: 350, discountPrice: 299 },
      { name: 'Chef Recommendation', price: 750, discountPrice: null },
      { name: 'Kids Meal', price: 300, discountPrice: 250 },
      { name: 'Extra Large', price: 1100, discountPrice: 999 },
    ];

    for (let m = 0; m < menuTemplates.length; m++) {
      const t = menuTemplates[m];
      const cat = cats[m % cats.length];
      await MenuItem.create({
        restaurant: restaurant._id,
        category: cat._id,
        name: `${t.name} - ${restaurant.name.split(' ')[0]}`,
        description: `Delicious ${t.name.toLowerCase()} prepared fresh`,
        price: t.price,
        discountPrice: t.discountPrice,
        ingredients: ['Fresh ingredients', 'House special sauce', 'Premium quality'],
        isAvailable: true,
        preparationTime: 15 + (m % 20),
      });
    }
  }

  console.log('\n=== Seed completed successfully ===');
  console.log('\nLogin credentials:');
  console.log('Super Admin:      admin@restaurant.com / Admin123!');
  console.log('Restaurant Admin: ali@pizzahut.com / Admin123!');
  console.log('Restaurant Admin: sara@burgerking.com / Admin123!');
  console.log('Customer:         john@example.com / Password123!');
  console.log('Customer:         jane@example.com / Password123!');
  console.log('Customer:         ahmed@example.com / Password123!');
  console.log(`\nRestaurants: ${restaurants.length}`);
  console.log('Categories & menu items created for each restaurant.');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
