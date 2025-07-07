
import React from 'react';
import { Category } from './types';

// --- SVG Icons ---

export const BookOpenIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.25-11.494v11.494L12 17.747l5.25-5.25-5.25 5.25V6.253zM3.75 6.253v11.494a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6.253m-15 0h15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.253A2.25 2.25 0 016 4h12a2.25 2.25 0 012.25 2.25v11.494A2.25 2.25 0 0118 20H6a2.25 2.25 0 01-2.25-2.25V6.253z" />
  </svg>
);

export const PrayerHandsIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 18.75V15.75m-3.75 3V15.75m-3.75 3V15.75m-3.75 3V15.75m-1.5 3V15.75" />
    </svg>
);

export const LotusIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c-4.418 0-8 3.134-8 7 0 2.23.9 4.25 2.34 5.66M12 3.75c4.418 0 8 3.134 8 7 0 2.23-.9 4.25-2.34 5.66m-11.32 0a8.01 8.01 0 01-1.34-5.66M12 20.25c-4.418 0-8-3.134-8-7 0-1.04.195-2.03.55-2.92m14.9 0A8.008 8.008 0 0112 20.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.03 8.27L12 2.25l7.97 6.02M12 20.25v-7.5m0 0l-7.97-6.02M12 12.75l7.97-6.02" />
  </svg>
);

export const ShieldIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

export const ChatBubbleIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.794 9 8.25z" />
  </svg>
);

export const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.024 4.024a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.952 0a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM10 4.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm14.25 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm-4.024 4.976a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm-8.89 0a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);


// --- Category Data ---

export const CATEGORY_DETAILS = {
  [Category.DEVOTION]: {
    icon: <BookOpenIcon />,
    color: "from-sky-500 to-cyan-400",
    topics: ["Dealing with Stress", "Overcoming Fear", "Conquering Depression", "Relationships", "Healing", "Purpose & Calling", "Anxiety"],
  },
  [Category.PRAYER]: {
    icon: <PrayerHandsIcon />,
    color: "from-indigo-500 to-purple-400",
    topics: ["Personal Growth", "Healing", "Family/Friends", "Forgiveness", "Finances", "Work/Career"],
  },
  [Category.MEDITATION]: {
    icon: <LotusIcon />,
    color: "from-emerald-500 to-green-400",
    topics: ["Peace", "God's Presence", "Strength", "Wisdom", "Faith"],
  },
  [Category.ACCOUNTABILITY]: {
    icon: <ShieldIcon />,
    color: "from-rose-500 to-red-400",
    topics: ["Pornography", "Alcohol", "Drugs", "Lust", "Addiction", "Laziness"],
  },
  [Category.CHAT]: {
    icon: <ChatBubbleIcon />,
    color: "from-amber-500 to-orange-400",
    topics: [],
  }
};
