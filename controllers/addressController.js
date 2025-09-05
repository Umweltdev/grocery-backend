const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const Address = require("../models/addressModel");

const addAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let addressData = { ...req.body };
    if (req.body.type !== "collection") {
      addressData.createdBy = _id;
    }
    const newAddress = await Address.create(addressData);
    return res.json(newAddress);
  } catch (error) {
    throw new Error(error);
  }
});

const updatedAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id, role } = req.user;
  validateMongoDbId(id);
  try {
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (address.type === "collection" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update address" });
    }
    const filter = { _id: id };
    const update = req.body;
    const options = {
      new: true,
    };
    let updatedAddress;
    if (address.type === "collection") {
      updatedAddress = await Address.findByIdAndUpdate(filter, update, options);
    } else {
      filter.createdBy = _id;
      updatedAddress = await Address.findOneAndUpdate(filter, update, options);
    }
    res.json(updatedAddress);
  } catch (error) {
    throw new Error(error);
  }
});

const getAddresses = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const { type } = req.query;
  try {
    let addresses;
    if (type === "collection") {
      addresses = await Address.find({ type: "collection" });
    } else if (type === "billing") {
      addresses = await Address.find({ type: "billing", createdBy: _id });
    } else {
      addresses = await Address.find({ type: "user", createdBy: _id });
    }
    res.json(addresses);
  } catch (error) {
    throw new Error(error);
  }
});

const getAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const address = await Address.findById(id);
    res.json(address);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id, role } = req.user;
  validateMongoDbId(id);
  validateMongoDbId(_id);
  try {
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (address.type === "collection" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete address" });
    }
    const filter = {
      _id: id,
      createdBy: address.type === "collection" ? undefined : _id,
    };
    const deletedAddress = await Address.findOneAndDelete(filter);
    res.json(deletedAddress);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  addAddress,
  getAddresses,
  updatedAddress,
  getAddress,
  deleteAddress,
};
