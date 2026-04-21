const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile'; // Free, very capable model

function buildSystemPrompt(profile) {
  if (!profile) {
    return `You are an expert AI personal fitness coach, nutritionist, psychologist, and life optimizer.
You speak in a supportive, energetic, but honest tone.
Never give generic advice — personalize everything.
If the user misses a workout or eats badly, don't judge — help them get back on track.
Always explain WHY you recommend something.
Be their coach, nutritionist, therapist, and biggest fan — all in one.`;
  }

  const goalMap = {
    lose_fat: 'Lose Fat',
    build_muscle: 'Build Muscle',
    get_fit: 'Get Fit',
    improve_endurance: 'Improve Endurance',
  };
  const locationMap = {
    home_no_equipment: 'Home (no equipment)',
    home_with_equipment: 'Home (with equipment)',
    gym: 'Gym',
    mixed: 'Mixed (home + gym)',
  };

  return `You are an expert AI personal fitness coach, nutritionist, psychologist, and life optimizer.

Your client's profile:
- Name: ${profile.user?.name || 'User'}
- Age: ${profile.age} years old
- Weight: ${profile.weight} kg | Height: ${profile.height} cm
- Gender: ${profile.gender}
- Primary Goal: ${goalMap[profile.primaryGoal] || profile.primaryGoal}
- Fitness Level: ${profile.fitnessLevel}
- Training Location: ${locationMap[profile.trainingLocation] || profile.trainingLocation}
- Training Days/Week: ${profile.trainingDaysPerWeek}
- Wake Up: ${profile.wakeUpTime} | Sleep: ${profile.sleepTime}
- Injuries: ${profile.injuries || 'None'}
- Allergies: ${profile.allergies || 'None'}
- Dietary Restrictions: ${profile.dietaryRestrictions || 'None'}

RULES:
- Always speak in a supportive, energetic, but honest tone
- NEVER give generic advice — everything must be personalized to this specific person
- If they miss a workout or eat badly, don't judge — help them get back on track
- Always explain WHY you recommend something
- Be their coach, nutritionist, therapist, and biggest fan — all in one
- Track their progress over time based on conversation history
- Celebrate their wins — big and small!
- When generating workout or meal plans, format them clearly with structured data`;
}

async function callGroq(messages, maxTokens = 2048) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages,
  });
  return response.choices[0].message.content;
}

async function chat(messages, profile, options = {}) {
  const systemPrompt = buildSystemPrompt(profile);
  const { maxTokens = 2048 } = options;

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return callGroq(groqMessages, maxTokens);
}

