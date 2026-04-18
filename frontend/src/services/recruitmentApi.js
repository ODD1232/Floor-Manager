import axios from "axios";

const BASE = "http://localhost:5009/api/candidates";
const ROLES_BASE = "http://localhost:5009/api/roles-mgmt";

export const createCandidate = (formData) => axios.post(BASE, formData);
export const getCandidates = (params) => axios.get(BASE, { params });
export const getCandidate = (id) => axios.get(`${BASE}/${id}`);

export const classifyCandidate = (id, skillLevel, department) =>
  axios.patch(`${BASE}/${id}/classify`, { skillLevel, department });

export const updateCandidateProfileFields = (id, payload) =>
  axios.patch(`${BASE}/${id}/profile-fields`, payload);

export const updateRound21 = (updates) =>
  axios.patch(`${BASE}/round21`, { updates });

export const updateRound22 = (updates) =>
  axios.patch(`${BASE}/round22`, { updates });

export const dumpCandidates = (ids, remarks) =>
  axios.patch(`${BASE}/dump`, { ids, remarks });

export const updateRound3Details = (id, payload) =>
  axios.patch(`${BASE}/${id}/round3-details`, payload);

export const approveCandidate = (id, signatureFile, remarks) => {
  const fd = new FormData();
  if (signatureFile) fd.append("signature", signatureFile);
  if (remarks) fd.append("remarks", remarks);

  return axios.patch(`${BASE}/${id}/approve`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getContractors = () => axios.get(`${BASE}/contractors`);

export const getRolesMgmt = () => axios.get(ROLES_BASE);
export const getAllPermissions = () => axios.get(`${ROLES_BASE}/permissions`);
export const createRole = (name) => axios.post(ROLES_BASE, { name });
export const setRolePermissions = (roleId, permissionKeys) =>
  axios.put(`${ROLES_BASE}/${roleId}/permissions`, { permissionKeys });
export const deleteRole = (roleId) => axios.delete(`${ROLES_BASE}/${roleId}`);