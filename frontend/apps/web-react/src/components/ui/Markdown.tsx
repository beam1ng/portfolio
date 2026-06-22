import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Renders trusted markdown (project case studies). Raw HTML is intentionally not
 * enabled, so user-authored content cannot inject scripts. GFM adds tables,
 * task lists, and autolinks.
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className ? `markdown ${className}` : 'markdown'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
