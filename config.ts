
export const API_KEY = process.env.API_KEY || "";

export const isConfigured = () => {
  return !!process.env.API_KEY;
};
