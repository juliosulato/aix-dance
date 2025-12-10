import type { Config as DOMPurifyConfig } from 'dompurify';
import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
}

/**
 * Component for safely rendering HTML content
 * Uses DOMPurify to sanitize HTML and prevent XSS attacks
 * 
 * @param html - Raw HTML string to sanitize and render
 * @param className - Optional CSS classes to apply
 * @param allowedTags - Optional array of allowed HTML tags (uses defaults if not provided)
 * @param allowedAttributes - Optional object mapping tags to allowed attributes
 */
export default function SafeHtml({ 
  html, 
  className = '',
  allowedTags,
  allowedAttributes 
}: SafeHtmlProps) {
  // Default configuration for DOMPurify
  const config: DOMPurifyConfig = {
    // Allow common formatting tags
    ALLOWED_TAGS: allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'div', 'span', 'hr'
    ],
    // Allow common attributes
    ALLOWED_ATTR: allowedAttributes ? Object.keys(allowedAttributes) : [
      'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height',
      'colspan', 'rowspan', 'class', 'id', 'style'
    ],
    // Ensure links open in new tab for security
    ADD_ATTR: ['target'],
  };

  // Sanitize the HTML
  const cleanHtml = DOMPurify.sanitize(html, config);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

/**
 * Sanitize HTML string without rendering (useful for processing before saving)
 */
export function sanitizeHtml(html: string, config?: DOMPurifyConfig): string {
  return DOMPurify.sanitize(html, config);
}
