const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String },
    category: { type: String, required: true },
    thumbnail_url: { type: String, required: true }, // ভিডিওর কভার ফটো
    video_url: { type: String, required: true },     // ইউটিউব বা ক্লাউড ভিডিও লিংক
    duration: { type: String, required: true },      // ভিডিওর দৈর্ঘ্য (যেমন: "05:20")
    published_date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
