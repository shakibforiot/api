const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },       // কার্ডে দেখানোর ছোট বিবরণ
    category: { type: String, required: true },
    thumbnail_url: { type: String, required: true },  // কার্ডের কভার ছবি
    published_date: { type: String, required: true },
    
    // 🔥 আপনার রিকোয়েস্ট অনুযায়ী নতুন ৪টি ফিল্ড যুক্ত করা হলো:
    description: { type: String, required: true },    // খবরের মূল বিস্তারিত বড় লেখা
    about: { type: String, default: "" },             // খবরটি সম্পর্কে অতিরিক্ত তথ্য
    author_name: { type: String, required: true },    // লেখকের নাম
    author_photo: { type: String, required: true }    // লেখকের প্রোফাইল পিকচারের লিংক
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
