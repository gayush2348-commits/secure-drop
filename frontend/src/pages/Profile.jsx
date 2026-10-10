import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    setError("");
    setSuccess("");

    if (!trimmedName) {
      setError("Name cannot be empty.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      setName(data.user.name);
      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-sm">
                {initial}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-800">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            {!isEditing && (
              <>
                <button
                  onClick={() => {
                    setName(user?.name || "");
                    setError("");
                    setSuccess("");
                    setIsEditing(true);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600  text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Success and error messages */}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {/* Account information */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Account Information
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Full Name
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    disabled={loading}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                ) : (
                  <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-800">
                    {user?.name || "Not available"}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Email Address
                </label>
                <p className="break-all rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-800">
                  {user?.email || "Not available"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Your email address cannot be changed here.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Account Role
                </label>
                <div>
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold capitalize text-blue-700">
                    {user?.role || "User"}
                  </span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/documents"
          className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
            My Documents
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your uploaded files.
          </p>
        </Link>

        <Link
          to="/upload"
          className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
            Upload Document
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Add a new document to your account.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Profile;
