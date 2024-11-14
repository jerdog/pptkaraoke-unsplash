const fs = require('fs');
const path = require('path');

// // Mock database of talk titles
// const talkTitles = [
//     'Nature and Technology',
//     'The Art of Simplicity',
//     'Innovations in AI',
//     'Future of Work',
//     'Cloud Computing Trends',
//     'Data-Driven Development',
//     'Developer Experience Matters',
//     'Open Source Power',
//     'Scaling Microservices',
//     'The Ethics of AI'
// ];

// Path to the JSON file for storing the daily talk title
const talkTitlesPath = path.resolve(process.cwd(), 'netlify/functions/talkTitles.json');

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// // Function to get a new random talk title
// function getRandomTalkTitle() {
//     const randomIndex = Math.floor(Math.random() * talkTitles.length);
//     return talkTitles[randomIndex];
// }

// Function to read talk titles from JSON file
function readTalkTitles() {
    try {
        if (fs.existsSync(talkTitlesPath)) {
            const fileData = fs.readFileSync(talkTitlesPath, 'utf8').trim();
            
            if (!fileData) {
                throw new Error('talkTitles.json is empty.');
            }

            return JSON.parse(fileData);
        } else {
            throw new Error('talkTitles.json file does not exist.');
        }
    } catch (error) {
        console.error('Error reading talkTitles.json:', error.message);
        return []; // Return an empty array if the file is empty or malformed
    }
}

// Function to write updated talk titles to JSON file
function writeTalkTitles(titles) {
    try {
        fs.writeFileSync(talkTitlesPath, JSON.stringify(titles, null, 2));
        console.log('Updated talkTitles.json successfully.');
    } catch (error) {
        console.error('Error writing to talkTitles.json:', error.message);
    }
}

// Function to get a talk title not used today
function getUnusedTalkTitle() {
    const today = getTodayDate();
    const titles = readTalkTitles();

    if (!titles || titles.length === 0) {
        throw new Error('The talkTitles.json file is empty or not properly formatted.');
    }

    // Find a title with last_used earlier than today or null
    let unusedTitle = titles.find(title => !title.last_used || title.last_used < today);

    if (!unusedTitle) {
        // If no such title is found, fallback to a random title
        console.warn('All titles have been used today. Falling back to a random title.');
        const randomIndex = Math.floor(Math.random() * titles.length);
        unusedTitle = titles[randomIndex];
    }

    if (unusedTitle) {
        // Update its last_used date to today
        unusedTitle.last_used = today;

        // Write the updated titles back to the JSON file
        writeTalkTitles(titles);

        return unusedTitle.title;
    }

    throw new Error('No valid talk title found.');
}


// Netlify function handler
exports.handler = async (event, context) => {
    try {
        const title = getUnusedTalkTitle();
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
