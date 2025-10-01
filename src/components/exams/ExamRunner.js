'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { examResultService } from '@/services/examResultService';
import {
  loadAttempt,
  saveAttempt,
  clearAttempt,
} from '@/services/examAttemptService';

export default function ExamRunner({ exam }) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const intervalRef = useRef(null);
  const attemptHydratedRef = useRef(false);
  const restoredSecondsRef = useRef(false);
  const submitRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  // Process questions to handle section-based questions and configurations
  const processedQuestions = useMemo(() => {
    const processed = [];

    exam?.questions?.forEach(question => {
      if (question.isSectionBased && question.sectionConfig) {
        // Handle section configuration - select random questions for this student
        const { selectedCount, questionRange } = question.sectionConfig;
        const totalQuestions = questionRange.end - questionRange.start + 1;

        // If the question has individual questions defined, use those
        if (question.questions && question.questions.length > 0) {
          // Shuffle the individual questions and select the required number
          const shuffled = [...question.questions].sort(
            () => Math.random() - 0.5
          );
          const selectedQuestions = shuffled.slice(0, selectedCount);

          // Create individual questions for this student
          selectedQuestions.forEach((individualQuestion, index) => {
            processed.push({
              ...individualQuestion,
              id: `${question.id}_${individualQuestion.id}`,
              title: `${question.title} - ${individualQuestion.title}`,
              body: individualQuestion.description || individualQuestion.body,
              questionNumber: questionRange.start + index,
              isSectionQuestion: true,
              sectionParentId: question.id,
              sectionConfig: question.sectionConfig,
              options: individualQuestion.options || [],
              correct_answer: individualQuestion.correct_answer,
              image: individualQuestion.image,
            });
          });
        } else {
          // Fallback to the old format (range-based)
          const allQuestionNumbers = Array.from(
            { length: totalQuestions },
            (_, i) => questionRange.start + i
          );

          // Shuffle and select the required number
          const shuffled = [...allQuestionNumbers].sort(
            () => Math.random() - 0.5
          );
          const selectedQuestions = shuffled
            .slice(0, selectedCount)
            .sort((a, b) => a - b);

          // Create individual questions for this student
          selectedQuestions.forEach(questionNum => {
            processed.push({
              ...question,
              id: `${question.id}_${questionNum}`,
              title: `${question.title} - Question ${questionNum}`,
              body: question.description || question.body,
              questionNumber: questionNum,
              isSectionQuestion: true,
              sectionParentId: question.id,
              sectionConfig: question.sectionConfig,
            });
          });
        }
      } else if (
        question.question_type === 'section_based' &&
        question.startQuestion &&
        question.endQuestion
      ) {
        // Legacy section-based questions (expand all)
        for (let i = question.startQuestion; i <= question.endQuestion; i++) {
          processed.push({
            ...question,
            id: `${question.id}_${i}`,
            title: `${question.title} - Question ${i}`,
            body: question.description || question.body,
            questionNumber: i,
            isSectionQuestion: true,
            sectionParentId: question.id,
          });
        }
      } else {
        // Regular question
        processed.push(question);
      }
    });

    return processed;
  }, [exam?.questions]);

  const questions = processedQuestions;
  const current = questions[index];

  const computeScore = useCallback(() => {
    let total = 0;
    let obtained = 0;
    for (const q of questions) {
      const marks = q.marks ?? 1;
      total += marks;
      const selected = answers[q.id];
      const correctOpt = (q.options || []).find(o => o.is_correct);
      if (
        correctOpt &&
        (correctOpt.id === selected ||
          String(correctOpt.id) === String(selected))
      ) {
        obtained += marks;
      }
    }
    return { obtained, total };
  }, [answers, questions]);
  const score = useMemo(
    () => (submitted ? computeScore() : null),
    [submitted, computeScore]
  );

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (!exam) {
      setIndex(0);
      setAnswers({});
      setSubmitted(false);
      setSecondsLeft(null);
      attemptHydratedRef.current = false;
      restoredSecondsRef.current = false;
      hasSubmittedRef.current = false;
      clearTimer();
      return;
    }

    clearTimer();
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(null);
    attemptHydratedRef.current = false;
    restoredSecondsRef.current = false;
    hasSubmittedRef.current = false;
  }, [exam?.id, clearTimer]);

  useEffect(() => {
    if (!exam || submitted || attemptHydratedRef.current) return;
    const saved = loadAttempt(exam.id, user?.email);
    if (saved) {
      if (saved.answers) setAnswers(saved.answers);
      if (typeof saved.index === 'number') setIndex(saved.index);
      if (typeof saved.secondsLeft === 'number') {
        restoredSecondsRef.current = true;
        setSecondsLeft(saved.secondsLeft);
      }
    }
    attemptHydratedRef.current = true;
  }, [exam?.id, submitted, user?.email]);

  useEffect(() => {
    if (submitted) {
      clearTimer();
      setSecondsLeft(null);
    }
  }, [submitted, clearTimer]);

  // Timer initialization and handling
  useEffect(() => {
    if (!exam || submitted || questions.length === 0) {
      clearTimer();
      setSecondsLeft(null);
      restoredSecondsRef.current = false;
      return;
    }

    const mode = exam?.config?.timing_mode || 'total_exam_time';
    const totalMinutes = exam?.config?.total_time_minutes;

    clearTimer();

    if (mode === 'total_exam_time' && totalMinutes) {
      const initial = Math.max(1, parseInt(totalMinutes, 10)) * 60;
      setSecondsLeft(prev => {
        if (restoredSecondsRef.current && typeof prev === 'number') {
          restoredSecondsRef.current = false;
          return prev;
        }
        restoredSecondsRef.current = false;
        return typeof prev === 'number' ? prev : initial;
      });
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s === null) return null;
          if (s <= 1) {
            clearTimer();
            submitRef.current?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (mode === 'per_question_time') {
      const rawLimit =
        current?.time_limit ?? exam?.config?.per_question_seconds ?? 60;
      const parsed = parseInt(rawLimit, 10);
      const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 60;

      setSecondsLeft(prev => {
        if (restoredSecondsRef.current && typeof prev === 'number') {
          restoredSecondsRef.current = false;
          return prev;
        }
        restoredSecondsRef.current = false;
        return limit;
      });

      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s === null) return null;
          if (s <= 1) {
            clearTimer();
            if (index < questions.length - 1) {
              setIndex(i => Math.min(i + 1, questions.length - 1));
            } else {
              submitRef.current?.();
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      setSecondsLeft(null);
    }

    return () => clearTimer();
  }, [
    exam?.id,
    exam?.config?.timing_mode,
    exam?.config?.total_time_minutes,
    exam?.config?.per_question_seconds,
    current?.time_limit,
    submitted,
    clearTimer,
    index,
    questions.length,
  ]);

  const handleSelect = optId => {
    setAnswers(prev => ({ ...prev, [current.id]: optId }));
  };

  const next = () => setIndex(i => Math.min(i + 1, questions.length - 1));
  const prev = () => setIndex(i => Math.max(i - 1, 0));
  const submit = async () => {
    if (!exam || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    const { obtained, total } = computeScore();
    setSubmitted(true);
    const payload = {
      examId: exam.id,
      userEmail: user?.email,
      answers,
      obtained,
      total,
    };
    try {
      await examResultService.submitResult(payload);
    } catch (error) {
      console.error('Failed to submit exam result:', error);
    }
    try {
      clearAttempt(exam.id, user?.email);
    } catch (error) {
      console.error('Failed to clear exam attempt:', error);
    }
  };

  submitRef.current = submit;

  // Persist attempt on changes
  useEffect(() => {
    if (!exam || submitted) return;
    saveAttempt(exam.id, user?.email, { answers, index, secondsLeft });
  }, [answers, index, secondsLeft, exam?.id, user?.email, submitted, exam]);

  if (!exam) return null;

  return (
    <div className='p-4'>
      <div className='mb-2 text-sm text-gray-600 flex justify-between'>
        <span>Candidate: {user?.name || user?.email}</span>
        {secondsLeft !== null && (
          <span className='font-mono'>
            Time: {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      {!submitted ? (
        <div>
          <div className='mb-2 font-medium'>
            Question {index + 1} / {questions.length}
            {current?.isSectionQuestion && (
              <span className='ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded'>
                Section Question {current.questionNumber}
              </span>
            )}
          </div>
          <div className='p-4 bg-white rounded border'>
            {/* Section-based question header */}
            {current?.isSectionQuestion && (
              <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded'>
                <div className='text-sm text-blue-800 font-medium'>
                  📋{' '}
                  {current.title.replace(
                    ' - Question ' + current.questionNumber,
                    ''
                  )}
                </div>
                <div className='text-xs text-blue-600 mt-1'>
                  This is question {current.questionNumber} from a section-based
                  question
                  {current.sectionConfig && (
                    <span className='ml-2 text-green-600'>
                      (Random selection: {current.sectionConfig.selectedCount}{' '}
                      of {current.sectionConfig.totalQuestions} questions)
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className='mb-4'>{current?.body || current?.title}</div>

            {/* Show image if available */}
            {current?.image && (
              <div className='mb-4'>
                <img
                  src={current.image}
                  alt='Question image'
                  className='max-w-full h-auto rounded border'
                />
              </div>
            )}

            <div className='space-y-2'>
              {(current?.options || []).map(opt => (
                <label
                  key={opt.id}
                  className='flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50'
                >
                  <input
                    type='radio'
                    className='mr-2'
                    name={`q-${current?.id}`}
                    checked={answers[current?.id] === opt.id}
                    onChange={() => handleSelect(opt.id)}
                    disabled={submitted}
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
          <div className='mt-4 flex justify-between'>
            <button
              onClick={prev}
              disabled={index === 0}
              className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
            >
              Previous
            </button>
            {index < questions.length - 1 ? (
              <button
                onClick={next}
                className='px-4 py-2 bg-indigo-600 text-white rounded'
              >
                Next
              </button>
            ) : (
              <button
                onClick={submit}
                className='px-4 py-2 bg-green-600 text-white rounded'
              >
                Submit
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className='p-4 bg-white rounded border'>
          <div className='text-lg font-semibold mb-2'>Submission received</div>
          <div className='text-gray-600'>
            Your responses have been submitted.
          </div>
          {score && (
            <div className='mt-2 text-sm text-gray-700'>
              Score: {score.obtained} / {score.total}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
