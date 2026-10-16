import { ROLES } from "./roles.js";

// The Issue Warning component (src/api/axios.js) reads the officer token from these keys,
// so DMC Officers can open a pre-filled warning from a verified report.
const TOKEN_KEY = "dms_token";
const USER_KEY = "dms_user";

export function saveWarningToken(session) {
  if (typeof window === "undefined" || session?.user?.role !== ROLES.DMC_OFFICER) return;
  try {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    // Storage can be blocked; verification still works, only the warning pre-fill needs it
  }
}

export function clearWarningToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing to clear if storage is blocked
  }
}
