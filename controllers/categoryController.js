const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const generateRandomHex = require("../utils/randomGenerator");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { parent } = req.body;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      const level = parentCategory.level + 1;

      const categoryData = {
        categoryId: generateRandomHex(),
        ...req.body,
        level,
      };

      if (req.images && req.images.length > 0) {
        categoryData.image = req.images[0];
      }

      const newCategory = await Category.create(categoryData);
      parentCategory.children.push(newCategory._id);
      await Promise.all([newCategory.save(), parentCategory.save()]);
      res.json(newCategory);
    } else {
      const categoryData = {
        ...req.body,
        categoryId: generateRandomHex(),
      };

      if (req.images && req.images.length > 0) {
        categoryData.image = req.images[0];
      }

      const newCategory = await Category.create(categoryData);
      res.json(newCategory);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getallCategory = asyncHandler(async (req, res) => {
  const { level, visible } = req.query;
  try {
    const query = level ? { level } : {};
    if (visible !== undefined && visible !== null) {
      query.visible = visible === "true";
    }
    const getallCategory = await Category.find(query).lean();
    const populatePromises = getallCategory.map(populateChildren);
    await Promise.all(populatePromises);
    res.json(getallCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await Category.findById(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    } 
    await deleteCategoryAndDescendants(deletedCategory);
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaCategory = await Category.findById(id).populate(
      "children parent"
    );
    res.json(getaCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const switchVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;
  try {
    const category = await Category.findById(id);
    category.visible = visible;
    await category.save();
    await updateSubcategoriesVisibility(category);
    res.json({ success: true });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  switchVisibility,
};

const populateChildren = async (category) => {
  const populatedChildren = await Category.find({
    parent: category._id,
  }).lean();
  if (category.visible !== false) {
    category.children = populatedChildren;
    if (category.children.length > 0) {
      const childPromises = category.children.map(populateChildren);
      await Promise.all(childPromises);
    }
  } else {
    category.children = [];
  }
};

async function deleteCategoryAndDescendants(category) {
  await Category.deleteOne({ _id: category._id });
  for (const childId of category.children) {
    const childCategory = await Category.findById(childId);
    if (childCategory) {
      await deleteCategoryAndDescendants(childCategory);
    }
  }
  if (category.parent) {
    const parentCategory = await Category.findById(category.parent);
    if (parentCategory) {
      parentCategory.children.pull(category._id);
      await parentCategory.save();
    }
  }
}

const updateSubcategoriesVisibility = async (category) => {
  const subcategories = await Category.find({ parent: category._id });
  for (const subcategory of subcategories) {
    subcategory.visible = category.visible;
    await subcategory.save();
    await updateSubcategoriesVisibility(subcategory);
  }
};
