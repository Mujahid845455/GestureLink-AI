// src/components/learning/LearningWindow.jsx
import React, { useState } from 'react';
import { FaGraduationCap, FaArrowLeft, FaPlay, FaClock, FaSearch } from 'react-icons/fa';

const LearningWindow = ({ onBack }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Tutorial data
    const tutorials = [
        {
            id: 1,
            title: "ASL Alphabet - A to Z",
            description: "Learn all 26 letters of the American Sign Language alphabet with clear demonstrations",
            videoUrl: "https://www.youtube.com/embed/tkMg8g8vVUo",
            category: "alphabet",
            difficulty: "beginner",
            duration: "8 min",
            thumbnail: "https://img.youtube.com/vi/tkMg8g8vVUo/maxresdefault.jpg"
        },
        {
            id: 2,
            title: "Basic Conversation in ASL",
            description: "Learn how to have simple conversations in American Sign Language",
            videoUrl: "https://www.youtube.com/embed/v1desDduz5M",
            category: "phrases",
            difficulty: "beginner",
            duration: "10 min",
            thumbnail: "https://img.youtube.com/vi/v1desDduz5M/maxresdefault.jpg"
        },
        {
            id: 3,
            title: "Common Greetings",
            description: "Learn essential greetings: Hello, Goodbye, Good Morning, Thank You",
            videoUrl: "https://www.youtube.com/embed/0FcwzMq4iWg",
            category: "greetings",
            difficulty: "beginner",
            duration: "6 min",
            thumbnail: "https://img.youtube.com/vi/0FcwzMq4iWg/maxresdefault.jpg"
        },
        {
            id: 4,
            title: "Basic Phrases",
            description: "Essential phrases: Yes, No, Please, Sorry, Excuse Me, You're Welcome",
            videoUrl: "https://www.youtube.com/embed/ianCxd71xIo",
            category: "phrases",
            difficulty: "beginner",
            duration: "7 min",
            thumbnail: "https://img.youtube.com/vi/ianCxd71xIo/maxresdefault.jpg"
        },
        {
            id: 5,
            title: "Family Signs",
            description: "Learn to sign family members: Mother, Father, Sister, Brother, Baby",
            videoUrl: "https://www.youtube.com/embed/5fR2OgGbKds",
            category: "phrases",
            difficulty: "beginner",
            duration: "6 min",
            thumbnail: "https://img.youtube.com/vi/5fR2OgGbKds/maxresdefault.jpg"
        },
        {
            id: 6,
            title: "Colors in ASL",
            description: "Master basic color signs: Red, Blue, Green, Yellow, Black, White",
            videoUrl: "https://www.youtube.com/embed/tkMg8g8vVUo",
            category: "phrases",
            difficulty: "beginner",
            duration: "5 min",
            thumbnail: "https://img.youtube.com/vi/tkMg8g8vVUo/maxresdefault.jpg"
        },
        {
            id: 7,
            title: "Days of the Week",
            description: "Learn to sign all seven days of the week in ASL",
            videoUrl: "https://www.youtube.com/embed/0FcwzMq4iWg",
            category: "phrases",
            difficulty: "intermediate",
            duration: "6 min",
            thumbnail: "https://img.youtube.com/vi/0FcwzMq4iWg/maxresdefault.jpg"
        },
        {
            id: 8,
            title: "Question Words",
            description: "Essential question words: Who, What, When, Where, Why, How",
            videoUrl: "https://www.youtube.com/embed/v1desDduz5M",
            category: "phrases",
            difficulty: "intermediate",
            duration: "7 min",
            thumbnail: "https://img.youtube.com/vi/v1desDduz5M/maxresdefault.jpg"
        },
        {
            id: 9,
            title: "Emotions & Feelings",
            description: "Express emotions: Happy, Sad, Angry, Excited, Tired, Confused",
            videoUrl: "https://www.youtube.com/embed/tkMg8g8vVUo",
            category: "phrases",
            difficulty: "intermediate",
            duration: "8 min",
            thumbnail: "https://img.youtube.com/vi/tkMg8g8vVUo/maxresdefault.jpg"
        }
    ];

    const categories = [
        { id: 'all', name: 'All Tutorials', icon: '📚' },
        { id: 'alphabet', name: 'Alphabet', icon: '🔤' },
        { id: 'numbers', name: 'Numbers', icon: '🔢' },
        { id: 'greetings', name: 'Greetings', icon: '👋' },
        { id: 'phrases', name: 'Phrases', icon: '💬' }
    ];

    const difficultyColors = {
        beginner: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
        intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
        advanced: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
    };

    // Filter tutorials
    const filteredTutorials = tutorials.filter(tutorial => {
        const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
        const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 md:px-6 md:py-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <FaGraduationCap className="text-xl md:text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Learning & Tutorials</h2>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Master sign language step by step</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tutorials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                                    }`}
                            >
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Tutorial Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredTutorials.map(tutorial => (
                            <div
                                key={tutorial.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                {/* Video Thumbnail */}
                                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                                    <iframe
                                        src={tutorial.videoUrl}
                                        title={tutorial.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg line-clamp-2">
                                            {tutorial.title}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${difficultyColors[tutorial.difficulty]}`}>
                                            {tutorial.difficulty}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {tutorial.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <FaClock className="mr-1" />
                                            {tutorial.duration}
                                        </div>
                                        <button className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium">
                                            <FaPlay className="text-xs" />
                                            <span>Watch</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredTutorials.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tutorials found</h3>
                            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or category filter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningWindow;
