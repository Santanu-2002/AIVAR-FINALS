import axiosInstance from "./axiosInstance";

export async function createTestRun(url, intent) {
  const payload = intent ? { url, intent } : { url };
  const response = await axiosInstance.post("/api/test-runs", payload);
  return response.data;
}

export async function getTestRun(id) {
  const response = await axiosInstance.get(`/api/test-runs/${id}`);
  return response.data;
}

export async function getTestRunReport(id) {
  const response = await axiosInstance.get(`/api/test-runs/${id}/report`);
  return response.data;
}

export async function getTestRunTests(id) {
  const response = await axiosInstance.get(`/api/test-runs/${id}/tests`);
  return response.data;
}

export async function attachPRD(id, file) {
  const formData = new FormData();
  formData.append("prd", file);
  const response = await axiosInstance.post(`/api/test-runs/${id}/prd`, formData);
  return response.data;
}