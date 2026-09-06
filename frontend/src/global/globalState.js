import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/loginSlice";

const globalState = configureStore({
  reducer: {
    login: loginReducer,
  },
});

export default globalState;