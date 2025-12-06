import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
}

const TargetCursor = ({ targetSelector = '.cursor-target', spinDuration = 2, hideDefaultCursor = true }: TargetCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const constants = useMemo(
    () => ({
      borderWidth: 1,
      cornerSize: 6,
      parallaxStrength: 0.00005
    }),
    []
  );

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.1,
      ease: 'power3.out'
    });
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Show normal cursor on videos and chatbot pages
    const currentPath = window.location.pathname;
    if (currentPath === '/videos' || currentPath.includes('/videos')) {
      if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
      // Restore normal cursor
      document.body.style.cursor = 'auto';
      return;
    }
    
    // For chatbot page, hide custom cursor but show normal system cursor
    if (currentPath === '/chatbot' || currentPath.includes('/chatbot')) {
      if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
      // Restore normal cursor
      document.body.style.cursor = 'auto';
      return;
    }

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    let activeTarget: Element | null = null;
    let currentTargetMove: ((ev: Event) => void) | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let isAnimatingToTarget = false;
    let resumeTimeout: NodeJS.Timeout | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentTargetMove) {
        target.removeEventListener('mousemove', currentTargetMove);
      }
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentTargetMove = null;
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    const createSpinTimeline = () => {
      if (spinTl.current) {
        spinTl.current.kill();
      }
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    // Function to check if video modal/dialog is open
    const checkVideoModalOpen = () => {
      // Check for video modals and dialogs
      const videoModals = Array.from(document.querySelectorAll('.video-modal, .video-dialog, [data-video-modal], [aria-label*="video" i]'));
      const openDialogs = Array.from(document.querySelectorAll('[role="dialog"][data-state="open"], .dialog-overlay, .modal-overlay, .video-card-expanded, .video-card-open'));
      
      // Check for any expanded/opened video cards
      const videoCards = Array.from(document.querySelectorAll('.video-card, [data-video-card], [class*="video-card"]'));
      
      for (const card of videoCards) {
        if (card.classList.contains('expanded') || 
            card.classList.contains('open') || 
            card.classList.contains('active') ||
            card.getAttribute('data-state') === 'open' ||
            card.getAttribute('aria-expanded') === 'true') {
          return true;
        }
      }
      
      for (const modal of videoModals) {
        if (modal.getAttribute('data-state') === 'open' || 
            modal.classList.contains('open') ||
            modal.classList.contains('expanded') ||
            window.getComputedStyle(modal).display !== 'none') {
          return true;
        }
      }
      
      for (const dialog of openDialogs) {
        if (dialog.querySelector('video, iframe, [class*="video"]') ||
            dialog.classList.contains('video-card-expanded') ||
            dialog.classList.contains('video-card-open')) {
          return true;
        }
      }
      
      // Check for any fullscreen video elements
      if (document.fullscreenElement && 
          (document.fullscreenElement.tagName === 'VIDEO' || 
           document.fullscreenElement.querySelector('video, iframe'))) {
        return true;
      }
      
      return false;
    };

    // Hide cursor when video modal is open
    const handleVideoModalVisibility = () => {
      if (checkVideoModalOpen()) {
        if (cursorRef.current) {
          gsap.to(cursorRef.current, { opacity: 0, duration: 0.3 });
        }
      } else {
        if (cursorRef.current) {
          gsap.to(cursorRef.current, { opacity: 1, duration: 0.3 });
        }
      }
    };

    // Monitor for modal changes
    const modalObserver = new MutationObserver(handleVideoModalVisibility);
    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'class', 'style', 'aria-expanded']
    });

    // Listen for video card clicks and interactions
    const handleVideoCardClick = (e: Event) => {
      const target = e.target as Element;
      const videoCard = target.closest('.video-card, [data-video-card], [class*="video-card"]');
      
      if (videoCard) {
        // Small delay to allow state changes to occur
        setTimeout(handleVideoModalVisibility, 100);
      }
    };

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      handleVideoModalVisibility();
    };

    document.addEventListener('click', handleVideoCardClick);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Listen for route changes to hide/show cursor on videos and chatbot pages
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/videos' || currentPath.includes('/videos')) {
        if (cursorRef.current) {
          cursorRef.current.style.display = 'none';
        }
        // Show normal cursor on videos page
        document.body.style.cursor = 'auto';
      } else if (currentPath === '/chatbot' || currentPath.includes('/chatbot')) {
        if (cursorRef.current) {
          cursorRef.current.style.display = 'none';
        }
        // Show normal cursor on chatbot page
        document.body.style.cursor = 'auto';
      } else {
        if (cursorRef.current) {
          cursorRef.current.style.display = 'block';
        }
        // Restore hidden cursor for other pages (if hideDefaultCursor is true)
        if (hideDefaultCursor) {
          document.body.style.cursor = 'none';
        }
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(handleRouteChange, 0);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handleRouteChange, 0);
    };

    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;

      const mouseX = gsap.getProperty(cursorRef.current, 'x') as number;
      const mouseY = gsap.getProperty(cursorRef.current, 'y') as number;

      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);

      if (!isStillOverTarget) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    //---------------------------------------------------------------
    // This code for onclick animation with safety fallback
    let clickResetTimeout: NodeJS.Timeout | null = null;
    let isClickAnimating = false;

    const mouseDownHandler = () => {
      if (!dotRef.current || !cursorRef.current) return;
      
      // Clear any existing timeout
      if (clickResetTimeout) {
        clearTimeout(clickResetTimeout);
        clickResetTimeout = null;
      }
      
      isClickAnimating = true;
      // Only kill tweens on the dot and cursor scale, NOT rotation
      gsap.killTweensOf(dotRef.current);
      gsap.killTweensOf(cursorRef.current, 'scale'); // Only kill scale animations, keep rotation
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.15, ease: 'power2.out' });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.15, ease: 'power2.out' });
      
      // Safety fallback - reset after 500ms if mouseup doesn't fire
      clickResetTimeout = setTimeout(() => {
        if (isClickAnimating && dotRef.current && cursorRef.current) {
          gsap.to(dotRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
          gsap.to(cursorRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
          isClickAnimating = false;
        }
      }, 500);
    };

    // Animate it back to its original size
    const mouseUpHandler = () => {
      if (!dotRef.current || !cursorRef.current) return;
      
      // Clear the safety timeout
      if (clickResetTimeout) {
        clearTimeout(clickResetTimeout);
        clickResetTimeout = null;
      }
      
      isClickAnimating = false;
      // Only kill tweens on the dot and cursor scale, NOT rotation
      gsap.killTweensOf(dotRef.current);
      gsap.killTweensOf(cursorRef.current, 'scale'); // Only kill scale animations, keep rotation
      gsap.to(dotRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };
    
    // Also reset on click event as backup
    const clickHandler = (e: MouseEvent) => {
      // Small delay to let the animation play
      setTimeout(() => {
        if (dotRef.current && cursorRef.current) {
          gsap.to(dotRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
          gsap.to(cursorRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
          isClickAnimating = false;
        }
      }, 100);
      
      // If we clicked on a target element, reset cursor to normal spinning state after a short delay
      const target = (e.target as Element).closest(targetSelector);
      if (target && activeTarget) {
        setTimeout(() => {
          // Force reset cursor to normal state
          if (activeTarget) {
            cleanupTarget(activeTarget);
          }
          activeTarget = null;
          isAnimatingToTarget = false;
          
          // Reset corners to normal position
          if (cornersRef.current) {
            const corners = Array.from(cornersRef.current);
            gsap.killTweensOf(corners);
            
            const { cornerSize } = constants;
            const positions = [
              { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
              { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
              { x: cornerSize * 0.5, y: cornerSize * 0.5 },
              { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
            ];
            
            const tl = gsap.timeline();
            corners.forEach((corner, index) => {
              tl.to(
                corner,
                {
                  x: positions[index].x,
                  y: positions[index].y,
                  duration: 0.3,
                  ease: 'power3.out'
                },
                0
              );
            });
          }
          
          // Resume spinning
          if (cursorRef.current && spinTl.current) {
            const currentRotation = gsap.getProperty(cursorRef.current, 'rotation') as number;
            const normalizedRotation = currentRotation % 360;
            
            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
            
            gsap.to(cursorRef.current, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => {
                spinTl.current?.restart();
              }
            });
          }
        }, 150);
      }
    };

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('click', clickHandler);

    //----------------------------------------------------------------
    const enterHandler = (e: MouseEvent) => {
      const directTarget = e.target as Element;

      // Check if we're hovering over a video element or video container
      let current: Element | null = directTarget;
      while (current && current !== document.body) {
        if (current.tagName === 'VIDEO' || 
            current.tagName === 'IFRAME' || 
            current.classList.contains('video-container') ||
            current.classList.contains('video-player') ||
            current.classList.contains('video-card') ||
            current.classList.contains('video-modal') ||
            current.classList.contains('video-dialog') ||
            current.closest('video, iframe, [class*="video"]')) {
          // Hide the entire cursor when over video content
          if (cursorRef.current) {
            gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
          }
          return; // Exit early if we're over video content
        }
        current = current.parentElement;
      }

      // Show cursor if it was hidden and we're not over video content
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { opacity: 1, duration: 0.2 });
      }

      const allTargets: Element[] = [];
      current = directTarget;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }

      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;

      if (activeTarget === target) return;

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(corner => {
        gsap.killTweensOf(corner);
      });

      gsap.killTweensOf(cursorRef.current, 'rotation');
      spinTl.current?.pause();

      gsap.set(cursorRef.current, { rotation: 0 });

      const updateCorners = (mouseX?: number, mouseY?: number) => {
        const rect = target.getBoundingClientRect();
        const cursorRect = cursorRef.current!.getBoundingClientRect();

        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tlc, trc, brc, blc] = Array.from(cornersRef.current!);

        const { borderWidth, cornerSize, parallaxStrength } = constants;

        let tlOffset = {
          x: rect.left - cursorCenterX - borderWidth,
          y: rect.top - cursorCenterY - borderWidth
        };
        let trOffset = {
          x: rect.right - cursorCenterX + borderWidth - cornerSize,
          y: rect.top - cursorCenterY - borderWidth
        };
        let brOffset = {
          x: rect.right - cursorCenterX + borderWidth - cornerSize,
          y: rect.bottom - cursorCenterY + borderWidth - cornerSize
        };
        let blOffset = {
          x: rect.left - cursorCenterX - borderWidth,
          y: rect.bottom - cursorCenterY + borderWidth - cornerSize
        };

        if (mouseX !== undefined && mouseY !== undefined) {
          const targetCenterX = rect.left + rect.width / 2;
          const targetCenterY = rect.top + rect.height / 2;
          const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
          const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;

          tlOffset.x += mouseOffsetX;
          tlOffset.y += mouseOffsetY;
          trOffset.x += mouseOffsetX;
          trOffset.y += mouseOffsetY;
          brOffset.x += mouseOffsetX;
          brOffset.y += mouseOffsetY;
          blOffset.x += mouseOffsetX;
          blOffset.y += mouseOffsetY;
        }

        const tl = gsap.timeline();
        const corners = [tlc, trc, brc, blc];
        const offsets = [tlOffset, trOffset, brOffset, blOffset];

        corners.forEach((corner, index) => {
          tl.to(
            corner,
            {
              x: offsets[index].x,
              y: offsets[index].y,
              duration: 0.2,
              ease: 'power2.out'
            },
            0
          );
        });
      };

      isAnimatingToTarget = true;
      updateCorners();

      setTimeout(() => {
        isAnimatingToTarget = false;
      }, 1);

      let moveThrottle: number | null = null;
      const targetMove = (ev: Event) => {
        const mouseEvent = ev as MouseEvent;
        if (moveThrottle || isAnimatingToTarget) return;
        moveThrottle = requestAnimationFrame(() => {
          updateCorners(mouseEvent.clientX, mouseEvent.clientY);
          moveThrottle = null;
        });
      };

      const leaveHandler = () => {
        activeTarget = null;
        isAnimatingToTarget = false;

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners);

          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];

          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: 'power3.out'
              },
              0
            );
          });
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current && spinTl.current) {
            const currentRotation = gsap.getProperty(cursorRef.current, 'rotation') as number;
            const normalizedRotation = currentRotation % 360;

            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });

            gsap.to(cursorRef.current, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => {
                spinTl.current?.restart();
              }
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      currentTargetMove = targetMove;
      currentLeaveHandler = leaveHandler;

      target.addEventListener('mousemove', targetMove);
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      window.removeEventListener('click', clickHandler);
      
      // Clear click timeout if exists
      if (clickResetTimeout) {
        clearTimeout(clickResetTimeout);
      }
      
      // Remove video card event listeners
      document.removeEventListener('click', handleVideoCardClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      // Remove route change listener
      window.removeEventListener('popstate', handleRouteChange);
      
      // Restore original history methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      // Cleanup mutation observer
      modalObserver.disconnect();

      console.log('Cleaning up TargetCursor');

      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor]);

  useEffect(() => {
    if (!cursorRef.current || !spinTl.current) return;

    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    }
  }, [spinDuration]);

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;
