const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    section: { type: String },
    brand: { type: String, required: true }
},
    {
        timestamps: true
    })

module.exports = mongoose.model("Product", ProductSchema)