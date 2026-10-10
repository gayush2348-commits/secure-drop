import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch(
        `/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          body: JSON.stringify({ newPassword }),
        },
      );

      setMessage(data.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow"
      >
        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>

        <p className="text-gray-500 mb-6">Enter your new password.</p>

        {message && (
          <p className="bg-green-100 text-green-600 p-3 rounded mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</p>
        )}

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-5"
          required
        />

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <Link to="/login" className="block text-center text-blue-600 mt-5">
          Back to Login
        </Link>
      </form>
    </div>
  );
}

export default ResetPassword;
