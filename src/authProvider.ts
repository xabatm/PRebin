import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  // پرۆسەی لۆگین
  login: async (user) => {
    if (user) {
      localStorage.setItem("auth", JSON.stringify(user));
      return {
        success: true,
        // لێرە گۆڕدرا بۆ /dashboard بۆ ئەوەی ڕاستەوخۆ بچێتە سەر داشبۆرد
        redirectTo: "/dashboard", 
      };
    }
    return {
      success: false,
      error: {
        name: "Login Error",
        message: "Invalid username or password",
      },
    };
  },
  
  // پرۆسەی چوونە دەرەوە
  logout: async () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user_info");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  // لێرە گۆڕانکاری کراوە: checkError بووە بە onError
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("auth");
      return { logout: true };
    }
    return { error };
  },

  // پشکنینی دۆخی لۆگین
  check: async () => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },

  // وەرگرتنی دەسەڵاتەکان
  getPermissions: async () => null,

  // وەرگرتنی ناسنامە
  getIdentity: async () => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      return JSON.parse(auth);
    }
    return null;
  },
};