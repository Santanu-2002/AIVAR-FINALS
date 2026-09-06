import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login as loginRequest, signup as signupRequest } from "../api/auth";
import { setCredentials } from "../global/slices/loginSlice";

export default function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function login(email, password) {
    setIsLoading(true);
    setError("");
    try {
      const data = await loginRequest(email, password);
      localStorage.setItem("aivar_token", data.token);
      dispatch(setCredentials({ email, token: data.token }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(name, email, password) {
    setIsLoading(true);
    setError("");
    try {
      const data = await signupRequest(name, email, password);
      localStorage.setItem("aivar_token", data.token);
      dispatch(setCredentials({ email, token: data.token }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed. Try a different email.");
    } finally {
      setIsLoading(false);
    }
  }

  return { login, signup, isLoading, error };
}