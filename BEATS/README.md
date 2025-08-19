# 🎵 BEATS - Modern Music Player

A beautiful, responsive, and feature-rich web-based music player with a modern UI inspired by popular streaming services.

## ✨ Features

- 🎧 High-quality audio playback with Web Audio API
- 🎨 Sleek, modern UI with light/dark theme support
- 🔍 Powerful search functionality
- 📱 Fully responsive design (works on all devices)
- 🎨 Audio visualization
- 🔄 Background sync for offline playback (Progressive Web App)
- 🎨 Customizable themes
- ⚡ Fast and lightweight
- 🎵 Drag and drop support for adding music
- ⌨️ Keyboard shortcuts for playback control

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for development)
- npm or yarn (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/beats-music-player.git
   cd beats-music-player
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

## 📁 Project Structure

```
BEATS/
├── assets/
│   ├── css/           # CSS stylesheets
│   ├── js/            # JavaScript files
│   └── img/           # Image assets
│       ├── album-covers/  # Album artwork
│       ├── icons/      # App icons for PWA
│       └── screenshots/  # App screenshots
├── music/             # Music files
├── pages/             # Application pages
│   ├── library/       # Music library
│   ├── contact/       # Contact page
│   └── auth/          # Authentication
├── sw.js             # Service Worker
└── manifest.json     # Web App Manifest
```

## 🛠 Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- [Howler.js](https://howlerjs.com/) - Audio library
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography
- [PWA](https://developers.google.com/web/progressive-web-apps) - Progressive Web App features

## 🌈 Theming

BEATS supports both light and dark themes. The theme automatically adapts to the user's system preferences, but can be manually toggled using the theme button in the navigation bar.

## 🎛 Keyboard Shortcuts

- `Space` - Play/Pause
- `→` - Next track
- `←` - Previous track
- `↑` - Increase volume
- `↓` - Decrease volume
- `M` - Mute/Unmute
- `L` - Toggle repeat
- `S` - Toggle shuffle

## 📱 Progressive Web App

BEATS is a PWA, which means:
- Installable on your device
- Works offline
- Fast loading
- App-like experience

To install:
1. Open BEATS in Chrome/Edge
2. Click the install button in the address bar
3. Follow the prompts

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all the artists and musicians who make great music
- Inspiration from Spotify, Apple Music, and other music players
- Icons by Font Awesome
- Fonts by Google Fonts

## Features

- Play music tracks
- Browse music library
- User authentication
- Contact form
- Responsive design

## Setup

1. Clone the repository
2. Open `index.html` in a web browser

## Note
- Make sure all music files are placed in the `music/` directory
- Update file paths in HTML/CSS/JS if you modify the directory structure
