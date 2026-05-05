import { combineReducers, configureStore } from "@reduxjs/toolkit";
import useReducer from "./user/userSlice";
import { persistReducer, persistStore } from "redux-persist";
// import storage from "redux-persist/lib/storage";

// Safe storage that works well with Vite
import createWebStorage from "redux-persist/es/storage/createWebStorage";

const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: (_key, value) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
});

// This prevents errors during build / SSR-like behavior in Vite
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local") // real localStorage on client
    : createNoopStorage(); // dummy storage otherwise

const rootReducer = combineReducers({ user: useReducer });

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // need to disable serializableCheck to be able to use Redux Persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
