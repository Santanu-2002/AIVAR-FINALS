import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getTestRun, getTestRunReport, getTestRunTests } from "../api/testRuns";

export default function Dashboard() {
  const { runId } = useParams();
  const location = useLocation();
  const targetUrl = location.state?.targetUrl || "";

  const [run, setRun] = useState(null);
  const [report, setReport] = useState(null);
  const [tests, setTests] = useState(null);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    async function poll() {
      try {
        const data = await getTestRun(runId);
        setRun(data);

        if (data.status === "completed") {
          clearInterval(intervalRef.current);
          const [reportData, testsData] = await Promise.all([
            getTestRunReport(runId),
            getTestRunTests(runId),
          ]);
          setReport(reportData);
          setTests(testsData);
        } else if (data.status === "failed") {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Could not reach the backend.");
        clearInterval(intervalRef.current);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => clearInterval(intervalRef.current);
  }, [runId]);

  if (error) {
    return (
      <main className="page">
        <div className="page__inner">
          <h1 className="page__heading">Test results</h1>
          <p className="field-error">{error}</p>
        </div>
      </main>
    );
  }

  if (!run) {
    return (
      <main className="page">
        <div className="page__inner">
          <h1 className="page__heading">Test results</h1>
          <p className="page__subheading">Loading run status...</p>
        </div>
      </main>
    );
  }

  const events = run.events || [];

  return (
    <main className="page">
      <div className="page__inner">
        <h1 className="page__heading">Test results</h1>
        <p className="page__subheading">{run.input?.url || targetUrl}</p>
        <span className={`badge badge--${run.status}`}>{run.status}</span>

        {run.status === "failed" && run.error && (
          <p className="field-error">{run.error}</p>
        )}

        <div className="result-list">
          {events.map((event, index) => (
            <div className="result-row" key={index}>
              <div>
                <p className="result-row__name">{event.message}</p>
              </div>
              <span className={`badge badge--${event.status || "pending"}`}>
                {event.status || "pending"}
              </span>
            </div>
          ))}
        </div>

        {report && (
          <div className="card">
            <h2 className="page__heading">Quality report</h2>
            <p><strong>Scenarios:</strong> {report.summary?.scenarios ?? "—"}</p>
            <p><strong>Tests run:</strong> {report.summary?.tests ?? "—"}</p>
            <p><strong>Passed:</strong> {report.summary?.passed ?? "—"}</p>
            <p><strong>Failed:</strong> {report.summary?.failed ?? "—"}</p>
            <p><strong>Coverage score:</strong> {report.summary?.coverageScore ?? "—"}</p>
            <p><strong>Healer actions:</strong> {report.healerActions?.length ?? "—"}</p>
            <p><strong>Coverage gaps:</strong> {report.coverageGaps?.length ? report.coverageGaps.join(", ") : "None"}</p>
            <p><strong>Untested flow risk:</strong> {report.untestedFlowRisk ?? "—"}</p>

            <h3 className="page__heading">Scenarios covered</h3>
            <div className="result-list">
              {report.scenariosCovered?.map((scenario) => (
                <div className="result-row" key={scenario.id}>
                  <p className="result-row__name">{scenario.title}</p>
                  <span className="badge">{scenario.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tests?.tests?.length > 0 && (
          <div className="card">
            <h2 className="page__heading">Generated tests</h2>
            {tests.tests.map((test) => (
              <div key={test.id}>
                <p className="result-row__name">{test.name}</p>
                <pre className="code-block">{test.code}</pre>
              </div>
            ))}
          </div>
        )}

        {run.status !== "completed" && run.status !== "failed" && (
          <p className="page__subheading">Running... this page updates automatically.</p>
        )}
      </div>
    </main>
  );
}