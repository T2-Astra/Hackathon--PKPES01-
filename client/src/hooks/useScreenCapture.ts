import { useState, useCallback } from 'react';

interface ScreenCaptureOptions {
  onSuccess?: (file: File) => void;
  onError?: (error: string) => void;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

interface ScreenCaptureState {
  isCapturing: boolean;
  isSupported: boolean;
  error: string | null;
}

export function useScreenCapture(options: ScreenCaptureOptions = {}) {
  const {
    onSuccess,
    onError,
    quality = 0.9,
    format = 'png'
  } = options;

  const [state, setState] = useState<ScreenCaptureState>({
    isCapturing: false,
    isSupported: 'getDisplayMedia' in navigator.mediaDevices,
    error: null,
  });

  const captureScreen = useCallback(async () => {
    if (!state.isSupported) {
      const errorMsg = 'Screen capture not supported in this browser';
      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    setState(prev => ({ ...prev, isCapturing: true, error: null }));

    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
        } as MediaTrackConstraints,
        audio: false,
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.position = 'absolute';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      document.body.appendChild(video);

      // Wait for video to load
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Wait a bit for the video to start playing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Clean up video element
      document.body.removeChild(video);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, `image/${format}`, quality);
      });

      // Create file from blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.${format}`;
      const file = new File([blob], filename, { type: `image/${format}` });

      setState(prev => ({ ...prev, isCapturing: false }));
      onSuccess?.(file);

    } catch (error: any) {
      let errorMessage = 'Failed to capture screenshot';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Screen capture permission denied. Please allow screen sharing.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No screen available for capture.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Screen capture not supported in this browser.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Screen capture was cancelled.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState(prev => ({ 
        ...prev, 
        isCapturing: false, 
        error: errorMessage 
      }));
      onError?.(errorMessage);
    }
  }, [state.isSupported, onSuccess, onError, quality, format]);

  const captureScreenWithFeedback = useCallback(async () => {
    if (state.isCapturing) return;
    
    // Show user feedback
    setState(prev => ({ ...prev, isCapturing: true }));
    
    // Small delay to show the capturing state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await captureScreen();
  }, [captureScreen, state.isCapturing]);

  return {
    ...state,
    captureScreen: captureScreenWithFeedback,
  };
}
