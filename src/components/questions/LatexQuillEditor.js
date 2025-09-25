'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
});

import 'react-quill/dist/quill.snow.css';

// This component assumes KaTeX is loaded from a CDN in the root layout.

export default function LatexQuillEditor(props) {
  const quillRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formulaHandler = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      const formula = prompt('Enter LaTeX Formula:');
      if (formula) {
        const { Quill } = require('react-quill');
        editor.insertEmbed(range.index, 'formula', formula, Quill.sources.USER);
      }
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'formula'], // Add formula button
        ['clean'],
      ],
      handlers: {
        formula: formulaHandler,
      },
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image',
    'formula', // Add formula format
  ];

  // Register formula blot and Tamil font support for Quill editor
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const { Quill } = require('react-quill');
      
      // Register the custom formula blot
      const FormulaBlot = Quill.import('blots/embed');
      class KatexFormula extends FormulaBlot {
        static create(value) {
          const node = super.create(value);
          if (window.katex) {
            window.katex.render(value, node, {
              throwOnError: false,
              displayMode: true,
            });
          }
          node.setAttribute('data-formula', value);
          return node;
        }

        static value(domNode) {
          return domNode.getAttribute('data-formula');
        }
      }
      KatexFormula.blotName = 'formula';
      KatexFormula.tagName = 'span';
      KatexFormula.className = 'ql-katex';
      Quill.register(KatexFormula);

      // Add Tamil font support to the editor
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        const quillContainer = editor.container;
        if (quillContainer) {
          quillContainer.style.fontFamily = "'Noto Sans Tamil', system-ui, sans-serif";
          quillContainer.classList.add('tamil-support');
        }
      }
    }
  }, [isClient]);

  if (!isClient) {
    return <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>;
  }

  return (
    <div className="tamil-support">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={modules}
        formats={formats}
        {...props}
      />
    </div>
  );
}
