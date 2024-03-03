const mongoose = require("mongoose");


const VariantSchema = new mongoose.Schema({
    sizes: [{
        size: { type: String },
        stock: { type: Number }
    }],
    color: { type: String },
    price: {
        currency: { type: String },
        value: { type: String }
    },
    assets: {
        thumbnail: { type: String },
        images: [String]
    },
    popularityIndex: { type: Number, default: 0 },
    product: { type: mongoose.Types.ObjectId, required: true, ref: Product },
    name: { type: String },
    brand: { type: String },
    section: { type: String }

}, {
    timestamps: true
})