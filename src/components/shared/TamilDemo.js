'use client';

import TamilText from './TamilText';

/**
 * Tamil Demo Component
 * Shows examples of Tamil text rendering with different font styles
 */
export default function TamilDemo() {
  const tamilExamples = {
    heading: 'தமிழ் மொழி - Tamil Language',
    question:
      'இந்த கேள்விக்கு பதில் என்ன? (What is the answer to this question?)',
    option: 'அ) சரியான பதில் (A) Correct Answer',
    body: 'தமிழ் மொழியில் எழுதப்பட்ட உரை சரியாக காட்டப்படுகிறது. (Text written in Tamil language is displayed correctly.)',
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 mb-4'>
        Tamil Font Support Demo
      </h2>

      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            Heading Style
          </h3>
          <TamilText type='heading' className='text-xl'>
            {tamilExamples.heading}
          </TamilText>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            Question Style
          </h3>
          <TamilText type='question' className='text-lg'>
            {tamilExamples.question}
          </TamilText>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            Option Style
          </h3>
          <TamilText type='option' className='text-base'>
            {tamilExamples.option}
          </TamilText>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            Body Text Style
          </h3>
          <TamilText type='body' className='text-base'>
            {tamilExamples.body}
          </TamilText>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            Search Highlighting
          </h3>
          <TamilText
            type='body'
            className='text-base'
            searchTerm='தமிழ்'
            highlight={true}
          >
            {tamilExamples.body}
          </TamilText>
        </div>
      </div>

      <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <h4 className='font-semibold text-gray-700 mb-2'>Font Information:</h4>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>• Primary Font: Noto Sans Tamil</li>
          <li>• Secondary Font: Tiro Tamil (for headings)</li>
          <li>• Fallback: System fonts</li>
          <li>• Features: Ligatures, Contextual Alternates, Kerning</li>
        </ul>
      </div>
    </div>
  );
}
