import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node: _node, ...props }) => <h1 className="text-3xl font-bold my-6" {...props} />,
          h2: ({ node: _node, ...props }) => <h2 className="text-2xl font-bold my-5" {...props} />,
          h3: ({ node: _node, ...props }) => <h3 className="text-xl font-semibold my-4" {...props} />,
          h4: ({ node: _node, ...props }) => <h4 className="text-lg font-medium my-3" {...props} />,
          p: ({ node: _node, ...props }) => <p className="my-4 leading-relaxed" {...props} />,
          ul: ({ node: _node, ...props }) => <ul className="my-4 ml-6 list-disc" {...props} />,
          ol: ({ node: _node, ...props }) => <ol className="my-4 ml-6 list-decimal" {...props} />,
          li: ({ node: _node, ...props }) => <li className="my-1" {...props} />,
          a: ({ node: _node, ...props }) => <a className="text-primary hover:underline" {...props} />,
          code: ({ node: _node, inline, ...props }: any) => {
            if (inline) {
              return <code className="px-1 py-0.5 text-sm bg-secondary rounded" {...props} />;
            }
            return <code {...props} />;
          },
          pre: ({ node: _node, ...props }) => <pre className="bg-secondary rounded-lg p-4 my-4 overflow-x-auto" {...props} />,
          blockquote: ({ node: _node, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
          ),
          img: ({ node: _node, ...props }) => (
            <img className="max-w-full rounded-lg my-4" {...props} alt={props.alt || ''} />
          ),
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse w-full" {...props} />
            </div>
          ),
          th: ({ node: _node, ...props }) => <th className="border p-2 text-left" {...props} />,
          td: ({ node: _node, ...props }) => <td className="border p-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
