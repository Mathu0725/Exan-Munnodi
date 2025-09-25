import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import QuestionFilterBar from '@/components/questions/QuestionFilterBar';
import DraggableQuestionList from './DraggableQuestionList';
import { subjectService } from '@/services/subjectService';

export default function Step2Questions({ data, onNext, onBack }) {
  const [filters, setFilters] = useState({ page: 1, limit: 5 });
  const [selectedQuestions, setSelectedQuestions] = useState(data.questions || []);
  const [totalAuto, setTotalAuto] = useState(10);
  const [rules, setRules] = useState([]); // {subjectId, subSubjectId, percent}
  const [searchTerm, setSearchTerm] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedQuestionForImage, setSelectedQuestionForImage] = useState(null);
  const [showSectionConfig, setShowSectionConfig] = useState({
    isOpen: false,
    question: null,
    totalQuestions: 0,
    selectedCount: 0
  });

  const { data: availableQuestionsData, isLoading } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getQuestions({ ...filters, filters }),
    keepPreviousData: true,
  });

  const { data: subjectTree } = useQuery({
    queryKey: ['subjectTree'],
    queryFn: () => subjectService.getSubjectsWithSubsubjects(),
  });



  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, page: 1, [name]: value }));
  };

  const handleAddQuestion = (question) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      // If it's a section-based question, show configuration modal
      if (question.question_type === 'section_based' && question.startQuestion && question.endQuestion) {
        setShowSectionConfig({
          isOpen: true,
          question: question,
          totalQuestions: question.endQuestion - question.startQuestion + 1,
          selectedCount: question.endQuestion - question.startQuestion + 1 // Default to all
        });
      } else {
        // Regular question (multiple choice)
        setSelectedQuestions([...selectedQuestions, question]);
      }
    }
  };

  const handleRemoveQuestion = (questionId) => {
    const questionToRemove = selectedQuestions.find(q => q.id === questionId);
    
    if (questionToRemove?.isSectionQuestion) {
      // If removing a section question, remove all questions from that section
      const sectionParentId = questionToRemove.sectionParentId;
      setSelectedQuestions(selectedQuestions.filter(q => q.sectionParentId !== sectionParentId));
    } else {
      // Regular question removal
      setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
    }
  };

  const handleNextStep = () => {
    onNext({ questions: selectedQuestions });
  };

  // Filter selected questions based on search term
  const filteredSelectedQuestions = selectedQuestions.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.body && q.body.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if a question matches the search term
  const isQuestionMatching = (q) => {
    if (!searchTerm) return true;
    return q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (q.body && q.body.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const handleImageInsert = (questionId, imageUrl) => {
    setSelectedQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, image: imageUrl }
          : q
      )
    );
    setShowImageModal(false);
    setSelectedQuestionForImage(null);
  };

  const handleImageRemove = (questionId) => {
    setSelectedQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, image: null }
          : q
      )
    );
  };

  const handleSectionConfigConfirm = () => {
    const { question, selectedCount } = showSectionConfig;
    
    // Create a section configuration object instead of expanding all questions
    const sectionConfig = {
      ...question,
      id: question.id,
      sectionConfig: {
        totalQuestions: question.endQuestion - question.startQuestion + 1,
        selectedCount: selectedCount,
        randomSelection: true, // Each student gets different questions
        questionRange: {
          start: question.startQuestion,
          end: question.endQuestion
        }
      },
      isSectionBased: true
    };
    
    setSelectedQuestions([...selectedQuestions, sectionConfig]);
    setShowSectionConfig({ isOpen: false, question: null, totalQuestions: 0, selectedCount: 0 });
  };

  const handleSectionConfigCancel = () => {
    setShowSectionConfig({ isOpen: false, question: null, totalQuestions: 0, selectedCount: 0 });
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
              {rules.length === 0 && <div className="text-sm text-gray-500">No rules yet. Click "Add Rule".</div>}
            </div>
            <div className="mt-3 text-right">
              <button type="button" onClick={autoSelectByRules} className="px-3 py-1 bg-indigo-600 text-white rounded">Auto Select</button>
            </div>
          </div>
        </div>

        {/* Selected Questions Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Selected Questions ({selectedQuestions.length})</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <DraggableQuestionList 
            questions={selectedQuestions}
            setQuestions={setSelectedQuestions}
            searchTerm={searchTerm}
            isQuestionMatching={isQuestionMatching}
            renderActions={(q) => (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuestionForImage(q);
                    setShowImageModal(true);
                  }}
                  className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {q.image ? 'Change Image' : 'Add Image'}
                </button>
                {q.image && (
                  <button
                    type="button"
                    onClick={() => handleImageRemove(q.id)}
                    className="px-2 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Remove Image
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-200 rounded-md">Back</button>
        <button type="button" onClick={handleNextStep} className="px-6 py-2 bg-indigo-600 text-white rounded-md">Next</button>
      </div>

      {/* Image Insert Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Image to Question</h3>
            <p className="text-sm text-gray-600 mb-4">
              Question: {selectedQuestionForImage?.title}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="imageUrl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        document.getElementById('imageUrl').value = e.target.result;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedQuestionForImage(null);
                }}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const imageUrl = document.getElementById('imageUrl').value;
                  if (imageUrl && selectedQuestionForImage) {
                    handleImageInsert(selectedQuestionForImage.id, imageUrl);
                  }
                }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Configuration Modal */}
      {showSectionConfig.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Configure Section Questions
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>{showSectionConfig.question?.title}</strong>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Total questions in section: {showSectionConfig.totalQuestions}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How many questions should each student get?
              </label>
              <input
                type="number"
                min="1"
                max={showSectionConfig.totalQuestions}
                value={showSectionConfig.selectedCount}
                onChange={(e) => setShowSectionConfig(prev => ({
                  ...prev,
                  selectedCount: parseInt(e.target.value) || 1
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Each student will get {showSectionConfig.selectedCount} random questions from this section
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Random Selection:</strong> Each student will get different questions from this section, ensuring fairness and preventing cheating.
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSectionConfigCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSectionConfigConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
