// Data storage utilities for local JSON persistence

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  isSubfolder: boolean;
}

export interface Script {
  id: string;
  scriptId: string;
  shortDescription: string;
  testEnvironment: 'Online' | 'Batch' | 'Online & Batch';
  testType: 'Positive' | 'Negative';
  purpose: string;
  assumptions: string[];
  expectedResults: string;
  scriptDetails: string;
  screenshots: Screenshot[];
  subfolderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Screenshot {
  id: string;
  filename: string;
  description: string;
  path: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  userId: string;
}

export interface ImportedScript {
  id: string;
  originalScriptId: string;
  projectId: string;
  script: Script;
  status: 'pending' | 'completed' | 'in-progress';
  remarks?: string;
  testScreenshots: Screenshot[];
  issues: string[];
  completedAt?: string;
}

export interface Issue {
  id: string;
  issueNumber: number;
  title: string;
  description: string;
  status: 'open' | 'fixed' | 'reopened';
  projectId: string;
  scriptIds: string[];
  screenshots: Screenshot[];
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

// Storage keys
const FOLDERS_KEY = 'regression_folders';
const SCRIPTS_KEY = 'regression_scripts';
const PROJECTS_KEY = 'regression_projects';
const IMPORTED_SCRIPTS_KEY = 'regression_imported_scripts';
const ISSUES_KEY = 'regression_issues';

// Generic storage functions
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Folder management
export const getFolders = (): Folder[] => getFromStorage<Folder>(FOLDERS_KEY);
export const saveFolders = (folders: Folder[]): void => saveToStorage(FOLDERS_KEY, folders);

export const addFolder = (folder: Omit<Folder, 'id'>): Folder => {
  const folders = getFolders();
  const newFolder: Folder = {
    ...folder,
    id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  folders.push(newFolder);
  saveFolders(folders);
  return newFolder;
};

export const updateFolder = (id: string, updates: Partial<Folder>): void => {
  const folders = getFolders();
  const index = folders.findIndex(f => f.id === id);
  if (index !== -1) {
    folders[index] = { ...folders[index], ...updates };
    saveFolders(folders);
  }
};

export const deleteFolder = (id: string): void => {
  const folders = getFolders();
  const filteredFolders = folders.filter(f => f.id !== id && f.parentId !== id);
  saveFolders(filteredFolders);
};

// Script management
export const getScripts = (): Script[] => getFromStorage<Script>(SCRIPTS_KEY);
export const saveScripts = (scripts: Script[]): void => saveToStorage(SCRIPTS_KEY, scripts);

export const addScript = (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Script => {
  const scripts = getScripts();
  const now = new Date().toISOString();
  const newScript: Script = {
    ...script,
    id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now
  };
  scripts.push(newScript);
  saveScripts(scripts);
  return newScript;
};

export const updateScript = (id: string, updates: Partial<Script>): void => {
  const scripts = getScripts();
  const index = scripts.findIndex(s => s.id === id);
  if (index !== -1) {
    scripts[index] = { 
      ...scripts[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveScripts(scripts);
  }
};

export const deleteScript = (id: string): void => {
  const scripts = getScripts();
  const filteredScripts = scripts.filter(s => s.id !== id);
  saveScripts(filteredScripts);
};

// Project management
export const getProjects = (userId: string): Project[] => {
  return getFromStorage<Project>(PROJECTS_KEY).filter(p => p.userId === userId);
};

export const saveProjects = (projects: Project[]): void => saveToStorage(PROJECTS_KEY, projects);

export const addProject = (name: string, userId: string): Project => {
  const projects = getFromStorage<Project>(PROJECTS_KEY);
  const newProject: Project = {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    userId,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
};

// Imported Scripts management
export const getImportedScripts = (projectId: string): ImportedScript[] => {
  return getFromStorage<ImportedScript>(IMPORTED_SCRIPTS_KEY).filter(s => s.projectId === projectId);
};

export const saveImportedScripts = (scripts: ImportedScript[]): void => {
  saveToStorage(IMPORTED_SCRIPTS_KEY, scripts);
};

export const importScript = (scriptId: string, projectId: string): void => {
  const scripts = getScripts();
  const script = scripts.find(s => s.id === scriptId);
  if (!script) return;

  const importedScripts = getFromStorage<ImportedScript>(IMPORTED_SCRIPTS_KEY);
  const newImportedScript: ImportedScript = {
    id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    originalScriptId: scriptId,
    projectId,
    script: { ...script },
    status: 'pending',
    testScreenshots: [],
    issues: []
  };
  
  importedScripts.push(newImportedScript);
  saveImportedScripts(importedScripts);
};

export const updateImportedScript = (id: string, updates: Partial<ImportedScript>): void => {
  const scripts = getFromStorage<ImportedScript>(IMPORTED_SCRIPTS_KEY);
  const index = scripts.findIndex(s => s.id === id);
  if (index !== -1) {
    scripts[index] = { ...scripts[index], ...updates };
    saveImportedScripts(scripts);
  }
};

// Issues management
export const getIssues = (projectId: string): Issue[] => {
  return getFromStorage<Issue>(ISSUES_KEY).filter(i => i.projectId === projectId);
};

export const saveIssues = (issues: Issue[]): void => saveToStorage(ISSUES_KEY, issues);

export const addIssue = (issue: Omit<Issue, 'id' | 'issueNumber' | 'createdAt' | 'updatedAt'>): Issue => {
  const allIssues = getFromStorage<Issue>(ISSUES_KEY);
  const projectIssues = allIssues.filter(i => i.projectId === issue.projectId);
  const nextIssueNumber = Math.max(0, ...projectIssues.map(i => i.issueNumber)) + 1;
  
  const now = new Date().toISOString();
  const newIssue: Issue = {
    ...issue,
    id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    issueNumber: nextIssueNumber,
    createdAt: now,
    updatedAt: now
  };
  
  allIssues.push(newIssue);
  saveIssues(allIssues);
  return newIssue;
};

export const updateIssue = (id: string, updates: Partial<Issue>): void => {
  const issues = getFromStorage<Issue>(ISSUES_KEY);
  const index = issues.findIndex(i => i.id === id);
  if (index !== -1) {
    issues[index] = { 
      ...issues[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveIssues(issues);
  }
};