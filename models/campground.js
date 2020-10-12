const mongoose = require('mongoose');
const validators = require('mongoose-validators');

var campgroundSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: String,
    image: {
        type: String,
        required: true,
        validate: validators.isURL({
            message: 'Must be a valid URL',
            protocols: ['http', 'https', 'ftp'],
            require_tld: true,
            require_protocol: true,
        }),
    },
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    rating: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: 'Number must be an integer',
        },
        default: 0,
    },
});

module.exports = mongoose.model('Campground', campgroundSchema);
