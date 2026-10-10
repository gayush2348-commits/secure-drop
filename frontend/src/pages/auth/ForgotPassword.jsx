import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

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
        <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>

        <p className="text-gray-500 mb-6">
          Enter your email to receive a password reset link.
        </p>

        {message && (
          <p className="bg-green-100 text-green-600 p-3 rounded mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-5"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <Link to="/login" className="block text-center text-blue-600 mt-5">
          Back to Login
        </Link>
      </form>
    </div>
  );
}

export default ForgotPassword;
