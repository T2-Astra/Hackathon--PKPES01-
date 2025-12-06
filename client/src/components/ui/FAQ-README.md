# MorphSurface FAQ Agent

## Overview
The MorphSurface FAQ Agent is a floating AI assistant that provides quick help and answers to users on the PolyLearnHub platform.

## Features
- **Animated Interface**: Smooth morphing animation when expanding/collapsing
- **AI-Powered**: Uses OpenRouter API with GPT-4o-mini for intelligent responses
- **Floating Design**: Positioned in the bottom-right corner for easy access
- **Toast Notifications**: Shows AI responses in elegant toast notifications
- **Keyboard Shortcuts**: Supports Cmd/Ctrl+Enter for quick submission

## Components Created
1. **`useClickOutside` hook** - Handles clicking outside to close the FAQ
2. **`SiriOrb` component** - Animated orb indicator
3. **`MorphSurface` component** - Main FAQ interface with morphing animation
4. **`FloatingFAQ` component** - Wrapper for positioning

## Integration
The FAQ agent is integrated into the main App.tsx and appears on all pages except the auth page.

## Usage
1. Click the "Ask AI" button in the floating widget
2. Type your question in the text area
3. Press Cmd/Ctrl+Enter or click the submit button
4. View the AI response in a toast notification

## Customization
- Modify the system prompt in `callFAQAI` function to change AI behavior
- Adjust positioning by editing the `FloatingFAQ` component
- Change animation settings by modifying the `SPEED` constant and motion properties
