import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Upload() {
  const { accessToken } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setError("");
    setSuccess("");
    setFile(null);

    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Only JPG, PNG, PDF, DOC and DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await apiFetch("/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      setSuccess(data.message || "Document uploaded successfully!");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Upload Document
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Upload and securely manage your documents in one place.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Select your file
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a file from your device to get started.
          </p>
        </div>

        {/* File picker */}
        <label
          htmlFor="document-file"
          className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.7}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0L7 9m5-5 5 5M4 16.5v2A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-2"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Click to browse files
          </p>
          <p className="mt-2 text-xs text-slate-500">
            JPG, PNG, PDF, DOC or DOCX · Maximum 5 MB
          </p>

          <input
            ref={fileInputRef}
            id="document-file"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={loading}
            className="sr-only"
          />
        </label>

        {/* Selected file */}
        {file && (
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3.75h6l4.25 4.5v12A.75.75 0 0 1 16.5 21h-9a.75.75 0 0 1-.75-.75v-15.75A.75.75 0 0 1 7.5 3.75ZM13 4v5h4"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-all text-sm font-semibold text-slate-800">
                {file.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(file.size)} · {file.type}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={loading}
              aria-label="Remove selected file"
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700"
          >
            <p className="font-semibold">{success}</p>
            <Link
              to="/documents"
              className="mt-2 inline-block font-semibold underline underline-offset-2"
            >
              View your documents
            </Link>
          </div>
        )}

        {/* Upload button */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {/* Guidelines */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-800">Before you upload</h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• Maximum file size is 5 MB.</li>
          <li>• Supported formats: JPG, PNG, PDF, DOC and DOCX.</li>
          <li>• Make sure you select the correct document before uploading.</li>
        </ul>
      </div>
    </div>
  );
}

export default Upload;
