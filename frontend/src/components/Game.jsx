import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socketIO from "socket.io-client";

const socket = socketIO.connect("http://localhost:4000");

const Game = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get("room");
  const playerName = queryParams.get("playerName");
  const [gameData, setGameData] = useState({});

  useEffect(() => {
    // Connect to the server
    socket.on("connect", () => {
      console.log("Connected to the server");

      // Join the specified room
      socket.emit("join_room", { room, playerName });
    });

    // Listen for the start of the game
    socket.on("start_game", (data) => {
      console.log("Game started!", data);
      setGameData(data.gameData);
      console.log("Game data:", data.gameData);
      // You can set state or trigger other logic here to start the game
    });

    // Clean up on component unmount
    return () => {
      socket.emit("leave_room", { room, playerName });
      socket.disconnect();
    };
  }, [room, playerName]);

  return (
    <div>
      <p>Room: {room}</p>
      <p>Player Name: {playerName}</p>
    </div>
  );
};

export default Game;
