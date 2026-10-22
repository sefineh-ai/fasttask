import React, { useState } from 'react';
import { OPENAPI_SPEC } from '../fastapi_spec/openapiSpec';
import { apiClient } from '../services/apiClient';
import { Play, Copy, Check, ChevronDown, ChevronRight, Terminal, Globe, Code, ShieldCheck, ExternalLink } from 'lucide-react';

interface EndpointState {
  isOpen: boolean;
  isTryingOut: boolean;
  params: Record<string, string>;
  requestBody: string;
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    durationMs: number;
    curl: string;
  } | null;
  isLoading: boolean;
}

export const SwaggerExplorer: React.FC<{ onDataModified?: () => void }> = ({ onDataModified }) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schemas' | 'overview'>('endpoints');
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  // Initial state for all endpoints
  const [endpointStates, setEndpointStates] = useState<Record<string, EndpointState>>({
    'get_list_tasks': {
      isOpen: true,
      isTryingOut: true,
      params: { status: '', priority: '', search: '', tag: '', sort_by: 'created_at' },
      requestBody: '',
      response: null,
      isLoading: false,
    },
    'post_create_task': {
      isOpen: false,
      isTryingOut: true,
      params: {},
      requestBody: JSON.stringify(
        {
          title: "Setup FastAPI JWT authentication middleware",
          description: "Protect admin routes using OAuth2 with Password (and hashing), Bearer with JWT tokens.",
          status: "in_progress",
          priority: "high",
          dueDate: "2026-10-28",
          tags: ["Auth", "Security", "FastAPI"],
          subtasks: [
            { title: "Configure python-jose and passlib", completed: false },
            { title: "Define UserInDB Pydantic model", completed: false }
          ]
        },
        null,
        2
      ),
      response: null,
      isLoading: false,
    },
    'get_get_task': {
      isOpen: false,
      isTryingOut: true,
      params: { task_id: 'TSK-101' },
      requestBody: '',
      response: null,
      isLoading: false,
    },
    'patch_patch_task': {
      isOpen: false,
      isTryingOut: true,
      params: { task_id: 'TSK-101' },
      requestBody: JSON.stringify({ priority: 'urgent', status: 'in_review' }, null, 2),
      response: null,
      isLoading: false,
    },
    'patch_toggle_task_completion': {
      isOpen: false,
      isTryingOut: true,
      params: { task_id: 'TSK-101' },
      requestBody: '',
      response: null,
      isLoading: false,
    },
    'post_add_subtask': {
      isOpen: false,
      isTryingOut: true,
      params: { task_id: 'TSK-101' },
      requestBody: JSON.stringify({ title: "Run end-to-end integration tests" }, null, 2),
      response: null,
      isLoading: false,
    },
    'delete_delete_task': {
      isOpen: false,
      isTryingOut: true,
      params: { task_id: 'TSK-106' },
      requestBody: '',
      response: null,
      isLoading: false,
    },
    'get_get_task_stats': {
      isOpen: false,
      isTryingOut: true,
      params: {},
      requestBody: '',
      response: null,
      isLoading: false,
    },
    'get_health_check': {
      isOpen: false,
      isTryingOut: true,
      params: {},
      requestBody: '',
      response: null,
      isLoading: false,
    },
  });

  const toggleEndpoint = (key: string) => {
    setEndpointStates((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          isOpen: false,
          isTryingOut: true,
          params: {},
          requestBody: '',
          response: null,
          isLoading: false,
        }),
        isOpen: !prev[key]?.isOpen,
      },
    }));
  };

  const updateParam = (key: string, paramName: string, val: string) => {
    setEndpointStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        params: {
          ...prev[key]?.params,
          [paramName]: val,
        },
      },
    }));
  };

  const updateRequestBody = (key: string, val: string) => {
    setEndpointStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        requestBody: val,
      },
    }));
  };

  const executeEndpoint = async (
    key: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    rawPath: string
  ) => {
    setEndpointStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isLoading: true },
    }));

    const state = endpointStates[key];
    const params = state?.params || {};

    // Substitute path variables like {task_id}
    let resolvedPath = rawPath;
    const queryParams: Record<string, string> = {};

    Object.entries(params).forEach(([pName, pVal]) => {
      if (resolvedPath.includes(`{${pName}}`)) {
        resolvedPath = resolvedPath.replace(`{${pName}}`, encodeURIComponent(pVal));
      } else if (pVal) {
        queryParams[pName] = pVal;
      }
    });

    let bodyData: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && state?.requestBody) {
      try {
        bodyData = JSON.parse(state.requestBody);
      } catch (e: any) {
        setEndpointStates((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            isLoading: false,
            response: {
              status: 400,
              statusText: 'Invalid JSON',
              headers: { 'content-type': 'application/json' },
              data: { error: 'Request body contains malformed JSON' },
              durationMs: 0,
              curl: '# Invalid JSON body',
            },
          },
        }));
        return;
      }
    }

    const result = await apiClient.executeApiCall({
      method,
      path: resolvedPath,
      queryParams,
      body: bodyData,
    });

    setEndpointStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        response: result,
      },
    }));

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && onDataModified) {
      onDataModified();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(id);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-600 text-white';
      case 'POST':
        return 'bg-emerald-600 text-white';
      case 'PUT':
        return 'bg-amber-600 text-white';
      case 'PATCH':
        return 'bg-teal-600 text-white';
      case 'DELETE':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-neutral-800 text-white';
    }
  };

  const getMethodBorderClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'border-blue-200 bg-blue-50/20';
      case 'POST':
        return 'border-emerald-200 bg-emerald-50/20';
      case 'PUT':
        return 'border-amber-200 bg-amber-50/20';
      case 'PATCH':
        return 'border-teal-200 bg-teal-50/20';
      case 'DELETE':
        return 'border-rose-200 bg-rose-50/20';
      default:
        return 'border-neutral-200 bg-white';
    }
  };

  // Extract endpoints from OPENAPI_SPEC
  const endpointList: Array<{
    key: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    tag: string;
    details: any;
  }> = [];

  Object.entries(OPENAPI_SPEC.paths).forEach(([pathKey, pathMethods]: [string, any]) => {
    Object.entries(pathMethods).forEach(([methodKey, opDetails]: [string, any]) => {
      const method = methodKey.toUpperCase() as any;
      const key = `${methodKey}_${opDetails.operationId || pathKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const tag = opDetails.tags?.[0] || 'Default';
      endpointList.push({
        key,
        path: pathKey,
        method,
        tag,
        details: opDetails,
      });
    });
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / API Context */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                OAS 3.1.0
              </span>
              <h2 className="text-xl font-bold text-neutral-900">
                {OPENAPI_SPEC.info.title}
              </h2>
              <span className="text-xs font-mono tabular-nums text-neutral-500">
                v{OPENAPI_SPEC.info.version}
              </span>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
              {OPENAPI_SPEC.info.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-md text-xs font-mono flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>Base URL: /api</span>
            </div>
          </div>
        </div>

        {/* Tab switchers: Endpoints vs Schemas */}
        <div className="flex items-center gap-1 pt-4">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'endpoints'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Interactive Endpoints ({endpointList.length})
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'schemas'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Pydantic Models & Schemas
          </button>
        </div>
      </div>

      {/* Endpoints View */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {endpointList.map((ep) => {
            const state = endpointStates[ep.key] || {
              isOpen: false,
              isTryingOut: true,
              params: {},
              requestBody: '',
              response: null,
              isLoading: false,
            };

            return (
              <div
                key={ep.key}
                className={`rounded-lg border transition-all overflow-hidden ${getMethodBorderClass(
                  ep.method
                )}`}
              >
                {/* Endpoint Header Bar */}
                <div
                  onClick={() => toggleEndpoint(ep.key)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded ${getMethodBadgeClass(
                        ep.method
                      )}`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-neutral-900">
                      /api{ep.path}
                    </span>
                    <span className="text-xs text-neutral-500 hidden sm:inline">
                      — {ep.details.summary}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {ep.tag}
                    </span>
                    {state.isOpen ? (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Endpoint Sandbox */}
                {state.isOpen && (
                  <div className="p-4 bg-white border-t border-neutral-200 text-xs space-y-4">
                    <p className="text-neutral-600 leading-relaxed">
                      {ep.details.description}
                    </p>

                    {/* Parameters Table */}
                    {ep.details.parameters && ep.details.parameters.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold text-neutral-800">Parameters:</div>
                        <div className="border border-neutral-200 rounded-md overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                              <tr>
                                <th className="p-2 w-32 font-mono">Name</th>
                                <th className="p-2 w-20">In</th>
                                <th className="p-2 w-48">Type / Schema</th>
                                <th className="p-2">Value Input</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {ep.details.parameters.map((param: any) => (
                                <tr key={param.name}>
                                  <td className="p-2 font-mono font-medium text-neutral-900">
                                    {param.name}
                                    {param.required && (
                                      <span className="text-rose-500 ml-1">*</span>
                                    )}
                                  </td>
                                  <td className="p-2 text-neutral-500">{param.in}</td>
                                  <td className="p-2 font-mono text-[11px] text-neutral-600">
                                    {param.schema?.enum ? (
                                      <span>enum: [{param.schema.enum.join(', ')}]</span>
                                    ) : (
                                      param.schema?.type || 'string'
                                    )}
                                  </td>
                                  <td className="p-2">
                                    {param.schema?.enum ? (
                                      <select
                                        value={state.params[param.name] || ''}
                                        onChange={(e) =>
                                          updateParam(ep.key, param.name, e.target.value)
                                        }
                                        className="w-full max-w-xs px-2 py-1 bg-white border border-neutral-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                      >
                                        <option value="">(None / All)</option>
                                        {param.schema.enum.map((opt: string) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        value={state.params[param.name] ?? ''}
                                        onChange={(e) =>
                                          updateParam(ep.key, param.name, e.target.value)
                                        }
                                        placeholder={param.description || `Enter ${param.name}...`}
                                        className="w-full max-w-xs px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                      />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Request Body Editor */}
                    {['POST', 'PUT', 'PATCH'].includes(ep.method) && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-semibold text-neutral-800">
                          <span>Request Body (application/json):</span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            Pydantic V2 Schema
                          </span>
                        </div>
                        <textarea
                          rows={6}
                          value={state.requestBody}
                          onChange={(e) => updateRequestBody(ep.key, e.target.value)}
                          className="w-full p-2.5 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 leading-relaxed"
                          placeholder='{ "title": "Example task" }'
                        />
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-neutral-500 text-[11px]">
                        Executes live async endpoint against server
                      </div>
                      <button
                        onClick={() => executeEndpoint(ep.key, ep.method, ep.path)}
                        disabled={state.isLoading}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md text-white transition-all shadow-xs ${
                          state.isLoading
                            ? 'bg-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-900 hover:bg-neutral-800 active:scale-95'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{state.isLoading ? 'Executing...' : 'Execute Request'}</span>
                      </button>
                    </div>

                    {/* Live Response Panel */}
                    {state.response && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-800">Server Response:</span>
                            <span
                              className={`px-2 py-0.5 font-mono tabular-nums font-bold text-[11px] rounded ${
                                state.response.status >= 200 && state.response.status < 300
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {state.response.status} {state.response.statusText}
                            </span>
                            <span className="font-mono tabular-nums text-neutral-500 text-[11px]">
                              {state.response.durationMs}ms
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              copyToClipboard(state.response!.curl, `curl-${ep.key}`)
                            }
                            className="flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 font-mono"
                          >
                            {copiedCurl === `curl-${ep.key}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied cURL!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy cURL</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Formatted JSON Body */}
                        <div>
                          <pre className="p-3 bg-neutral-900 text-emerald-400 font-mono text-[11px] rounded-md overflow-x-auto max-h-64 leading-relaxed">
                            {JSON.stringify(state.response.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schemas View */}
      {activeTab === 'schemas' && (
        <div className="space-y-4">
          {Object.entries(OPENAPI_SPEC.components.schemas).map(([name, schema]: [string, any]) => (
            <div key={name} className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-100">
                <span className="font-mono font-bold text-sm text-neutral-900">{name}</span>
                <span className="text-xs text-neutral-500 font-mono">
                  {schema.type || 'object'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-3">{schema.description || 'Pydantic data model'}</p>
              <pre className="p-3 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-md overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
