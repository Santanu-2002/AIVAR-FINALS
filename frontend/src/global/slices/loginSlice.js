import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: "",
  token: localStorage.getItem("aivar_token") || null,
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.email = action.payload.email;
      state.token = action.payload.token;
    },
    clearCredentials: (state) => {
      state.email = "";
      state.token = null;
    },
  },
});

export const { setCredentials, clearCredentials } = loginSlice.actions;
export default loginSlice.reducer;