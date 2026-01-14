// src/utils/enhancedISLConverter.js
/**
 * Enhanced ISL Dictionary with ASL Grammar and Facial Expressions
 */

export const ENHANCED_ISL_DICTIONARY = {
    // Pronouns
    YOU: {
        duration: 800,
        bones: {
            RightArm: { x: -0.2, y: 0.1, z: -0.5 },
            RightForeArm: { x: -0.3, y: 0, z: 0 }
        },
        motion: "point_forward",
        face: { eyebrows: "neutral", mouth: "neutral", headTilt: 0 }
    },

    I: {
        duration: 700,
        bones: {
            RightArm: { x: -0.3, y: 0.2, z: -0.2 },
            RightForeArm: { x: -0.5, y: 0, z: 0 }
        },
        motion: "point_chest",
        face: { eyebrows: "neutral", mouth: "neutral" }
    },

    // WH-Questions
    WHO: {
        duration: 1200,
        bones: {
            RightArm: { x: 0.3, y: 0.4, z: -0.8 },
            RightForeArm: { x: -0.6, y: 0, z: 0 }
        },
        motion: "circular_shake",
        face: {
            eyebrows: "raised",
            mouth: "oo_shape",
            headTilt: 0.2
        }
    },

    WHAT: {
        duration: 1100,
        bones: {
            LeftArm: { x: 0.2, y: 0.3, z: 0.6 },
            RightArm: { x: 0.2, y: 0.3, z: -0.6 }
        },
        motion: "palms_up_shake",
        face: { eyebrows: "furrowed", mouth: "neutral" }
    },

    WHERE: {
        duration: 1000,
        bones: {
            RightArm: { x: 0.2, y: 0.5, z: -0.7 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "side_to_side",
        face: { eyebrows: "raised", mouth: "neutral", headTilt: 0.15 }
    },

    WHEN: {
        duration: 1000,
        bones: {
            RightArm: { x: 0.1, y: 0.4, z: -0.5 },
            RightForeArm: { x: -0.5, y: 0, z: 0 }
        },
        motion: "circle",
        face: { eyebrows: "raised", mouth: "neutral" }
    },

    WHY: {
        duration: 1100,
        bones: {
            RightArm: { x: 0.3, y: 0.5, z: -0.6 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "tap_forehead",
        face: { eyebrows: "furrowed", mouth: "neutral", headTilt: 0.1 }
    },

    HOW: {
        duration: 1000,
        bones: {
            LeftArm: { x: 0.3, y: 0.2, z: 0.5 },
            RightArm: { x: 0.3, y: 0.2, z: -0.5 }
        },
        motion: "twist",
        face: { eyebrows: "raised", mouth: "neutral" }
    },

    // Common Words
    NAME: {
        duration: 1000,
        bones: {
            RightArm: { x: 0.2, y: 0.3, z: -0.6 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "tap_fingers_twice",
        face: { eyebrows: "neutral", mouth: "slight_smile" }
    },

    MY: {
        duration: 600,
        bones: {
            RightArm: { x: -0.3, y: 0.1, z: -0.3 },
            RightForeArm: { x: -0.5, y: 0, z: 0 }
        },
        motion: "pat_chest",
        face: { eyebrows: "neutral", mouth: "neutral" }
    },

    YOUR: {
        duration: 700,
        bones: {
            RightArm: { x: -0.2, y: 0.2, z: -0.6 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "point_forward",
        face: { eyebrows: "neutral", mouth: "neutral" }
    },

    HELLO: {
        duration: 900,
        bones: {
            RightArm: { x: 0.2, y: 0.6, z: -1.0 },
            RightForeArm: { x: -0.3, y: 0, z: 0 }
        },
        motion: "wave",
        face: { eyebrows: "neutral", mouth: "smile", headTilt: 0 }
    },

    THANK_YOU: {
        duration: 1000,
        bones: {
            RightArm: { x: 0.1, y: 0.4, z: -0.5 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "chin_forward",
        face: { eyebrows: "neutral", mouth: "smile" }
    },

    PLEASE: {
        duration: 800,
        bones: {
            RightArm: { x: -0.2, y: 0.2, z: -0.4 },
            RightForeArm: { x: -0.5, y: 0, z: 0 }
        },
        motion: "chest_circle",
        face: { eyebrows: "neutral", mouth: "polite" }
    },

    SORRY: {
        duration: 900,
        bones: {
            RightArm: { x: -0.3, y: 0.2, z: -0.4 },
            RightForeArm: { x: -0.6, y: 0, z: 0 }
        },
        motion: "chest_circle",
        face: { eyebrows: "sad", mouth: "sad" }
    },

    YES: {
        duration: 700,
        bones: {
            RightArm: { x: 0.2, y: 0.4, z: -0.6 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "nod",
        face: { eyebrows: "neutral", mouth: "affirmative" }
    },

    NO: {
        duration: 700,
        bones: {
            RightArm: { x: 0.1, y: 0.3, z: -0.5 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "snap",
        face: { eyebrows: "neutral", mouth: "negative" }
    },

    GOOD: {
        duration: 800,
        bones: {
            RightArm: { x: 0.1, y: 0.4, z: -0.7 },
            RightForeArm: { x: -0.3, y: 0, z: 0 }
        },
        motion: "thumbs_up",
        face: { eyebrows: "neutral", mouth: "smile" }
    },

    FROM: {
        duration: 700,
        bones: {
            RightArm: { x: 0.2, y: 0.3, z: -0.5 },
            RightForeArm: { x: -0.4, y: 0, z: 0 }
        },
        motion: "pull_back",
        face: { eyebrows: "neutral", mouth: "neutral" }
    }
};

// ASL Grammar Rules
export const ASL_GRAMMAR = {
    sentenceStructure: "topic-comment",
    whQuestionRules: {
        eyebrowRaise: true,
        headTilt: "forward",
        holdLastSign: 300
    },
    yesNoQuestionRules: {
        eyebrowRaise: true,
        headTilt: "forward",
        holdLastSign: 200
    }
};

// Enhanced text to ISL conversion with ASL grammar
export function enhancedTextToISL(text) {
    const t = text.toLowerCase().trim();

    // ASL Grammar Translation Rules (WH-word goes at END in ASL)
    const translations = {
        // WH Questions
        "who are you": { signs: ["YOU", "WHO"], type: "wh_question" },
        "what is your name": { signs: ["YOUR", "NAME", "WHAT"], type: "wh_question" },
        "where are you from": { signs: ["YOU", "FROM", "WHERE"], type: "wh_question" },
        "how are you": { signs: ["YOU", "HOW"], type: "wh_question" },
        "why are you here": { signs: ["YOU", "HERE", "WHY"], type: "wh_question" },
        "when are you coming": { signs: ["YOU", "COMING", "WHEN"], type: "wh_question" },

        // Statements
        "my name is": { signs: ["MY", "NAME"], type: "statement" },
        "i am from": { signs: ["I", "FROM"], type: "statement" },
        "hello": { signs: ["HELLO"], type: "greeting" },
        "thank you": { signs: ["THANK_YOU"], type: "polite" },
        "please": { signs: ["PLEASE"], type: "polite" },
        "sorry": { signs: ["SORRY"], type: "polite" },
        "yes": { signs: ["YES"], type: "response" },
        "no": { signs: ["NO"], type: "response" },
        "good": { signs: ["GOOD"], type: "statement" }
    };

    // Find exact match
    if (translations[t]) {
        return {
            signs: translations[t].signs,
            grammarType: translations[t].type,
            nonManualMarkers: getNonManualMarkers(translations[t].type)
        };
    }

    // Fallback: word-by-word
    const words = t.replace(/[?!.,]/g, '').split(' ');
    const signs = words
        .map(w => w.toUpperCase().replace(/[^A-Z]/g, ''))
        .filter(w => ENHANCED_ISL_DICTIONARY[w]);

    return {
        signs,
        grammarType: t.includes('?') ? 'question' : 'statement',
        nonManualMarkers: getNonManualMarkers('statement')
    };
}

function getNonManualMarkers(type) {
    const markers = {
        eyebrows: "neutral",
        headTilt: 0,
        mouth: "neutral"
    };

    if (type === 'wh_question') {
        markers.eyebrows = "raised";
        markers.headTilt = 0.3;
        markers.mouth = "question";
    } else if (type === 'yesno_question') {
        markers.eyebrows = "raised";
        markers.headTilt = 0.2;
    } else if (type === 'polite') {
        markers.mouth = "polite";
    }

    return markers;
}

// Get sign sequence with timing
export function getEnhancedSignSequence(signs) {
    return signs.map((sign, index) => {
        const signData = ENHANCED_ISL_DICTIONARY[sign];
        return {
            sign,
            animation: signData || null,
            startTime: index * 2,
            duration: signData?.duration || 1000,
            index
        };
    });
}
