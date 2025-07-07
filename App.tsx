import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@google/genai';
import { Category, Screen, Program, ChatMessage, CompletedProgram, ProgramDay, DevotionContent, PrayerContent, MeditationContent, AccountabilityContent } from './types';
import { CATEGORY_DETAILS, SparklesIcon } from './constants';
import { generateProgram, createChat } from './services/geminiService';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
  </div>
);

const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>(Screen.WELCOME);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [customTopic, setCustomTopic] = useState<string>('');
    
    const [program, setProgram] = useState<Program | null>(null);
    const [currentProgramDay, setCurrentProgramDay] = useState<number>(0);
    
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState<string>('');
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    
    const [completedPrograms, setCompletedPrograms] = useState<CompletedProgram[]>(() => {
        try {
            const savedPrograms = localStorage.getItem('dscplCompletedPrograms');
            return savedPrograms ? JSON.parse(savedPrograms) : [];
        } catch (error) {
            console.error("Failed to load completed programs from localStorage", error);
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (screen === Screen.CHAT) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, screen]);

    useEffect(() => {
        try {
            localStorage.setItem('dscplCompletedPrograms', JSON.stringify(completedPrograms));
        } catch (error) {
            console.error("Failed to save completed programs to localStorage", error);
        }
    }, [completedPrograms]);

    const handleReset = () => {
        setScreen(Screen.WELCOME);
        setSelectedCategory(null);
        setSelectedTopic(null);
        setCustomTopic('');
        setProgram(null);
        setCurrentProgramDay(0);
        setError(null);
        setIsLoading(false);
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        if (category === Category.CHAT) {
            const newChat = createChat();
            setChatSession(newChat);
            setChatMessages([]);
            setUserMessage('');
            setScreen(Screen.CHAT);
        } else {
            setScreen(Screen.TOPIC_SELECTION);
        }
    };

    const handleTopicSelect = (topic: string) => {
        const finalTopic = topic === 'Something else...' ? customTopic : topic;
        if (!finalTopic) {
            setError("Please enter a custom topic.");
            return;
        }
        setSelectedTopic(finalTopic);
        setError(null);
        setScreen(Screen.PROGRAM_OVERVIEW);
    };

    const startProgram = useCallback(async () => {
        if (!selectedCategory || !selectedTopic) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const generatedProgram = await generateProgram(selectedCategory, selectedTopic);
            setProgram(generatedProgram);
            setScreen(Screen.DAILY_PROGRAM);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setScreen(Screen.TOPIC_SELECTION); // Go back to allow re-try
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, selectedTopic]);
    
    const handleSendMessage = async () => {
        if (!userMessage.trim() || !chatSession || isChatLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: userMessage };
        setChatMessages(prev => [...prev, newUserMessage]);
        setUserMessage('');
        setIsChatLoading(true);

        try {
            const stream = await chatSession.sendMessageStream({ message: userMessage });
            
            let modelResponse = '';
            setChatMessages(prev => [...prev, { role: 'model', text: '...' }]);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setChatMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse + '...';
                    return newMessages;
                });
            }
            setChatMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });

        } catch (err) {
            console.error(err);
            setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const finishProgram = () => {
        if(!selectedCategory || !selectedTopic) return;
        const newCompletedProgram: CompletedProgram = {
            id: new Date().toISOString(),
            category: selectedCategory,
            topic: selectedTopic,
            completedDate: new Date().toLocaleDateString(),
        };
        setCompletedPrograms(prev => [...prev, newCompletedProgram]);
        handleReset();
    }


    const renderWelcomeScreen = () => (
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">What do you need today?</h1>
            <p className="text-slate-400 mb-10">DSCPL is here to walk with you in every season.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {Object.values(Category).map(cat => {
                    const details = CATEGORY_DETAILS[cat];
                    return (
                        <button key={cat} onClick={() => handleCategorySelect(cat)} className={`group relative p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-sky-400 transition-all duration-300 text-left flex flex-col items-start shadow-lg hover:shadow-sky-400/20`}>
                            <div className={`absolute -top-3 -right-3 text-white p-3 rounded-full bg-gradient-to-br ${details.color}`}>
                                {details.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100">{cat}</h2>
                            <p className="text-slate-400 mt-2 flex-grow">{cat === Category.CHAT ? "Start a conversation." : "Get daily guidance."}</p>
                            <div className="w-full h-1 bg-slate-700 mt-4 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${details.color} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out`}></div>
                            </div>
                        </button>
                    );
                })}
            </div>
             <button onClick={() => setScreen(Screen.DASHBOARD)} className="mt-12 text-slate-400 hover:text-sky-400 transition">View Progress Dashboard</button>
        </div>
    );
    
    const renderTopicSelectionScreen = () => {
        if (!selectedCategory) return null;
        const details = CATEGORY_DETAILS[selectedCategory];
        const topics = [...details.topics, "Something else..."];

        return (
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Choose a focus for your {selectedCategory}</h1>
                <p className="text-slate-400 mb-8">Select a topic or specify your own to personalize your plan.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    {topics.map(topic => (
                        <button key={topic} onClick={() => handleTopicSelect(topic)} className="px-6 py-3 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-sky-400 transition text-lg">
                            {topic}
                        </button>
                    ))}
                </div>
                {selectedTopic === 'Something else...' && (
                    <div className="mt-8">
                        <input
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="e.g., 'patience with my kids'"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                    </div>
                )}
                 {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        );
    };

    const renderProgramOverviewScreen = () => (
        <div className="max-w-2xl mx-auto text-center">
             <h1 className="text-4xl font-bold mb-4">Your 7-Day Journey</h1>
             <p className="text-xl text-slate-300 mb-8">
                By the end of this week, you will feel more connected to God and confident in your spiritual walk.
             </p>
            {isLoading ? <LoadingSpinner /> : (
                <>
                    <p className="text-slate-400 mb-8">DSCPL will generate a personalized plan for you based on <span className="font-bold text-sky-400">{selectedCategory}</span> and your focus on <span className="font-bold text-sky-400">{selectedTopic}</span>.</p>
                    <button onClick={startProgram} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-sky-400/40 transform hover:scale-105 transition-all duration-300">
                        Begin My Journey
                    </button>
                </>
            )}
        </div>
    );

    const renderDailyProgramScreen = () => {
        if (!program || !selectedCategory) return null;
        const dayData = program[currentProgramDay];
        if (!dayData) return <p className="text-center text-red-400">Error: Could not load data for this day.</p>;

        const renderContent = (content: any) => {
            switch(selectedCategory) {
                case Category.DEVOTION:
                    const dev = content as DevotionContent;
                    return <div className="space-y-6">
                        <div><h3 className="text-sm text-sky-400 font-semibold tracking-wider uppercase">Scripture</h3><p className="text-xl mt-1 font-serif">{dev.scripture}</p></div>
                        <div><h3 className="text-sm text-sky-400 font-semibold tracking-wider uppercase">Prayer</h3><p className="text-lg mt-1 italic text-slate-300">"{dev.prayer}"</p></div>
                        <div><h3 className="text-sm text-sky-400 font-semibold tracking-wider uppercase">Declaration</h3><p className="text-lg mt-1 font-bold">"{dev.declaration}"</p></div>
                        {dev.videoTitle && <div className="border-t border-slate-700 pt-6 mt-6"><h3 className="text-sm text-sky-400 font-semibold tracking-wider uppercase">Recommended Video</h3><p className="text-lg mt-1">{dev.videoTitle}</p><img src={`https://picsum.photos/seed/${dev.videoTitle}/400/225`} alt="Recommended video thumbnail" className="mt-2 rounded-lg" /></div>}
                    </div>;
                case Category.PRAYER:
                    const pray = content as PrayerContent;
                    return <div className="space-y-4">
                        <p className="text-lg mb-4 text-center text-slate-400">Follow the ACTS model for your prayer time.</p>
                        <div><h3 className="font-bold text-indigo-400 text-xl">Adoration</h3><p className="mt-1">{pray.adoration}</p></div>
                        <div><h3 className="font-bold text-indigo-400 text-xl">Confession</h3><p className="mt-1">{pray.confession}</p></div>
                        <div><h3 className="font-bold text-indigo-400 text-xl">Thanksgiving</h3><p className="mt-1">{pray.thanksgiving}</p></div>
                        <div><h3 className="font-bold text-indigo-400 text-xl">Supplication</h3><p className="mt-1">{pray.supplication}</p></div>
                    </div>;
                case Category.MEDITATION:
                    const med = content as MeditationContent;
                    return <div className="space-y-6">
                        <div><h3 className="text-sm text-emerald-400 font-semibold tracking-wider uppercase">Scripture Focus</h3><p className="text-xl mt-1 text-center font-serif">"{med.scripture}"</p></div>
                        <div className="border-y border-slate-700 py-6 my-6"><h3 className="text-sm text-emerald-400 font-semibold tracking-wider uppercase mb-4 text-center">Meditation Prompts</h3><p className="text-lg mt-1 text-center">1. {med.prompt1}</p><p className="text-lg mt-2 text-center">2. {med.prompt2}</p></div>
                        <div><h3 className="text-sm text-emerald-400 font-semibold tracking-wider uppercase text-center mb-4">Breathing Guide</h3>
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-32 h-32">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full"></div>
                                    <div className="absolute inset-2 bg-emerald-500/30 rounded-full breathing-circle"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">Breathe</div>
                                </div>
                                <p className="text-slate-400 mt-4 text-center">Inhale for 4s, Hold for 4s, Exhale for 4s</p>
                            </div>
                        </div>
                    </div>;
                case Category.ACCOUNTABILITY:
                    const acc = content as AccountabilityContent;
                    return <div className="space-y-6">
                        <div><h3 className="text-sm text-rose-400 font-semibold tracking-wider uppercase">Scripture for Strength</h3><p className="text-xl mt-1 font-serif">{acc.scripture}</p></div>
                        <div><h3 className="text-sm text-rose-400 font-semibold tracking-wider uppercase">Truth Declaration</h3><p className="text-lg mt-1 font-bold">"{acc.declaration}"</p></div>
                        <div><h3 className="text-sm text-rose-400 font-semibold tracking-wider uppercase">Alternative Action</h3><p className="text-lg mt-1">{acc.alternativeAction}</p></div>
                        <div className="border-t border-slate-700 pt-6 mt-6">
                            <button className="w-full bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg hover:shadow-rose-500/40 transform hover:scale-105 transition">
                                SOS: I need help now!
                            </button>
                        </div>
                    </div>;
                default: return null;
            }
        }
        
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentProgramDay(d => Math.max(0, d - 1))} disabled={currentProgramDay === 0} className="p-3 rounded-full bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"> &lt; </button>
                    <h2 className="text-2xl font-bold">Day {dayData.day} of 7</h2>
                    <button onClick={() => setCurrentProgramDay(d => Math.min(6, d + 1))} disabled={currentProgramDay === 6} className="p-3 rounded-full bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"> &gt; </button>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-xl">
                    {renderContent(dayData.content)}
                </div>
                {currentProgramDay === 6 && (
                    <div className="text-center mt-8">
                        <button onClick={finishProgram} className="bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-green-400/40 transform hover:scale-105 transition">
                            Complete Program
                        </button>
                    </div>
                )}
            </div>
        );
    }
    
    const renderChatScreen = () => (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-slate-300"><strong className="text-amber-400">DSCPL:</strong> I'm here for you. What's on your mind?</p>
                </div>
                {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                            {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    </div>
                ))}
                {isChatLoading && chatMessages[chatMessages.length - 1]?.role === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-md p-4 rounded-2xl bg-slate-800 text-slate-200 rounded-bl-none">...</div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-4">
                <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    disabled={isChatLoading}
                />
                <button onClick={handleSendMessage} disabled={isChatLoading || !userMessage.trim()} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition">Send</button>
            </div>
        </div>
    );
    
    const renderDashboardScreen = () => (
        <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-4xl font-bold mb-8 text-center">Your Progress</h1>
            {completedPrograms.length === 0 ? (
                 <div className="text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-300 text-lg">You haven't completed any programs yet.</p>
                    <p className="text-slate-400 mt-2 mb-6">Start a new one to see your progress here!</p>
                    <button onClick={handleReset} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-sky-400/40 transform hover:scale-105 transition-all duration-300">
                        Start a New Program
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {completedPrograms.map(p => (
                        <div key={p.id} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex justify-between items-center transition hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">{p.category}</h2>
                                <p className="text-slate-400">Topic: {p.topic}</p>
                            </div>
                            <span className="text-slate-500 text-sm">Completed: {p.completedDate}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCurrentScreen = () => {
        switch (screen) {
            case Screen.WELCOME:
                return renderWelcomeScreen();
            case Screen.TOPIC_SELECTION:
                return renderTopicSelectionScreen();
            case Screen.PROGRAM_OVERVIEW:
                return renderProgramOverviewScreen();
            case Screen.DAILY_PROGRAM:
                 return isLoading ? <LoadingSpinner /> : renderDailyProgramScreen();
            case Screen.CHAT:
                return renderChatScreen();
            case Screen.DASHBOARD:
                return renderDashboardScreen();
            default:
                return renderWelcomeScreen();
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
            <header className="absolute top-0 left-0 w-full p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button onClick={handleReset} className="flex items-center gap-2 text-2xl font-bold text-slate-200 hover:text-sky-400 transition-colors">
                        <SparklesIcon className="w-7 h-7 text-sky-400"/>
                        DSCPL
                    </button>
                     {screen !== Screen.WELCOME && (
                        <button onClick={handleReset} className="text-slate-400 hover:text-white transition"> &larr; Back to Home</button>
                     )}
                </div>
            </header>
            <main className="flex items-center justify-center min-h-screen pt-16">
                {renderCurrentScreen()}
            </main>
        </div>
    );
};

export default App;
