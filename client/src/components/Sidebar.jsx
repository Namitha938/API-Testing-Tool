import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Clock,
  Layers,
  Search,
  MoreVertical,
  Play,
  PlayCircle,
  Upload,
  Globe,
  FileCode,
  Server,
  BookOpen,
  Edit2,
  FolderPlus,
  MoveRight,
  Tag,
  X,
  Filter,
  Check,
  CornerDownRight,
  GripVertical,
  Sparkles,
  HelpCircle,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export const FOLDER_COLORS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-[#E8F1FB]', text: 'text-[#0B63C5]', border: 'border-[#B3D4F8]' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-[#E8F6E3]', text: 'text-[#166534]', border: 'border-[#BCE5B3]' },
  { id: 'sky', name: 'Sky', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-300 dark:border-sky-800' },
  { id: 'amber', name: 'Amber', bg: 'bg-[#FEF6E7]', text: 'text-[#9A3412]', border: 'border-[#FCDCA8]' },
  { id: 'rose', name: 'Rose', bg: 'bg-[#FDECEB]', text: 'text-[#991B1B]', border: 'border-[#F9B7B5]' },
  { id: 'purple', name: 'Purple', bg: 'bg-[#F4ECFB]', text: 'text-[#6B21A8]', border: 'border-[#DCB9F5]' },
  { id: 'teal', name: 'Teal', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-300 dark:border-teal-800' },
];

// Highlight search matches
export function HighlightMatch({ text = '', query = '' }) {
  if (!query || !text) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight bg-[#FEF08A] text-[#854D0E] font-bold px-0.5 rounded-xs">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// RailButton helper for slim collapsed rail & full expanded nav item
function RailButton({
  icon: Icon,
  label,
  badgeCount,
  active,
  onClick,
  isCollapsed,
  iconClass = 'text-slate-500',
  pulse = false,
}) {
  return (
    <div className="relative group w-full flex items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        className={`w-full ${isCollapsed ? 'h-10 justify-center px-0' : 'h-10 sm:h-11 px-3 justify-between'} rounded-md flex items-center text-xs font-semibold transition cursor-pointer ${
          active
            ? 'bg-[#E8F1FB] dark:bg-sky-950/60 text-[#0B63C5] dark:text-sky-300 shadow-2xs'
            : 'text-slate-700 dark:text-slate-300 hover:bg-[#F0F6FC] dark:hover:bg-slate-800/60'
        }`}
        aria-label={label}
        title={!isCollapsed ? undefined : label}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <Icon className={`w-4 h-4 ${active ? 'text-[#0B63C5]' : iconClass}`} />
            {isCollapsed && badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#0B63C5] ring-2 ring-white dark:ring-slate-900" />
            )}
            {isCollapsed && pulse && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>
          {!isCollapsed && <span className="font-semibold truncate">{label}</span>}
        </div>
        {!isCollapsed && badgeCount !== undefined && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono shrink-0">
            {badgeCount}
          </span>
        )}
        {!isCollapsed && pulse && (
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
        )}
      </button>

      {/* Tooltip on hover & keyboard focus in collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-50 border border-slate-700/50">
          {label} {badgeCount !== undefined ? `(${badgeCount})` : ''}
          <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
        </div>
      )}
    </div>
  );
}

export const Sidebar = ({
  onOpenCollections,
  onOpenEnvironments,
  onRunCollection,
  onOpenMockServer,
  onOpenApiDocs,
  onOpenCurlImport,
  isOpen = true,
  isCollapsed = false,
  onExpandSidebar,
  onClose,
}) => {
  const {
    collections,
    loadSavedRequest,
    activeRequest,
    history,
    loadHistoryItem,
    clearHistory,
    fetchCollections,
    environments,
    aiAssistantOpen,
    setAiAssistantOpen,
    newRequestTemplate,
  } = useApi();

  // Navigation section: 'apis', 'history', 'environments'
  const [activeNav, setActiveNav] = useState('apis');
  // Segmented control: 'apis' vs 'recents'
  const [segmentedView, setSegmentedView] = useState('apis');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('ALL');
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  // Remember expand/collapse state in localStorage
  const [openCollections, setOpenCollections] = useState(() => {
    try {
      const saved = localStorage.getItem('studio_open_collections');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [openFolders, setOpenFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('studio_open_folders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('studio_open_collections', JSON.stringify(openCollections));
    } catch (e) {
      console.warn('Could not save openCollections', e);
    }
  }, [openCollections]);

  useEffect(() => {
    try {
      localStorage.setItem('studio_open_folders', JSON.stringify(openFolders));
    } catch (e) {
      console.warn('Could not save openFolders', e);
    }
  }, [openFolders]);

  // Inline rename state
  const [inlineEditingFolderId, setInlineEditingFolderId] = useState(null);
  const [inlineRenameText, setInlineRenameText] = useState('');

  // Folder creation/editing modal state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [targetCollectionId, setTargetCollectionId] = useState('');
  const [parentFolderId, setParentFolderId] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderTag, setFolderTag] = useState('');
  const [folderColor, setFolderColor] = useState('indigo');
  const [folderDesc, setFolderDesc] = useState('');

  // Move request modal state
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [requestToMove, setRequestToMove] = useState(null);
  const [moveToColId, setMoveToColId] = useState('');
  const [moveToFolderId, setMoveToFolderId] = useState('');

  // Drag over states
  const [rootDragOverColId, setRootDragOverColId] = useState(null);

  // Toggle collection accordion
  const toggleCollection = (id) => {
    setOpenCollections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle folder accordion
  const toggleFolder = (id) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Create Folder Modal
  const openCreateFolderModal = (collectionId, parentId = null) => {
    setEditingFolder(null);
    setTargetCollectionId(collectionId || collections[0]?._id || '');
    setParentFolderId(parentId);
    setFolderName('');
    setFolderTag('');
    setFolderColor('indigo');
    setFolderDesc('');
    setFolderModalOpen(true);
  };

  // Open Edit Folder Modal
  const openEditFolderModal = (collectionId, folder) => {
    setEditingFolder(folder);
    setTargetCollectionId(collectionId);
    setParentFolderId(folder.parentId || null);
    setFolderName(folder.name || '');
    setFolderTag(folder.tag || '');
    setFolderColor(folder.color || 'indigo');
    setFolderDesc(folder.description || '');
    setFolderModalOpen(true);
  };

  // Inline Rename Start & Submit
  const startInlineRename = (folder) => {
    setInlineEditingFolderId(folder.id);
    setInlineRenameText(folder.name);
  };

  const submitInlineRename = async (collectionId, folderId) => {
    if (!inlineRenameText.trim()) {
      setInlineEditingFolderId(null);
      return;
    }
    try {
      await fetch(`/api/collections/${collectionId}/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inlineRenameText.trim() }),
      });
      await fetchCollections();
    } catch (err) {
      console.error(err);
    } finally {
      setInlineEditingFolderId(null);
    }
  };

  // Duplicate Folder
  const handleDuplicateFolder = async (e, collectionId, folderId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/collections/${collectionId}/folders/${folderId}/duplicate`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Folder (Create or Update from Modal)
  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim() || !targetCollectionId) return;

    try {
      if (editingFolder) {
        await fetch(`/api/collections/${targetCollectionId}/folders/${editingFolder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folderName.trim(),
            tag: folderTag.trim(),
            color: folderColor,
            description: folderDesc.trim(),
          }),
        });
      } else {
        await fetch(`/api/collections/${targetCollectionId}/folders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folderName.trim(),
            tag: folderTag.trim(),
            color: folderColor,
            description: folderDesc.trim(),
            parentId: parentFolderId,
          }),
        });
      }

      await fetchCollections();
      setOpenCollections((prev) => ({ ...prev, [targetCollectionId]: true }));
      if (parentFolderId) {
        setOpenFolders((prev) => ({ ...prev, [parentFolderId]: true }));
      }
      setFolderModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete folder with confirmation
  const handleDeleteFolder = async (e, collectionId, folderId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this API folder? Requests will be preserved and moved to the collection root.')) return;
    try {
      await fetch(`/api/collections/${collectionId}/folders/${folderId}`, { method: 'DELETE' });
      await fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  // Add a new empty request into collection or directly into a distinct API folder
  const handleAddRequestToCollection = async (e, collectionId, folderId = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderId ? 'New Endpoint' : 'New Request',
          collectionId,
          folderId,
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        }),
      });
      if (res.ok) {
        const reqDoc = await res.json();
        await fetchCollections();
        loadSavedRequest(reqDoc);
        setOpenCollections((prev) => ({ ...prev, [collectionId]: true }));
        if (folderId) {
          setOpenFolders((prev) => ({ ...prev, [folderId]: true }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete saved request
  const handleDeleteRequest = async (e, reqId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this API request?')) return;
    try {
      await fetch(`/api/requests/${reqId}`, { method: 'DELETE' });
      await fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicate saved request
  const handleDuplicateRequest = async (e, reqId) => {
    e.stopPropagation();
    try {
      await fetch(`/api/requests/${reqId}/duplicate`, { method: 'POST' });
      await fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  // Open Move Modal
  const openMoveModal = (e, req) => {
    e.stopPropagation();
    setRequestToMove(req);
    setMoveToColId(req.collectionId);
    setMoveToFolderId(req.folderId || '');
    setMoveModalOpen(true);
  };

  // Direct move handler for drag & drop or modal
  const handleDirectMoveRequest = async (requestId, collectionId, folderId) => {
    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          folderId: folderId || null,
        }),
      });
      await fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Move Request Modal
  const handleMoveRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestToMove) return;
    await handleDirectMoveRequest(requestToMove._id, moveToColId, moveToFolderId);
    setMoveModalOpen(false);
    setRequestToMove(null);
  };

  // Filter requests matching search and method
  const isRequestMatching = (req) => {
    const matchesSearch =
      !searchTerm ||
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod =
      selectedMethodFilter === 'ALL' || req.method.toUpperCase() === selectedMethodFilter;

    return matchesSearch && matchesMethod;
  };

  const isFolderMatching = (folder, requests) => {
    if (!searchTerm && selectedMethodFilter === 'ALL') return true;
    const nameMatches =
      searchTerm &&
      (folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (folder.tag && folder.tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const folderRequests = requests.filter((r) => r.folderId === folder.id);
    const hasMatchingRequest = folderRequests.some(isRequestMatching);

    return nameMatches || hasMatchingRequest;
  };

  const methodsList = ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  // Total folders count across all collections
  const totalFoldersCount = useMemo(() => {
    return collections.reduce((acc, c) => acc + (c.folders?.length || 0), 0);
  }, [collections]);

  // Total matching count (requests or folders)
  const totalMatchingCount = useMemo(() => {
    let count = 0;
    collections.forEach((c) => {
      (c.requests || []).forEach((r) => {
        if (isRequestMatching(r)) count++;
      });
      (c.folders || []).forEach((f) => {
        if (isFolderMatching(f, c.requests || [])) count++;
      });
    });
    return count;
  }, [collections, searchTerm, selectedMethodFilter]);

  // Method badge classes
  const getMethodBadgeClass = (method) => {
    const m = (method || 'GET').toUpperCase();
    if (m === 'GET') return 'badge-get';
    if (m === 'POST') return 'badge-post';
    if (m === 'PUT') return 'badge-put';
    if (m === 'DELETE') return 'badge-delete';
    if (m === 'PATCH') return 'badge-patch';
    return 'badge-get';
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        id="studio-sidebar"
        aria-label="Sidebar Navigation"
        className={`fixed lg:static top-16 bottom-0 left-0 z-30 lg:z-10 bg-white dark:bg-[#0C1017] border-r border-[#E1E5EA] dark:border-slate-800 flex flex-col shrink-0 select-none overflow-hidden h-[calc(100vh-4rem)] transition-all duration-200 ease-in-out motion-reduce:transition-none shadow-lg lg:shadow-none ${
          isCollapsed ? 'lg:w-16 w-16 max-w-[64px]' : 'w-[300px] max-w-[85vw]'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section Nav: Workspace Section */}
        <div className={`border-b border-[#E1E5EA] dark:border-slate-800/80 space-y-1 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {isCollapsed ? (
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 mx-1" />
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
              Workspace
            </div>
          )}

          {/* Nav Item: APIs & Folders */}
          <RailButton
            icon={Layers}
            label="APIs & Folders"
            badgeCount={collections.length}
            active={activeNav === 'apis'}
            isCollapsed={isCollapsed}
            iconClass="text-[#0B63C5]"
            onClick={() => {
              if (isCollapsed && onExpandSidebar) {
                onExpandSidebar();
              }
              setActiveNav('apis');
            }}
          />

          {/* Nav Item: History */}
          <RailButton
            icon={Clock}
            label="History"
            badgeCount={history.length}
            active={activeNav === 'history'}
            isCollapsed={isCollapsed}
            iconClass="text-slate-500"
            onClick={() => {
              if (isCollapsed && onExpandSidebar) {
                onExpandSidebar();
              }
              setActiveNav('history');
            }}
          />

          {/* Nav Item: Environments (modal-only, does not steal active state) */}
          <RailButton
            icon={Globe}
            label="Environments"
            badgeCount={environments.length}
            active={false}
            isCollapsed={isCollapsed}
            iconClass="text-slate-500"
            onClick={() => {
              onOpenEnvironments?.();
            }}
          />
        </div>

        {/* Tools Section */}
        <div className={`border-b border-[#E1E5EA] dark:border-slate-800/80 space-y-1 ${isCollapsed ? 'p-2' : 'px-3 py-2'}`}>
          {isCollapsed ? (
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 mx-1" />
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
              Tools
            </div>
          )}

          <RailButton
            icon={PlayCircle}
            label="Collection Runner"
            isCollapsed={isCollapsed}
            iconClass="text-emerald-600 dark:text-emerald-400"
            onClick={() => onRunCollection?.(null)}
          />

          <RailButton
            icon={Server}
            label="Mock Server"
            isCollapsed={isCollapsed}
            iconClass="text-indigo-600 dark:text-indigo-400"
            onClick={onOpenMockServer}
          />

          <RailButton
            icon={BookOpen}
            label="Documentation"
            isCollapsed={isCollapsed}
            iconClass="text-sky-600 dark:text-sky-400"
            onClick={onOpenApiDocs}
          />

          <RailButton
            icon={Sparkles}
            label="AI Assistant"
            isCollapsed={isCollapsed}
            iconClass="text-purple-600 dark:text-purple-400"
            pulse={aiAssistantOpen}
            onClick={() => setAiAssistantOpen?.((prev) => !prev)}
          />
        </div>

        {/* MAIN EXPLORER AREA (when APIs & Folders is active and expanded) */}
        {!isCollapsed && activeNav === 'apis' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Segmented Control (APIs | Recents) & Add Button */}
            <div className="p-3 pb-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                {/* Segmented Control */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold flex-1">
                  <button
                    onClick={() => setSegmentedView('apis')}
                    className={`flex-1 py-1 text-center rounded-md transition cursor-pointer ${
                      segmentedView === 'apis'
                        ? 'bg-white dark:bg-slate-900 text-[#0B63C5] dark:text-sky-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    APIs
                  </button>
                  <button
                    onClick={() => setSegmentedView('recents')}
                    className={`flex-1 py-1 text-center rounded-md transition cursor-pointer ${
                      segmentedView === 'recents'
                        ? 'bg-white dark:bg-slate-900 text-[#0B63C5] dark:text-sky-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Recents
                  </button>
                </div>

                {/* Primary Blue "Add" Dropdown Button */}
                <div className="relative">
                  <button
                    onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                    className="h-7 px-2.5 rounded-md bg-[#0B63C5] hover:bg-[#0952A5] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
                  </button>

                  {addDropdownOpen && (
                    <div
                      className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-lg shadow-lg py-1 z-40 text-xs"
                      onMouseLeave={() => setAddDropdownOpen(false)}
                    >
                      <button
                        onClick={() => {
                          setAddDropdownOpen(false);
                          handleAddRequestToCollection(null, collections[0]?._id, null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#0B63C5]" />
                        <span>New Request</span>
                      </button>
                      <button
                        onClick={() => {
                          setAddDropdownOpen(false);
                          openCreateFolderModal(collections[0]?._id);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>New Folder</span>
                      </button>
                      <button
                        onClick={() => {
                          setAddDropdownOpen(false);
                          onOpenCollections?.();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-500" />
                        <span>New Collection</span>
                      </button>
                      <button
                        onClick={() => {
                          setAddDropdownOpen(false);
                          onOpenCurlImport?.();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                      >
                        <Terminal className="w-3.5 h-3.5 text-sky-600" />
                        <span>Import cURL</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Search Input */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search folder, request, or URL..."
                  className="w-full bg-[#F7F8FA] dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0B63C5] focus:bg-white transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Method Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                {methodsList.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMethodFilter(m)}
                    className={`px-2 py-0.5 rounded font-mono font-bold transition cursor-pointer shrink-0 ${
                      selectedMethodFilter === m
                        ? 'bg-[#0B63C5] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Tree Explorer View */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {collections.length === 0 ? (
                /* Swagger Empty State: Headline, grey help text, 2-3 outlined cards with rounded sparkle icons */
                <div className="text-center py-6 px-1 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F1FB] dark:bg-sky-950/60 flex items-center justify-center mx-auto text-[#0B63C5]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0E2A47] dark:text-slate-100">Ready to Explore APIs</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create or import collections to test endpoints and automate workflows.
                    </p>
                  </div>

                  <div className="space-y-2 text-left pt-1">
                    <div
                      onClick={newRequestTemplate}
                      className="p-2.5 rounded-lg border border-[#E1E5EA] dark:border-slate-800 hover:border-[#0B63C5] bg-white dark:bg-slate-900/60 transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 font-semibold text-xs text-[#0E2A47] dark:text-slate-200 group-hover:text-[#0B63C5]">
                        <div className="w-5 h-5 rounded-full bg-[#E8F1FB] flex items-center justify-center text-[#0B63C5]">
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <span>Generate API from Prompt</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 mt-0.5">Use AI to generate mock routes & payloads</p>
                    </div>

                    <div
                      onClick={onOpenCurlImport}
                      className="p-2.5 rounded-lg border border-[#E1E5EA] dark:border-slate-800 hover:border-[#0B63C5] bg-white dark:bg-slate-900/60 transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 font-semibold text-xs text-[#0E2A47] dark:text-slate-200 group-hover:text-[#0B63C5]">
                        <div className="w-5 h-5 rounded-full bg-[#E8F6E3] flex items-center justify-center text-[#166534]">
                          <FileCode className="w-3 h-3" />
                        </div>
                        <span>Generate API from Code / cURL</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 mt-0.5">Paste cURL or OpenAPI schema directly</p>
                    </div>

                    <div
                      onClick={onOpenCollections}
                      className="p-2.5 rounded-lg border border-[#E1E5EA] dark:border-slate-800 hover:border-[#0B63C5] bg-white dark:bg-slate-900/60 transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 font-semibold text-xs text-[#0E2A47] dark:text-slate-200 group-hover:text-[#0B63C5]">
                        <div className="w-5 h-5 rounded-full bg-[#FFF3EB] flex items-center justify-center text-[#FF6A00]">
                          <FolderPlus className="w-3 h-3" />
                        </div>
                        <span>Create Custom Collection</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 mt-0.5">Organize distinct API services in folders</p>
                    </div>
                  </div>
                </div>
              ) : totalMatchingCount === 0 && searchTerm ? (
                /* No Results State */
                <div className="text-center py-8 px-2 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <h4 className="font-bold text-xs text-[#0E2A47] dark:text-slate-200">No matching APIs or folders</h4>
                  <p className="text-[11px] text-slate-500">
                    No results for "<span className="text-[#0B63C5] font-mono">{searchTerm}</span>"
                    {selectedMethodFilter !== 'ALL' ? ` with ${selectedMethodFilter}` : ''}.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedMethodFilter('ALL');
                    }}
                    className="text-xs font-semibold text-[#0B63C5] hover:underline cursor-pointer"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                collections.map((col) => {
                  const allColRequests = col.requests || [];
                  const colFolders = col.folders || [];
                  const matchingRequests = allColRequests.filter(isRequestMatching);

                  // Auto-expand collection if search is active and matching items exist
                  const hasSearchMatch =
                    searchTerm &&
                    (col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      matchingRequests.length > 0 ||
                      colFolders.some((f) => isFolderMatching(f, allColRequests)));

                  const isOpen = hasSearchMatch ? true : (openCollections[col._id] ?? true);
                  const rootRequests = matchingRequests.filter((r) => !r.folderId);
                  const realFolderCount = colFolders.length;

                  return (
                    <div
                      key={col._id}
                      className="rounded-lg border border-[#E1E5EA] dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden text-xs shadow-2xs transition"
                    >
                      {/* Collection Header */}
                      <div
                        onClick={() => toggleCollection(col._id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setRootDragOverColId(col._id);
                        }}
                        onDragLeave={() => setRootDragOverColId(null)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setRootDragOverColId(null);
                          try {
                            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                            if (data.reqId) {
                              await handleDirectMoveRequest(data.reqId, col._id, null);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 hover:bg-[#F0F6FC] dark:hover:bg-slate-800/40 cursor-pointer transition text-[#0E2A47] dark:text-slate-200 font-medium group ${
                          rootDragOverColId === col._id ? 'bg-[#E8F1FB] ring-2 ring-[#0B63C5]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="truncate font-bold">
                            <HighlightMatch text={col.name} query={searchTerm} />
                          </span>
                          {/* Real folder count badge */}
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono shrink-0">
                            {realFolderCount} {realFolderCount === 1 ? 'folder' : 'folders'} · {allColRequests.length} reqs
                          </span>
                        </div>

                        {/* Actions */}
                        <div
                          className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onRunCollection?.(col)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 transition"
                            title="Run Collection"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleAddRequestToCollection(e, col._id, null)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 transition"
                            title="+ Request to root"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openCreateFolderModal(col._id)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 transition"
                            title="+ Distinct API Folder"
                          >
                            <FolderPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Tree Content: Folders & Requests */}
                      {isOpen && (
                        <div className="border-t border-[#E1E5EA] dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/40 bg-slate-50/30 dark:bg-slate-950/20">
                          {/* Folders List */}
                          {colFolders.map((folder) => {
                            const folderRequests = allColRequests.filter((r) => r.folderId === folder.id);
                            const matchingFolderReqs = folderRequests.filter(isRequestMatching);
                            const folderColorDef =
                              FOLDER_COLORS.find((c) => c.id === folder.color) || FOLDER_COLORS[0];

                            const isFolderOpen =
                              searchTerm && matchingFolderReqs.length > 0
                                ? true
                                : (openFolders[folder.id] ?? true);

                            return (
                              <div key={folder.id} className="text-xs">
                                {/* Folder Header */}
                                <div
                                  onClick={() => toggleFolder(folder.id)}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={async (e) => {
                                    e.preventDefault();
                                    try {
                                      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                                      if (data.reqId) {
                                        await handleDirectMoveRequest(data.reqId, col._id, folder.id);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="flex items-center justify-between px-2.5 py-1.5 hover:bg-[#F0F6FC] dark:hover:bg-slate-800/40 cursor-pointer transition group select-none"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {isFolderOpen ? (
                                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                                    )}
                                    <Folder className="w-3.5 h-3.5 text-indigo-500 shrink-0" />

                                    {/* Inline rename input or folder name */}
                                    {inlineEditingFolderId === folder.id ? (
                                      <input
                                        type="text"
                                        autoFocus
                                        value={inlineRenameText}
                                        onChange={(e) => setInlineRenameText(e.target.value)}
                                        onBlur={() => submitInlineRename(col._id, folder.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') submitInlineRename(col._id, folder.id);
                                          if (e.key === 'Escape') setInlineEditingFolderId(null);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-white dark:bg-slate-900 border border-[#0B63C5] rounded px-1.5 py-0.5 text-xs text-[#0E2A47] dark:text-slate-100 focus:outline-none"
                                      />
                                    ) : (
                                      <span
                                        onDoubleClick={(e) => {
                                          e.stopPropagation();
                                          startInlineRename(folder);
                                        }}
                                        className="font-semibold text-slate-800 dark:text-slate-200 truncate"
                                      >
                                        <HighlightMatch text={folder.name} query={searchTerm} />
                                      </span>
                                    )}

                                    {/* Folder Tag */}
                                    {folder.tag && (
                                      <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${folderColorDef.bg} ${folderColorDef.text} ${folderColorDef.border}`}
                                      >
                                        {folder.tag}
                                      </span>
                                    )}

                                    {/* Folder Request Count */}
                                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                      ({folderRequests.length})
                                    </span>
                                  </div>

                                  {/* Folder Action Buttons */}
                                  <div
                                    className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => onRunCollection?.(col, folder.id)}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600"
                                      title="Run Folder"
                                    >
                                      <Play className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleAddRequestToCollection(e, col._id, folder.id)}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600"
                                      title="+ Request inside folder"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => startInlineRename(folder)}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                      title="Rename folder"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDuplicateFolder(e, col._id, folder.id)}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                      title="Duplicate folder"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteFolder(e, col._id, folder.id)}
                                      className="p-1 rounded hover:bg-rose-100 text-rose-500"
                                      title="Delete folder"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Folder Requests List */}
                                {isFolderOpen && (
                                  <div className="pl-6 pr-2 py-1 space-y-0.5 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/40">
                                    {folderRequests.length === 0 ? (
                                      <div className="text-[11px] text-slate-400 py-1 pl-2 italic flex items-center justify-between">
                                        <span>Folder is empty</span>
                                        <button
                                          onClick={(e) => handleAddRequestToCollection(e, col._id, folder.id)}
                                          className="text-sky-600 hover:underline cursor-pointer not-italic text-[10px] font-semibold"
                                        >
                                          + Add Request
                                        </button>
                                      </div>
                                    ) : (
                                      matchingFolderReqs.map((req) => {
                                        const isReqActive = activeRequest?._id === req._id;
                                        return (
                                          <div
                                            key={req._id}
                                            draggable
                                            onDragStart={(e) => {
                                              e.dataTransfer.setData(
                                                'text/plain',
                                                JSON.stringify({ reqId: req._id, colId: col._id })
                                              );
                                            }}
                                            onClick={() => loadSavedRequest(req)}
                                            className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition text-xs group ${
                                              isReqActive
                                                ? 'bg-[#E8F1FB] dark:bg-sky-950/60 font-semibold text-[#0B63C5] dark:text-sky-300'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-[#F0F6FC] dark:hover:bg-slate-800/50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-1.5 truncate">
                                              <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-400 cursor-grab shrink-0" />
                                              <span
                                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono shrink-0 ${getMethodBadgeClass(
                                                  req.method
                                                )}`}
                                              >
                                                {req.method}
                                              </span>
                                              <span className="truncate">
                                                <HighlightMatch text={req.name} query={searchTerm} />
                                              </span>
                                            </div>

                                            {/* Action items on request */}
                                            <div
                                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <button
                                                onClick={(e) => openMoveModal(e, req)}
                                                className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
                                                title="Move request to another folder"
                                              >
                                                <MoveRight className="w-2.5 h-2.5" />
                                              </button>
                                              <button
                                                onClick={(e) => handleDuplicateRequest(e, req._id)}
                                                className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
                                                title="Duplicate request"
                                              >
                                                <Copy className="w-2.5 h-2.5" />
                                              </button>
                                              <button
                                                onClick={(e) => handleDeleteRequest(e, req._id)}
                                                className="p-0.5 rounded hover:bg-rose-100 text-rose-500"
                                                title="Delete request"
                                              >
                                                <Trash2 className="w-2.5 h-2.5" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Root Requests (outside any folder) */}
                          {rootRequests.length > 0 && (
                            <div className="pl-4 pr-2 py-1 space-y-0.5">
                              {rootRequests.map((req) => {
                                const isReqActive = activeRequest?._id === req._id;
                                return (
                                  <div
                                    key={req._id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData(
                                        'text/plain',
                                        JSON.stringify({ reqId: req._id, colId: col._id })
                                      );
                                    }}
                                    onClick={() => loadSavedRequest(req)}
                                    className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition text-xs group ${
                                      isReqActive
                                        ? 'bg-[#E8F1FB] dark:bg-sky-950/60 font-semibold text-[#0B63C5] dark:text-sky-300'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-[#F0F6FC] dark:hover:bg-slate-800/50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-400 cursor-grab shrink-0" />
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono shrink-0 ${getMethodBadgeClass(
                                          req.method
                                        )}`}
                                      >
                                        {req.method}
                                      </span>
                                      <span className="truncate">
                                        <HighlightMatch text={req.name} query={searchTerm} />
                                      </span>
                                    </div>

                                    <div
                                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={(e) => openMoveModal(e, req)}
                                        className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
                                        title="Move request to folder"
                                      >
                                        <MoveRight className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDuplicateRequest(e, req._id)}
                                        className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
                                        title="Duplicate request"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteRequest(e, req._id)}
                                        className="p-0.5 rounded hover:bg-rose-100 text-rose-500"
                                        title="Delete request"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeNav === 'history' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EA] dark:border-slate-800">
              <span className="text-xs font-semibold text-[#0E2A47] dark:text-slate-200">Execution Log ({history.length})</span>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {history.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                  <p>No requests sent yet</p>
                </div>
              ) : (
                history.map((h, i) => (
                  <div
                    key={h._id || i}
                    onClick={() => loadHistoryItem(h)}
                    className="p-2 rounded-md hover:bg-[#F0F6FC] dark:hover:bg-slate-800/50 cursor-pointer text-xs border border-transparent hover:border-[#E1E5EA] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${getMethodBadgeClass(h.method)}`}>
                        {h.method}
                      </span>
                      <span className="font-semibold truncate text-[#0E2A47] dark:text-slate-200">{h.url}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pl-1">
                      <span>Status: {h.response?.status || 'N/A'}</span>
                      <span>{new Date(h.createdAt || Date.now()).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Pinned: Support & Documentation with Help Icon */}
        <div className={`border-t border-[#E1E5EA] dark:border-slate-800 shrink-0 bg-white dark:bg-[#0C1017] ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          <div className="relative group w-full">
            <button
              onClick={() => (onOpenApiDocs ? onOpenApiDocs() : window.open('https://github.com/Namitha938/API-Testing-Tool#readme', '_blank'))}
              className={`w-full ${isCollapsed ? 'h-10 justify-center px-0' : 'h-11 px-3 justify-between'} rounded-md flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#F0F6FC] dark:hover:bg-slate-800/60 transition cursor-pointer`}
              title={isCollapsed ? 'Support & Documentation' : undefined}
              aria-label="Support & Documentation"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#0B63C5]" />
                {!isCollapsed && <span>Support & Documentation</span>}
              </div>
              {!isCollapsed && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-50 border border-slate-700/50">
                Support & Documentation
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CREATE / EDIT FOLDER MODAL */}
      {folderModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-5 text-xs">
            <h3 className="font-bold text-sm text-[#0E2A47] dark:text-slate-100 mb-3 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#0B63C5]" />
              <span>{editingFolder ? 'Edit API Folder' : 'Create Distinct API Folder'}</span>
            </h3>

            <form onSubmit={handleSaveFolder} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Folder / API Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. GitHub API, Weather API, Httpbin API"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0B63C5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Service Tag (Short Badge)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. GitHub, Weather, V2"
                  value={folderTag}
                  onChange={(e) => setFolderTag(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0B63C5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Tag Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setFolderColor(col.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${col.bg} ${col.text} ${col.border} ${
                        folderColor === col.id ? 'ring-2 ring-slate-900 dark:ring-white scale-105' : 'opacity-70'
                      }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional service description..."
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0B63C5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFolderModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-[#E1E5EA] text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-[#0B63C5] hover:bg-[#0952A5] text-white font-semibold cursor-pointer"
                >
                  {editingFolder ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVE REQUEST MODAL */}
      {moveModalOpen && requestToMove && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-5 text-xs">
            <h3 className="font-bold text-sm text-[#0E2A47] dark:text-slate-100 mb-2 flex items-center gap-2">
              <MoveRight className="w-4 h-4 text-[#0B63C5]" />
              <span>Move Request to Distinct Folder</span>
            </h3>
            <p className="text-slate-500 mb-3">
              Moving <strong className="text-slate-800 dark:text-slate-200">{requestToMove.name}</strong>
            </p>

            <form onSubmit={handleMoveRequestSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Collection
                </label>
                <select
                  value={moveToColId}
                  onChange={(e) => {
                    setMoveToColId(e.target.value);
                    setMoveToFolderId('');
                  }}
                  className="w-full px-3 py-1.5 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0B63C5]"
                >
                  {collections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Distinct Folder
                </label>
                <select
                  value={moveToFolderId}
                  onChange={(e) => setMoveToFolderId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0B63C5]"
                >
                  <option value="">(Collection Root - No Folder)</option>
                  {collections
                    .find((c) => c._id === moveToColId)
                    ?.folders?.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name} {f.tag ? `[${f.tag}]` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMoveModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-[#E1E5EA] text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-[#0B63C5] hover:bg-[#0952A5] text-white font-semibold cursor-pointer"
                >
                  Move Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
