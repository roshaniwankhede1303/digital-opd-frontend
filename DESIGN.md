// DESIGN.md content
/\*

# Digital OPD - Design Document

## Overview

A chat-based learning mini-game for NEET-PG aspirants to practice diagnosing virtual patients under AI doctor guidance.

## Architecture

### Frontend (React Native + Expo)

- **Navigation**: expo-router for file-based routing
- **State Management**: TanStack Query for server state + React hooks for local state
- **Database**: expo-sqlite for offline-first data storage
- **Real-time**: Socket.io-client for chat communication
- **UI**: Custom components matching Figma designs

### Key Features

1. **Offline-First**: All actions saved locally, synced when online
2. **Real-time Chat**: WebSocket communication with AI doctor
3. **Scoring System**: Points based on attempt accuracy (5 pts max per section, -2 per retry)
4. **Haptic Feedback**: Success/error vibrations for better UX

### Data Flow

1. User selects patient → Initialize game session
2. AI doctor presents case → User requests tests
3. System validates test → Shows results if correct
4. User submits diagnosis → Calculate final score
5. All actions queued for sync → Batch upload when online

### Database Schema

- `chat_messages`: Chat history with timestamps
- `user_actions`: All user interactions for sync
- `game_sessions`: Progress tracking and scoring
- `patient_cases`: Test case definitions

### Scoring Logic

- Test: 5 pts (first try) → 3 pts (second) → 1 pt (third) → 0 pts
- Diagnosis: Same deduction pattern
- Total: Sum of both sections (max 10 points)

### Offline Handling

- SQLite stores all data locally
- Actions queued with sync flags
- Connection status indicator
- Auto-sync on reconnection
- "Last writer wins" conflict resolution

## File Structure

```
src/
├── app/                 # Expo Router screens
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # Database, Socket, Sync
├── utils/              # Types, Scoring logic
└── constants/          # Test cases
```

## Testing

- Jest setup for scoring helper functions
- Mock implementations for Expo modules
- Unit tests for core business logic

## Future Enhancements

- Push notifications for new cases
- Leaderboards and achievements
- Advanced AI responses with medical reasoning
- Multi-language support
  \*/
