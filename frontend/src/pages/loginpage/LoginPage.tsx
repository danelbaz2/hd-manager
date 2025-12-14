import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Username"
          className="p-2 text-base border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 text-base border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="p-2 text-base cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
