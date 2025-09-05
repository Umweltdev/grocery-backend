const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryDeleteImg } = require("../utils/cloudinary");
const crypto = require("crypto");

function generateRandomHex() {
  const buffer = crypto.randomBytes(4);
  return "#" + buffer.toString("hex");
}

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    // console.log(req.images);
    const newProduct = await Product.create({
      ...req.body,
      productId: generateRandomHex(),
      images: req.images,
    });
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const parsedPreviousImages = req.body.previousImages.map((imageString) =>
    JSON.parse(imageString)
  );
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    let updatedData = req.body;
    if (req.body.name) updatedData.slug = slugify(req.body.name);
    const product = await Product.findById(id);
    const existingImages = product.images;
    let updatedImages = [];

    if (req.images && req.images.length > 0) {
      updatedImages = req.images.map((image) => ({
        public_id: image.public_id,
        url: image.url,
      }));
    }

    updatedData.images = [...updatedImages, ...existingImages];

    const removedImages = existingImages.filter(
      (existingImage) =>
        !parsedPreviousImages.some(
          (previousImage) => previousImage.public_id === existingImage.public_id
        )
    );

    for (const removedImage of removedImages) {
      await cloudinaryDeleteImg(removedImage.public_id);
    }

    updatedData.images = updatedData.images.filter(
      (updatedImage) =>
        !removedImages.some(
          (removedImage) => removedImage.public_id === updatedImage.public_id
        )
    );

    delete updatedData.previousImages;
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const product = await Product.findById(id);
    // console.log(product._id);
    const imagesToDelete = product.images;
    for (const image of imagesToDelete) {
      await cloudinaryDeleteImg(image.public_id);
    }
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById(id)
      .populate("category")
      .populate("brand")
      .populate("ratings.postedby");
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
  
    const queryObj = { ...req.query };
    const excludeFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "minPrice",
      "maxPrice",
      "brands",
      "sales",
      "featured",
      "stock",
      "categoryId",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    const brands = req.query.brands;
    const stock = req.query.stock;
    const featured = req.query.featured;
    const sales = req.query.sales;
    const categoryId = req.query.categoryId;

    if (categoryId) {
      const category = await Category.findById(categoryId);
      const productIds = await getNestedCategoryProductIds(category);
      query = query.where("_id").in(productIds);
    }

    if (brands) {
      const brandIds = brands.split(",").map((brandId) => brandId.trim());
      query = query.where("brand").in(brandIds);
    }
    if (featured && featured.toLowerCase() === "true")
      query = query.where("isFeatured").equals(true);
    if (stock && stock.toLowerCase() === "true")
      query = query.where("stock").gt(0);
    if (sales && sales.toLowerCase() === "true")
      query = query.where("salePrice").gt(0);

    // Filter by maxPrice and/or minPrice
    const maxPrice = req.query.maxPrice;
    const minPrice = req.query.minPrice;

    if (maxPrice && minPrice) {
      query = query.or([
        { regularPrice: { $gte: minPrice, $lte: maxPrice } },
        { salePrice: { $gte: minPrice, $lte: maxPrice } },
      ]);
    } else if (maxPrice) {
      query = query.or([
        { regularPrice: { $lte: maxPrice } },
        { salePrice: { $lte: maxPrice } },
      ]);
    } else if (minPrice) {
      query = query.or([
        { regularPrice: { $gte: minPrice } },
        { salePrice: { $gte: minPrice } },
      ]);
    }

    // Sorting
    if (req.query.sort) {
      const { sort } = req.query;
      let sortBy = "-createdAt";
      if (sort === "relevance") {
        //TODO::::: Add relevance sorting logic
      } else if (sort === "new_arrivals") {
        sortBy = "-createdAt";
      } else if (sort === "price_low_high") {
        sortBy = "regularPrice";
      } else if (sort === "price_high_low") {
        sortBy = "-regularPrice";
      }
      query = query.sort(sortBy);
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    query = query.populate("category brand ratings.postedby");

    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

const searchProduct = asyncHandler(async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment } = req.body;
  const { prodId } = req.params;

  const maxRate = 100;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let val = Math.round(((actualRating / maxRate) * 5 * 10) / 10);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
        totalstar: val <= 5 ? val : 5,
      },
      { new: true }
    );

    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishlist.some((wishlistId) =>
      wishlistId.equals(id)
    );
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: id },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: id },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const productIds = await getNestedCategoryProductIds(category);
    const products = await Product.find({ _id: { $in: productIds } })
      .lean()
      .populate("brand category");
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  rating,
  addToWishlist,
  getProductsByCategory,
};

async function getNestedCategoryProductIds(category) {
  let productIds = [];
  const categoryProducts = await Product.find({
    category: category._id,
  }).lean();
  productIds = productIds.concat(
    categoryProducts.map((product) => product._id)
  );
  for (const childId of category.children) {
    const childCategory = await Category.findById(childId);
    if (childCategory) {
      const childCategoryProductIds = await getNestedCategoryProductIds(
        childCategory
      );
      productIds = productIds.concat(childCategoryProductIds);
    }
  }
  return productIds;
}
