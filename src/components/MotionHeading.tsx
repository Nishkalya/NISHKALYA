import React from 'react';
import { motion } from 'motion/react';

interface MotionHeadingProps {
  html: string;
  className?: string;
  delay?: number;
  whileInView?: boolean;
}

const childVariants: any = {
  hidden: { y: '100%', opacity: 0 },
  visible: (customDelay: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: customDelay
    }
  })
};

export const MotionHeading: React.FC<MotionHeadingProps> = ({ 
  html, 
  className = "", 
  delay = 0,
  whileInView = false
}) => {
  if (!html) return null;

  // Pattern split: match HTML tags (e.g. <span class="text-[#58a6ff]">), non-tag words, and consecutive whitespaces
  const tokens = html.match(/(<[^>]+>|[^<>\s]+|\s+)/g) || [html];

  let currentSpanClass = '';
  let wordIndex = 0;

  return (
    <motion.span 
      initial="hidden"
      {...(whileInView ? { whileInView: "visible", viewport: { once: true, margin: "-10%" } } : { animate: "visible" })}
      className={`inline-block ${className}`}
    >
      {tokens.map((token, index) => {
        // Checking if token is an HTML tag
        if (token.startsWith('<') && token.endsWith('>')) {
          if (token.startsWith('</')) {
            currentSpanClass = '';
          } else {
            // Extractor of the class/className attribute (e.g., class="...")
            const classMatch = token.match(/class(?:Name)?=["']([^"']+)["']/);
            if (classMatch) {
              currentSpanClass = classMatch[1];
            }
          }
          return null; // Tags are parsed for state, not rendered as flat text
        }

        // Return whitespace as normal text segment
        if (/^\s+$/.test(token)) {
          return <span key={index} className="inline-block">{token}</span>;
        }

        const animateDelay = delay + wordIndex * 0.08;
        wordIndex++;

        return (
          <span
            key={index}
            className="inline-block overflow-hidden vertical-align-middle pb-1"
          >
            <motion.span
              custom={animateDelay}
              variants={childVariants}
              className={`inline-block ${currentSpanClass}`}
            >
              {token}
            </motion.span>
            {/* Soft spacing after word token */}
            <span className="inline-block w-[0.25em]">&nbsp;</span>
          </span>
        );
      })}
    </motion.span>
  );
};
