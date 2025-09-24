'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';

// Normalize a parsed CSV row so that both legacy and v2 templates are supported
// - Supports legacy headers: subject, category, option_a..option_e, correct_options (A-E), tags
// - Produces the fields expected by validateRow: subject_id, category_id, option1..option5, correct_answer
const normalizeRowForImport = (row, subjectNameToIdMap, categoryNameToIdMap) => {
  if (!row || typeof row !== 'object') return row;

  // Detect legacy format by presence of legacy keys
  const isLegacy =
    'subject' in row ||
    'category' in row ||
    'option_a' in row ||
    'option_b' in row ||
    'correct_options' in row;

  if (!isLegacy) {
    // Still coerce some fields to strings where needed for validation
    const normalized = { ...row };
    if (normalized.difficulty !== undefined && normalized.difficulty !== null) {
      normalized.difficulty = String(normalized.difficulty).trim();
    }
    return normalized;
  }

  const toLowerTrim = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

  // Resolve subject/category names to ids if provided
  const subjectIdFromName = row.subject ? subjectNameToIdMap.get(toLowerTrim(row.subject)) : undefined;
  const categoryIdFromName = row.category ? categoryNameToIdMap.get(toLowerTrim(row.category)) : undefined;

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
    const raw = String(row.correct_options).split(/[,;\s]+/).filter(Boolean)[0] || '';
    const letter = raw.trim().charAt(0).toUpperCase();
    const idx = ['A', 'B', 'C', 'D', 'E'].indexOf(letter);
    if (idx >= 0) correctAnswer = String(idx + 1);
  }

  // Difficulty to string for validator includes check
  const difficulty = row.difficulty !== undefined && row.difficulty !== null ? String(row.difficulty).trim() : row.difficulty;

  // Tags: keep as comma-split array on row.tags (validator will pass through)
  let tags = row.tags;
  if (typeof tags === 'string') {
    tags = tags
      .split(',')
      .map((t) => t.trim())
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
  const parsedSubjectFromRow = row.subject_id && !isNaN(parseInt(row.subject_id)) ? parseInt(row.subject_id) : null;
  const parsedCategoryFromRow = row.category_id && !isNaN(parseInt(row.category_id)) ? parseInt(row.category_id) : null;
  const finalSubjectId = parsedSubjectFromRow ?? (defaults?.subjectId ? parseInt(defaults.subjectId) : null);
  const finalCategoryId = parsedCategoryFromRow ?? (defaults?.categoryId ? parseInt(defaults.categoryId) : null);

  if (!finalSubjectId) errors.push('Valid Subject ID is required');
  if (!finalCategoryId) errors.push('Valid Category ID is required');
  if (!row.difficulty || !['1','2','3','4','5'].includes(row.difficulty)) errors.push('Difficulty must be between 1 and 5');
  if (!row.marks || isNaN(parseInt(row.marks))) errors.push('Valid Marks are required');
  
  const options = [row.option1, row.option2, row.option3, row.option4, row.option5].filter(Boolean);
  if (options.length < 2) errors.push('At least 2 options are required');
  if (!row.correct_answer || isNaN(parseInt(row.correct_answer)) || parseInt(row.correct_answer) < 1 || parseInt(row.correct_answer) > options.length) {
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
      sub_subject_id: defaults?.subSubjectId ? parseInt(defaults.subSubjectId) : (row.sub_subject_id && !isNaN(parseInt(row.sub_subject_id)) ? parseInt(row.sub_subject_id) : null),
      category_id: finalCategoryId,
      difficulty: parseInt(row.difficulty),
      marks: parseInt(row.marks),
      negative_marks: row.negative_marks ? parseInt(row.negative_marks) : 0,
      options: options.map((opt, i) => ({ text: opt, is_correct: (i + 1) === parseInt(row.correct_answer) })),
      // Pass-through tags if provided (array or comma-separated string)
      tags: Array.isArray(row.tags)
        ? row.tags
        : (row.tags ? String(row.tags).split(',').map((t) => t.trim()).filter(Boolean) : []),
      status: 'draft', // Default to draft
    },
  };
};

