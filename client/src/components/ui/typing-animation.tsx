import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  className = '',
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < text.length) {
      // Typing mode - add next character
      timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, typingSpeed);
    } else if (!isDeleting && charIndex === text.length) {
      // Finished typing - pause before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && charIndex > 0) {
      // Deleting mode - remove last character
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev - 1);
        setDisplayedText(text.substring(0, charIndex - 1));
      }, deletingSpeed);
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting - start typing again
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, text, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <h1 className={cn('text-4xl lg:text-6xl font-bold mb-6 text-foreground', className)}>
      {displayedText}
      <span className="inline-block w-1 h-[1.2em] bg-primary ml-1 animate-[blink_1s_ease-in-out_infinite] align-text-top"></span>
    </h1>
  );
};

