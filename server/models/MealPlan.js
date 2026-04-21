const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  name: String,
  ingredients: [String],
  preparation: String,
  portionSize: String,
  protein: Number,   // grams
  carbs: Number,     // grams
  fats: Number,      // grams
  calories: Number,
});

const mealDaySchema = new mongoose.Schema({
  day: Number,
  date: Date,
  meals: [mealSchema],
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  totalCalories: Number,
  notes: String,
});

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: Number,
  year: Number,
  goal: String,
  dailyCalorieTarget: Number,
  dailyProteinTarget: Number,
  days: [mealDaySchema],
  generatedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);
