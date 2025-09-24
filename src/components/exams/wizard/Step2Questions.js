import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import QuestionFilterBar from '@/components/questions/QuestionFilterBar';
import DraggableQuestionList from './DraggableQuestionList';
import { subjectService } from '@/services/subjectService';

export default function Step2Questions({ data, onNext, onBack }) {
  const [filters, setFilters] = useState({ page: 1, limit: 5 });
  const [selectedQuestions, setSelectedQuestions] = useState(data.questions || []);
  const [totalAuto, setTotalAuto] = useState(10);
  const [percents, setPercents] = useState({});
  const [rules, setRules] = useState([]); // {subjectId, subSubjectId, percent}

  const { data: availableQuestionsData, isLoading } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getQuestions({ ...filters, filters }),
    keepPreviousData: true,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects({ limit: 100 }),
  });
  const { data: subjectTree } = useQuery({
    queryKey: ['subjectTree'],
    queryFn: () => subjectService.getSubjectsWithSubsubjects(),
  });

  useEffect(() => {
    // initialize percents equally on first load
    if (!subjectsData?.data || Object.keys(percents).length > 0) return;
    const count = subjectsData.data.length || 1;
    const base = Math.floor(100 / count);
    const p = {};
    subjectsData.data.forEach((s, idx) => { p[s.id] = idx === 0 ? 100 - base * (count - 1) : base; });
    setPercents(p);
  }, [subjectsData, percents]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, page: 1, [name]: value }));
  };

  const handleAddQuestion = (question) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
  };

  const handleNextStep = () => {
    onNext({ questions: selectedQuestions });
  };

  const autoSelectBySubjectPercent = async () => {
    const subjects = subjectsData?.data || [];
    if (subjects.length === 0) return;
    // compute per-subject counts
    const desired = subjects.map((s) => ({ id: s.id, pct: Number(percents[s.id] || 0) }));
    const total = Math.max(0, Number(totalAuto || 0));
    let allocated = desired.map((d) => ({ id: d.id, count: Math.floor((d.pct / 100) * total) }));
    let sum = allocated.reduce((a, b) => a + b.count, 0);
    // distribute remainder
    let rem = total - sum;
    const byPctDesc = [...desired].sort((a, b) => b.pct - a.pct);
    let i = 0;
    while (rem > 0 && byPctDesc.length > 0) {
      const id = byPctDesc[i % byPctDesc.length].id;
      const slot = allocated.find((x) => x.id === id);
      slot.count += 1;
      rem -= 1;
      i += 1;
    }

    // fetch and pick
    const alreadyIds = new Set(selectedQuestions.map((q) => q.id));
    const picks = [];
    for (const { id, count } of allocated) {
      if (count <= 0) continue;
      try {
        const res = await questionService.getQuestions({ page: 1, limit: 1000, filters: { subject_id: id } });
        const pool = (res?.data || []).filter((q) => !alreadyIds.has(q.id));
        // shuffle
        for (let j = pool.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [pool[j], pool[k]] = [pool[k], pool[j]];
        }
        picks.push(...pool.slice(0, count));
      } catch {}
    }
    const next = [...selectedQuestions, ...picks];
    setSelectedQuestions(next);
  };

  const autoSelectByRules = async () => {
    if (!Array.isArray(rules) || rules.length === 0) return;
    const total = Math.max(0, Number(totalAuto || 0));
    const desired = rules.map((r) => ({
      subjectId: Number(r.subjectId),
      subSubjectId: r.subSubjectId ? Number(r.subSubjectId) : null,
      pct: Number(r.percent || 0),
    })).filter((r) => r.subjectId && r.pct > 0);
    if (desired.length === 0) return;

    let allocated = desired.map((d) => ({ key: `${d.subjectId}:${d.subSubjectId ?? 'any'}`, d, count: Math.floor((d.pct / 100) * total) }));
    let sum = allocated.reduce((a, b) => a + b.count, 0);
    let rem = total - sum;
    const byPctDesc = [...desired].sort((a, b) => b.pct - a.pct);
    let i = 0;
    while (rem > 0 && byPctDesc.length > 0) {
      const target = byPctDesc[i % byPctDesc.length];
      const slot = allocated.find((x) => x.d === target);
      slot.count += 1;
      rem -= 1;
      i += 1;
    }

    const alreadyIds = new Set(selectedQuestions.map((q) => q.id));
    const picks = [];
    for (const { d, count } of allocated) {
      if (count <= 0) continue;
      try {
        const res = await questionService.getQuestions({ page: 1, limit: 2000, filters: { subject_id: d.subjectId, sub_subject_id: d.subSubjectId || '' } });
        let pool = (res?.data || []).filter((q) => !alreadyIds.has(q.id));
        // shuffle
        for (let j = pool.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [pool[j], pool[k]] = [pool[k], pool[j]];
        }
        picks.push(...pool.slice(0, count));
      } catch {}
    }
    setSelectedQuestions((prev) => [...prev, ...picks]);
  };

  const addRule = () => {
    const firstSubject = subjectTree?.data?.[0]?.id || '';
    setRules((prev) => [...prev, { subjectId: firstSubject, subSubjectId: '', percent: 0 }]);
  };
  const removeRule = (idx) => setRules((prev) => prev.filter((_, i) => i !== idx));
  const updateRule = (idx, field, value) => setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value, ...(field === 'subjectId' ? { subSubjectId: '' } : {}) } : r)));

  const buildSubjectRulesEqual = () => {
    const subs = subjectTree?.data || [];
    if (subs.length === 0) return;
    const base = Math.floor(100 / subs.length);
    let rem = 100 - base * subs.length;
    const next = subs.map((s, i) => ({ subjectId: s.id, subSubjectId: '', percent: base + (i === 0 ? rem : 0) }));
    setRules(next);
  };

  const buildSubSubjectRulesEqual = () => {
    const subs = subjectTree?.data || [];
    const flat = [];
    subs.forEach((s) => {
      const list = s.subsubjects || [];
      if (list.length === 0) {
        flat.push({ subjectId: s.id, subSubjectId: '', label: `${s.name}` });
      } else {
        list.forEach((ss) => flat.push({ subjectId: s.id, subSubjectId: ss.id, label: `${s.name} / ${ss.name}` }));
      }
    });
    if (flat.length === 0) return;
    const base = Math.floor(100 / flat.length);
    let rem = 100 - base * flat.length;
    const next = flat.map((f, i) => ({ subjectId: f.subjectId, subSubjectId: f.subSubjectId, percent: base + (i === 0 ? rem : 0) }));
    setRules(next);
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Available Questions Panel */}
        <div>
          <h3 className="text-lg font-medium mb-4">Available Questions</h3>
          <QuestionFilterBar filters={filters} onFilterChange={handleFilterChange} />
          {isLoading && <p>Loading...</p>}
          <div className="mt-4 space-y-2">
            {availableQuestionsData?.data.map((q) => (
              <div key={q.id} className="flex justify-between items-center p-2 border rounded-md">
                <span>{q.title}</span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion(q)}
                  disabled={!!selectedQuestions.find(sq => sq.id === q.id)}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded-md disabled:bg-gray-300"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
          {/* TODO: Add pagination for available questions */}
          <div className="mt-6 p-3 border rounded">
            <div className="font-medium mb-2">Auto-select by Subject %</div>
            <div className="flex items-center space-x-3 mb-3">
              <label className="text-sm text-gray-600">Total Questions</label>
              <input type="number" value={totalAuto} onChange={(e) => setTotalAuto(e.target.value)} className="w-24 px-2 py-1 border rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(subjectsData?.data || []).map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm">{s.name}</span>
                  <div className="flex items-center space-x-2">
                    <input type="number" min={0} max={100} value={percents[s.id] ?? 0} onChange={(e) => setPercents((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))} className="w-20 px-2 py-1 border rounded" />
                    <span className="text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button type="button" onClick={autoSelectBySubjectPercent} className="px-3 py-1 bg-indigo-600 text-white rounded">Auto Select</button>
            </div>
          </div>

          <div className="mt-6 p-3 border rounded">
            <div className="font-medium mb-2">Auto-select by Subject & Sub-subject %</div>
            <div className="flex items-center space-x-3 mb-3">
              <label className="text-sm text-gray-600">Total Questions</label>
              <input type="number" value={totalAuto} onChange={(e) => setTotalAuto(e.target.value)} className="w-24 px-2 py-1 border rounded" />
              <button type="button" onClick={addRule} className="px-2 py-1 bg-gray-200 rounded">+ Add Rule</button>
              <button type="button" onClick={buildSubjectRulesEqual} className="px-2 py-1 bg-gray-200 rounded">+ All Subjects (equal)</button>
              <button type="button" onClick={buildSubSubjectRulesEqual} className="px-2 py-1 bg-gray-200 rounded">+ All Sub-subjects (equal)</button>
            </div>
            <div className="space-y-2">
              {rules.map((r, idx) => {
                const subs = (subjectTree?.data || []).find((s) => s.id === Number(r.subjectId))?.subsubjects || [];
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <select value={r.subjectId} onChange={(e) => updateRule(idx, 'subjectId', e.target.value)} className="px-2 py-1 border rounded">
                      {(subjectTree?.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={r.subSubjectId} onChange={(e) => updateRule(idx, 'subSubjectId', e.target.value)} className="px-2 py-1 border rounded">
                      <option value="">All Sub-subjects</option>
                      {subs.map((ss) => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
                    </select>
                    <div className="flex items-center">
                      <input type="number" min={0} max={100} value={r.percent} onChange={(e) => updateRule(idx, 'percent', e.target.value)} className="w-24 px-2 py-1 border rounded" />
                      <span className="ml-1">%</span>
                    </div>
                    <button type="button" onClick={() => removeRule(idx)} className="px-2 py-1 text-red-600">Remove</button>
                  </div>
                );
              })}
              {rules.length === 0 && <div className="text-sm text-gray-500">No rules yet. Click “Add Rule”.</div>}
            </div>
            <div className="mt-3 text-right">
              <button type="button" onClick={autoSelectByRules} className="px-3 py-1 bg-indigo-600 text-white rounded">Auto Select</button>
            </div>
          </div>
        </div>

        {/* Selected Questions Panel */}
        <div>
          <h3 className="text-lg font-medium mb-4">Selected Questions ({selectedQuestions.length})</h3>
          <DraggableQuestionList 
            questions={selectedQuestions}
            setQuestions={setSelectedQuestions}
            renderActions={(q) => (
              <button
                type="button"
                onClick={() => handleRemoveQuestion(q.id)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md"
              >
                Remove
              </button>
            )}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-200 rounded-md">Back</button>
        <button type="button" onClick={handleNextStep} className="px-6 py-2 bg-indigo-600 text-white rounded-md">Next</button>
      </div>
    </div>
  );
}
