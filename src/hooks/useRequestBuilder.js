import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function useRequestBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [req, setReq] = useState(blank());
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  function blank() {
    return {
      name: '',
      method: 'GET',
      url: '',
      params: [{ key: '', value: '', enabled: true }],
      headers: [{ key: '', value: '', enabled: true }],
      body: '',
      assertions: [],
      auth: { type: 'none', token: '', username: '', password: '' },
    };
  }

  function set(field, value) {
    setReq((r) => ({ ...r, [field]: value }));
  }

  function buildPayload(req) {
    const { auth, _id, createdAt, updatedAt, __v, ...rest } = req;
    const headers = (rest.headers || [])
      .filter((h) => h.enabled && h.key)
      .map((h) => ({ key: h.key, value: h.value }))
      .filter((h) => h.key.toLowerCase() !== 'authorization');

    if (auth.type === 'bearer' && auth.token) {
      headers.push({ key: 'Authorization', value: `Bearer ${auth.token}` });
    } else if (auth.type === 'basic' && auth.username) {
      const encoded = btoa(`${auth.username}:${auth.password || ''}`);
      headers.push({ key: 'Authorization', value: `Basic ${encoded}` });
    }

    return { ...rest, headers };
  }

  useEffect(() => {
    if (id) {
      api.getSaved().then((list) => {
        const found = list.find((r) => r._id === id);
        if (found) setReq({ ...blank(), ...found });
      });
    }
  }, [id]);

  async function send() {
    setLoading(true);
    try {
      const res = await api.sendRequest(buildPayload(req));
      setResponse(res);
    } catch (e) {
      setResponse({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      const doc = id
        ? await api.updateRequest(id, buildPayload(req))
        : await api.saveRequest(buildPayload(req));
      setNotice('Request saved');
      return doc;
    } catch (e) {
      setNotice('Could not save the request');
      return null;
    }
  }

  return { req, set, response, loading, notice, send, save, isEditing: !!id };
}