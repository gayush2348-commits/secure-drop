import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../services/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Verification token is missing. Please open the link sent to your email.",
        );
        return;
      }

      try {
        const data = await apiFetch(
          `/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
          },
        );

        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully.",
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error.message || "We couldn't verify your email. Please try again.",
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg sm:p-8">
        <p className="text-sm font-bold tracking-widest text-blue-600">
          SECUREDROP
        </p>

        {status === "verifying" && (
          <>
            <div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <svg
                className="h-8 w-8 animate-spin text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.2"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Verifying your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Please wait while we verify your email address. This will only
              take a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg
                className="h-9 w-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Email verified!
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              {message}
            </p>

            <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                Your account is ready!
              </p>
              <p className="mt-1 text-sm text-green-700">
                Please log in to start using SecureDrop.
              </p>
            </div>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                className="h-9 w-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Verification failed
            </h1>

            <p className="mt-3 break-words text-sm leading-6 text-slate-600">
              {message}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Make sure you're using the correct verification link from your
              email.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to Login
            </Link>
          </>
        )}

        <p className="mt-7 text-xs text-slate-400">
          SecureDrop · Secure file management
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
