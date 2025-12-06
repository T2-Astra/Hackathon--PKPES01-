import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { useLanguageContext } from '@/hooks/useLanguageContext';
import { 
  Camera, 
  Monitor, 
  Smartphone, 
  Tablet,
  AlertCircle, 
  CheckCircle,
  Loader2,
  Download,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenshotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScreenshotCapture: (file: File) => void;
}

export function ScreenshotDialog({ isOpen, onClose, onScreenshotCapture }: ScreenshotDialogProps) {
  const { t } = useLanguageContext();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const { isCapturing, isSupported, error, captureScreen } = useScreenCapture({
    onSuccess: (file) => {
      setCapturedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
    },
    onError: (errorMsg) => {
      console.error('Screenshot error:', errorMsg);
    },
    quality: 0.9,
    format: 'png'
  });

  const handleCapture = async () => {
    // Clear previous capture
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
      setCapturedFile(null);
    }
    
    await captureScreen();
  };

  const handleUseScreenshot = () => {
    if (capturedFile) {
      onScreenshotCapture(capturedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    // Clean up object URL
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
      setCapturedFile(null);
    }
    onClose();
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Screenshot Capture
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Not Supported</h3>
            <p className="text-muted-foreground text-sm">
              Screen capture is not supported in this browser. Please try using Chrome, Edge, or Firefox.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Take Screenshot
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Instructions */}
          {!capturedImage && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Monitor className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Capture Your Screen</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Click the button below to start screen capture. You can choose to capture your entire screen, 
                      a specific window, or a browser tab.
                    </p>
                  </div>
                  
                  {/* Capture Options Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg border">
                      <Monitor className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Entire Screen</span>
                      <span className="text-muted-foreground text-center">Capture everything on your screen</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg border">
                      <div className="w-5 h-5 border-2 border-green-500 rounded"></div>
                      <span className="font-medium">Application Window</span>
                      <span className="text-muted-foreground text-center">Capture a specific application</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg border">
                      <Tablet className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Browser Tab</span>
                      <span className="text-muted-foreground text-center">Capture a specific browser tab</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCapture} 
                    disabled={isCapturing}
                    className="w-full max-w-sm"
                  >
                    {isCapturing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Start Screen Capture
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Screenshot Preview */}
          {capturedImage && (
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Screenshot Captured
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {capturedFile && `${(capturedFile.size / 1024 / 1024).toFixed(1)}MB`}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleCapture}>
                      <Camera className="w-4 h-4 mr-1" />
                      Retake
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Screenshot preview" 
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Preview your screenshot before adding it to the chat
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleUseScreenshot}>
                      <Download className="w-4 h-4 mr-2" />
                      Use Screenshot
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
