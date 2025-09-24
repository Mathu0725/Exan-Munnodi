'use client';

export default function QuestionPreview({ question }) {
  if (!question) return null;

  const { title, body, image_url, options = [], difficulty, marks, time_limit } = question;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {typeof body === 'string' && body.length > 0 && (
          <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: body }} />
        )}
        {image_url && (
          <div className="mt-3">
            <img src={image_url} alt="Question" className="max-h-64 rounded" />
          </div>
        )}
      </div>

      {options.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
          <ul className="space-y-2">
            {options.map((opt) => (
              <li key={opt.id} className="p-3 border rounded flex items-start gap-2">
                <span className={`mt-1 inline-block h-2 w-2 rounded-full ${opt.is_correct ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                <span>{opt.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 text-sm text-gray-600">
        <span>Difficulty: {difficulty}</span>
        <span>Marks: {marks}</span>
        {time_limit ? <span>Time: {time_limit}s</span> : null}
      </div>
    </div>
  );
}


