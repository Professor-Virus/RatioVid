import { useState } from 'react';
import Navbar from './Navbar';

function HomePage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/processVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl, prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process video');
      }
      
      const data = await response.json();
      setSnippets(data.snippets);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-4 flex-grow">
        <h1 className="text-4xl font-bold mb-8">RatioVid</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="w-full px-4 py-2 mb-4 border rounded bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700 focus:outline-none"
          />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter search prompt"
            className="w-full px-4 py-2 mb-4 border rounded bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Process Video'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {snippets.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Snippets:</h2>
            {snippets.map((snippet, index) => (
              <video key={index} src={snippet} controls className="mb-4" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
