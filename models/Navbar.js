const mongoose = require('mongoose');

const navbarSchema = new mongoose.Schema({
    label: { 
        type: String, 
        required: [true, 'মেনুর নাম (যেমন: হোম, খেলাধুলা) দেওয়া বাধ্যতামূলক'] 
    },
    url: { 
        type: String, 
        required: [true, 'মেনুর লিংক বা রুট (যেমন: /sports) দেওয়া বাধ্যতামূলক'] 
    },
    order: { 
        type: Number, 
        default: 0 // মেনুগুলো কোনটির পর কোনটি বসবে তা সাজানোর জন্য (যেমন: ১, ২, ৩)
    }
});

module.exports = mongoose.model('Navbar', navbarSchema);