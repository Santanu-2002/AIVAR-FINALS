import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { login, signup, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === "signup";

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSignup && !name.trim()) {
      setFormError("Enter your name.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setFormError("Enter both an email and a password.");
      return;
    }

    setFormError("");

    try {
      if (isSignup) {
        await signup(name.trim(), email, password);
      } else {
        await login(email, password);
      }

      // Only clear + redirect once the request actually succeeded —
      // if login/signup throws, we fall into the catch below instead
      // and the user's input (and the error message) stays on screen.
      resetForm();
      navigate("/");
    } catch (err) {
      // useAuth's `error` state should already reflect this, but a
      // local fallback keeps the form from failing silently if it doesn't.
      setFormError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="page">
      <div className="page__inner">
        <h1 className="page__heading">{isSignup ? "Create account" : "Log in"}</h1>
        <p className="page__subheading">
          {isSignup
            ? "Set up an account to save and revisit your test runs."
            : "Welcome back — log in to view your test runs."}
        </p>

        <form className="card" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {(formError || error) && <p className="field-error">{formError || error}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "PLEASE WAIT..." : isSignup ? "SIGN UP" : "LOG IN"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            className="btn-text"
            onClick={() => {
              setFormError("");
              setMode(isSignup ? "login" : "signup");
            }}
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}