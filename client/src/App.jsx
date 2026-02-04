import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Zap, Users, Coffee, AlertTriangle, Search } from 'lucide-react';
import { trackPageView } from './utils/metaPixel';

// Page Imports
import HomePage from './pages/HomePage.jsx';
import GameTemplate from './pages/GameTemplate.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Loginl.jsx';

// Security Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Meta Pixel PageView Tracker
const PageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);
  return null;
};

// --- GAME DATA CONFIGURATION ---

const SYNDICATE_DATA = {
  gameId: 1, 
  title: "THE SYNDICATE",
  subtitle: "Trust No One. Betray Everyone. The Ultimate Game of Power & Deception.",
  tagline: "#1 Strategy Card Game in Bangladesh",
  storyTitle: "Welcome to the Underworld",
  storyText: (
    <>
      <p>In the shadows of Dhaka, five rival families fight for control. <span className="font-bold text-[#2e8b57]">Corruption is currency</span>, and loyalty is just a word.</p>
      <p><strong>The Syndicate</strong> is a fast-paced game of hidden identities. Eliminate your rivals' influence and be the last boss standing. Will you play it safe, or lie straight to your best friend's face?</p>
    </>
  ),
  colors: {
    bg: "#f8f5e6",
    text: "#1a3325",
    primary: "#2e8b57", // Green
    secondary: "#e8e4d0"
  },
  features: [
    { title: "Bluff & Deceive", desc: "Don't have the cards? Lie! Claim you're the Police Commissioner. Just don't get caught.", icon: <ShieldAlert size={40} color="white"/> },
    { title: "Fast Paced", desc: "No boring setup. Rounds last 15 minutes. Perfect for quick breaks or long game nights.", icon: <Zap size={40} color="white"/> },
    { title: "Ruins Friendships", desc: "Designed to create chaos. Backstab your friends—all in good fun, of course.", icon: <Users size={40} color="#1a3325"/> }
  ]
};

// --- CORRECTED TONG DATA (No Cockroaches!) ---
const TONG_DATA = {
  gameId: 2, 
  title: "TONG",
  subtitle: "Cha, Bon, Paan, Muri. Pass the cards, keep a straight face.",
  tagline: "The Desi Bluffing Game",
  storyTitle: "The Art of the Adda",
  storyText: (
    <>
      <p>It's tea time at the Tong. You pass a card facedown to your friend and say <span className="font-bold text-[#e63946]">"This is a Dry Cake."</span></p>
      <p>Is it really? Or are you actually handing them a <strong>Paan</strong>? <strong>Tong</strong> is all about calling bluffs. Collect 4 of the same item (like 4 Bakorkhanis), and you lose. It is simple, chaotic, and loud.</p>
    </>
  ),
  colors: {
    bg: "#f8f5e6",
    text: "#1a3325",
    primary: "#e63946", // Red/Orange
    secondary: "#f4e4bc"
  },
  features: [
    { title: "8 Desi Suits", desc: "Cha, Bon, Paan, Toast, Kola, Bakorkhani, Dry Cake, Muri. All your Tong favorites.", icon: <Coffee size={40} color="white"/> },
    { title: "Call the Bluff", desc: "Look your friend in the eye. Are they lying? If you guess wrong, you take the card.", icon: <Search size={40} color="white"/> },
    { title: "Don't Collect 4", desc: "The goal is survival. If you get stuck with 4 of the same item, you lose the round.", icon: <AlertTriangle size={40} color="#1a3325"/> }
  ]
};

// --- MAIN APP COMPONENT ---

function App() {
  return (
    <HashRouter>
      <PageViewTracker />
      <Routes>
        {/* 1. Public Website */}
        <Route path="/" element={<HomePage />} />
        
        {/* 2. Game Routes */}
        <Route 
          path="/syndicate" 
          element={<GameTemplate {...SYNDICATE_DATA} />} 
        />
        <Route 
          path="/tong" 
          element={<GameTemplate {...TONG_DATA} />} 
        />

        {/* 3. Login & Admin */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;