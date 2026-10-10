import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function Dashboard() {
  const { user, accessToken } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/files/?limit=5", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (cancelled) return;

        setTotalFiles(Number(data.totalFiles) || 0);
        setFiles(Array.isArray(data.files) ? data.files : []);
      } catch (err) {
        if (cancelled) return;

        setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFiles();

    return () => {
      cancelled = true;
    };
  }, [accessToken, retryCount]);

  const formatSize = (bytes) => {
    const size = Number(bytes) || 0;

    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileStyle = (mimeType = "") => {
    if (mimeType === "application/pdf") {
      return {
        label: "PDF",
        style: "bg-red-50 text-red-600 ring-red-100",
      };
    }

    if (mimeType.startsWith("image/")) {
      return {
        label: "IMG",
        style: "bg-violet-50 text-violet-600 ring-violet-100",
      };
    }

    return {
      label: "DOC",
      style: "bg-blue-50 text-blue-600 ring-blue-100",
    };
  };

  return (
    <div className="min-h-full space-y-7 pb-8 text-slate-800">
      {/* Welcome Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Your secure workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Welcome back,{" "}
            <span className="font-semibold text-slate-700">
              {user?.name || "User"}
            </span>
            ! Here's what's happening with your files.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Upload Document
        </Link>
      </section>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>

          <button
            onClick={() => setRetryCount((prev) => prev + 1)}
            disabled={loading}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 font-semibold transition hover:bg-red-100 disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              ▤
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              My Library
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Documents
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : totalFiles}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Documents in your workspace
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-2xl text-violet-600">
            ↗
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Quick Access
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">Manage Files</p>

          <Link
            to="/documents"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Open document library →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 xl:col-span-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl text-amber-600">
            +
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">Get Started</p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            Add a document
          </p>

          <Link
            to="/upload"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Upload a new file →
          </Link>
        </div>
      </section>

      {/* Recent Documents */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Documents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access your latest uploaded files.
            </p>
          </div>

          <Link
            to="/documents"
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >
            View all documents →
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div
            className="space-y-4 p-5 sm:p-6"
            role="status"
            aria-live="polite"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 py-2"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/5 rounded bg-slate-100" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>

                <div className="h-8 w-14 rounded-lg bg-slate-100" />
              </div>
            ))}

            <p className="text-center text-sm text-slate-500">
              Loading your documents...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="px-6 py-12 text-center">
            <p className="font-semibold text-slate-800">
              Your recent files couldn't be loaded.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Retry to fetch the latest information.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && files.length === 0 && (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
              ▤
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No documents yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Your uploaded documents will appear here. Upload your first file
              to get started.
            </p>

            <Link
              to="/upload"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Upload your first file
            </Link>
          </div>
        )}

        {/* Documents List */}
        {!loading && !error && files.length > 0 && (
          <div className="divide-y divide-slate-100">
            {files.map((file) => {
              const fileStyle = getFileStyle(file.mimeType);

              return (
                <article
                  key={file._id}
                  className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ${fileStyle.style}`}
                    >
                      {fileStyle.label}
                    </div>

                    <div className="min-w-0">
                      <h3
                        title={file.originalName}
                        className="break-words text-sm font-semibold text-slate-800 transition group-hover:text-blue-700 sm:truncate"
                      >
                        {file.originalName}
                      </h3>

                      <p className="mt-1.5 text-xs text-slate-500">
                        {file.mimeType}{" "}
                        <span className="mx-1 text-slate-300">•</span>
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    View file ↗
                  </a>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && !error && files.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Showing {files.length} recent{" "}
              {files.length === 1 ? "document" : "documents"} from your library.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
