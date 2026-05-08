import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    name: "",
    location: "",
    type: "user",
  },
  organisation: {
    name: "",
    location: "",
    type: "organisation",
  },
  activeRole: "",
};

export const detailsSlice = createSlice({
  name: "details",
  initialState,
  reducers: {
    setUserSession: (state, action) => {
      state.user = {
        name: action.payload.name,
        location: action.payload.location,
        type: "user",
      };
      state.activeRole = "user";
    },
    setOrganisationSession: (state, action) => {
      state.organisation = {
        name: action.payload.name,
        location: action.payload.location,
        type: "organisation",
      };
      state.activeRole = "organisation";
    },
    setActiveRole: (state, action) => {
      state.activeRole = action.payload || "";
    },
    clearAllSessions: (state) => {
      state.user = { name: "", location: "", type: "user" };
      state.organisation = { name: "", location: "", type: "organisation" };
      state.activeRole = "";
    },
  },
});

export const {
  setUserSession,
  setOrganisationSession,
  setActiveRole,
  clearAllSessions,
} = detailsSlice.actions;

export default detailsSlice.reducer;
