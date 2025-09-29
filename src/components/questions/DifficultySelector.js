'use client';

import { useState } from 'react';

export default function DifficultySelector({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        Difficulty
      </label>
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type='button'
            className={`text-2xl ${
              (hoverValue || value) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
          >
            &#9733;
          </button>
        ))}
      </div>
    </div>
  );
}
