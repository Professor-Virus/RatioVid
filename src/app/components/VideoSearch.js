import { useState } from 'react';

export default function VideoSearch() {
    const [videoUrl, setVideoUrl] = useState('');
    const [searchPrompt, setSearchPrompt] = useState('');
    const [snippets, setSnippets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/searchVideo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl, searchPrompt }),
            });
            const data = await response.json();
            setSnippets(data.snippets);
        } catch (error) {
            console.error('Error searching video:', error);
        }
        setIsLoading(false);
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter YouTube video URL"
                />
                <input
                    type="text"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    placeholder="Enter search prompt"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search Video'}
                </button>
            </form>
            {snippets.length > 0 && (
                <div>
                    <h2>Search Results:</h2>
                    {snippets.map((snippet, index) => (
                        <video key={index} src={snippet} controls />
                    ))}
                </div>
            )}
        </div>
    );
}