'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@nextui-org/react';
import rehypeRaw from 'rehype-raw';

interface MarkdownContentProps {
  content: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface VideoProps {
  src: string;
  title?: string;
  height?: string;
}

interface VideoElementProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  src?: string;
  title?: string;
  height?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="flat"
      className="absolute right-2 top-2 bg-content2/50 hover:bg-content2"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <CopyIcon className="h-4 w-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function Video({ src, title, height = '400px' }: VideoProps) {
  // Handle different video types
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    // Convert YouTube URL to embed URL
    const videoId = src.includes('youtu.be')
      ? src.split('youtu.be/')[1]
      : src.split('v=')[1]?.split('&')[0];
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden my-8">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    );
  }

  // Handle direct video files
  return (
    <div className="my-8">
      <video controls className="w-full rounded-lg" style={{ maxHeight: height }}>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative">
                <CopyButton text={String(children).replace(/\n$/, '')} />
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="!mt-0"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          p({ children }) {
            return <p className="my-4 leading-relaxed">{children}</p>;
          },
          h2({ children }) {
            return <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-primary hover:text-primary-600 underline decoration-primary/30 hover:decoration-primary-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          div(props: VideoElementProps) {
            // Check if this is a video element
            if (props.className === 'video') {
              // Extract src and title from iframe if it exists
              const children = props.children as React.ReactNode[];
              const iframe = children?.[0];
              if (
                iframe &&
                typeof iframe === 'object' &&
                'type' in iframe &&
                iframe.type === 'iframe'
              ) {
                const { src, title } = (iframe as any).props;
                return <Video src={src} title={title} />;
              }
              // Fallback to direct props if no iframe
              const { src, title, height } = props;
              if (!src) return null;
              return <Video src={src} title={title} height={height} />;
            }
            return <div {...props} />;
          },
          iframe(props) {
            const { src, title, ...rest } = props;
            if (src?.includes('youtube.com/embed/')) {
              return (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden my-8">
                  <iframe
                    {...rest}
                    src={src}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              );
            }
            return <iframe {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
