const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  initialStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'kg',
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  shelfLife: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pricingMethod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'fixed',
    validate: {
      isIn: [['fixed', 'dynamic', 'ai']],
    },
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  imagePublicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'Products',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// Associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

module.exports = Product;
