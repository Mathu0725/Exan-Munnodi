'use client';

import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';

// Normalize a parsed CSV row so that both legacy and v2 templates are supported
// - Supports legacy headers: subject, category, option_a..option_e, correct_options (A-E), tags
// - Supports simple format: question, option1..option5, correct_answer, difficulty
// - Produces the fields expected by validateRow: subject_id, category_id, option1..option5, correct_answer
const normalizeRowForImport = (
  row,
  subjectNameToIdMap,
  categoryNameToIdMap,
  defaults
) => {
  if (!row || typeof row !== 'object') return row;

  // Detect simple format by presence of 'question' key
  const isSimpleFormat = 'question' in row;

  // Detect legacy format by presence of legacy keys
  const isLegacy =
    'subject' in row ||
    'category' in row ||
    'option_a' in row ||
    'option_b' in row ||
    'correct_options' in row;

  if (isSimpleFormat) {
    // Simple format: question, option1..option5, correct_answer, difficulty
    const normalized = {
      title: row.question || '',
      body: '', // Simple format doesn't have body
      subject_id: defaults?.subjectId || 1, // Use default subject
      sub_subject_id: defaults?.subSubjectId || null,
      category_id: defaults?.categoryId || 1, // Use default category
      difficulty: row.difficulty || defaults?.difficulty || 1,
      marks: defaults?.marks || 1,
      negative_marks: defaults?.negativeMarks || 0,
      option1: row.option1 || '',
      option2: row.option2 || '',
      option3: row.option3 || '',
      option4: row.option4 || '',
      option5: row.option5 || '',
      correct_answer: row.correct_answer || 1,
    };
    return normalized;
  }

  if (!isLegacy) {
    // Still coerce some fields to strings where needed for validation
    const normalized = { ...row };
    if (normalized.difficulty !== undefined && normalized.difficulty !== null) {
      normalized.difficulty = String(normalized.difficulty).trim();
    }
    return normalized;
  }

  const toLowerTrim = v =>
    typeof v === 'string' ? v.trim().toLowerCase() : '';

  // Resolve subject/category names to ids if provided
  const subjectIdFromName = row.subject
    ? subjectNameToIdMap.get(toLowerTrim(row.subject))
    : undefined;
  const categoryIdFromName = row.category
    ? categoryNameToIdMap.get(toLowerTrim(row.category))
    : undefined;

  // Map legacy options option_a..option_e to option1..option5
  const letters = ['a', 'b', 'c', 'd', 'e'];
  const optionFields = {};
  letters.forEach((letter, idx) => {
    const legacyKey = `option_${letter}`;
    const value = row[legacyKey] ?? row[legacyKey.toUpperCase()] ?? undefined;
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      optionFields[`option${idx + 1}`] = value;
    }
  });

  // Convert correct_options letters (possibly comma-separated) to a single index (1-5)
  let correctAnswer = row.correct_answer;
  if (!correctAnswer && row.correct_options) {
    const raw =
      String(row.correct_options)
        .split(/[,;\s]+/)
        .filter(Boolean)[0] || '';
    const letter = raw.trim().charAt(0).toUpperCase();
    const idx = ['A', 'B', 'C', 'D', 'E'].indexOf(letter);
    if (idx >= 0) correctAnswer = String(idx + 1);
  }

  // Difficulty to string for validator includes check
  const difficulty =
    row.difficulty !== undefined && row.difficulty !== null
      ? String(row.difficulty).trim()
      : row.difficulty;

  // Tags: keep as comma-split array on row.tags (validator will pass through)
  let tags = row.tags;
  if (typeof tags === 'string') {
    tags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }

  return {
    ...row,
    // Prefer explicit IDs if present; otherwise mapped from names when available
    subject_id: row.subject_id ?? subjectIdFromName,
    category_id: row.category_id ?? categoryIdFromName,
    // Keep sub_subject_id as-is (legacy does not provide it)
    ...optionFields,
    correct_answer: correctAnswer ?? row.correct_answer,
    difficulty,
    tags,
  };
};

