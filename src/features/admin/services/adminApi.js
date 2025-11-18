import apiInstance from '../../../services/apiInstance';

const adminApi = {
    // User Management
    searchUsers: async (keyword = '', page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        const res = await apiInstance.get(`/users/search?${params.toString()}`);
        return res.data;
    },

    getUserById: async (id) => {
        const res = await apiInstance.get(`/users/${id}`);
        return res.data;
    },

    createUser: async (data) => {
        const res = await apiInstance.post('/users', data);
        return res.data;
    },

    updateUser: async (id, data) => {
        const res = await apiInstance.put(`/users/${id}`, data);
        return res.data;
    },

    deleteUser: async (id) => {
        const res = await apiInstance.delete(`/users/${id}`);
        return res.data;
    },

    // Role Management
    getAllRoles: async () => {
        const res = await apiInstance.get('/roles');
        return res.data;
    },

    searchRoles: async (keyword = '', page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        const res = await apiInstance.get(`/roles/search?${params.toString()}`);
        return res.data;
    },

    createRole: async (data) => {
        const res = await apiInstance.post('/roles', data);
        return res.data;
    },

    updateRole: async (id, data) => {
        const res = await apiInstance.put(`/roles/${id}`, data);
        return res.data;
    },

    deleteRole: async (id) => {
        const res = await apiInstance.delete(`/roles/${id}`);
        return res.data;
    },

    // Role-Permission Management
    getRolePermissions: async (roleId) => {
        const res = await apiInstance.get(`/roles/${roleId}/permissions`);
        return res.data;
    },

    updateRolePermissions: async (roleId, permissionIds) => {
        const res = await apiInstance.put(`/roles/${roleId}/permissions`, { permissionIds });
        return res.data;
    },

    // Permission Management
    getAllPermissions: async () => {
        const res = await apiInstance.get('/permissions');
        return res.data;
    },

    searchPermissions: async (keyword = '', page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        const res = await apiInstance.get(`/permissions/search?${params.toString()}`);
        return res.data;
    },

    createPermission: async (data) => {
        const res = await apiInstance.post('/permissions', data);
        return res.data;
    },

    updatePermission: async (id, data) => {
        const res = await apiInstance.put(`/permissions/${id}`, data);
        return res.data;
    },

    deletePermission: async (id) => {
        const res = await apiInstance.delete(`/permissions/${id}`);
        return res.data;
    },

    // Topic Management
    searchTopics: async (keyword = '', page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        const res = await apiInstance.get(`/topics/search?${params.toString()}`);
        return res.data;
    },

    createTopic: async (data) => {
        const res = await apiInstance.post('/topics', data);
        return res.data;
    },

    updateTopic: async (id, data) => {
        const res = await apiInstance.put(`/topics/${id}`, data);
        return res.data;
    },

    deleteTopic: async (id) => {
        const res = await apiInstance.delete(`/topics/${id}`);
        return res.data;
    },

    // Statistics
    getStatistics: async () => {
        const [usersRes, rolesRes, permissionsRes, topicsRes] = await Promise.all([
            apiInstance.get('/users/count'),
            apiInstance.get('/roles/count'),
            apiInstance.get('/permissions/count'),
            apiInstance.get('/topics/count')
        ]);
        return {
            users: usersRes.data.data,
            roles: rolesRes.data.data,
            permissions: permissionsRes.data.data,
            topics: topicsRes.data.data
        };
    }
};

export default adminApi;
