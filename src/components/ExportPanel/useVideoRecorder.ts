import { useState, useRef, useEffect } from 'react';

interface UseVideoRecorderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  mediaUrl: string | null;
}

export const useVideoRecorder = ({ videoRef, mediaUrl }: UseVideoRecorderProps) => {
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    const canvas = document.querySelector('canvas');
    const video = videoRef.current;

    if (!canvas || !video || !mediaUrl) {
      alert('Please load a media file before recording.');
      return;
    }

    try {
      setIsRecordingVideo(true);
      setRecordProgress(0);

      video.currentTime = 0;
      video.playbackRate = 1.0; // Force 1x during record

      const videoStream = canvas.captureStream(30);
      const combinedTracks: MediaStreamTrack[] = [];

      videoStream.getVideoTracks().forEach(track => combinedTracks.push(track));

      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      let destStream: MediaStream;
      if (!audioDestRef.current) {
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();

        source.connect(dest);
        source.connect(audioCtx.destination);

        audioDestRef.current = dest;
        destStream = dest.stream;
      } else {
        destStream = audioDestRef.current.stream;
      }

      destStream.getAudioTracks().forEach(track => combinedTracks.push(track));

      const combinedStream = new MediaStream(combinedTracks);

      let options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      const recorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        const finalUrl = URL.createObjectURL(finalBlob);

        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = 'karaoke_video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(finalUrl);

        setIsRecordingVideo(false);
        setRecordProgress(0);
      };

      video.play();
      recorder.start(100);

      const interval = setInterval(() => {
        if (video.duration && video.currentTime) {
          const pct = Math.round((video.currentTime / video.duration) * 100);
          setRecordProgress(pct);

          if (video.ended || video.currentTime >= video.duration - 0.1) {
            clearInterval(interval);
            recorder.stop();
            video.pause();
          }
        }
      }, 500);

    } catch (e) {
      console.error(e);
      alert('Could not record video. Please try again.');
      setIsRecordingVideo(false);
    }
  };

  const handleStopRecordingVideo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      videoRef.current?.pause();
    }
  };

  return {
    isRecordingVideo,
    recordProgress,
    handleStartRecording,
    handleStopRecordingVideo,
  };
};