async function generateTrainingProgram(profile) {
  const prompt = `Generate a complete 30-day training program for my client with this profile:
- Goal: ${profile.primaryGoal}
- Level: ${profile.fitnessLevel}
- Location: ${profile.trainingLocation}
- Training days/week: ${profile.trainingDaysPerWeek}
- Injuries: ${profile.injuries || 'None'}

Return a JSON array with exactly 30 objects, one per day. Each object:
{
  "day": <number 1-30>,
  "weekNumber": <1-4>,
  "type": <"strength"|"cardio"|"flexibility"|"endurance"|"rest"|"active_recovery">,
  "title": "<workout title>",
  "duration": <minutes>,
  "exercises": [
    {
      "name": "<exercise name>",
      "sets": <number>,
      "reps": "<e.g. 12-15 or 45 seconds>",
      "rest": "<e.g. 60 seconds>",
      "description": "<how to perform>",
      "muscleGroup": "<target muscle>",
      "equipment": "<equipment needed>"
    }
  ],
  "notes": "<coaching note for this day>"
}

For rest days, exercises array should be empty.
Progressive overload: increase intensity each week.
Return ONLY the JSON array, no other text.`;

  const text = await callGroq([{ role: 'user', content: prompt }], 8000);
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse training program JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateMealPlan(profile) {
  const bmr =
    profile.gender === 'male'
      ? 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age
      : 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age;

  const activityMultiplier =
    profile.trainingDaysPerWeek <= 2 ? 1.375 :
    profile.trainingDaysPerWeek <= 4 ? 1.55 :
    profile.trainingDaysPerWeek <= 6 ? 1.725 : 1.9;

  const tdee = Math.round(bmr * activityMultiplier);
  const targetCalories =
    profile.primaryGoal === 'lose_fat' ? tdee - 400 :
    profile.primaryGoal === 'build_muscle' ? tdee + 300 : tdee;

  const prompt = `Generate a 7-day meal plan template (repeated for 30 days) for:
- Goal: ${profile.primaryGoal}
- Daily calorie target: ${targetCalories} kcal
- Dietary restrictions: ${profile.dietaryRestrictions || 'None'}
- Allergies: ${profile.allergies || 'None'}

Return a JSON array of 7 day templates. Each day:
{
  "day": <1-7>,
  "meals": [
    {
      "type": <"breakfast"|"lunch"|"dinner"|"snack">,
      "name": "<meal name>",
      "ingredients": ["<ingredient with quantity>"],
      "preparation": "<step by step preparation>",
      "portionSize": "<portion description>",
      "protein": <grams>,
      "carbs": <grams>,
      "fats": <grams>,
      "calories": <kcal>
    }
  ],
  "totalProtein": <grams>,
  "totalCarbs": <grams>,
  "totalFats": <grams>,
  "totalCalories": <kcal>
}

Budget-friendly, easy-to-cook meals. Return ONLY the JSON array.`;

  const text = await callGroq([{ role: 'user', content: prompt }], 8000);
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse meal plan JSON');
  const weekTemplate = JSON.parse(jsonMatch[0]);

  const thirtyDays = [];
  for (let i = 0; i < 30; i++) {
    const template = weekTemplate[i % 7];
    thirtyDays.push({ ...template, day: i + 1 });
  }
  return { days: thirtyDays, dailyCalorieTarget: targetCalories };
}

async function analyzeFoodLog(entries, profile, targets) {
  const summary = entries.map((e) => `${e.name} (${e.quantity}): ${e.calories} kcal, ${e.protein}g protein`).join('\n');

  const prompt = `My client logged these foods today:
${summary}

Totals: ${targets.totalCalories} kcal, ${targets.totalProtein}g protein, ${targets.totalCarbs}g carbs, ${targets.totalFats}g fats
Daily targets: ~${targets.calorieTarget} kcal, ~${targets.proteinTarget}g protein
Profile: ${profile.primaryGoal}, ${profile.weight}kg, ${profile.fitnessLevel}

Give a short analysis (3-4 sentences):
1. Was it enough/too much for their goal?
2. What macros are they missing?
3. What should they eat for the rest of the day?
Be specific and encouraging.`;

  return callGroq([{ role: 'user', content: prompt }], 512);
}

async function analyzeSleep(sleepHours, profile) {
  const prompt = `My client slept ${sleepHours} hours last night.
Their goal is ${profile.primaryGoal}. They train ${profile.trainingDaysPerWeek} days/week.
Give a 2-3 sentence analysis: was it enough for recovery? Include 1 specific tip to improve sleep quality.`;

  return callGroq([{ role: 'user', content: prompt }], 256);
}

async function generateMentalCoaching(motivationLevel, mood, notes, profile) {
  const prompt = `My client's mental check-in today:
- Motivation: ${motivationLevel}/10
- Mood: ${mood}
- Notes: "${notes || 'none'}"
- Goal: ${profile.primaryGoal}

${motivationLevel <= 4 ? 'They need extra support and motivation.' : 'Celebrate their positive energy!'}
Give a short, personalized coaching message (3-5 sentences). Be their biggest fan!`;

  return callGroq([{ role: 'user', content: prompt }], 300);
}

async function generateWeeklyReport(data, profile) {
  const missedWorkouts = data.workoutsPlanned - data.workoutsCompleted;
  const calorieGap = data.calorieTarget - data.avgCalories;
  const sleepDeficit = 7.5 - data.avgSleep;

  const prompt = `You are a strict but caring AI fitness coach. Generate a deep weekly accountability report for your client.

CLIENT DATA THIS WEEK:
- Workouts: ${data.workoutsCompleted}/${data.workoutsPlanned} completed (${missedWorkouts} missed)
- Avg daily calories: ${data.avgCalories} kcal (target: ${data.calorieTarget}, gap: ${Math.abs(calorieGap)} kcal ${calorieGap > 0 ? 'under' : 'over'})
- Avg daily protein: ${data.avgProtein}g
- Avg sleep: ${data.avgSleep} hours (deficit: ${sleepDeficit > 0 ? sleepDeficit.toFixed(1) + 'h below optimal' : 'on track'})
- Avg motivation: ${data.avgMotivation}/10
- Days logged food: ${data.daysLoggedFood || 0}/7
- Days logged sleep: ${data.daysLoggedSleep || 0}/7
- Days checked in mentally: ${data.daysCheckedIn || 0}/7
- Goal: ${profile.primaryGoal} | Level: ${profile.fitnessLevel}

GENERATE A REPORT with:
1. "summary" — 3-4 sentence honest but motivating overview of the week
2. "whatWentWrong" — array of exactly what failed (be specific, not generic)
3. "whyItMatters" — explain WHY each failure affects their goal
4. "top3Improvements" — 3 CONCRETE action steps for next week (with exact numbers/times)
5. "nextWeekPlan" — a short daily focus plan for next week (Mon-Sun, one sentence each)
6. "overallProgressRating" — 1-10
7. "mentalWellnessScore" — 1-10
8. "coachMessage" — a personal, emotional motivational message (2-3 sentences)

Return ONLY valid JSON object, no other text:
{
  "summary": "...",
  "whatWentWrong": ["...", "..."],
  "whyItMatters": ["...", "..."],
  "top3Improvements": ["...", "...", "..."],
  "nextWeekPlan": {"monday":"...","tuesday":"...","wednesday":"...","thursday":"...","friday":"...","saturday":"...","sunday":"..."},
  "overallProgressRating": <1-10>,
  "mentalWellnessScore": <1-10>,
  "coachMessage": "..."
}`;

  const text = await callGroq([{ role: 'user', content: prompt }], 1024);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse report JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateMotivationalMessage(profile) {
  const styles = ['gym poster quote', 'Instagram caption', 'challenge announcement', 'coach pep talk'];
  const style = styles[Math.floor(Math.random() * styles.length)];

  const prompt = `Create a short motivational message in the style of a "${style}" for someone with goal: ${profile.primaryGoal}, level: ${profile.fitnessLevel}. Max 3 sentences. Make it FIRE!`;

  const message = await callGroq([{ role: 'user', content: prompt }], 150);
  return { message, style };
}

async function secretaryChat(messages, coaches, userProfile) {
  const coachesList = coaches.map((c, i) =>
    `COACH ${i + 1}:
  - ID: ${c._id}
  - Name: ${c.fullName}
  - Main Specialty: ${c.mainSpecialty}
  - All Specialties: ${c.specialties?.join(', ')}
  - Experience: ${c.experience} years
  - Rating: ${c.avgRating}/5 (${c.totalReviews} reviews)
  - City: ${c.city}
  - Session Types: ${c.sessionTypes?.join(', ')}
  - Price: ${c.pricePerSession}€/session${c.monthlyPackage ? ` | ${c.monthlyPackage}€/month` : ''}
  - Languages: ${c.languages?.join(', ') || 'Not specified'}
  - Bio: ${c.bio?.slice(0, 150)}...`
  ).join('\n\n');

  const clientInfo = userProfile
    ? `CLIENT PROFILE: ${userProfile.primaryGoal}, ${userProfile.fitnessLevel} level, ${userProfile.age} years, ${userProfile.gender}`
    : 'CLIENT PROFILE: Not set yet';

  const systemPrompt = `You are a professional AI receptionist/secretary for a premium coaching platform called "Persona AI Trainer".

Your job:
1. Warmly greet new clients and understand their needs
2. Ask smart questions to understand their goal, budget, preference (online/in-person), gender preference
3. Recommend the TOP 3 best-matched coaches from the list below
4. Explain WHY each coach is a good fit
5. Help them book a session by telling them to click the coach card

AVAILABLE COACHES ON THE PLATFORM:
${coaches.length > 0 ? coachesList : 'No coaches available yet — tell the client we are onboarding new coaches soon.'}

${clientInfo}

RULES:
- Be warm, professional, and efficient like a real luxury reception
- Never reveal private client data
- If no coach matches perfectly, suggest the closest match and explain
- When recommending coaches, output a special JSON block at the END of your message like this (only when recommending):
  COACHES_JSON:[{"id":"...","name":"...","reason":"why this coach"}]
- Keep responses concise — max 4 sentences before asking a follow-up question
- Speak in the same language as the client (English/German/French/Arabic)`;

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  return callGroq(groqMessages, 1024);
}

async function analyzeMealPhoto(base64Image, mimeType) {
  const response = await client.chat.completions.create({
    model: 'llama-3.2-11b-vision-preview',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
          {
            type: 'text',
            text: `Analyze this food photo and estimate the nutritional values.
Return ONLY a valid JSON object (no other text):
{
  "name": "<food name, be specific>",
  "quantity": "<estimated portion e.g. 200g or 1 plate>",
  "calories": <number>,
  "protein": <grams as number>,
  "carbs": <grams as number>,
  "fats": <grams as number>,
  "confidence": "<high|medium|low>",
  "notes": "<optional short note about the estimation>"
}
If you cannot identify food in the image, return: {"error": "No food detected"}`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse AI response');
  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  chat,
  generateTrainingProgram,
  generateMealPlan,
  analyzeFoodLog,
  analyzeSleep,
  generateMentalCoaching,
  generateWeeklyReport,
  generateMotivationalMessage,
  secretaryChat,
  analyzeMealPhoto,
};
