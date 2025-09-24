'use client';

import { useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// This component assumes KaTeX is loaded from a CDN in the root layout.

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

export default function LatexQuillEditor(props) {
  const quillRef = useRef(null);

  const formulaHandler = () => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    const formula = prompt('Enter LaTeX Formula:');
    if (formula) {
      editor.insertEmbed(range.index, 'formula', formula, Quill.sources.USER);
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

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      modules={modules}
      formats={formats}
      {...props}
    />
  );
}
