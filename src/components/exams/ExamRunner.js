'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { examResultService } from '@/services/examResultService';
import { loadAttempt, saveAttempt, clearAttempt } from '@/services/examAttemptService';

export default function ExamRunner({ exam }) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const intervalRef = useRef(null);

  const questions = exam?.questions || [];
  const current = questions[index];

  const computeScore = () => {
    let total = 0;
    let obtained = 0;
    for (const q of questions) {
      const marks = q.marks ?? 1;
      total += marks;
      const selected = answers[q.id];
      const correctOpt = (q.options || []).find((o) => o.is_correct);
      if (correctOpt && correctOpt.id === selected) {
        obtained += marks;
      }
    }
    return { obtained, total };
  };
  const score = useMemo(() => (submitted ? computeScore() : null), [submitted, answers, questions]);

  // Timer initialization and handling
  useEffect(() => {
    if (!exam) return;
    // Load saved attempt if present
    const saved = loadAttempt(exam.id, user?.email);
    if (saved && !submitted) {
      if (saved.answers) setAnswers(saved.answers);
      if (typeof saved.index === 'number') setIndex(saved.index);
      if (typeof saved.secondsLeft === 'number') setSecondsLeft(saved.secondsLeft);
    }
    const mode = exam?.config?.timing_mode || 'total_exam_time';
    const totalMinutes = exam?.config?.total_time_minutes;

    const clearTimer = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };

    const startTotalTimer = () => {
      const initial = Math.max(1, parseInt(totalMinutes || 0, 10)) * 60; // at least 1s if configured 0
      setSecondsLeft(initial);
      clearTimer();
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null) return null;
          if (s <= 1) {
            clearTimer();
            // auto submit on expiry
            submit();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    };

    const perQuestionStart = () => {
      const limit = parseInt(current?.time_limit || 60, 10); // default 60s if not provided
      setSecondsLeft(limit);
      clearTimer();
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null) return null;
          if (s <= 1) {
            clearTimer();
            // auto move to next or submit on last question
            if (index < questions.length - 1) {
              setIndex((i) => i + 1);
            } else {
              submit();
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    };

    if (submitted) {
      clearTimer();
      setSecondsLeft(null);
      return;
    }

    if (mode === 'total_exam_time' && totalMinutes) {
      startTotalTimer();
    } else if (mode === 'per_question_time') {
      perQuestionStart();
    } else {
      // no timing
      setSecondsLeft(null);
      clearTimer();
    }

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, index, current?.time_limit, submitted]);

  const handleSelect = (optId) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optId }));
  };

  const next = () => setIndex((i) => Math.min(i + 1, questions.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const submit = async () => {
    setSubmitted(true);
    const { obtained, total } = computeScore();
    const s = {
      examId: exam.id,
      userEmail: user?.email,
      answers,
      obtained,
      total,
    };
    try { await examResultService.submitResult(s); } catch {}
    try { clearAttempt(exam.id, user?.email); } catch {}
  };

  // Persist attempt on changes
  useEffect(() => {
    if (!exam || submitted) return;
    saveAttempt(exam.id, user?.email, { answers, index, secondsLeft });
  }, [answers, index, secondsLeft, exam, user?.email, submitted]);

  if (!exam) return null;

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-gray-600 flex justify-between">
        <span>Candidate: {user?.name || user?.email}</span>
        {secondsLeft !== null && (
          <span className="font-mono">
            Time: {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      {!submitted ? (
        <div>
          <div className="mb-2 font-medium">Question {index + 1} / {questions.length}</div>
          <div className="p-4 bg-white rounded border">
            <div className="mb-4">{current?.body || current?.title}</div>
            <div className="space-y-2">
              {(current?.options || []).map((opt) => (
                <label key={opt.id} className="flex items-center p-2 border rounded cursor-pointer">
                  <input
                    type="radio"
                    className="mr-2"
                    name={`q-${current.id}`}
                    checked={answers[current.id] === opt.id}
                    onChange={() => handleSelect(opt.id)}
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button onClick={prev} disabled={index === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
            {index < questions.length - 1 ? (
              <button onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded">Next</button>
            ) : (
              <button onClick={submit} className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded border">
          <div className="text-lg font-semibold mb-2">Submission received</div>
          <div className="text-gray-600">Your responses have been submitted.</div>
        </div>
      )}
    </div>
  );
}


