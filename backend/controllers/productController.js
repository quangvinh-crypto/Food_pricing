const { Product, Category } = require('../models');
const cloudinary = require('../config/cloudinary');
const { Op } = require('sequelize');

// Get all products with filters
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, pricingMethod, isActive, search } = req.query;

    // Build filter conditions
    const whereClause = {};
    if (categoryId) whereClause.categoryId = categoryId;
    if (pricingMethod) whereClause.pricingMethod = pricingMethod;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', ],
      }],
      order: [['createdAt', 'DESC']],
    });

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'Không có sản phẩm nào. Vui lòng thêm sản phẩm mới.',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description', ],
      }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      basePrice,
      currentPrice,
      costPrice,
      stock,
      initialStock,
      unit,
      expiryDate,
      shelfLife,
      pricingMethod,
      isActive,
    } = req.body;

    // Validation
    if (!name || !categoryId || !basePrice || !costPrice || !expiryDate || !shelfLife) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, categoryId, basePrice, costPrice, expiryDate, shelfLife',
      });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Handle image upload
    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      categoryId,
      basePrice,
      currentPrice: currentPrice || basePrice,
      costPrice,
      stock: stock || 0,
      initialStock: initialStock || stock || 0,
      unit: unit || 'kg',
      expiryDate,
      shelfLife,
      pricingMethod: pricingMethod || 'fixed',
      image: imageUrl,
      imagePublicId: imagePublicId,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Fetch product with category
    const createdProduct = await Product.findByPk(product.id, {
      include: [{
        model: Category,
        as: 'category',
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);

    // Delete uploaded image if product creation fails
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if category exists (if updating categoryId)
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (product.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(product.imagePublicId);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    await product.update(updateData);

    // Fetch updated product with category
    const updatedProduct = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
      }],
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);

    // Delete uploaded image if update fails
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// Update product price
exports.updateProductPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPrice, pricingMethod } = req.body;

    if (!currentPrice) {
      return res.status(400).json({
        success: false,
        message: 'currentPrice is required',
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.update({
      currentPrice,
      pricingMethod: pricingMethod || product.pricingMethod,
    });

    res.status(200).json({
      success: true,
      message: 'Product price updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product price:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product price',
      error: error.message,
    });
  }
};
