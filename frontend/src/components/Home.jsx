import React, { useState, useEffect } from "react";

import socketIO from "socket.io-client";

const socket = socketIO.connect("http://localhost:4000");

const Home = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Listen for a response from the server
    socket.on("player_found", (data) => {
      setMessage(
        `Player found: ${data.opponentName} redirecting to the game...`
      );
      // Redirect to the game page after 2 seconds with the room and player's name in query params
      setTimeout(() => {
        window.location.href = `/game?room=${data.room}&playerName=${data.name}`;
      }, 2000);
    });

    socket.on("error", (error) => {
      setMessage(`Error: ${error.message}`);
    });

    // Clean up on component unmount
    return () => {
      socket.off("player_found");
      socket.off("error");
    };
  }, []);

  const handleSearch = () => {
    if (name.trim() === "") {
      setMessage("Please enter your name.");
      return;
    }

    // Emit the search event to the server with the player's name
    socket.emit("search_player", { playerName: name });

    setMessage("Searching for a player...");
  };

  return (
    <div className="bg-black text-white w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold">Mini Chess</h1>
        <div>
          <p className="mb-2">Enter your name:</p>
          <input
            type="text"
            className="w-48 p-2 text-black rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-48 p-2 bg-blue-500 hover:bg-blue-700 rounded"
        >
          Search for a player
        </button>
        {message && <p className="mt-4 text-yellow-400">{message}</p>}
      </div>
    </div>
  );
};

export default Home;
