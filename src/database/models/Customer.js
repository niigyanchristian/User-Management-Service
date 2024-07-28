const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    username: String,
    email: String,
    password: String,
    salt: String,
    phone: String,
    profile:{
    full_name:String,
    role: { type: String, enum: ['user', 'shop_owner'], default: 'user' }
    },
    address:[
        { type: Schema.Types.ObjectId, ref: 'address', require: true }
    ],
    cart: [
        {
          product: { 
                _id: { type: String, require: true},
                name: { type: String},
                banner: { type: String},
                price: { type: Number},
                shop_id:{type: String}
            },
          unit: { type: Number, require: true}
        }
    ],
    wishlist:[
        {
            _id: { type: String, require: true },
            name: { type: String },
            description: { type: String },
            banner: { type: String },
            avalable: { type: Boolean },
            price: { type: Number },
            shop_id:{type: String}
        }
    ],
    orders: [
        {
            _id: {type: String, required: true},
            amount: { type: String},
            orderId: String,
            status: String,
            deliveryCost:{type: Number},
            totalCost:{type: Number},
            product:{type:String , require:true},
            date: {type: Date, default: Date.now()}
        }
    ]
},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
});

module.exports = mongoose.model('customer', CustomerSchema);