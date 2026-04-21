const ChatHistory = require('../models/ChatHistory');
const UserProfile = require('../models/UserProfile');
const claude = require('../services/claudeService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, messageType = 'general' } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const profile = await UserProfile.findOne({ user: req.user._id }).populate('user', 'name');

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ user: req.user._id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ user: req.user._id, messages: [] });
    }

    // Add user message
    chatHistory.messages.push({ role: 'user', content: message, messageType });

    // Keep last 20 messages for context (to avoid token limits)
    const recentMessages = chatHistory.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await claude.chat(recentMessages, profile);

    // Save AI response
    chatHistory.messages.push({ role: 'assistant', content: aiResponse, messageType });
    await chatHistory.save();

    res.json({ success: true, message: aiResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ user: req.user._id });
    const messages = chatHistory?.messages || [];
    // Return last 50 messages for display
    res.json({ success: true, messages: messages.slice(-50) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearChat = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate({ user: req.user._id }, { messages: [] });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMotivationalMessage = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json({ success: true, message: 'Keep pushing — every rep counts! 💪' });
    }
    const result = await claude.generateMotivationalMessage(profile);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDailyBriefing = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id }).populate('user', 'name');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const message = `Good morning ${profile.user.name}! Give me today's briefing based on my profile. Include: today's workout reminder, meal plan reminder, and one motivational message to start the day strong!`;

    const chatHistory = await ChatHistory.findOne({ user: req.user._id });
    const recentMessages = (chatHistory?.messages || []).slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    recentMessages.push({ role: 'user', content: message });

    const briefing = await claude.chat(recentMessages, profile);
    res.json({ success: true, briefing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
