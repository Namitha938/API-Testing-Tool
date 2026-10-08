import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

const defaultRequest = {
  _id: null,
  name: '1. Fetch Live Posts (Real Public API)',
  collectionId: null,
  folderId: null,
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts',
  params: [
    { key: 'userId', value: '1', enabled: true, description: 'Filter posts by author ID' },
  ],
  headers: [
    { key: 'Accept', value: 'application/json', enabled: true, description: 'Accept JSON format' },
  ],
  auth: {
    type: 'none',
    token: '',
    username: '',
    password: '',
    key: '',
    value: '',
    addTo: 'header',
  },
  bodyType: 'none',
  rawBody: '',
  formData: [],
  testCases: [
    { id: 't1', name: 'Status code is 200 OK', type: 'status', expectedValue: '200', enabled: true },
    { id: 't2', name: 'Response time under 1500ms', type: 'responseTime', expectedValue: '1500', enabled: true },
    { id: 't3', name: 'Response contains posts data', type: 'containsText', expectedValue: 'title', enabled: true },
  ],
};

export const ApiProvider = ({ children }) => {
  const { token } = useAuth();

  const [activeRequest, setActiveRequest] = useState(defaultRequest);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [collections, setCollections] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState('');
  const [history, setHistory] = useState([]);

  // Active view states
  const [activeTab, setActiveTab] = useState('params'); // 'params', 'headers', 'auth', 'body', 'tests'
  const [responseTab, setResponseTab] = useState('body'); // 'body', 'headers', 'timings', 'tests'

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch Collections
  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (e) {
      console.error('Failed to load collections', e);
    }
  };

  // Fetch Environments
  const fetchEnvironments = async () => {
    try {
      const res = await fetch('/api/environments', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setEnvironments(data);
        if (data.length > 0 && !activeEnvironmentId) {
          // Select first environment by default
          setActiveEnvironmentId(data[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to load environments', e);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchEnvironments();
    fetchHistory();
  }, [token]);

  // Execute active request
  const sendRequest = async () => {
    if (!activeRequest.url) return;
    setIsLoading(true);

    try {
      const payload = {
        method: activeRequest.method,
        url: activeRequest.url,
        params: activeRequest.params,
        headers: activeRequest.headers,
        auth: activeRequest.auth,
        bodyType: activeRequest.bodyType,
        rawBody: activeRequest.rawBody,
        formData: activeRequest.formData,
        testCases: activeRequest.testCases,
        environmentId: activeEnvironmentId || null,
        savedRequestId: activeRequest._id || null,
      };

      const res = await fetch('/api/proxy/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);
      fetchHistory(); // refresh history panel
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        responseTime: 0,
        responseSize: 0,
        responseHeaders: {},
        responseBody: JSON.stringify({ error: err.message }, null, 2),
        testResults: [],
        passedCount: 0,
        failedCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save or update active request
  const saveRequest = async (saveData = {}) => {
    try {
      const payload = {
        ...activeRequest,
        ...saveData,
      };

      let res;
      if (activeRequest._id) {
        // Update
        res = await fetch(`/api/requests/${activeRequest._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        if (!payload.collectionId && collections.length > 0) {
          payload.collectionId = collections[0]._id;
        }
        res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const saved = await res.json();
        setActiveRequest(saved);
        fetchCollections();
        return saved;
      }
    } catch (e) {
      console.error('Error saving request', e);
    }
  };

  // Select a saved request to edit
  const loadSavedRequest = (reqDoc) => {
    setActiveRequest({
      _id: reqDoc._id,
      name: reqDoc.name,
      collectionId: reqDoc.collectionId,
      folderId: reqDoc.folderId,
      method: reqDoc.method,
      url: reqDoc.url,
      params: reqDoc.params || [],
      headers: reqDoc.headers || [],
      auth: reqDoc.auth || { type: 'none' },
      bodyType: reqDoc.bodyType || 'none',
      rawBody: reqDoc.rawBody || '',
      formData: reqDoc.formData || [],
      testCases: reqDoc.testCases || [],
    });
    setResponse(null);
  };

  // Select a history entry
  const loadHistoryItem = (hist) => {
    setActiveRequest(prev => ({
      ...prev,
      _id: hist.requestId || null,
      name: `Re: ${hist.method} ${hist.url}`,
      method: hist.method,
      url: hist.url,
      rawBody: hist.requestBody || '',
    }));
    setResponse({
      status: hist.status,
      statusText: hist.statusText,
      responseTime: hist.responseTime,
      responseSize: hist.responseSize,
      timings: hist.timings,
      responseHeaders: hist.responseHeaders || {},
      responseBody: hist.responseBody || '',
      testResults: hist.testResults || [],
      passedCount: hist.passedCount || 0,
      failedCount: hist.failedCount || 0,
    });
  };

  // Clear history
  const clearHistory = async () => {
    try {
      await fetch('/api/history/clear', {
        method: 'DELETE',
        headers: authHeaders,
      });
      setHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ApiContext.Provider
      value={{
        activeRequest,
        setActiveRequest,
        response,
        setResponse,
        isLoading,
        sendRequest,
        saveRequest,
        loadSavedRequest,
        loadHistoryItem,
        collections,
        fetchCollections,
        environments,
        fetchEnvironments,
        activeEnvironmentId,
        setActiveEnvironmentId,
        history,
        fetchHistory,
        clearHistory,
        activeTab,
        setActiveTab,
        responseTab,
        setResponseTab,
        newRequestTemplate: () => {
          setActiveRequest({
            ...defaultRequest,
            _id: null,
            name: 'New Request',
          });
          setResponse(null);
        },
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

