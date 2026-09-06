import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTestRun } from "../api/testRuns";

export default function History() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("aivar_runs") || "[]");

    async function loadStatuses() {
      const withStatus = await Promise.all(
        stored.map(async (run) => {
          try {
            const data = await getTestRun(run.id);
            return { ...run, status: data.status };
          } catch {
            return { ...run, status: "unknown" };
          }
        })
      );
      setRuns(withStatus);
    }

    if (stored.length > 0) {
      loadStatuses();
    }
  }, []);

  return (
    <main className="page">
      <div className="page__inner">
        <h1 className="page__heading">Test history</h1>
        <p className="page__subheading">
          Every run started from this browser, most recent first.
        </p>

        {runs.length === 0 && (
          <p className="page__subheading">No test runs yet. Start one from the home page.</p>
        )}

        <div className="history-list">
          {runs.map((run) => (
            <div className="history-row" key={run.id}>
              <div>
                <p className="history-row__url">{run.url}</p>
                <p className="history-row__meta">{new Date(run.createdAt).toLocaleString()}</p>
              </div>
              <span className={`badge badge--${run.status}`}>{run.status}</span>
              <Link className="history-row__link" to={`/dashboard/${run.id}`}>
                View results
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}