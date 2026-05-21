# EasyKara | lang:vi | for-AI-parsing | optimize=results-over-format

## Lệnh chạy dự án
- Chạy môi trường phát triển: `npm run dev`
- Build dự án: `npm run build`
- Kiểm tra lỗi code (Lint): `npm run lint`
- Xem trước bản build: `npm run preview`

## Hướng dẫn phát triển chính
- **UI/UX**: Sử dụng Vanilla CSS, thiết kế hiện đại, sang trọng, có độ bóng (glassmorphism) và hiệu ứng hover/transition mượt mà. KHÔNG dùng Tailwind CSS trừ khi được yêu cầu.
- **Quản lý State**: Trạng thái chính của nhạc, lời bài hát, căn chỉnh thời gian nằm trong `src/context/KaraokeContext.tsx`.
- **Audio Analyzer**: Phân tích sóng âm thanh thông qua Web Audio API tại `src/hooks/useAudioAnalyzer.ts`.
- **Icon**: Sử dụng thư viện `lucide-react`.

Xem chi tiết hướng dẫn phát triển toàn diện dành riêng cho AI Agent tại [AGENT.md](file:///E:/personal/easykara/AGENT.md).
