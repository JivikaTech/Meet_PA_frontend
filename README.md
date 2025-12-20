# Meet PA - Frontend

Modern Next.js application for AI-powered meeting notes with audio recording and file upload capabilities.

## Features

- Audio file upload with drag-and-drop support
- Browser-based audio recording using MediaRecorder API
- Real-time processing status indicators
- AI-generated transcripts and summaries
- Editable transcripts and summaries
- Responsive Notion-inspired UI
- Toast notifications for user feedback

## Prerequisites

- Node.js 18+ and npm
- Running backend server (see Backend README)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

If not set, defaults to `http://localhost:3001`

## Development

Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Features Overview

### Audio Upload
- Drag & drop audio files
- Supports: MP3, WAV, M4A, WebM, OGG
- Max file size: 100MB
- File preview before processing

### Audio Recording
- Browser-based recording
- Pause/resume functionality
- Recording timer
- Visual feedback
- Automatic format detection

### Processing Pipeline
1. **Upload**: File uploaded to backend
2. **Transcription**: AWS Transcribe converts speech to text (2-3 min)
3. **Summary**: Claude AI generates structured notes
4. **Results**: View and edit transcript and summary

### Results Display
- **Transcript Viewer**: Full transcript with copy and edit features
- **Summary Panel**: 
  - TL;DR (3-line summary)
  - Key Discussion Points
  - Decisions Made
  - Action Items

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Dropzone** - File upload
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **TanStack Query** - Server state (planned)

## Project Structure

```
app/
├── page.tsx           # Main meeting interface
├── layout.tsx         # Root layout
└── globals.css        # Global styles

components/
├── AudioUploader.tsx  # File upload component
├── AudioRecorder.tsx  # Browser recording component
├── TranscriptViewer.tsx # Transcript display
├── SummaryPanel.tsx   # Summary display
└── LoadingStates.tsx  # Progress indicators

lib/
├── api-client.ts      # API communication
└── types.ts           # TypeScript types

hooks/
└── useAudioProcessing.ts # Audio workflow logic
```

## Browser Compatibility

### Audio Recording
- Chrome/Edge: Full support (WebM/Opus)
- Firefox: Full support (WebM/Opus)
- Safari: Limited (MP4/AAC)

### Audio Upload
- All modern browsers

## Development Tips

1. **Backend Connection**: Ensure backend is running on port 3001
2. **Browser Permissions**: Allow microphone access for recording
3. **File Formats**: Test with different audio formats
4. **Large Files**: Transcription can take 2-3 minutes for long recordings

## Common Issues

### "No response from server"
- Check if backend is running: `http://localhost:3001/health`
- Verify CORS settings in backend

### "Failed to access microphone"
- Grant browser microphone permissions
- Check browser compatibility
- Use HTTPS in production (required for MediaRecorder)

### "File size exceeds limit"
- Max upload size: 100MB
- Compress audio before upload if needed

## API Integration

The frontend communicates with the backend through:
- `POST /api/upload` - Upload audio file
- `POST /api/transcribe` - Start transcription
- `POST /api/summarize` - Generate summary

See backend README for API documentation.

## Customization

### Styling
Edit `app/globals.css` for global styles. Uses Tailwind CSS v4 with custom theme.

### Branding
Update metadata in `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your description",
};
```

## License

ISC
