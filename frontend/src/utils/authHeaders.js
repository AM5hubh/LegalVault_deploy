export const authHeaders = (token) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const jsonAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  ...authHeaders(token),
});
