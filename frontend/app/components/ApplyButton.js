// 'use client';

// import { useState } from 'react';
// import { API_BASE, CURRENT_USER_ID } from '@/lib/api';

// export default function ApplyButton({ internshipId }) {
//   const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

//   const apply = async () => {
//     setStatus('loading');
//     try {
//       await fetch(`${API_BASE}/api/applications`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           internshipId,
//           userId: CURRENT_USER_ID,
//         }),
//       });
//       setStatus('success');
//     } catch (err) {
//       setStatus('success');
//     }
//   };

//   return (
//     <div className="flex items-center gap-3">
//       <button
//         onClick={apply}
//         disabled={status === 'loading' || status === 'success'}
//         className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
//       >
//         {status === 'loading' ? 'Applying…' : status === 'success' ? 'Applied ✓' : 'Apply now'}
//       </button>
//       {status === 'success' && (
//         <span className="text-sm text-emerald-700">Application submitted!</span>
//       )}
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { API_BASE, CURRENT_USER_ID } from '@/lib/api';

export default function ApplyButton({ internshipId }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const apply = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId,
          userId: CURRENT_USER_ID,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Could not submit application. Please try again.');
        return;
      }

      setStatus('success');
      setMessage('Application submitted!');
    } catch (err) {
      setStatus('error');
      setMessage('Could not submit application. Please check your connection and try again.');
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={apply}
        disabled={status === 'loading' || status === 'success'}
        className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Applying…' : status === 'success' ? 'Applied ✓' : 'Apply now'}
      </button>

      {message && (
        <span
          className={`text-sm ${
            status === 'success' ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
