import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services/api";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSignupSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Signup successful: show email verification message
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Check your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Your account has been created successfully. Verify your email
            address to activate your SecureDrop account.
          </p>

          <div className="mt-5 break-words rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
              Verification email sent to
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {formData.email}
            </p>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Open your inbox and click the verification link. If you don't see
            the email, check your spam or junk folder.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Login
          </Link>

          <p className="mt-5 text-sm text-slate-500">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-bold tracking-wide text-blue-600">
            SECUREDROP
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Create account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Get started by creating your SecureDrop account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
