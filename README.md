# 🔮 Entity Summoning Platform

A mystical web application where users perform dark rituals to summon and collect supernatural entities from beyond the veil. Built with React, TypeScript, Tailwind CSS, and powered by Supabase for full backend functionality.

**🌐 Live Demo:** [https://entityplatform.netlify.app](https://entityplatform.netlify.app)

## ✨ Current Features (Backend Integration Complete)

### 🎯 Core Gameplay
- **Interactive Summoning Circle**: Click runes to customize your ritual
- **8 Unique Runes**: Each with distinct effects and unlock requirements
- **Dynamic Entity Generation**: AI-powered entities with unique personalities and abilities
- **Rarity System**: Common, Rare, Legendary, and Mythic entities with increasing power
- **Shiny Variants**: Ultra-rare sparkling versions of entities

### 🔋 Energy & Progression Systems
- **Ritual Energy System**: Limited summons per day with energy regeneration
- **VIP Membership**: 4 tiers with increased energy capacity and exclusive benefits
- **Daily Login Rewards**: 15-day reward cycle with streak bonuses up to 200%
- **Achievement System**: 16 achievements with meaningful rewards
- **Premium Currency**: Essence Crystals for special purchases

### 🎮 Advanced Monetization
- **Battle Pass System**: Seasonal progression with free and premium tiers
- **Cosmetic Shop**: Circle themes, particle effects, UI customization, and summon animations
- **Storage Expansion**: Increase grimoire capacity with multiple package options

### 🛒 Premium Features
- **Premium Shop**: Powerful items purchasable with Essence Crystals
- **Energy Refills**: Instant energy restoration options
- **Power Boosts**: Temporary enhancements for better summoning results
- **Convenience Items**: Auto-collect, storage expansion, and more

### 🎯 Quest System
- **Daily Quests**: Rotating objectives for consistent engagement
- **Weekly Challenges**: Longer-term goals with better rewards
- **Story Quests**: Progressive narrative-driven missions
- **Achievement Quests**: Long-term collection and progression goals
- **Quest Notifications**: Real-time progress tracking and completion alerts

### 🎮 Guest User System
- **Instant Access**: Play immediately without registration
- **Local Storage**: Progress saved in browser for guests
- **Limited Features**: 25 entity storage, single gacha pulls, basic shop access
- **Seamless Upgrade**: Convert to full account with data migration
- **Bonus Rewards**: 100 crystals + 500 essence for account creation

### 🌐 Backend Infrastructure (COMPLETE)
- **Supabase Integration**: PostgreSQL database with real-time subscriptions
- **User Authentication**: Email/password with profile management
- **Row Level Security**: Secure data access with comprehensive policies
- **Edge Functions**: Server-side logic for critical operations
- **Real-time Sync**: Live updates across devices for authenticated users
- **Anti-cheat Protection**: Server-side validation for all transactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend features)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd entity-summoning-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and keys to .env

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 **CURRENT STATUS: DEMO READY**

### ✅ **FULLY IMPLEMENTED**
- **Complete Backend Infrastructure** - 15+ database tables with RLS
- **Guest User System** - Instant play with seamless account upgrade
- **Authentication System** - Secure email/password with profiles
- **Core Summoning Mechanics** - Rune selection and entity generation
- **Energy System** - Time-based regeneration with VIP benefits
- **Currency Management** - Essence and crystals for purchases
- **Achievement System** - Unlockable achievements with rewards
- **Grimoire Collection** - Entity storage and management

### ⚠️ **KNOWN ISSUES & LIMITATIONS (DEMO VERSION)**
- **Gacha System** - Removed from UI due to animation issues
- **PvP System** - Battle mechanics are simulated for demo purposes
- **Guild System** - UI implemented but backend functionality limited
- **Trading System** - UI implemented but backend functionality limited
- **Chat System** - UI implemented but backend functionality limited
- **Leaderboards** - Shows mock data for demonstration
- **Cosmetic Shop** - Removed from UI in this demo version
- **Battle Pass** - Progression tracking works but some rewards are simulated

### 🎮 **DEMO FEATURES**
- **Resource Buttons** - Added "+" buttons to add Essence and Crystals for demo purposes
- **Guest Mode** - Play without account creation, with progress saved locally
- **Account Upgrade** - Create an account to unlock all features (simulated in demo)
- **Offline Support** - Basic functionality works without internet connection

### 🚀 **NEXT STEPS**
1. **Fix Gacha System** - Implement proper animation sequence
2. **Complete PvP System** - Finish battle mechanics and matchmaking
3. **Enhance Social Features** - Complete guild, trading, and chat functionality
4. **Optimize Performance** - Improve loading times and transitions
5. **Mobile Optimization** - Better responsive design for smaller screens

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Edge Functions)
- **Icons**: Lucide React
- **Audio**: Web Audio API
- **Build Tool**: Vite
- **Deployment**: Netlify

## 🎮 How to Play

1. **Select Runes**: Click on runes around the summoning circle (up to 4)
2. **Adjust Parameters**: Modify ritual parameters for different results
3. **Invoke Entity**: Spend energy to perform the summoning ritual
4. **Collect or Sacrifice**: Add the entity to your grimoire or sacrifice for power
5. **Complete Quests**: Earn rewards by completing various objectives
6. **Upgrade Account**: Create an account to unlock all features and save progress

## 📜 License

This project is proprietary. All rights reserved.

---

*"From the digital void, consciousness emerges..."* 🔮✨

**🎮 READY TO PLAY:** [https://entityplatform.netlify.app](https://entityplatform.netlify.app)

**🎯 Perfect for judges - instant access as guest, full features with account!**