const validateRow = (row, index, defaults) => {
  const errors = [];
  if (!row.title) errors.push('Title is required');

  // Apply defaults for subject/category if missing/invalid
  const parsedSubjectFromRow =
    row.subject_id && !isNaN(parseInt(row.subject_id))
      ? parseInt(row.subject_id)
      : null;
  const parsedCategoryFromRow =
    row.category_id && !isNaN(parseInt(row.category_id))
      ? parseInt(row.category_id)
      : null;
  const finalSubjectId =
    parsedSubjectFromRow ??
    (defaults?.subjectId ? parseInt(defaults.subjectId) : null);
  const finalCategoryId =
    parsedCategoryFromRow ??
    (defaults?.categoryId ? parseInt(defaults.categoryId) : null);

  if (!finalSubjectId) errors.push('Valid Subject ID is required');
  if (!finalCategoryId) errors.push('Valid Category ID is required');
  const rawDifficulty = row.difficulty ?? defaults?.difficulty ?? '';
  const normalizedDifficulty = String(rawDifficulty).trim();
  if (
    !normalizedDifficulty ||
    !['1', '2', '3', '4', '5'].includes(normalizedDifficulty)
  )
    errors.push('Difficulty must be between 1 and 5');

  const rawMarks = row.marks ?? defaults?.marks ?? '';
  const normalizedMarks = String(rawMarks).trim();
  if (!normalizedMarks || isNaN(parseFloat(normalizedMarks)))
    errors.push('Valid Marks are required');

  const rawNegativeMarks = row.negative_marks ?? defaults?.negativeMarks ?? '0';
  const normalizedNegativeMarks =
    String(rawNegativeMarks).trim() === ''
      ? '0'
      : String(rawNegativeMarks).trim();
  if (isNaN(parseFloat(normalizedNegativeMarks)))
    errors.push('Negative marks must be a number');

  const options = [
    row.option1,
    row.option2,
    row.option3,
    row.option4,
    row.option5,
  ].filter(
    opt => opt !== undefined && opt !== null && String(opt).trim() !== ''
  );
  if (options.length < 2) errors.push('At least 2 options are required');
  const correctAnswerSource = row.correct_answer ?? '';
  if (
    !correctAnswerSource ||
    isNaN(parseInt(correctAnswerSource)) ||
    parseInt(correctAnswerSource) < 1 ||
    parseInt(correctAnswerSource) > options.length
  ) {
    errors.push(`A correct answer index (1-${options.length}) is required`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors, data: row, originalIndex: index + 1 };
  }

  return {
    isValid: true,
    data: {
      title: row.title,
      body: row.body || '',
      subject_id: finalSubjectId,
      sub_subject_id: defaults?.subSubjectId
        ? parseInt(defaults.subSubjectId)
        : row.sub_subject_id && !isNaN(parseInt(row.sub_subject_id))
          ? parseInt(row.sub_subject_id)
          : null,
      category_id: finalCategoryId,
      difficulty: parseInt(normalizedDifficulty),
      marks: parseFloat(normalizedMarks),
      negative_marks: parseFloat(normalizedNegativeMarks),
      options: options.map((opt, i) => ({
        text: opt,
        is_correct: i + 1 === parseInt(correctAnswerSource),
      })),
      // Pass-through tags if provided (array or comma-separated string)
      tags: Array.isArray(row.tags)
        ? row.tags
        : row.tags
          ? String(row.tags)
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : [],
      status: 'draft', // Default to draft
    },
  };
};

