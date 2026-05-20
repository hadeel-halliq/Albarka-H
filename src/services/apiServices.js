import apiClient, {
  getApiErrorMessage,
  setAccessToken,
  clearAccessToken,
} from "./apiClient";

function resolveListPayload(response) {
  const data = response?.data;

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }
  
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  
  if (Array.isArray(data?.items)) {
    return data.items;
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data?.data && typeof data.data === 'object') {
    const keys = Object.keys(data.data);
    for (const key of keys) {
      if (Array.isArray(data.data[key])) {
        return data.data[key];
      }
    }
  }
  
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  
  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const keys = Object.keys(data.data);
    for (const key of keys) {
      const value = data.data[key];
      if (Array.isArray(value)) {
        return value;
      }
      if (value && typeof value === 'object') {
        const nestedKeys = Object.keys(value);
        for (const nestedKey of nestedKeys) {
          if (Array.isArray(value[nestedKey])) {
            return value[nestedKey];
          }
        }
      }
    }
  }
  
  console.warn('Could not resolve list payload from response:', response);
  return [];
}

function resolveSinglePayload(response) {
  return response?.data?.data || response?.data;
}

function extractAccessToken(rawResponse) {
  const d = rawResponse?.data;
  return (
    d?.data?.accessToken ||
    d?.accessToken ||
    d?.data?.token ||
    d?.token ||
    d?.data?.data?.accessToken ||
    d?.data?.data?.token ||
    null
  );
}

export const authService = {
  async login(email, password) {
    localStorage.removeItem("isAuthorized");
    clearAccessToken();

    const response = await apiClient.post("/auth/login", { email, password });
    const payload = resolveSinglePayload(response);

    let accessToken = extractAccessToken(response) || payload?.accessToken || payload?.token;
    if (accessToken) setAccessToken(String(accessToken));

    await this.me();
    localStorage.setItem("isAuthorized", "true");
    return payload;
  },
  async me() {
    const response = await apiClient.get("/auth/me");
    return resolveSinglePayload(response);
  },
  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAccessToken();
      localStorage.removeItem("isAuthorized");
    }
  },
  
  async refresh() {
    const response = await apiClient.post("/auth/refresh");
    const payload = resolveSinglePayload(response);
    const accessToken =
      extractAccessToken(response) || payload?.accessToken || payload?.token;
    if (accessToken) setAccessToken(String(accessToken));
    return payload;
  },

  async getProfile() {
    const response = await apiClient.get("/auth/profile");
    return resolveSinglePayload(response); 
  },

  
  async updateProfile(payload) {
    const response = await apiClient.patch("/auth/profile", payload);
    return resolveSinglePayload(response); 
  },

  async changePassword(oldPassword, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      throw new Error("كلمتا المرور الجديدتين غير متطابقتين");
    }
    if (newPassword.length < 8) {
      throw new Error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
    }

    const response = await apiClient.patch("/auth/change-password", {
      oldPassword,
      newPassword,
      confirmPassword
    });
    return resolveSinglePayload(response);
  },
};

export const dashboardService = {
  async stats() {
    const response = await apiClient.get("/admin/dashboard-stats");
    return resolveSinglePayload(response);
  },
};

export const branchesService = {
  async list() {
    const response = await apiClient.get("/branches", { params: { page: 1, limit: 100 } });
    return resolveListPayload(response);
  },
 
  async getById(id) {
    const response = await apiClient.get(`/branches/${id}`);
    return resolveSinglePayload(response); 
  },
  async create(payload) {
    const response = await apiClient.post("/branches", payload);
    return resolveSinglePayload(response);
  },
  async update(id, payload) {
    const response = await apiClient.patch(`/branches/${id}`, payload);
    return resolveSinglePayload(response);
  },
  async remove(id) {
    await apiClient.delete(`/branches/${id}`);
  },
};

export const mediaService = {
  async list(params = {}) {
    const response = await apiClient.get("/media", {
      params: { page: 1, limit: 20, ...params }
    });
    
    const data = response?.data;
    const items = data?.data?.items || data?.items || [];
    const meta = data?.data?.meta || data?.meta || {};
    
    return { items, meta };
  },
  async upload(file, altText = "") {
    if (!file) throw new Error("يرجى اختيار ملف للرفع");

    const formData = new FormData();
    formData.append("file", file);         
    if (altText.trim()) formData.append("altText", altText); 
    const response = await apiClient.post("/media/upload", formData);
    return resolveSinglePayload(response);
  },
  async remove(id) {
    await apiClient.delete(`/media/${id}`);
  },
};

