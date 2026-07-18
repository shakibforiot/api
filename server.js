const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// মডেলগুলো ইমপোর্ট করা
const Article = require('./models/Article');
const Navbar = require('./models/Navbar'); // ন্যাভবার মডেল

const app = express();

// ১. মিডলওয়্যার কনফিগারেশন
app.use(cors()); 
app.use(express.json()); 

// ২. মঙ্গোডিবি ডাটাবেজ কানেকশন
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roar_bangla_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('🚀 Database connect'))
    .catch((err) => console.error('❌ ডাটাবেজ কানেকশনে সমস্যা:', err.message));

// বেস রুট
app.get('/', (req, res) => {
    res.send('নিউজ পোর্টাল এপিআই সার্ভার সচল আছে।');
});

// ==========================================
// 🔥 ARTICLE API ENDPOINTS (খবরের জন্য)
// ==========================================

// [POST] - নতুন খবর যুক্ত করা
app.post('/api/v1/articles', async (req, res) => {
    try {
        const newArticle = new Article(req.body);
        const savedArticle = await newArticle.save();
        res.status(201).json({ success: true, data: savedArticle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// [GET] - সব খবর পেজ অনুযায়ী দেখা
app.get('/api/v1/articles', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const category = req.query.category;

        let queryFilter = {};
        if (category) queryFilter.category = category;

        const skipIndex = (page - 1) * limit;
        const articles = await Article.find(queryFilter).sort({ createdAt: -1 }).skip(skipIndex).limit(limit);
        const totalArticles = await Article.countDocuments(queryFilter);

        res.status(200).json({
            success: true,
            meta: { totalItems: totalArticles, currentPage: page, totalPages: Math.ceil(totalArticles / limit) },
            data: articles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ==========================================
// 🧭 NAVBAR API ENDPOINTS (মেনুবারের জন্য)
// ==========================================

// ১. [POST API] - ন্যাভবারে নতুন মেনু আইটেম যুক্ত করা (Admin panel থেকে করার জন্য)
app.post('/api/v1/navbar', async (req, res) => {
    try {
        const { label, url, order } = req.body;

        const newMenuItem = new Navbar({
            label,
            url,
            order
        });

        const savedMenuItem = await newMenuItem.save();
        res.status(201).json({
            success: true,
            message: 'ন্যাভবার আইটেমটি সফলভাবে যুক্ত হয়েছে।',
            data: savedMenuItem
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ২. [GET API] - সব মেনু আইটেম সিরিয়াল অনুযায়ী ফ্রন্টএন্ডে পাঠানো
app.get('/api/v1/navbar', async (req, res) => {
    try {
        // .sort({ order: 1 }) দেওয়ার কারণে ১, ২, ৩ এভাবে ছোট থেকে বড় সিরিয়ালে মেনু আসবে
        const menuItems = await Navbar.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            totalMenus: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'server not load',
            error: error.message
        });
    }
});

// সার্ভার পোর্ট লিসেনিং
const PORT = process.env.PORT || 10000; // রেন্ডার সাধারণত ১০০০০ পোর্ট ব্যবহার করে
app.listen(PORT, '0.0.0.0', () => {
    console.log(`💻 server is raning: ${PORT}-`);
});