export default function ImportUploader() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [uploadStep, setUploadStep] = useState('upload'); // 'upload' or 'configure'
  const [subjectId, setSubjectId] = useState('');
  const [subSubjectId, setSubSubjectId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [defaultDifficulty, setDefaultDifficulty] = useState('');
  const [defaultMarks, setDefaultMarks] = useState('');
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState('');

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects({ limit: 100 }),
  });
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  // Debug logging
  console.log('Categories data:', categoriesData);
  console.log('Categories error:', categoriesError);
  console.log('Categories loading:', categoriesLoading);
  const { data: subjectHierarchyData } = useQuery({
    queryKey: ['subjects-with-subsubjects'],
    queryFn: () => subjectService.getSubjectsWithSubsubjects(),
  });
  const { data: subSubjectsData, isLoading: isLoadingSubSubjects } = useQuery({
    queryKey: ['subsubjects', subjectId],
    queryFn: () => subjectService.getSubSubjectsForSubject(subjectId),
    enabled: !!subjectId,
  });

  useEffect(() => {
    // Reset sub-subject when subject changes
    setSubSubjectId('');
  }, [subjectId]);

  const mutation = useMutation({
    mutationFn: questionService.createManyQuestions, // Assumes this service exists
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      queryClient.invalidateQueries(['dashboardStats']);
      alert('Successfully imported questions!');
      handleClear();
    },
    onError: error => {
      alert(`An error occurred: ${error.message}`);
    },
  });

  const parseAndValidate = selectedFile => {
    setIsProcessing(true);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const defaults = {
          subjectId,
          categoryId,
          subSubjectId,
          difficulty: defaultDifficulty,
          marks: defaultMarks,
          negativeMarks: defaultNegativeMarks,
        };

        // Build name->id maps for legacy rows resolution
        const subjectNameToIdMap = new Map(
          (subjectsData?.data || []).map(s => [
            String(s.name).trim().toLowerCase(),
            s.id,
          ])
        );
        const categoryNameToIdMap = new Map(
          (categoriesData?.data || []).map(c => [
            String(c.name).trim().toLowerCase(),
            c.id,
          ])
        );

        const normalizedRows = results.data.map(row =>
          normalizeRowForImport(row, subjectNameToIdMap, categoryNameToIdMap, {
            subjectId: subjectId,
            subSubjectId: subSubjectId,
            categoryId: categoryId,
            difficulty: defaultDifficulty,
            marks: defaultMarks,
            negativeMarks: defaultNegativeMarks,
          })
        );

        const validated = normalizedRows.map((row, i) =>
          validateRow(row, i, defaults)
        );
        setValidationResult({
          valid: validated.filter(r => r.isValid).map(r => r.data),
          invalid: validated.filter(r => !r.isValid),
        });
        setIsProcessing(false);

        // Move to configure step after successful parsing
        if (validated.some(r => r.isValid)) {
          setUploadStep('configure');
        }
      },
      error: err => {
        alert(`Error parsing CSV: ${err.message}`);
        setIsProcessing(false);
      },
    });
  };

  const handleFileChange = e => {
    const selected = e.target.files[0];
    setFile(selected);
    setValidationResult(null);
    if (selected) {
      // Auto-parse and validate immediately upon selection with current defaults
      parseAndValidate(selected);
    }
  };

  const handleValidate = () => {
    if (!file) return alert('Please select a file first.');
    parseAndValidate(file);
  };

  const handleSave = () => {
    if (validationResult?.valid.length > 0) {
      // Apply the selected defaults to all questions
      const questionsWithDefaults = validationResult.valid.map(q => ({
        ...q,
        subject_id: subjectId || 1,
        sub_subject_id: subSubjectId || null,
        category_id: categoryId || 1,
        difficulty: q.difficulty || defaultDifficulty || 1,
        marks: defaultMarks || 1,
        negative_marks: defaultNegativeMarks || 0,
      }));

      mutation.mutate(questionsWithDefaults);
    }
  };

  const handleClear = () => {
    setFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    setUploadStep('upload');
    // Reset file input
    if (typeof document !== 'undefined') {
      const input = document.getElementById('csv-upload');
      if (input) {
        input.value = '';
      }
    }
    setSubjectId('');
    setSubSubjectId('');
    setCategoryId('');
    setDefaultDifficulty('');
    setDefaultMarks('');
    setDefaultNegativeMarks('');
  };

  const handleDownloadReference = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    const rows = [['Type', 'ID', 'Name', 'Parent Subject ID']];

    (subjectHierarchyData?.data || []).forEach(subject => {
      rows.push(['Subject', subject.id, subject.name, '']);
      (subject.subsubjects || []).forEach(sub => {
        rows.push(['Sub-subject', sub.id, sub.name, subject.id]);
      });
    });

    (categoriesData?.data || []).forEach(category => {
      rows.push(['Category', category.id, category.name, '']);
    });

    const csv = rows
      .map(row =>
        row
          .map((value = '') => {
            const stringValue = String(value ?? '');
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'master-data-reference.csv');
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  const subjectOptions = useMemo(
    () => subjectHierarchyData?.data || [],
    [subjectHierarchyData]
  );
  const categoryOptions = useMemo(
    () => categoriesData?.data || [],
    [categoriesData]
  );

  const selectedSubjectName = useMemo(() => {
    if (!subjectId) return '';
    const match = subjectOptions.find(
      subject => String(subject.id) === String(subjectId)
    );
    return match?.name || '';
  }, [subjectId, subjectOptions]);

  const defaultHints = useMemo(() => {
    const hints = [];
    if (defaultDifficulty) hints.push(`Difficulty ${defaultDifficulty}`);
    if (defaultMarks)
      hints.push(
        `${defaultMarks} mark${Number(defaultMarks) === 1 ? '' : 's'}`
      );
    if (defaultNegativeMarks) hints.push(`${defaultNegativeMarks} negative`);
    return hints.join(' · ');
  }, [defaultDifficulty, defaultMarks, defaultNegativeMarks]);

  return (
    <div className='bg-white p-6 rounded-lg shadow space-y-6'>
      {uploadStep === 'upload' ? (
        <>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
            <div>
              <h3 className='text-lg font-medium'>Import Questions from CSV</h3>
              <p className='text-sm text-gray-500 mt-1'>
                First select subject and sub-subject, then upload CSV with just
                questions and answers.
              </p>
            </div>
            <button
              type='button'
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/templates/simple_questions_template.csv';
                link.download = 'simple_questions_template.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-600 border border-green-500 rounded-md hover:bg-green-50'
            >
              Download Template
            </button>
          </div>

          {/* Step 1: Select Subject and Sub-subject */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200'>
            <div className='flex items-center mb-4'>
              <div className='w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3'>
                1
              </div>
              <h4 className='font-semibold text-blue-900 text-lg'>
                Choose Subject & Category
              </h4>
            </div>
            <p className='text-blue-700 text-sm mb-4'>
              Select where these questions will be categorized
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 flex items-center'>
                  <span className='text-red-500 mr-1'>*</span>
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                >
                  <option value=''>Choose a subject...</option>
                  {subjectOptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {subjectId && (
                  <div className='flex items-center text-green-600 text-sm'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Selected:{' '}
                    {subjectOptions.find(s => s.id == subjectId)?.name}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>
                  Sub-subject <span className='text-gray-500'>(optional)</span>
                </label>
                <select
                  value={subSubjectId}
                  onChange={e => setSubSubjectId(e.target.value)}
                  disabled={!subjectId || isLoadingSubSubjects}
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>Choose sub-subject...</option>
                  {subSubjectsData?.data.map(ss => (
                    <option key={ss.id} value={ss.id}>
                      {ss.name}
                    </option>
                  ))}
                </select>
                {isLoadingSubSubjects && (
                  <div className='flex items-center text-blue-600 text-sm'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
                    Loading sub-subjects...
                  </div>
                )}
              </div>
            </div>

            <div className='mt-4'>
              <label className='text-sm font-semibold text-gray-700 flex items-center'>
                <span className='text-red-500 mr-1'>*</span>
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                disabled={categoriesLoading}
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all mt-2 disabled:bg-gray-100 disabled:cursor-not-allowed'
              >
                <option value=''>
                  {categoriesLoading
                    ? 'Loading categories...'
                    : 'Choose a category...'}
                </option>
                {categoryOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <div className='text-red-600 text-sm mt-1'>
                  Error loading categories: {categoriesError.message}
                </div>
              )}
              {categoryId && (
                <div className='flex items-center text-green-600 text-sm mt-1'>
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Selected:{' '}
                  {categoryOptions.find(c => c.id == categoryId)?.name}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Upload CSV */}
          <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200'>
            <div className='flex items-center mb-4'>
              <div className='w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3'>
                2
              </div>
              <h4 className='font-semibold text-green-900 text-lg'>
                Upload Your Questions
              </h4>
            </div>

            {!subjectId || !categoryId ? (
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 text-yellow-600 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <p className='text-yellow-800 font-medium'>
                    Please complete Step 1 first
                  </p>
                </div>
                <p className='text-yellow-700 text-sm mt-1'>
                  Select subject and category before uploading CSV
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='bg-white border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors'>
                  <div className='mb-4'>
                    <svg
                      className='w-12 h-12 text-green-500 mx-auto'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                      />
                    </svg>
                  </div>
                  <h5 className='text-lg font-semibold text-gray-900 mb-2'>
                    Upload CSV File
                  </h5>
                  <p className='text-gray-600 mb-4'>
                    Upload your questions CSV file. Make sure it has these
                    columns:
                  </p>
                  <div className='bg-gray-50 rounded-lg p-3 mb-4'>
                    <code className='text-sm text-gray-700'>
                      question, option1, option2, option3, option4, option5,
                      correct_answer, difficulty
                    </code>
                  </div>

                  <input
                    id='csv-upload'
                    type='file'
                    accept='.csv'
                    onChange={handleFileChange}
                    className='block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 transition-colors'
                  />

                  {file && (
                    <div className='mt-4 p-3 bg-green-100 rounded-lg'>
                      <div className='flex items-center text-green-800'>
                        <svg
                          className='w-5 h-5 mr-2'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span className='font-medium'>
                          Selected: {file.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-start'>
                    <svg
                      className='w-5 h-5 text-blue-600 mr-2 mt-0.5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <div>
                      <p className='text-blue-800 font-medium text-sm'>
                        Questions will be assigned to:
                      </p>
                      <p className='text-blue-700 text-sm'>
                        <strong>
                          {subjectOptions.find(s => s.id == subjectId)?.name}
                        </strong>
                        {subSubjectId &&
                          ` > ${subSubjectsData?.data.find(s => s.id == subSubjectId)?.name}`}
                        <br />
                        Category:{' '}
                        <strong>
                          {categoryOptions.find(c => c.id == categoryId)?.name}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className='bg-purple-50 border border-purple-200 rounded-lg p-6 text-center'>
              <div className='flex items-center justify-center mb-4'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
              </div>
              <h5 className='text-lg font-semibold text-purple-900 mb-2'>
                Processing Your Questions
              </h5>
              <p className='text-purple-700'>
                Please wait while we validate your CSV file...
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium'>
                Configure Question Settings
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                CSV uploaded successfully! Now select the subject, category, and
                other settings for all {validationResult?.valid.length || 0}{' '}
                questions.
              </p>
            </div>
            <button
              onClick={() => setUploadStep('upload')}
              className='px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
            >
              ← Back to Upload
            </button>
          </div>

          {/* Configuration options */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-wide text-gray-500'>
                Subject *
              </label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value=''>Select Subject</option>
                {subjectOptions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-wide text-gray-500'>
                Sub-subject
              </label>
              <select
                value={subSubjectId}
                onChange={e => setSubSubjectId(e.target.value)}
                disabled={!subjectId || isLoadingSubSubjects}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value=''>Optional: pick sub-subject</option>
                {subSubjectsData?.data.map(ss => (
                  <option key={ss.id} value={ss.id}>
                    {ss.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-wide text-gray-500'>
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value=''>Select Category</option>
                {categoryOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-wide text-gray-500'>
                Default Difficulty (1-5)
              </label>
              <select
                value={defaultDifficulty}
                onChange={e => setDefaultDifficulty(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value=''>Leave as-is from CSV</option>
                {[1, 2, 3, 4, 5].map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-wide text-gray-500'>
                Default Marks
              </label>
              <input
                type='number'
                min='0'
                step='0.5'
                value={defaultMarks}
                onChange={e => setDefaultMarks(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Keep CSV values'
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-wide text-gray-500'>
                Default Negative Marks
              </label>
              <input
                type='number'
                min='0'
                step='0.5'
                value={defaultNegativeMarks}
                onChange={e => setDefaultNegativeMarks(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Keep CSV values'
              />
            </div>
          </div>

          {validationResult && (
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h4 className='text-xl font-bold text-green-900'>
                    ✅ Ready to Import!
                  </h4>
                  <p className='text-green-700 mt-1'>
                    {validationResult.valid.length} questions are ready to be
                    imported
                  </p>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-green-600'>
                    {validationResult.valid.length}
                  </div>
                  <div className='text-sm text-green-600'>Valid Questions</div>
                </div>
              </div>

              {validationResult.valid.length > 0 && (
                <div className='mb-6'>
                  <h5 className='font-semibold text-gray-900 mb-3'>
                    Preview Questions
                  </h5>
                  <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                          <tr>
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Question
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Difficulty
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                              Correct Answer
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                          {validationResult.valid.slice(0, 5).map((row, i) => (
                            <tr key={i} className='hover:bg-gray-50'>
                              <td className='px-4 py-3 text-sm text-gray-900 max-w-xs truncate'>
                                {row.title || row.data?.title || 'N/A'}
                              </td>
                              <td className='px-4 py-3 text-sm'>
                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                  {row.difficulty ||
                                    row.data?.difficulty ||
                                    'N/A'}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-sm text-gray-900'>
                                Option{' '}
                                {row.correct_answer ||
                                  row.data?.correct_answer ||
                                  'N/A'}
                              </td>
                            </tr>
                          ))}
                          {validationResult.valid.length > 5 && (
                            <tr className='bg-gray-50'>
                              <td
                                colSpan='3'
                                className='px-4 py-3 text-center text-sm text-gray-500'
                              >
                                <div className='flex items-center justify-center'>
                                  <svg
                                    className='w-4 h-4 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                  >
                                    <path
                                      fillRule='evenodd'
                                      d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                                      clipRule='evenodd'
                                    />
                                  </svg>
                                  ... and {validationResult.valid.length - 5}{' '}
                                  more questions
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex justify-between items-center'>
                <button
                  onClick={handleClear}
                  className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                >
                  ← Start Over
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    !subjectId ||
                    !categoryId ||
                    validationResult.valid.length === 0 ||
                    mutation.isPending
                  }
                  className='px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center'
                >
                  {mutation.isPending ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Import {validationResult.valid.length} Questions
                    </>
                  )}
                </button>
              </div>

              {validationResult.invalid.length > 0 && (
                <div className='mt-6'>
                  <h4 className='font-semibold text-lg mb-2'>
                    Errors Found ({validationResult.invalid.length})
                  </h4>
                  <div className='overflow-x-auto border rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-4 py-2 text-left text-xs font-medium'>
                            Row
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium'>
                            Question
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium'>
                            Errors
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {validationResult.invalid.map((row, i) => (
                          <tr key={i} className='bg-red-50'>
                            <td className='px-4 py-2'>
                              {row.originalIndex || i + 1}
                            </td>
                            <td className='px-4 py-2'>
                              {row.data?.title || row.title || 'N/A'}
                            </td>
                            <td className='px-4 py-2'>
                              <ul className='list-disc list-inside text-red-700'>
                                {row.errors.map((err, j) => (
                                  <li key={j}>{err}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!validationResult && (
        <>
          <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-3'>
            <p className='text-sm text-gray-600'>
              Upload the template CSV. Leave subject/category columns blank if
              you want the defaults above to apply.
            </p>
            <input
              id='csv-upload'
              type='file'
              accept='.csv'
              onChange={handleFileChange}
              className='w-full max-w-xs mx-auto'
            />
            {file && (
              <p className='mt-2 text-sm text-gray-600'>
                Selected file: {file.name}
              </p>
            )}
          </div>
          <div className='mt-6 flex justify-end'>
            <button
              onClick={handleValidate}
              disabled={!file || isProcessing}
              className='...'
            >
              {isProcessing ? 'Validating...' : 'Re-Validate'}
            </button>
          </div>
        </>
      )}

      {validationResult && (
        <div>
          <div className='p-4 bg-gray-50 rounded-lg space-y-2'>
            <h4 className='font-semibold text-lg'>Validation Complete</h4>
            <p className='text-green-600'>
              {validationResult.valid.length} questions are valid and ready to
              import.
            </p>
            <p className='text-red-600'>
              {validationResult.invalid.length} questions have errors.
            </p>
            <p className='text-sm text-gray-500'>
              Need to fix subject, category, difficulty, or marks? Update the
              CSV or adjust the defaults above and re-validate.{' '}
              {defaultHints && (
                <span className='text-gray-600'>
                  Current defaults: {defaultHints}.
                </span>
              )}
            </p>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <button
              onClick={handleClear}
              className='px-4 py-2 bg-gray-200 rounded-md'
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              disabled={
                validationResult.valid.length === 0 || mutation.isPending
              }
              className='px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400'
            >
              {mutation.isPending
                ? 'Saving...'
                : `Save ${validationResult.valid.length} Valid Questions`}
            </button>
          </div>

          {validationResult.invalid.length > 0 && (
            <div className='mt-6'>
              <h4 className='font-semibold text-lg mb-2'>Errors Found</h4>
              <div className='overflow-x-auto border rounded-lg'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-left text-xs font-medium'>
                        Row
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium'>
                        Title
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium'>
                        Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {validationResult.invalid.map((row, i) => (
                      <tr key={i} className='bg-red-50'>
                        <td className='px-4 py-2'>{row.originalIndex}</td>
                        <td className='px-4 py-2'>{row.data.title || 'N/A'}</td>
                        <td className='px-4 py-2'>
                          <ul className='list-disc list-inside text-red-700'>
                            {row.errors.map((err, j) => (
                              <li key={j}>{err}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='mt-4 text-sm text-gray-500 space-y-1'>
        <p>Download a sample CSV template:</p>
        <p>
          -{' '}
          <a
            href='/templates/questions_template_v2.csv'
            download
            className='text-indigo-600 hover:underline'
          >
            Template v2 (recommended)
          </a>{' '}
          — includes subject_id, optional sub_subject_id, and category_id
          columns.
        </p>
        <p>
          -{' '}
          <a
            href='/templates/questions_template.csv'
            download
            className='text-indigo-600 hover:underline'
          >
            Legacy template
          </a>{' '}
          — older headers; set defaults above when missing.
        </p>
      </div>
    </div>
  );
}
