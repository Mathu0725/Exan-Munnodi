'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

export default function ExamPreview({ examData }) {
  if (!examData) return null;

  const { title, description, questions, config } = examData;

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {description && <p className="mt-2 text-gray-600">{description}</p>}
        </header>

        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.id || index} className="border-b pb-6">
              <div className="flex items-start">
                <div className="font-bold text-lg text-gray-700 mr-4">{index + 1}.</div>
                <div className="flex-1">
                  <div className="prose">
                    <QuillEditor
                      value={q.body}
                      readOnly={true}
                      theme="bubble"
                      modules={{ toolbar: false }}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={opt.id || optIndex} className="flex items-center p-2 border rounded-md">
                        <input type="radio" name={`question-${index}`} id={`q-${index}-opt-${optIndex}`} className="mr-3" />
                        <label htmlFor={`q-${index}-opt-${optIndex}`} className="flex-1">{opt.text}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-8 text-center">
          <p className="text-gray-500">End of Preview</p>
        </footer>
      </div>
    </div>
  );
}
