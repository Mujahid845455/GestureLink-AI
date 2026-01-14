// src/utils/islConverter.js

/**
 * ISL Sign Dictionary
 * Maps ISL words to animation data
 */
export const ISL_SIGN_DICTIONARY = {
    "HELLO": {
        handShape: "wave",
        motion: "side-to-side",
        facialExpression: "smile",
        description: "Wave hand side to side"
    },
    "YOU": {
        handShape: "point",
        motion: "forward",
        facialExpression: "neutral",
        description: "Point finger forward"
    },
    "WHO": {
        handShape: "index",
        motion: "rotate",
        facialExpression: "question",
        description: "Index finger rotate with raised eyebrows"
    },
    "HOW": {
        handShape: "flat",
        motion: "twist",
        facialExpression: "question",
        description: "Flat hands twist with questioning look"
    },
    "MY": {
        handShape: "flat",
        motion: "chest-tap",
        facialExpression: "neutral",
        description: "Flat hand tap on chest"
    },
    "NAME": {
        handShape: "H-shape",
        motion: "cross",
        facialExpression: "neutral",
        description: "H-shaped hands cross"
    },
    "THANK-YOU": {
        handShape: "flat",
        motion: "chin-forward",
        facialExpression: "smile",
        description: "Flat hand from chin forward"
    },
    "GOOD": {
        handShape: "thumbs-up",
        motion: "upward",
        facialExpression: "smile",
        description: "Thumbs up gesture"
    },
    "MORNING": {
        handShape: "flat",
        motion: "sunrise",
        facialExpression: "neutral",
        description: "Flat hand rising like sun"
    },
    "WHAT": {
        handShape: "open",
        motion: "shake",
        facialExpression: "question",
        description: "Open hands shake with questioning look"
    },
    "WHERE": {
        handShape: "point",
        motion: "side-to-side",
        facialExpression: "question",
        description: "Point finger side to side"
    },
    "WHEN": {
        handShape: "index",
        motion: "circle",
        facialExpression: "question",
        description: "Index finger circle motion"
    },
    "SORRY": {
        handShape: "fist",
        motion: "chest-circle",
        facialExpression: "sad",
        description: "Fist circles on chest"
    },
    "PLEASE": {
        handShape: "flat",
        motion: "chest-circle",
        facialExpression: "polite",
        description: "Flat hand circles on chest"
    },
    "YES": {
        handShape: "fist",
        motion: "nod",
        facialExpression: "affirmative",
        description: "Fist nods up and down"
    },
    "NO": {
        handShape: "fingers",
        motion: "snap",
        facialExpression: "negative",
        description: "Fingers snap together"
    }
};

/**
 * Predefined sentence mappings
 * English → ISL Gloss
 */
export const PREDEFINED_SENTENCES = [
    {
        id: 1,
        english: "Hello",
        islGloss: "HELLO",
        signs: ["HELLO"],
        category: "greetings"
    },
    {
        id: 2,
        english: "How are you?",
        islGloss: "YOU HOW?",
        signs: ["YOU", "HOW"],
        category: "greetings"
    },
    {
        id: 3,
        english: "Who are you?",
        islGloss: "YOU WHO?",
        signs: ["YOU", "WHO"],
        category: "questions"
    },
    {
        id: 4,
        english: "What is your name?",
        islGloss: "YOUR NAME WHAT?",
        signs: ["YOU", "NAME", "WHAT"],
        category: "questions"
    },
    {
        id: 5,
        english: "My name is...",
        islGloss: "MY NAME",
        signs: ["MY", "NAME"],
        category: "introduction"
    },
    {
        id: 6,
        english: "Thank you",
        islGloss: "THANK-YOU",
        signs: ["THANK-YOU"],
        category: "greetings"
    },
    {
        id: 7,
        english: "Good morning",
        islGloss: "MORNING GOOD",
        signs: ["MORNING", "GOOD"],
        category: "greetings"
    },
    {
        id: 8,
        english: "Please",
        islGloss: "PLEASE",
        signs: ["PLEASE"],
        category: "polite"
    },
    {
        id: 9,
        english: "Sorry",
        islGloss: "SORRY",
        signs: ["SORRY"],
        category: "polite"
    },
    {
        id: 10,
        english: "Yes",
        islGloss: "YES",
        signs: ["YES"],
        category: "responses"
    },
    {
        id: 11,
        english: "No",
        islGloss: "NO",
        signs: ["NO"],
        category: "responses"
    },
    {
        id: 12,
        english: "Where are you?",
        islGloss: "YOU WHERE?",
        signs: ["YOU", "WHERE"],
        category: "questions"
    }
];

/**
 * Convert English text to ISL gloss
 * @param {string} text - English text
 * @returns {object} - { islGloss, signs, isCustom }
 */
export function textToISLGloss(text) {
    // Normalize text
    const normalizedText = text.trim().toLowerCase();

    // Check if it's a predefined sentence
    const predefined = PREDEFINED_SENTENCES.find(
        s => s.english.toLowerCase() === normalizedText
    );

    if (predefined) {
        return {
            islGloss: predefined.islGloss,
            signs: predefined.signs,
            isCustom: false,
            category: predefined.category
        };
    }

    // For custom text, do basic word-by-word conversion
    // This is a simplified Level 1 implementation
    const words = normalizedText
        .replace(/[?!.,]/g, '')
        .split(' ')
        .map(w => w.toUpperCase());

    // Filter only words that exist in dictionary
    const validSigns = words.filter(word => ISL_SIGN_DICTIONARY[word]);

    return {
        islGloss: validSigns.join(' '),
        signs: validSigns,
        isCustom: true,
        category: 'custom'
    };
}

/**
 * Get sign animation data
 * @param {string} signWord - ISL sign word
 * @returns {object} - Animation data
 */
export function getSignAnimation(signWord) {
    return ISL_SIGN_DICTIONARY[signWord] || null;
}

/**
 * Get sign sequence with timing
 * @param {array} signs - Array of sign words
 * @returns {array} - Array of sign objects with timing
 */
export function getSignSequence(signs) {
    return signs.map((sign, index) => ({
        sign,
        animation: getSignAnimation(sign),
        startTime: index * 2, // 2 seconds per sign
        duration: 2,
        index
    }));
}
