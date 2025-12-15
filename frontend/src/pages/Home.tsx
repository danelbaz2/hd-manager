import React from "react";
import Button from "../components/Layout/HeaderBar/Button";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">HD Manager</h1>
      <p className="mb-4">Welcome to the HD Manager application.</p>
      <Button onClick={() => alert("Clicked!")}>Get Started</Button>
    </div>
  );
};

export default Home;