export const productsService = {
  async list(params = {}) {
    const response = await apiClient.get("/products", {
      params: {
        page: 1,
        limit: 20,       
        ...params          
      }
    });
    
    const data = response?.data;
    const items = data?.data?.items || data?.items || [];
    const meta = data?.data?.meta || data?.meta || {};
    
    return { items, meta };
  },
  
  async getById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return resolveSinglePayload(response);
  },
  async create(payload) {
    const response = await apiClient.post("/products", payload);
    return resolveSinglePayload(response);
  },
  async update(id, payload) {
    const response = await apiClient.patch(`/products/${id}`, payload);
    return resolveSinglePayload(response);
  },
};

export const variantsService = {
  async listByProduct(productId) {
    const response = await apiClient.get("/variants", {
      params: { productId }
    });
    return resolveListPayload(response);
  },
  async create(payload) {
    const response = await apiClient.post("/variants", payload);
    return resolveSinglePayload(response);
  },
  async update(id, payload) {
    const response = await apiClient.patch(`/variants/${id}`, payload);
    return resolveSinglePayload(response);
  },
  async remove(id) {
    await apiClient.delete(`/variants/${id}`);
  },
};

export const servicesService = {
  async list(params = {}) {
    const response = await apiClient.get("/services", {
      params: {
        page: 1,
        limit: 20,         
        isActive: true,   
        ...params       
      }
    });
    
    const data = response?.data;
    const items = data?.data?.items || data?.items || [];
    const meta = data?.data?.meta || data?.meta || {};
    
    return { items, meta };
  },

  
  async getById(id) {
    const response = await apiClient.get(`/services/${id}`);
    return resolveSinglePayload(response);
  },
  async create(payload) {
    const response = await apiClient.post("/services", payload);
    return resolveSinglePayload(response);
  },
  async update(id, payload) {
    const response = await apiClient.patch(`/services/${id}`, payload);
    return resolveSinglePayload(response);
  },
  async remove(id) {
    await apiClient.delete(`/services/${id}`);
  },
};

export const socialLinksService = {
 
  async listPublic(params = {}) {
    const response = await apiClient.get("/social-links", {
      params: { page: 1, limit: 20, ...params }
    });
    return resolveListPayload(response); 
  },

  async list() {
    const response = await apiClient.get("/social-links/admin", {
      params: { page: 1, limit: 100 },
    });
    return resolveListPayload(response);
  },

  async getById(id) {
    const response = await apiClient.get(`/social-links/${id}`);
    return resolveSinglePayload(response);
  },

  async create(payload) {
    const response = await apiClient.post("/social-links", payload);
    return resolveSinglePayload(response);
  },
  async update(id, payload) {
    const response = await apiClient.patch(`/social-links/${id}`, payload);
    return resolveSinglePayload(response);
  },
  async remove(id) {
    await apiClient.delete(`/social-links/${id}`);
  },
};


export const contactsService = {

  async submit(payload) {
    const response = await apiClient.post("/contacts", payload, {
      headers: { Authorization: '' }
    });
    return resolveSinglePayload(response);
  },

  
  async list(params = {}) {
    const response = await apiClient.get("/contacts", {
      params: {
        page: 1,
        limit: 20,          
        ...params   
      }
    });
    
    const data = response?.data;
    const items = data?.data?.items || data?.items || [];
    const meta = data?.data?.meta || data?.meta || {};
    
    return { items, meta };
  },

  async getById(id) {
    const response = await apiClient.get(`/contacts/${id}`);
    return resolveSinglePayload(response);
  },

  async updateStatus(id, status) {
    const validStatuses = ["UNREAD", "READ", "REPLIED"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const response = await apiClient.patch(`/contacts/${id}/status`, { status });
    return resolveSinglePayload(response);
  },
};

export const healthService = {
  async check() {
    const response = await apiClient.get("/health", {
      headers: { Authorization: '' } 
    });
    return resolveSinglePayload(response); 
  },

  async validationDemo(name) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      throw new Error("الاسم مطلوب ويجب أن يكون حرفين على الأقل");
    }

    const response = await apiClient.get("/health/validation-demo", {
      params: { name: name.trim() },
      headers: { Authorization: '' } 
    });
    return resolveSinglePayload(response); 
  },
};
export { getApiErrorMessage };
