import { useState, useCallback, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';

/* ─── Props ─── */

interface MarkdownRendererProps {
  content: string;
}

/* ─── Code Block with Copy Button ─── */

interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
}

function CodeBlock({ className, children }: CodeBlockProps): ReactNode {
  const [copied, setCopied] = useState<boolean>(false);
  const match = /language-(\w+)/.exec(className ?? '');
  const language = match?.[1] ?? '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codeString]);

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-language">{language}</span>
        <button
          onClick={handleCopy}
          className="code-copy-btn"
          aria-label="Copy code"
          type="button"
        >
          {copied ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Copy size={14} />
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className={className}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

/* ─── Main Renderer ─── */

export default function MarkdownRenderer({ content }: MarkdownRendererProps): ReactNode {
  return (
    <div className="prose-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        children={content}
        components={{
          code({ className, children, ...rest }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="inline-code" {...rest}>
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="md-link"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="table-wrapper">
                <table>{children}</table>
              </div>
            );
          },
          blockquote({ children }) {
            return <blockquote className="md-blockquote">{children}</blockquote>;
          },
        }}
      />
    </div>
  );
}
