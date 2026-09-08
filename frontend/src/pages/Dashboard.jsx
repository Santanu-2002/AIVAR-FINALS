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
            <h2 className="card__title">Quality report</h2>

            <p className="report-stat">
              <strong>Scenarios:</strong>
              <span>{report.summary?.scenarios ?? "—"}</span>
            </p>

            <p className="report-stat">
              <strong>Tests run:</strong>
              <span>{report.summary?.tests ?? "—"}</span>
            </p>

            <p className="report-stat">
              <strong>Passed:</strong>
              <span>{report.summary?.passed ?? "—"}</span>
            </p>

            <p className="report-stat">
              <strong>Failed:</strong>
              <span>{report.summary?.failed ?? "—"}</span>
            </p>

            <p className="report-stat">
              <strong>Coverage score:</strong>
              <span>{report.summary?.coverageScore ?? "—"}</span>
            </p>

            <p className="report-stat">
              <strong>Healer actions:</strong>
              <span>{report.healerActions?.length ?? "—"}</span>
            </p>

            <p className="report-stat">
              <strong>Coverage gaps:</strong>
              <span>
                {report.coverageGaps?.length
                  ? report.coverageGaps.join(", ")
                  : "None"}
              </span>
            </p>

            <p className="report-stat">
              <strong>Untested flow risk:</strong>
              <span>{report.untestedFlowRisk ?? "—"}</span>
            </p>
            <h3 className="card__subtitle">Scenarios covered</h3>
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
  <div className="card generated-tests-card">
    <h2 className="card__title">Generated tests</h2>

    <div className="generated-tests">
      {tests.tests.map((test, index) => (
              <div className="generated-test" key={test.id || index}>

                <div className="generated-test__header">
                  <span className="generated-test__number">
                    Test {index + 1}
                  </span>

                  <span className="generated-test__name">
                    {test.name}
                  </span>
                </div>

                <pre className="code-block">
                  <code>{test.code}</code>
                </pre>

              </div>
            ))}
          </div>
        </div>
      )}

        {run.status !== "completed" && run.status !== "failed" && (
          <p className="page__subheading">Running... this page updates automatically.</p>
        )}
      </div>
    </main>
  );
}