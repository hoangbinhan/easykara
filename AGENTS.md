# EasyKara Agent Guidelines | lang:en | for-AI-parsing | optimize=results-over-format

<user>
identity: EasyKara AI Developer
tone: Professional, concise, highly effective problem solver
language-rule: ALWAYS respond in English. Even if the user speaks/conversates in Vietnamese, all of the agent's output, explanations, plans, code comments, and documentation MUST be in English.
focus: React 19, TypeScript, Vite, Web Audio API, Tailwind CSS v4, Karaoke Sync Engine
</user>

<gates label="DEVELOPMENT & APPROVAL GATES">

GATE-1 Technology & Style Check:
trigger: Adding new features or modifying UI/UX
action: - ALWAYS use Tailwind CSS v4 + custom utility class tokens defined in `src/index.css` / `DESIGN.md`. - NEVER use static `style={{ ... }}` objects inside React components. All static styles must be replaced with Tailwind CSS classes. Dynamic 60fps positioning (such as playhead coordinates) is permitted inline. - Ensure premium aesthetics, layout, and visual balance. All styling guidelines must be sourced directly from the rules in [DESIGN.md](file:///E:/personal/easykara/DESIGN.md). - Maintain the Neon theme: Blackout canvas `#000000`, Graphite Deep surfaces `#151617`, Whiteout CTAs `#ffffff`, and electric Neon Glow accent `#34d59a`.

GATE-2 State & Context Check:
trigger: Making changes to lyric data, audio playing status, or synchronization progress
action: - Always use and synchronize states through `KaraokeContext` (`src/context/KaraokeContext.tsx`). - Never store these global states locally in components to prevent desynchronization (desync).

GATE-3 Component Limit Check:
trigger: Adding or modifying React components
action: - Ensure no single component file or hook exceeds **200 lines** of code. Keep files atomic, highly focused, and reusable.

GATE-4 Quality & Verification:
trigger: Source code modifications completed
action: - Run `npm run lint` to check for syntax errors and type issues. - Run `npm run build` to ensure the project builds successfully without TypeScript compile errors.

</gates>

<rules>

UI/UX DEVELOPMENT:
aesthetic: Maximize premium visual excellence. All styling, layout, typography, radii, and color choices MUST be sourced directly from [DESIGN.md](file:///E:/personal/easykara/DESIGN.md).
colors: Use standard Tailwind utility classes for the Neon theme (Blackout `#000000`, Graphite Deep `#151617`, Graphite `#242628`, Whiteout `#ffffff`, and Neon Glow `#34d59a` accents).
typography: Strict compliance with Inter (body copy, headings) and GeistMono/Fira Code (code displays, tags, inputs) hierarchy and weights from [DESIGN.md](file:///E:/personal/easykara/DESIGN.md).
radii: Strict 4px radius for all containers, inputs, and cards (`rounded-[4px]`), and 9999px pill shapes for buttons (`rounded-full`).
interactivity: Add smooth hover states and transitions using Tailwind's transition utilities.
inline-styles: Strictly prohibit all static `style={{ ... }}` blocks. Re-route them entirely to Tailwind CSS classes. Only truly dynamic runtime properties may be inline.

AUDIO & LYRICS SYNCING:
audio-analyzer: `src/hooks/useAudioAnalyzer.ts` handles audio decoding and waveform extraction.
timeline: `src/components/WaveformTimeline.tsx` visualizes timeline tracks, allowing dragging and editing of time tags (word or line levels).
sync-engine: `src/components/SyncPanel.tsx` manages keybinds (e.g., Spacebar) to sync lyrics with audio in real time.
export: `src/components/ExportPanel.tsx` exports completed karaoke sub/video (.lrc format, etc.).

CODING STYLE & CONVENTIONS:
imports: Order imports cleanly: React & hooks first, followed by context, custom hooks, components, styles, and icons. Each component should not exceed 200 lines; it's best to break it down into as many components as possible.
icons: Use `lucide-react` for all visual icons.
comments: Maintain clear English code comments explaining complex syncing and audio analysis math.

MULTIPLE LANGUAGES (i18n):
i18n-rule: ALWAYS use multiple languages for all static and user-facing text copy rendered inside React components. NEVER hardcode strings in the component templates. All text must be defined as key-value pairs in the JSON files under `@src/locales` (e.g. `en.json`, `vi.json`) and retrieved at runtime using the `useLanguage` translation hook (`t`).

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
