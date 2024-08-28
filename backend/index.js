const express = require("express");
const app = express();
const PORT = 4000;

//New imports
const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let players = {};
let rooms = {};

io.on("connection", (socket) => {
  socket.on("search_player", ({ playerName }) => {
    // Store the player's name in the players object
    console.log(playerName);
    players[socket.id] = playerName;

    // Example logic: Match players (this is very basic logic)
    const opponent = Object.keys(players).find((id) => id !== socket.id);
    if (opponent) {
      // create a room
      const opponentName = players[opponent];
      // const room = socket.id + opponent;
      const room = Math.random().toString(36).substring(7);
      console.log(room);

      socket.join(room);
      io.sockets.sockets.get(opponent).join(room);

      rooms[room] = [
        { id: socket.id, name: playerName, status: "waiting", gameData: {} },
        { id: opponent, name: opponentName, status: "waiting", gameData: {} },
      ];

      // Emit an event to both players with the opponent's name and the room
      io.to(socket.id).emit("player_found", {
        opponentName: players[opponent],
        room: room,
        name: playerName,
      });
      io.to(opponent).emit("player_found", {
        opponentName: playerName,
        room: room,
        name: players[opponent],
      });

      // Remove players after they are matched
      delete players[socket.id];
      delete players[opponent];
    } else {
      // Wait for another player to join
      socket.emit("waiting", { message: "Waiting for an opponent..." });
    }
  });

  socket.on("join_room", ({ room, playerName }) => {
    console.log("Joining room", room, playerName);
    if (rooms[room]) {
      // Join the room and add the player to the rooms object
      socket.join(room);
      if (rooms[room][0]["name"] === playerName) {
        rooms[room][0]["id"] = socket.id;
        rooms[room][0]["status"] = "ready";
      } else if (rooms[room][1]["name"] === playerName) {
        rooms[room][1]["id"] = socket.id;
        rooms[room][1]["status"] = "ready";
      } else {
        socket.emit("error", { message: "Player not found in the room" });
      }
      // Emit an event to both players in the room to start the game
      if (
        rooms[room][0]["status"] === "ready" &&
        rooms[room][1]["status"] === "ready"
      ) {
        io.to(room).emit("start_game", {
          room: room,
          players: rooms[room],
          gameData: rooms[room][0]["gameData"],
        });
      }
    } else {
      socket.emit("error", { message: "Room not found" });
    }
  });

  // socket.on("move", ({ room, player, move }) => {
  //   console.log("Move", room, player, move);
  //   const opponent = rooms[room].find((p) => p.id !== player.id);
  //   io.to(opponent.id).emit("move", { move });
  // });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
