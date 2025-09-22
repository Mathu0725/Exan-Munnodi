'use client';

import { useState, useRef } from 'react';

export default function DraggableQuestionList({ questions, setQuestions, renderActions }) {
  const [dragging, setDragging] = useState(false);
  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.parentNode);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    const list = [...questions];
    const draggedItemContent = list.splice(dragItem.current, 1)[0];
    list.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    setQuestions(list);
  };

  const handleDragEnd = () => {
    setDragging(false);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const getStyles = (index) => {
    if (dragItem.current === index) {
      return 'bg-indigo-100 border-indigo-400 opacity-50';
    }
    return 'bg-white';
  };

  return (
    <div className="mt-4 space-y-2 p-4 border rounded-md bg-gray-50 min-h-[200px]">
      {questions.length > 0 ? (
        questions.map((q, index) => (
          <div
            key={q.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex justify-between items-center p-2 border rounded-md cursor-move transition-all ${dragging ? getStyles(index) : 'bg-white'}`}
          >
            <div className="flex items-center">
              <span className="text-gray-500 mr-4">&#x2630;</span>
              <span>{q.title}</span>
            </div>
            <div>
              {renderActions && renderActions(q, index)}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No questions selected yet.</p>
      )}
    </div>
  );
}
