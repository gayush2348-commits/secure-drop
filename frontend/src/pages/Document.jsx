import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function Documents() {
  const { accessToken } = useAuth();

  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState("");
  const [updateFileId, setUpdateFileId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fileInputRef = useRef(null);

  // Fetch documents
  useEffect(() => {
    let cancelled = false;

    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search,
          type,
          sort,
        });

        const data = await apiFetch(`/files?${params}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (cancelled) return;

        const fetchedFiles = Array.isArray(data.files) ? data.files : [];

        setFiles(fetchedFiles);
        setTotalPages(Math.max(1, Number(data.totalPages) || 1));
        setTotalFiles(Number(data.totalFiles) || 0);
      } catch (err) {
        if (cancelled) return;

        setError(err.message || "Unable to load documents.");
        setFiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFiles();

    return () => {
      cancelled = true;
    };
  }, [accessToken, page, search, type, sort, retryCount]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
    setSuccess("");
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Delete document
  const handleDelete = async (id) => {
    if (actionLoading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed) return;

    setActionLoading(true);
    setActionType("delete");
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFiles((prev) => prev.filter((file) => file._id !== id));
      setTotalFiles((prev) => Math.max(0, prev - 1));
      setSuccess("Document deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete document.");
    } finally {
      setActionLoading(false);
      setActionType("");
    }
  };

  // Open file picker
  const handleUpdate = (id) => {
    if (actionLoading) return;

    setUpdateFileId(id);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Replace document
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    setError("");
    setSuccess("");

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, PDF, DOC and DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    if (!updateFileId || actionLoading) {
      e.target.value = "";
      return;
    }

    const currentFileId = updateFileId;

    setActionLoading(true);
    setActionType("update");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const data = await apiFetch(`/files/${currentFileId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!data.file) {
        throw new Error("Updated document details were not returned.");
      }

      setFiles((prev) =>
        prev.map((file) => (file._id === currentFileId ? data.file : file)),
      );

      setSuccess("Document replaced successfully.");
    } catch (err) {
      setError(err.message || "Failed to replace document.");
    } finally {
      setActionLoading(false);
      setActionType("");
      setUpdateFileId(null);
      e.target.value = "";
    }
  };

  // File icon and label
  const getFileType = (file) => {
    const mime = file.mimeType || "";

    if (mime === "application/pdf") {
      return {
        label: "PDF",
        icon: "PDF",
        style: "bg-red-50 text-red-600 ring-red-100",
      };
    }

    if (mime.startsWith("image/")) {
      return {
        label: "Image",
        icon: "IMG",
        style: "bg-violet-50 text-violet-600 ring-violet-100",
      };
    }

    return {
      label: "Document",
      icon: "DOC",
      style: "bg-blue-50 text-blue-600 ring-blue-100",
    };
  };

  const formatSize = (bytes) => {
    const size = Number(bytes) || 0;

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredCount = totalFiles;

  return (
    <div className="min-h-full space-y-7 pb-8 text-slate-800">
      <input
        type="file"
        ref={fileInputRef}
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
        disabled={actionLoading}
      />

      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Your personal workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Documents
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Keep your files organized, accessible and secure.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="text-lg leading-none">+</span>
          Upload Document
        </Link>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
              ▤
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Library
            </span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">
            {search || type !== "all"
              ? "Matching documents"
              : "Total documents"}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : filteredCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
            PDF
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">
            PDFs on this page
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {loading
              ? "—"
              : files.filter((file) => file.mimeType === "application/pdf")
                  .length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
            IMG
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">
            Images on this page
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {loading
              ? "—"
              : files.filter((file) => file.mimeType?.startsWith("image/"))
                  .length}
          </p>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            onClick={() => setRetryCount((prev) => prev + 1)}
            disabled={loading}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2 font-semibold transition hover:bg-red-100 disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      )}

      {success && !error && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
            ✓
          </span>
          {success}
        </div>
      )}

      {/* Documents workspace */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All files</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and manage your uploaded documents.
              </p>
            </div>

            <span className="mt-2 w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:mt-0">
              {loading ? "Loading..." : `${files.length} shown`}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_170px_155px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={handleSearch}
                placeholder="Search by file name..."
                aria-label="Search documents"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={type}
              onChange={handleTypeChange}
              aria-label="Filter by file type"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All file types</option>
              <option value="pdf">PDF files</option>
              <option value="image">Images</option>
              <option value="doc">Documents</option>
            </select>

            <select
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort documents"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4 p-6" role="status" aria-live="polite">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 py-3"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/5 rounded bg-slate-100" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>
                <div className="hidden h-9 w-24 rounded-lg bg-slate-100 sm:block" />
              </div>
            ))}
            <p className="text-center text-sm text-slate-500">
              Loading your documents...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold text-slate-800">
              We couldn't load your files.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Check your connection and try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && files.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
              ▤
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">
              {search || type !== "all"
                ? "No matching documents"
                : "Your workspace is empty"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search || type !== "all"
                ? "Try another search term or choose a different file type."
                : "Upload your first document to keep all your important files in one place."}
            </p>

            {search || type !== "all" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setType("all");
                  setPage(1);
                }}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/upload"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Upload your first file
              </Link>
            )}
          </div>
        )}

        {/* File rows */}
        {!loading && !error && files.length > 0 && (
          <div className="divide-y divide-slate-100">
            {files.map((file) => {
              const fileType = getFileType(file);

              return (
                <article
                  key={file._id}
                  className="group flex flex-col gap-4 px-4 py-5 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ${fileType.style}`}
                    >
                      {fileType.icon}
                    </div>

                    <div className="min-w-0">
                      <h3
                        title={file.originalName}
                        className="break-words text-sm font-semibold text-slate-800 transition group-hover:text-blue-700 sm:truncate"
                      >
                        {file.originalName}
                      </h3>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{fileType.label}</span>
                        <span className="text-slate-300">•</span>
                        <span>{formatSize(file.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      View file ↗
                    </a>

                    <button
                      onClick={() => handleUpdate(file._id)}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading &&
                      actionType === "update" &&
                      updateFileId === file._id
                        ? "Replacing..."
                        : "Replace"}
                    </button>

                    <button
                      onClick={() => handleDelete(file._id)}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading && actionType === "delete"
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && files.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Page <span className="font-semibold text-slate-800">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">{totalPages}</span>
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || actionLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages || actionLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Documents;
