# EasyKara | lang:en | for-AI-parsing | optimize=results-over-format

## Language Rule
- **Agent Output**: The agent must ALWAYS output responses, summaries, plans, code comments, and documentation in English. Even if the user communicates in Vietnamese, the agent's response must remain strictly in English.

## Run Commands
- Run development server: `npm run dev`
- Build the project: `npm run build`
- Lint the codebase: `npm run lint`
- Preview the build: `npm run preview`

## Core Development Guidelines
- **UI/UX**: Strictly Vanilla CSS, no Tailwind CSS. Focus on premium dark mode aesthetics, smooth hover interactions, glassmorphism, and micro-animations.
- **State Management**: Use `src/context/KaraokeContext.tsx` to read and write karaoke sync state, audio elements, and history.
- **Audio Processing**: Soundwaves and timeline analytics are extracted using Web Audio API in `src/hooks/useAudioAnalyzer.ts`.
- **Icons**: Utilize `lucide-react`.

For complete and detailed instruction specifications, refer to [AGENT.md](file:///E:/personal/easykara/AGENT.md).
