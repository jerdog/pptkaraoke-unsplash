const fs = require('fs');
const path = require('path');
import OpenAI from 'openai';

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Set this in Netlify environment variables
});

// Path to the original JSON file in the deployed directory
const talkTitlesPath = path.resolve(__dirname, 'talkTitles.json');
const aiTalkTitlesPath = path.resolve(process.cwd(), 'netlify/functions/aiTalkTitles.json');

// Path to the writable /tmp directory in Netlify Functions
const tmpTalkTitlesPath = path.resolve('/tmp', 'talkTitles.json');
const tmpAiTalkTitlesPath = path.resolve('/tmp', 'aiTalkTitles.json');

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Function to ensure JSON file exists in /tmp
function ensureTmpFile(originalPath, tmpPath) {
    if (!fs.existsSync(tmpPath)) {
        fs.copyFileSync(originalPath, tmpPath);
        console.log(`Copied ${originalPath} to ${tmpPath}`);
    }
}

// Function to read talk titles from the appropriate JSON file
function readTalkTitles(useAI = false) {
    const originalPath = useAI ? aiTalkTitlesPath : talkTitlesPath;
    const tmpPath = useAI ? tmpAiTalkTitlesPath : tmpTalkTitlesPath;

    try {
        ensureTmpFile(originalPath, tmpPath);
        const fileData = fs.readFileSync(tmpPath, 'utf8').trim();

        if (!fileData) throw new Error(`${useAI ? 'aiTalkTitles.json' : 'talkTitles.json'} is empty.`);

        return JSON.parse(fileData);
    } catch (error) {
        console.error(`Error reading ${useAI ? 'aiTalkTitles.json' : 'talkTitles.json'}:`, error.message);
        return [];
    }
}

// Function to write updated talk titles to JSON file
function writeTalkTitles(titles) {
    try {
        fs.writeFileSync(tmpTalkTitlesPath, JSON.stringify(titles, null, 2));
        console.log('Updated talkTitles.json successfully.');
    } catch (error) {
        console.error('Error writing to talkTitles.json:', error.message);
    }
}

// Generate a talk title using ChatGPT
async function generateAITalkTitle() {
    const prompts = readTalkTitles(true);
    if (prompts.length === 0) throw new Error('No AI prompts available in aiTalkTitles.json.');

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)].title;

    const response = await openai.chat.completions.create({
        model: 'gpt-4', // Or 'gpt-3.5-turbo', depending on your use case
        messages: [
            { role: 'system', content: 'You are a helpful assistant generating conference talk titles.' },
            { role: 'user', content: `Generate a new conference talk title based on this: "${randomPrompt}"` },
        ],
        max_tokens: 50,
    });

    if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content.trim();
    }

    throw new Error('Failed to generate AI talk title.');
}

// Function to get a talk title not used today
function getUnusedTalkTitle() {
    const today = getTodayDate();
    const titles = readTalkTitles();

    if (!titles || titles.length === 0) {
        throw new Error('No valid entries in talkTitles.json.');
    }

    let unusedTitle = titles.find(title => !title.last_used || title.last_used < today);

    if (!unusedTitle) {
        console.warn('All titles used today. Selecting a random fallback.');
        const randomIndex = Math.floor(Math.random() * titles.length);
        unusedTitle = titles[randomIndex];
    }

    unusedTitle.last_used = today;
    writeTalkTitles(titles);

    return unusedTitle.title;
}

// Netlify function handler
exports.handler = async (event, context) => {
    const useAI = event.queryStringParameters && event.queryStringParameters.ai === 'true';

    try {
        const title = useAI ? await generateAITalkTitle() : getUnusedTalkTitle();
        return {
            statusCode: 200,
            body: JSON.stringify({ title, date: getTodayDate() }),
        };
    } catch (error) {
        console.error('Error fetching talk title:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch talk title' }),
        };
    }
};
