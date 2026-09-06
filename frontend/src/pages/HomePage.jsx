import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTestRun, attachPRD } from "../api/testRuns";

function isValidURL(url) {
  try {
    const parsedURL = new URL(url);
    return parsedURL.protocol === "http:" || parsedURL.protocol === "https:";
  } catch {
    return false;
  }
}

function saveRunToHistory(run) {
  const existing = JSON.parse(localStorage.getItem("aivar_runs") || "[]");
  existing.unshift({ id: run.runId, url: run.url, createdAt: new Date().toISOString() });
  localStorage.setItem("aivar_runs", JSON.stringify(existing));
}

export default function HomePage() {
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prdFile, setPrdFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!targetUrl.trim()) {
      setError("Enter a URL before starting the test run.");
      return;
    }

    if (!isValidURL(targetUrl.trim())) {
      setError("Please provide a valid URL.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const run = await createTestRun(targetUrl.trim(), instructions.trim() || undefined);
      const runId = run.runId || run.id;

      if (prdFile) {
        await attachPRD(runId, prdFile);
      }

      saveRunToHistory({ runId, url: targetUrl.trim() });
      navigate(`/dashboard/${runId}`, { state: { targetUrl: targetUrl.trim() } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the test run. Check the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main className="page">
        <div className="page__inner">
          <h1 className="page__heading">Start testing</h1>
          <p className="page__subheading">
            Please provide a valid URL and start.
          </p>

          <form className="card" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="target-url">Target URL</label>
              <input
                id="target-url"
                name="target-url"
                type="url"
                placeholder="https://example.com"
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="instructions">Instructions (optional)</label>
              <input
                id="instructions"
                name="instructions"
                type="text"
                placeholder="add extra info if needed"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="prd">PRD (optional)</label>
              <input
                id="prd"
                name="prd"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(event) => setPrdFile(event.target.files[0] || null)}
              />
            </div>

            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "STARTING..." : "START TESTING"}
            </button>
          </form>
        </div>
      </main>

      <section className="about">
        <div className="about__inner">
          <h2 className="about__title">About</h2>
          <p className="about__text">
            Autonomous QA : an AI-powered test orchestration platform that
            autonomously plans, generates, executes, and heals web
            application tests, delivering meaningful coverage and actionable
            quality insights with minimal manual intervention.
          </p>
        </div>
      </section>
    </>
  );
}