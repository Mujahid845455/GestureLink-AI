// src/components/signing/TextToSignWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaBrain, FaArrowLeft, FaPlay, FaPause, FaRedo, FaLanguage, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { enhancedTextToISL, getEnhancedSignSequence, ENHANCED_ISL_DICTIONARY } from '../../utils/enhancedISLConverter';
import EnhancedSignAvatar from './EnhancedSignAvatar';

const TextToSignWindow = ({ onBack }) => {
    const [inputText, setInputText] = useState('');
    const [islGloss, setIslGloss] = useState('');
    const [signSequence, setSignSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSignIndex, setCurrentSignIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [animationSpeed, setAnimationSpeed] = useState(1.0);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const [signHistory, setSignHistory] = useState([]);
    const playIntervalRef = useRef(null);
    const signStartTimeRef = useRef(null);

    // Enhanced predefined sentences with ISL grammar
    const PREDEFINED_SENTENCES = [
        { id: 1, english: "Hello", islGloss: "HELLO", signs: ["HELLO"], category: "greetings" },
        { id: 2, english: "How are you?", islGloss: "YOU HOW?", signs: ["YOU", "HOW"], category: "questions" },
        { id: 3, english: "Who are you?", islGloss: "YOU WHO?", signs: ["YOU", "WHO"], category: "questions" },
        { id: 4, english: "What is your name?", islGloss: "YOUR NAME WHAT?", signs: ["YOUR", "NAME", "WHAT"], category: "questions" },
        { id: 5, english: "Where are you from?", islGloss: "YOU FROM WHERE?", signs: ["YOU", "FROM", "WHERE"], category: "questions" },
        { id: 6, english: "My name is...", islGloss: "MY NAME", signs: ["MY", "NAME"], category: "greetings" },
        { id: 7, english: "Thank you", islGloss: "THANK-YOU", signs: ["THANK_YOU"], category: "polite" },
        { id: 8, english: "Please", islGloss: "PLEASE", signs: ["PLEASE"], category: "polite" },
        { id: 9, english: "Sorry", islGloss: "SORRY", signs: ["SORRY"], category: "polite" },
        { id: 10, english: "Yes", islGloss: "YES", signs: ["YES"], category: "responses" },
        { id: 11, english: "No", islGloss: "NO", signs: ["NO"], category: "responses" },
        { id: 12, english: "Good", islGloss: "GOOD", signs: ["GOOD"], category: "responses" },
        { id: 13, english: "I love you", islGloss: "I LOVE YOU", signs: ["I", "LOVE", "YOU"], category: "greetings" },
        { id: 14, english: "Help me", islGloss: "HELP ME", signs: ["HELP", "ME"], category: "emergency" },
        { id: 15, english: "I understand", islGloss: "I UNDERSTAND", signs: ["I", "UNDERSTAND"], category: "responses" }
    ];

    const categories = [
        { id: 'all', name: 'All', icon: '📚' },
        { id: 'greetings', name: 'Greetings', icon: '👋' },
        { id: 'questions', name: 'Questions', icon: '❓' },
        { id: 'polite', name: 'Polite', icon: '🙏' },
        { id: 'responses', name: 'Responses', icon: '💬' },
        { id: 'emergency', name: 'Emergency', icon: '🆘' }
    ];

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        };
    }, []);

    // Filter sentences by category
    const filteredSentences = selectedCategory === 'all'
        ? PREDEFINED_SENTENCES
        : PREDEFINED_SENTENCES.filter(s => s.category === selectedCategory);

    // Handle text conversion with enhanced ISL grammar
    const handleConvert = () => {
        if (!inputText.trim()) return;

        const result = enhancedTextToISL(inputText);
        const islGlossText = result.signs.join(' ');
        setIslGloss(islGlossText);

        const sequence = getEnhancedSignSequence(result.signs);
        setSignSequence(sequence);
        setCurrentSignIndex(0);
        setIsPlaying(false);

        // Add to history
        if (inputText.trim()) {
            setSignHistory(prev => [{
                text: inputText,
                gloss: islGlossText,
                sequence: sequence,
                timestamp: new Date().toISOString()
            }, ...prev.slice(0, 9)]);
        }
    };

    // Handle predefined sentence click
    const handlePredefinedClick = (sentence) => {
        setInputText(sentence.english);
        setIslGloss(sentence.islGloss);

        const sequence = getEnhancedSignSequence(sentence.signs);
        setSignSequence(sequence);
        setCurrentSignIndex(0);
        setIsPlaying(false);

        // Add to history
        setSignHistory(prev => [{
            text: sentence.english,
            gloss: sentence.islGloss,
            sequence: sequence,
            timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
    };

    // Play animation with better timing
    const handlePlay = () => {
        if (signSequence.length === 0) return;

        setIsPlaying(true);
        signStartTimeRef.current = Date.now();

        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
        }

        let index = currentSignIndex;
        const playNextSign = () => {
            if (index >= signSequence.length) {
                clearInterval(playIntervalRef.current);
                setIsPlaying(false);
                setCurrentSignIndex(0);
                return;
            }

            setCurrentSignIndex(index);
            index++;
        };

        // Initial play
        playNextSign();

        // Calculate timing based on animation duration
        const baseInterval = 2000; // 2 seconds per sign
        const speedAdjustedInterval = baseInterval / animationSpeed;

        playIntervalRef.current = setInterval(playNextSign, speedAdjustedInterval);
    };

    // Pause animation
    const handlePause = () => {
        setIsPlaying(false);
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
        }
    };

    // Replay animation
    const handleReplay = () => {
        handlePause();
        setCurrentSignIndex(0);
        setTimeout(() => handlePlay(), 100);
    };

    // Navigate to next sign
    const handleNextSign = () => {
        if (currentSignIndex < signSequence.length - 1) {
            setCurrentSignIndex(prev => prev + 1);
        }
    };

    // Navigate to previous sign
    const handlePrevSign = () => {
        if (currentSignIndex > 0) {
            setCurrentSignIndex(prev => prev - 1);
        }
    };

    // Clear all
    const handleClear = () => {
        setInputText('');
        setIslGloss('');
        setSignSequence([]);
        setCurrentSignIndex(0);
        setIsPlaying(false);
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
        }
    };

    // Get current sign details
    const getCurrentSignDetails = () => {
        if (signSequence.length === 0 || currentSignIndex >= signSequence.length) return null;

        const sign = signSequence[currentSignIndex];
        const dictEntry = ENHANCED_ISL_DICTIONARY[sign.sign] || {};

        return {
            ...sign,
            meaning: dictEntry.meaning || sign.animation?.description,
            tips: dictEntry.tips || [],
            example: dictEntry.example
        };
    };

    const currentSignDetails = getCurrentSignDetails();

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-purple-50 to-blue-50/30 dark:from-gray-900 dark:to-purple-900/20 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 md:px-6 md:py-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Go back"
                        >
                            <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <FaBrain className="text-xl md:text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Text to Sign Language</h2>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Convert text to ISL animations</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${avatarLoaded ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${avatarLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                            {avatarLoaded ? 'Avatar Ready' : 'Loading Avatar...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* 3D Avatar Display */}
                    {signSequence.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    🤟 3D Avatar Performing Signs
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
                                    <select
                                        value={animationSpeed}
                                        onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm"
                                        disabled={isPlaying}
                                    >
                                        <option value="0.5">0.5x</option>
                                        <option value="0.75">0.75x</option>
                                        <option value="1.0">1x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                    </select>
                                </div>
                            </div>

                            {/* Avatar Canvas with GSAP Animations */}
                            <div className="w-full h-96 md:h-[600px] mb-6 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 relative">
                                <EnhancedSignAvatar
                                    currentSign={signSequence[currentSignIndex]}
                                    isPlaying={isPlaying}
                                    onLoad={() => setAvatarLoaded(true)}
                                />

                                {/* Progress indicator */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2">
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            <span>Sign {currentSignIndex + 1} of {signSequence.length}</span>
                                            <span>{Math.round(((currentSignIndex + 1) / signSequence.length) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                                style={{ width: `${((currentSignIndex + 1) / signSequence.length) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Animation Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePrevSign}
                                        disabled={currentSignIndex === 0 || isPlaying}
                                        className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous sign"
                                    >
                                        <FaStepBackward />
                                    </button>

                                    {!isPlaying ? (
                                        <button
                                            onClick={handlePlay}
                                            disabled={signSequence.length === 0}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaPlay />
                                            <span>Play Animation</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePause}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center space-x-2"
                                        >
                                            <FaPause />
                                            <span>Pause</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNextSign}
                                        disabled={currentSignIndex >= signSequence.length - 1 || isPlaying}
                                        className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next sign"
                                    >
                                        <FaStepForward />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleReplay}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center space-x-2"
                                    >
                                        <FaRedo />
                                        <span>Replay</span>
                                    </button>

                                    <button
                                        onClick={handleClear}
                                        className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Current Sign Details */}
                            {currentSignDetails && (
                                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                                                Currently Showing:
                                            </div>
                                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                                                {currentSignDetails.sign}
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                                {currentSignDetails.meaning}
                                            </p>

                                            {currentSignDetails.tips && currentSignDetails.tips.length > 0 && (
                                                <div className="mt-4">
                                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tips:</div>
                                                    <ul className="space-y-1">
                                                        {currentSignDetails.tips.map((tip, index) => (
                                                            <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="text-purple-500 mr-2">•</span>
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Animation Details:</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Hand Shape:</span>
                                                    <span className="font-medium">{currentSignDetails.animation?.handShape || 'Default'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Motion:</span>
                                                    <span className="font-medium">{currentSignDetails.animation?.motion || 'None'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Expression:</span>
                                                    <span className="font-medium">{currentSignDetails.animation?.facialExpression || 'Neutral'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Quick Access Categories
                        </h3>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center ${selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg transform scale-105'
                                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    <span className="text-lg mr-2">{category.icon}</span>
                                    {category.name}
                                    <span className="ml-2 text-xs opacity-75">
                                        ({PREDEFINED_SENTENCES.filter(s => category.id === 'all' || s.category === category.id).length})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Input Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FaLanguage className="mr-2 text-purple-500" />
                                    Enter Text to Convert
                                </h3>

                                <div className="space-y-4">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type your message here... (e.g., Hello, How are you?)"
                                        className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-gray-900 dark:text-white placeholder:text-gray-400 resize-none transition-colors"
                                        maxLength={500}
                                    />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {inputText.length}/500 characters
                                        </span>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={handleClear}
                                                disabled={!inputText.trim() && signSequence.length === 0}
                                                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={handleConvert}
                                                disabled={!inputText.trim()}
                                                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
                                            >
                                                Convert to Signs
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* ISL Gloss Display */}
                                {islGloss && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl">
                                        <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                                            ISL Gloss Representation:
                                        </div>
                                        <div className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">
                                            {islGloss}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            This is the structured sign language representation of your text.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sign History */}
                            {signHistory.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Recent Conversions</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {signHistory.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setInputText(item.text);
                                                    setIslGloss(item.gloss);
                                                    setSignSequence(item.sequence);
                                                    setCurrentSignIndex(0);
                                                }}
                                                className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left"
                                            >
                                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                                    {item.text}
                                                </div>
                                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 truncate">
                                                    {item.gloss}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {item.sequence.length} signs
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Predefined Sentences */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Quick Sentences ({filteredSentences.length})
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Click any sentence to load it
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredSentences.map(sentence => (
                                <button
                                    key={sentence.id}
                                    onClick={() => handlePredefinedClick(sentence)}
                                    className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-500 hover:scale-[1.02] transition-all text-left group"
                                >
                                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                                        {sentence.english}
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                                        {sentence.islGloss}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                            {sentence.category}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {sentence.signs.length} sign{sentence.signs.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sign Sequence Display */}
                    {signSequence.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Sign Sequence ({signSequence.length} signs)
                            </h3>

                            {/* Sign Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
                                {signSequence.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentSignIndex(index);
                                            if (isPlaying) handlePause();
                                        }}
                                        className={`p-3 rounded-xl border-2 transition-all ${currentSignIndex === index
                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-900/20 transform scale-105 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-600'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">
                                                {item.animation?.facialExpression === 'smile' && '😊'}
                                                {item.animation?.facialExpression === 'question' && '🤔'}
                                                {item.animation?.facialExpression === 'neutral' && '😐'}
                                                {item.animation?.facialExpression === 'sad' && '😔'}
                                                {item.animation?.facialExpression === 'excited' && '🤩'}
                                                {!item.animation?.facialExpression && '🤟'}
                                            </div>
                                            <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                {item.sign}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                {index + 1}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-lg">
                                    🤟 How It Works
                                </h4>
                                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">1.</span>
                                        <span>Type your message or select a quick sentence</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">2.</span>
                                        <span>System converts it to ISL (Indian Sign Language) format</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">3.</span>
                                        <span>View the 3D avatar performing the signs</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">4.</span>
                                        <span>Play animation to see signs in sequence</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-3 text-lg">
                                    💡 Tips for Best Experience
                                </h4>
                                <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Use clear, simple sentences for better accuracy</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Adjust animation speed for comfortable viewing</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Click on any sign in the sequence to view it individually</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Check the sign details panel for tips and explanations</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSignWindow;