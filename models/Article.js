const mongoose = require('mongoose');

// ডাটাবেজে একটি আর্টিকেলের ভেতরে কী কী থাকবে তা ঠিক করা
const articleSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true // শিরোনাম ছাড়া কোনো পোস্ট সেভ হবে না
    },
    summary: { 
        type: String, 
        required: true // কার্ডের ভেতরের ছোট বিবরণ বা সাব-টাইটেল
    },
    category: { 
        type: String, 
        required: true // যেমন: "খেলাধুলা", "ইতিহাস", "বিজ্ঞান"
    },
    thumbnail_url: { 
        type: String, 
        required: true // কার্ডের ওপরে যে ছবিটা দেখা যাচ্ছে, সেটার ইন্টারনেট লিংক
    },
    published_date: { 
        type: String, 
        default: "জানুয়ারি ২০, ২০২৬" // খবরের তারিখ
    }
}, { timestamps: true }); // এটা দিলে পোস্টটি কখন তৈরি হলো (createdAt) তা অটো সেভ হয়ে যায়

module.exports = mongoose.model('Article', articleSchema);
