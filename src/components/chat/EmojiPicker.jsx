// src/components/chat/EmojiPicker.jsx
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState('greetings');

    const emojiCategories = {
        greetings: {
            label: '👋 Greetings',
            emojis: ['👋', '🙋', '🙋‍♂️', '🙋‍♀️', '👏', '🤝', '✨']
        },
        love: {
            label: '❤️ Love',
            emojis: ['❤️', '💕', '💖', '🤟', '💝', '💗', '💓', '💞']
        },
        gestures: {
            label: '👍 Gestures',
            emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤙', '🤘', '🖖']
        },
        hands: {
            label: '✋ Hands',
            emojis: ['✋', '🖐️', '👐', '🙌', '🤲', '👏', '🙏', '🤝']
        },
        emotions: {
            label: '😊 Emotions',
            emojis: ['😊', '😢', '😡', '😍', '🥰', '😭', '😂', '🤗']
        },
        actions: {
            label: '💪 Actions',
            emojis: ['💪', '🤳', '📸', '✍️', '🎯', '🎨', '🎵', '📚']
        }
    };

    return (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-h-96 overflow-hidden z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sign Language Emojis</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FaTimes className="text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
                {Object.entries(emojiCategories).map(([key, category]) => (
                    <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors ${activeCategory === key
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {category.label.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Emoji Grid */}
            <div className="p-3 overflow-y-auto max-h-64">
                <div className="grid grid-cols-8 gap-2">
                    {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => onEmojiSelect(emoji)}
                            className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-all hover:scale-110 active:scale-95"
                            title={emoji}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;
