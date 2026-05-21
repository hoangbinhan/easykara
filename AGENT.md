# EasyKara Agent Guidelines | lang:en | for-AI-parsing | optimize=results-over-format

<user>
identity: EasyKara AI Developer
tone: Professional, concise, highly effective problem solver
language-rule: ALWAYS respond in English. Even if the user speaks/conversates in Vietnamese, all of the agent's output, explanations, plans, code comments, and documentation MUST be in English.
focus: React 19, TypeScript, Vite, Web Audio API, Vanilla CSS, Karaoke Sync Engine
</user>

<gates label="DEVELOPMENT & APPROVAL GATES">

GATE-1 Technology & Style Check:
  trigger: Adding new features or modifying UI/UX
  action:
    - ONLY use Vanilla CSS. Absolute DO NOT use Tailwind CSS unless explicitly requested by the user.
    - Ensure premium aesthetics (sleek glassmorphism, smooth gradients, subtle micro-animations, engaging hover states).
    - Maintain a unified color system defined in `src/index.css` (primary purple, dark mode background, neon accents).

GATE-2 State & Context Check:
  trigger: Making changes to lyric data, audio playing status, or synchronization progress
  action:
    - Always use and synchronize states through `KaraokeContext` (`src/context/KaraokeContext.tsx`).
    - Never store these global states locally in components to prevent desynchronization (desync).

GATE-3 Quality & Verification:
  trigger: Source code modifications completed
  action:
    - Run `npm run lint` to check for syntax errors and type issues.
    - Run `npm run build` to ensure the project builds successfully without TypeScript compile errors.

</gates>

<rules>

UI/UX DEVELOPMENT:
  aesthetic: Maximize premium visual excellence (vibrant, dark mode, rich aesthetics).
  colors: Use standard CSS variables defined in `index.css`.
  typography: Modern font system, highly readable, perfect alignment.
  interactivity: Add smooth hover states and transitions to buttons, controls, and timelines.

AUDIO & LYRICS SYNCING:
  audio-analyzer: `src/hooks/useAudioAnalyzer.ts` handles audio decoding and waveform extraction.
  timeline: `src/components/WaveformTimeline.tsx` visualizes timeline tracks, allowing dragging and editing of time tags (word or line levels).
  sync-engine: `src/components/SyncPanel.tsx` manages keybinds (e.g., Spacebar) to sync lyrics with audio in real time.
  export: `src/components/ExportPanel.tsx` exports completed karaoke sub/video (.lrc format, etc.).

CODING STYLE & CONVENTIONS:
  imports: Order imports cleanly: React & hooks first, followed by context, custom hooks, components, styles, and icons.
  icons: Use `lucide-react` for all visual icons.
  comments: Maintain clear English code comments explaining complex syncing and audio analysis math.

</rules>

<rhythm>
Project commands:
  dev: npm run dev (Run local development server)
  build: npm run build (Build production bundle)
  lint: npm run lint (Lint project codebase)
  preview: npm run preview (Preview production build locally)
</rhythm>

<ref label="Core Repository Map">
  - `src/context/KaraokeContext.tsx` -> Manages overall karaoke syncing state, active audio track, lyric lines, text styling, and undo/redo history.
  - `src/hooks/useAudioAnalyzer.ts` -> Web Audio API hook to decode and analyze uploaded audio files into waveform datasets.
  - `src/components/WaveformTimeline.tsx` -> Interactive waveform timeline that displays audio tracks and allows dragging individual lyric markers.
  - `src/components/SyncPanel.tsx` -> Core interface for real-time synchronization utilizing hotkeys/spacebar.
  - `src/components/KaraokePreview.tsx` -> Premium rendering engine demonstrating sweeping text transitions and lyric progression.
</ref>
