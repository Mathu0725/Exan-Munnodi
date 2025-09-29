'use client';

import { useState, useRef } from 'react';

export default function DraggableQuestionList({
  questions,
  setQuestions,
  renderActions,
  searchTerm,
  isQuestionMatching,
}) {
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

  const getStyles = index => {
    if (dragItem.current === index) {
      return 'bg-indigo-100 border-indigo-400 opacity-50';
    }
    return 'bg-white';
  };

  // Filter questions based on search term
  const visibleQuestions = searchTerm
    ? questions.filter(isQuestionMatching)
    : questions;

  // Group questions - handle both expanded section questions and section configurations
  const groupedQuestions = questions.reduce((groups, question) => {
    if (question.isSectionQuestion && question.sectionParentId) {
      // Expanded section questions (old format)
      if (!groups[question.sectionParentId]) {
        groups[question.sectionParentId] = {
          parent: question,
          children: [],
        };
      }
      groups[question.sectionParentId].children.push(question);
    } else if (question.isSectionBased && question.sectionConfig) {
      // Section configuration (new format)
      groups[question.id] = {
        parent: question,
        children: [],
        isSectionConfig: true,
      };
    } else {
      // Regular questions
      groups[question.id] = {
        parent: question,
        children: [],
      };
    }
    return groups;
  }, {});

  return (
    <div className='mt-4 space-y-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 min-h-[200px] theme-transition'>
      {Object.keys(groupedQuestions).length > 0 ? (
        Object.entries(groupedQuestions).map(([groupId, group]) => {
          const isMatching = isQuestionMatching
            ? isQuestionMatching(group.parent)
            : true;
          const isVisible = searchTerm ? isMatching : true;

          if (!isVisible) return null;

          // If this is a section-based question group (expanded format)
          if (group.children.length > 0 && !group.isSectionConfig) {
            return (
              <div
                key={groupId}
                className='border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3'
              >
                {/* Section Header */}
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex items-center'>
                    <span className='text-blue-600 dark:text-blue-400 mr-2'>
                      📋
                    </span>
                    <div>
                      <div className='font-medium text-blue-800 dark:text-blue-200'>
                        {group.parent.title.replace(
                          ' - Question ' + group.parent.questionNumber,
                          ''
                        )}
                      </div>
                      <div className='text-sm text-blue-600 dark:text-blue-400'>
                        Section-based Question ({group.children.length}{' '}
                        questions)
                      </div>
                    </div>
                  </div>
                  <div>
                    {renderActions &&
                      renderActions(
                        group.parent,
                        questions.findIndex(q => q.id === group.parent.id)
                      )}
                  </div>
                </div>

                {/* Individual Questions in Section */}
                <div className='ml-4 space-y-1'>
                  {group.children
                    .sort((a, b) => a.questionNumber - b.questionNumber)
                    .map((childQuestion, childIndex) => (
                      <div
                        key={childQuestion.id}
                        className='flex items-center p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600'
                      >
                        <span className='text-gray-500 mr-3 text-sm'>
                          Q{childQuestion.questionNumber}
                        </span>
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                            {childQuestion.title}
                          </div>
                          {childQuestion.body && (
                            <div
                              className='text-xs text-gray-600 dark:text-gray-300 mt-1'
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {childQuestion.body
                                .replace(/<[^>]*>/g, '')
                                .substring(0, 100)}
                              ...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          }

          // If this is a section configuration (new format)
          if (group.isSectionConfig) {
            const config = group.parent.sectionConfig;
            return (
              <div
                key={groupId}
                className='border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20 p-3'
              >
                {/* Section Configuration Header */}
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex items-center'>
                    <span className='text-green-600 dark:text-green-400 mr-2'>
                      ⚙️
                    </span>
                    <div>
                      <div className='font-medium text-green-800 dark:text-green-200'>
                        {group.parent.title}
                      </div>
                      <div className='text-sm text-green-600 dark:text-green-400'>
                        Section Configuration: {config.selectedCount} of{' '}
                        {config.totalQuestions} questions selected
                      </div>
                      <div className='text-xs text-green-500 dark:text-green-300 mt-1'>
                        Questions {config.questionRange.start}-
                        {config.questionRange.end} • Random selection for each
                        student
                      </div>
                    </div>
                  </div>
                  <div>
                    {renderActions &&
                      renderActions(
                        group.parent,
                        questions.findIndex(q => q.id === group.parent.id)
                      )}
                  </div>
                </div>

                {/* Configuration Details */}
                <div className='ml-4 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600'>
                  <div className='text-sm text-gray-700 dark:text-gray-300'>
                    <div className='flex justify-between items-center'>
                      <span>Total questions in section:</span>
                      <span className='font-medium'>
                        {config.totalQuestions}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span>Questions per student:</span>
                      <span className='font-medium text-green-600'>
                        {config.selectedCount}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span>Selection method:</span>
                      <span className='font-medium text-blue-600'>Random</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Regular question
          return (
            <div
              key={group.parent.id}
              draggable
              onDragStart={e =>
                handleDragStart(
                  e,
                  questions.findIndex(q => q.id === group.parent.id)
                )
              }
              onDragEnter={e =>
                handleDragEnter(
                  e,
                  questions.findIndex(q => q.id === group.parent.id)
                )
              }
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className={`flex justify-between items-center p-2 border rounded-md cursor-move transition-all ${
                dragging
                  ? getStyles(
                      questions.findIndex(q => q.id === group.parent.id)
                    )
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              } ${isMatching ? '' : 'opacity-50'} theme-transition`}
            >
              <div className='flex items-center flex-1'>
                <span className='text-gray-500 mr-4'>&#x2630;</span>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900 dark:text-gray-100 tamil-question'>
                    {searchTerm ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: group.parent.title.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                          ),
                        }}
                      />
                    ) : (
                      group.parent.title
                    )}
                  </div>
                  {group.parent.body && (
                    <div
                      className='text-sm text-gray-600 dark:text-gray-300 mt-1 overflow-hidden tamil-body'
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {searchTerm ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: group.parent.body.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                            ),
                          }}
                        />
                      ) : (
                        group.parent.body
                      )}
                    </div>
                  )}
                  {group.parent.image && (
                    <div className='mt-2'>
                      <img
                        src={group.parent.image}
                        alt='Question image'
                        className='w-16 h-16 object-cover rounded border'
                        onError={e => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                {renderActions &&
                  renderActions(
                    group.parent,
                    questions.findIndex(q => q.id === group.parent.id)
                  )}
              </div>
            </div>
          );
        })
      ) : (
        <p className='text-gray-500 dark:text-gray-400 text-center'>
          No questions selected yet.
        </p>
      )}

      {searchTerm &&
        Object.keys(groupedQuestions).length === 0 &&
        questions.length > 0 && (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <p>No questions match your search term &quot;{searchTerm}&quot;</p>
          </div>
        )}
    </div>
  );
}
