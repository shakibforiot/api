const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// মডেলসমূহ ইমপোর্ট করা
const Navbar = require('./models/Navbar');
const Article = require('./models/Article');

const app = express();

// --- মিডলওয়্যার কনফিগারেশন ---
app.use(cors()); 
app.use(express.json()); 

// --- মঙ্গোডিবি ক্লাউড ডাটাবেজ কানেকশন ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('🚀 মঙ্গোডিবি ক্লাউড ডাটাবেজ সফলভাবে কানেক্ট হয়েছে!'))
    .catch((err) => console.error('❌ ডাটাবেজ কানেকশনে সমস্যা:', err.message));

// বেস রুট চেক
app.get('/', (req, res) => {
    res.send('নিউজ পোর্টাল অ্যাডভান্সড এপিআই ইঞ্জিন সম্পূর্ণ সচল।');
});

// ==========================================
// 🧭 ১. NAVBAR API ENDPOINTS (মেনুবারের জন্য)
// ==========================================

// [POST] - ন্যাভবারে নতুন মেনু আইটেম যুক্ত করা
app.post('/api/v1/navbar', async (req, res) => {
    try {
        const newMenu = new Navbar(req.body);
        const savedMenu = await newMenu.save();
        res.status(201).json({ success: true, data: savedMenu });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// [GET] - সব মেনু আইটেম সিরিয়াল (order) অনুযায়ী দেখা
app.get('/api/v1/navbar', async (req, res) => {
    try {
        const menuItems = await Navbar.find().sort({ order: 1 });
        res.status(200).json({ success: true, totalMenus: menuItems.length, data: menuItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 新 [DELETE] - আইডি ধরে নির্দিষ্ট কোনো ন্যাভবার মেনু ডিলিট করা
app.delete('/api/v1/navbar/:id', async (req, res) => {
    try {
        const deletedMenu = await Navbar.findByIdAndDelete(req.params.id);
        if (!deletedMenu) {
            return res.status(404).json({ success: false, message: 'ডিলিট করার মতো কোনো মেনু পাওয়া যায়নি' });
        }
        res.status(200).json({ success: true, message: 'ন্যাভবার মেনুটি সফলভাবে ডিলিট করা হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 新 [PUT/PATCH] - আইডি ধরে নির্দিষ্ট কোনো ন্যাভবার মেনু এডিট বা আপডেট করা
app.put('/api/v1/navbar/:id', async (req, res) => {
    try {
        const updatedMenu = await Navbar.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // নতুন ডেটা রিটার্ন করবে এবং ভ্যালিডেশন চেক করবে
        );
        if (!updatedMenu) {
            return res.status(404).json({ success: false, message: 'আপডেট করার মতো কোনো মেনু পাওয়া যায়নি' });
        }
        res.status(200).json({ success: true, message: 'ন্যাভবার মেনুটি সফলভাবে আপডেট করা হয়েছে', data: updatedMenu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ==========================================
// 📰 ২. ARTICLE API ENDPOINTS (খবর ও ইমেজের জন্য)
// ==========================================

// 新 [GET] - অ্যাডমিনের জন্য সব পোস্টের শুধু ID, Title ও Category দেখা (পেজিনেশন ছাড়া)
app.get('/api/v1/admin/posts-list', async (req, res) => {
    try {
        // .select('title category') দেওয়ার কারণে ডাটাবেজ থেকে অপ্রয়োজনীয় বড় সামারি বা ছবি লোড হবে না, শুধু আইডি ও টাইটেল আসবে
        const posts = await Article.find().select('title category').sort({ createdAt: -1 });
        res.status(200).json({ success: true, totalPosts: posts.length, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// [POST] - নতুন খবর/আর্টিকেল যুক্ত করা
app.post('/api/v1/articles', async (req, res) => {
    try {
        const newArticle = new Article(req.body);
        const savedArticle = await newArticle.save();
        res.status(201).json({ success: true, data: savedArticle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// [GET] - সব খবর পেজ অনুযায়ী দেখা (Pagination & Category Filter সহ)
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

// [GET] - নির্দিষ্ট ১টি আর্টিকেলের বিস্তারিত বিবরণ দেখা (Details by ID)
app.get('/api/v1/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'আর্টিকেলটি খুঁজে পাওয়া যায়নি' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// [DELETE] - আইডি ধরে নির্দিষ্ট ১টি আর্টিকেল ডাটাবেজ থেকে ডিলিট করা
app.delete('/api/v1/articles/:id', async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        if (!deletedArticle) {
            return res.status(404).json({ success: false, message: 'ডিলিট করার মতো কোনো আর্টিকেল পাওয়া যায়নি' });
        }
        res.status(200).json({ success: true, message: 'আর্টিকেলটি সফলভাবে ডিলিট করা হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// [GET] - ডাটাবেজে থাকা সমস্ত ইউনিক ক্যাটাগরির লিস্ট বের করা
app.get('/api/v1/categories', async (req, res) => {
    try {
        const categories = await Article.distinct('category');
        res.status(200).json({ success: true, totalCategories: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- সার্ভার পোর্ট লিসেনিং ও রেন্ডার বাইন্ডিং ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`💻 সার্ভারটি সচল আছে পোর্ট নম্বর: ${PORT}-এ`));
