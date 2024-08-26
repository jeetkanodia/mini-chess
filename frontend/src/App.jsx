import { useState } from "react";
import socketIO from "socket.io-client";
const socket = socketIO.connect("http://localhost:4000");
function App() {
  return (
    <div className="bg-black h-screen w-full text-white flex justify-center items-center">
      MINI CHESS
    </div>
  );
}

export default App;
