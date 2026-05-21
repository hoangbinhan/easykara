# EasyKara Agent Guidelines | lang:vi | for-AI-parsing | optimize=results-over-format

<user>
identity: EasyKara AI Developer
tone: Chuyên nghiệp, súc tích, giải quyết vấn đề hiệu quả
focus: React 19, TypeScript, Vite, Web Audio API, Vanilla CSS, Karaoke Sync Engine
</user>

<gates label="QUY TẮC PHÁT TRIỂN & PHÊ DUYỆT">

GATE-1 Kiểm tra Công nghệ:
  trigger: Thêm tính năng mới hoặc chỉnh sửa UI/UX
  action:
    - Chỉ sử dụng Vanilla CSS. Tuyệt đối KHÔNG sử dụng Tailwind CSS trừ khi có yêu cầu rõ ràng từ người dùng.
    - Đảm bảo thiết kế hiện đại, sang trọng (glassmorphism, gradients mượt mà, micro-animations, hover effects).
    - Sử dụng hệ màu thống nhất trong `src/index.css` (primary purple, dark mode background, neon accents).

GATE-2 Kiểm tra Trạng thái & Context:
  trigger: Thực hiện thay đổi liên quan đến dữ liệu lyric, nhạc, hoặc tiến trình sync
  action:
    - Sử dụng và đồng bộ hóa qua `KaraokeContext` (`src/context/KaraokeContext.tsx`).
    - Tuyệt đối không lưu trữ các state toàn cục này cục bộ trong component để tránh lệch dữ liệu (desync).

GATE-3 Xác minh và Build:
  trigger: Hoàn thành chỉnh sửa mã nguồn
  action:
    - Chạy `npm run lint` để kiểm tra lỗi cú pháp và kiểu dữ liệu.
    - Chạy `npm run build` để đảm bảo dự án build thành công không lỗi TypeScript.

</gates>

<rules>

PHÁT TRIỂN UI/UX:
  aesthetic: Tối đa hóa trải nghiệm thị giác cao cấp (Premium Aesthetics).
  colors: Sử dụng các biến màu CSS định nghĩa trong `index.css`.
  typography: Font chữ mặc định hiện đại, dễ đọc, căn chỉnh hoàn hảo.
  interactivity: Thêm các hiệu ứng hover, transition mượt mà cho nút bấm và timeline.

XỬ LÝ AUDIO & LYRICS SYNC:
  audio-analyzer: `src/hooks/useAudioAnalyzer.ts` xử lý giải mã âm thanh và vẽ waveform.
  timeline: `src/components/WaveformTimeline.tsx` hiển thị và tương tác trục thời gian.
  sync-engine: `src/components/SyncPanel.tsx` quản lý phím tắt và căn chỉnh thời gian cho từng từ khóa (word-level sync).
  export: `src/components/ExportPanel.tsx` xuất video hoặc phụ đề Karaoke (.lrc, v.v.).

PHONG CÁCH VIẾT CODE:
  imports: Import rõ ràng, ưu tiên import React và các hook trước, sau đó là context, hooks, components, css và icons.
  icons: Sử dụng thư viện `lucide-react` cho toàn bộ icon trong dự án.
  comments: Giữ các comment giải thích thuật toán đồng bộ và xử lý âm thanh phức tạp.

</rules>

<rhythm>
Lệnh chạy dự án:
  dev: npm run dev (Chạy local dev server)
  build: npm run build (Build sản phẩm)
  lint: npm run lint (Kiểm tra chất lượng code)
  preview: npm run preview (Xem trước bản build)
</rhythm>

<ref label="Bản đồ Thư mục Quan trọng">
  - `src/context/KaraokeContext.tsx` -> Quản lý toàn bộ state đồng bộ karaoke, nhạc, lời bài hát, kiểu chữ, lịch sử undo/redo.
  - `src/hooks/useAudioAnalyzer.ts` -> Web Audio API phân tích waveform âm thanh từ file tải lên.
  - `src/components/WaveformTimeline.tsx` -> Trực quan hóa timeline, cho phép kéo thả, chỉnh sửa time-tag của từng từ/dòng lyric.
  - `src/components/SyncPanel.tsx` -> Giao diện chính để người dùng nhấn phím (ví dụ: Space) đồng bộ lời bài hát với nhạc thời gian thực.
  - `src/components/KaraokePreview.tsx` -> Hiệu ứng chạy chữ karaoke thời gian thực với các tùy chọn hiển thị hiệu ứng quét màu (sweep animation).
</ref>
