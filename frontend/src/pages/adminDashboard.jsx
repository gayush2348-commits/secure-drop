import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user: currentUser, accessToken } = useAuth();

  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch("/admin/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUsers(response.users);
        setUserCount(response.count);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const regularUserCount = users.filter((user) => user.role === "user").length;

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const handleRoleChange = async (id, newRole) => {
    setError("");

    try {
      const response = await apiFetch(`/admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === id ? { ...item, role: response.user.role } : item,
        ),
      );

      if (selectedUser?._id === id) {
        setSelectedUser((prevUser) => ({
          ...prevUser,
          role: response.user.role,
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser?._id) {
      setError("You cannot delete your own admin account.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmed) return;

    setError("");

    try {
      await apiFetch(`/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      setUserCount((prevCount) => Math.max(0, prevCount - 1));

      if (selectedUser?._id === id) {
        setSelectedUser(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedUser(null);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await apiFetch(`/admin/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSelectedUser(response.user);
    } catch (err) {
      setDetailsError(err.message || "Unable to load user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedUser(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              SecureDrop / Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Manage users and monitor your platform.
            </p>
          </div>

          <div className="w-fit rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium text-blue-600">SYSTEM STATUS</p>
            <p className="mt-1 font-semibold text-blue-600">User Management</p>
            <Link to="/" className="text-green-600 hover:text-green-800">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Global error */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <span className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700">
                ALL
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {loading ? "—" : userCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">Registered accounts</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Administrators
              </p>
              <span className="rounded-lg bg-purple-100 px-3 py-2 text-purple-700">
                ADM
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {loading ? "—" : adminCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Accounts with admin access
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Regular Users
              </p>
              <span className="rounded-lg bg-emerald-100 px-3 py-2 text-emerald-700">
                USER
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              {loading ? "—" : regularUserCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">Standard accounts</p>
          </div>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                User Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage all registered accounts.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              aria-label="Search users by name or email"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
            />
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading users...
            </div>
          ) : error && users.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              Unable to load users.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-slate-700">No users found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email Address
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Account ID
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = user._id === currentUser?._id;

                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold uppercase text-blue-700">
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {user.name || "Unnamed User"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            disabled={isCurrentUser}
                            aria-label={`Change role for ${user.name || user.email}`}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(user._id)}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={isCurrentUser}
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {user._id}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500 sm:px-6">
            Showing {filteredUsers.length} of {userCount} users
          </div>
        </div>
      </div>

      {/* User details modal */}
      {(detailsLoading || detailsError || selectedUser) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetails();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="user-details-title"
                className="text-xl font-bold text-slate-800"
              >
                User Details
              </h2>
              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close user details"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {detailsLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading user details...
              </p>
            ) : detailsError ? (
              <div>
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {detailsError}
                </p>
                <button
                  type="button"
                  onClick={closeDetails}
                  className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            ) : selectedUser ? (
              <>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-medium text-slate-800">
                      {selectedUser.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="break-words font-medium text-slate-800">
                      {selectedUser.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Account ID</p>
                    <p className="break-all font-mono text-sm text-slate-700">
                      {selectedUser._id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
