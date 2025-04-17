import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [videoURL, setVideoURL] = useState("");
  const [loading, setLoading] = useState(false);

  const extractVideoID = (url) => {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
    const parts = url.split(regExp);
    return parts[1] || url;
  };

  const getSentimentSummary = () => {
    const summary = { positive: 0, negative: 0, neutral: 0 };
    results.forEach((res) => {
      if (res.sentiment === "positive") summary.positive++;
      else if (res.sentiment === "negative") summary.negative++;
      else summary.neutral++;
    });
    return [
      { name: "Positive", count: summary.positive },
      { name: "Negative", count: summary.negative },
      { name: "Neutral", count: summary.neutral },
    ];
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const commentsArray = input.split("\n").filter((line) => line.trim() !== "");
    if (commentsArray.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments: commentsArray }),
      });

      const data = await response.json();
      setResults(data.analysis);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleYouTubeAnalyze = async () => {
    const videoId = extractVideoID(videoURL.trim());
    if (!videoId) return alert("Please enter a valid YouTube link or ID");

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/analyze-youtube-comments?video_id=${videoId}`
      );
      const data = await response.json();
      setResults(data.analysis);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while fetching YouTube comments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          🧠 DataTalks: Comment Analyzer
        </h1>

        {/* YouTube Video Analyzer */}
        <div className="mb-6">
          <input
            type="text"
            className="w-full border p-2 rounded-md mb-2"
            placeholder="Paste YouTube video URL or ID"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
          />
          <button
            onClick={handleYouTubeAnalyze}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full"
          >
            {loading ? "Analyzing YouTube..." : "Analyze YouTube Comments 🎥"}
          </button>
        </div>

        {/* Manual Comment Analyzer */}
        <form onSubmit={handleManualSubmit} className="mb-6">
          <textarea
            rows="6"
            className="w-full border p-2 rounded-md"
            placeholder="Or type/paste comments here (one per line)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            {loading ? "Analyzing..." : "Analyze Manual Comments ✍️"}
          </button>
        </form>

        {/* Chart */}
        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Sentiment Summary:</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getSentimentSummary()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Results:</h2>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {results.map((res, index) => {
                let colorClass = "text-gray-600";
                if (res.sentiment === "positive") colorClass = "text-green-600";
                else if (res.sentiment === "negative") colorClass = "text-red-600";
                else if (res.sentiment === "neutral") colorClass = "text-yellow-600";

                return (
                  <li key={index} className="border p-3 rounded-md bg-gray-50">
                    <strong className={colorClass}>
                      {res.sentiment.toUpperCase()}
                    </strong>
                    : {res.comment}
                    <br />
                    <span className="text-sm text-gray-500">
                      Score: {res.score}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
