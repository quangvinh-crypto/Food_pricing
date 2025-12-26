const { Category } = require('../models');

const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...');

    const categories = [
      {
        name: 'Rau củ',
        description: 'Rau xanh, củ quả tươi sống',
        icon: '🥬',
      },
      {
        name: 'Trái cây',
        description: 'Trái cây trong nước và nhập khẩu',
        icon: '🍎',
      },
      {
        name: 'Thịt',
        description: 'Thịt heo, bò, gà tươi',
        icon: '🥩',
      },
      {
        name: 'Hải sản',
        description: 'Cá, tôm, mực tươi sống',
        icon: '🐟',
      },
      {
        name: 'Sữa và trứng',
        description: 'Sản phẩm từ sữa và trứng',
        icon: '🥛',
      },
    ];

    for (const category of categories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
    }

    console.log('✅ Categories seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;