export default function ImportUploader() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  const [subSubjectId, setSubSubjectId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const { data: subjectsData } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectService.getSubjects({ limit: 100 }) });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });
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
      alert('Successfully imported questions!');
      handleClear();
    },
    onError: (error) => {
      alert(`An error occurred: ${error.message}`);
    }
  });

  const parseAndValidate = (selectedFile) => {
    setIsProcessing(true);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const defaults = { subjectId, categoryId, subSubjectId };

        // Build name->id maps for legacy rows resolution
        const subjectNameToIdMap = new Map(
          (subjectsData?.data || []).map((s) => [String(s.name).trim().toLowerCase(), s.id])
        );
        const categoryNameToIdMap = new Map(
          (categoriesData?.data || []).map((c) => [String(c.name).trim().toLowerCase(), c.id])
        );

        const normalizedRows = results.data.map((row) =>
          normalizeRowForImport(row, subjectNameToIdMap, categoryNameToIdMap)
        );

        const validated = normalizedRows.map((row, i) => validateRow(row, i, defaults));
        setValidationResult({
          valid: validated.filter(r => r.isValid).map(r => r.data),
          invalid: validated.filter(r => !r.isValid),
        });
        setIsProcessing(false);
      },
      error: (err) => {
        alert(`Error parsing CSV: ${err.message}`);
        setIsProcessing(false);
      },
    });
  };

  const handleFileChange = (e) => {
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
      mutation.mutate({ questions: validationResult.valid });
    }
  };

  const handleClear = () => {
    setFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    // Reset file input
    document.getElementById('csv-upload').value = '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h3 className="text-lg font-medium">Import Questions from CSV</h3>

      {/* Select defaults to apply to imported rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">Select Subject (applied to all rows if missing)</option>
          {subjectsData?.data.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select value={subSubjectId} onChange={(e) => setSubSubjectId(e.target.value)} disabled={!subjectId || isLoadingSubSubjects} className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">{subjectId ? 'Optional: Sub-subject' : 'Select Subject first'}</option>
          {subSubjectsData?.data.map((ss) => (
            <option key={ss.id} value={ss.id}>{ss.name}</option>
          ))}
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">Select Category (applied to all rows if missing)</option>
          {categoriesData?.data.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      
      {!validationResult && (
        <>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="..." />
            {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleValidate} disabled={!file || isProcessing} className="...">
              {isProcessing ? 'Validating...' : 'Re-Validate'}
            </button>
          </div>
        </>
      )}

      {validationResult && (
        <div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-lg">Validation Complete</h4>
            <p className="text-green-600">{validationResult.valid.length} questions are valid and ready to import.</p>
            <p className="text-red-600">{validationResult.invalid.length} questions have errors.</p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={handleClear} className="px-4 py-2 bg-gray-200 rounded-md">Clear</button>
            <button onClick={handleSave} disabled={validationResult.valid.length === 0 || mutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400">
              {mutation.isPending ? 'Saving...' : `Save ${validationResult.valid.length} Valid Questions`}
            </button>
          </div>

          {validationResult.invalid.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-lg mb-2">Errors Found</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {validationResult.invalid.map((row, i) => (
                      <tr key={i} className="bg-red-50">
                        <td className="px-4 py-2">{row.originalIndex}</td>
                        <td className="px-4 py-2">{row.data.title || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <ul className="list-disc list-inside text-red-700">
                            {row.errors.map((err, j) => <li key={j}>{err}</li>)}
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

      <div className="mt-4 text-sm text-gray-500 space-y-1">
        <p>Download a sample CSV template:</p>
        <p>
          - <a href="/templates/questions_template_v2.csv" download className="text-indigo-600 hover:underline">Template v2 (recommended)</a> — includes subject_id, optional sub_subject_id, and category_id columns.
        </p>
        <p>
          - <a href="/templates/questions_template.csv" download className="text-indigo-600 hover:underline">Legacy template</a> — older headers; set defaults above when missing.
        </p>
      </div>
    </div>
  );
}
