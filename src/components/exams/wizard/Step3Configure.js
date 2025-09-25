import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import ExamPreview from '@/components/exams/ExamPreview';

export default function Step3Configure({ data, onBack, onSubmit }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const { register, handleSubmit, watch, getValues, reset } = useForm({
    defaultValues: data.config || {
      global_shuffle: false,
      negative_marking: true,
      allow_review: true,
      question_numbering: 'fixed',
      total_time_minutes: '',
      timing_mode: 'total_exam_time',
      access_password: '',
    },
  });
  const [jsonText, setJsonText] = useState(JSON.stringify(data.config || {
    global_shuffle: false,
    negative_marking: true,
    allow_review: true,
    question_numbering: 'fixed',
    total_time_minutes: '',
    timing_mode: 'total_exam_time',
  }, null, 2));

  const timingMode = watch('timing_mode');

  const handleFormSubmit = (configData) => {
    const payload = {
      ...configData,
      total_time_minutes: configData.total_time_minutes ? parseInt(configData.total_time_minutes, 10) : null,
    };
    onSubmit(payload);
  };

  const getPreviewData = () => ({
    ...data,
    config: getValues(),
  });

  const openJsonEditor = () => {
    setJsonText(JSON.stringify(getValues(), null, 2));
    setIsJsonOpen(true);
  };

  const applyJsonChanges = () => {
    try {
      const parsed = JSON.parse(jsonText);
      reset(parsed);
      setIsJsonOpen(false);
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Exam Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="global_shuffle" {...register('global_shuffle')} type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="global_shuffle" className="font-medium text-gray-700">Shuffle Questions</label>
                <p className="text-gray-500">Randomize the order of questions for each attempt.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="negative_marking" {...register('negative_marking')} type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="negative_marking" className="font-medium text-gray-700">Enable Negative Marking</label>
                <p className="text-gray-500">Deduct marks for incorrect answers.</p>
              </div>
            </div>
            <div>
              <label htmlFor="question_numbering" className="block text-sm font-medium text-gray-700">Question Numbering</label>
              <select id="question_numbering" {...register('question_numbering')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="fixed">Fixed</option>
                <option value="random_per_attempt">Random per Attempt</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Timing</h3>
            <div>
              <label htmlFor="timing_mode" className="block text-sm font-medium text-gray-700">Timing Mode</label>
              <select id="timing_mode" {...register('timing_mode')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="total_exam_time">Total Exam Time</option>
                <option value="per_question_time">Sum of Individual Question Times</option>
              </select>
            </div>
            {timingMode === 'total_exam_time' && (
              <div>
                <label htmlFor="total_time_minutes" className="block text-sm font-medium text-gray-700">Total Time (minutes)</label>
                <input id="total_time_minutes" type="number" placeholder="Optional" {...register('total_time_minutes')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            )}
            <div>
              <label htmlFor="access_password" className="block text-sm font-medium text-gray-700">Exam Access Password</label>
              <div className="mt-1 flex">
                <input id="access_password" type="text" {...register('access_password')} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md" />
                <button type="button" onClick={() => reset({ ...getValues(), access_password: Math.random().toString(36).slice(2, 8).toUpperCase() })} className="px-3 bg-gray-200 rounded-r-md">Generate</button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Students must enter this to start the exam.</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Final Review (JSON)</h3>
            <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-auto text-sm">
              {JSON.stringify(getPreviewData(), null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-200 rounded-md">Back</button>
          <div className="flex space-x-3">
            <button type="button" onClick={() => setIsPreviewOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-md">Preview</button>
            <button type="button" onClick={openJsonEditor} className="px-6 py-2 bg-gray-700 text-white rounded-md">Edit JSON</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md">Save Exam</button>
          </div>
        </div>
      </form>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Exam Preview" size="4xl">
        <ExamPreview examData={getPreviewData()} />
      </Modal>

      <Modal isOpen={isJsonOpen} onClose={() => setIsJsonOpen(false)} title="Edit Exam Config (JSON)" size="3xl">
        <div className="space-y-4">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={16}
            className="w-full font-mono text-sm border rounded p-3"
          />
          <div className="flex justify-end space-x-3">
            <button onClick={() => setIsJsonOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button onClick={applyJsonChanges} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Apply</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
