# EasyKara | lang:en | for-AI-parsing | optimize=results-over-format

## Language Rule
- **Agent Output**: The agent must ALWAYS output responses, summaries, plans, code comments, and documentation in English. Even if the user communicates in Vietnamese, the agent's response must remain strictly in English.

## Run Commands
- Run development server: `npm run dev`
- Build the project: `npm run build`
- Lint the codebase: `npm run lint`
- Preview the build: `npm run preview`

## Core Development Guidelines
- **UI/UX & Design System**: Styled using Tailwind CSS v4. All styling, layout, colors (Blackout `#000000`, Graphite Deep `#151617`, Graphite `#242628`, Whiteout `#ffffff`, Neon Glow `#34d59a`), typography (Inter and Fira Code/GeistMono), and border-radii (4px for cards/containers/inputs, 9999px pills for buttons) MUST be sourced directly from the rules in [DESIGN.md](file:///E:/personal/easykara/DESIGN.md).
- **Style Constraints**: All static `style={{ ... }}` objects inside React components are strictly prohibited and must be replaced with Tailwind CSS classes. Truly dynamic properties (such as playhead offsets or waveform width) are allowed inline.
- **Component Limits**: No single component or hook file is permitted to exceed **200 lines**. Keep them focused and split when necessary.
- **State Management**: Use `src/context/KaraokeContext.tsx` to read and write karaoke sync state, audio elements, and history.
- **Audio Processing**: Soundwaves and timeline analytics are extracted using Web Audio API in `src/hooks/useAudioAnalyzer.ts`.
- **Icons**: Utilize `lucide-react`.

For complete and detailed instruction specifications, refer to [AGENT.md](file:///E:/personal/easykara/AGENT.md).
