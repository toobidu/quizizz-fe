// Routes dành cho Player (người chơi)
import { Dashboard, Leaderboard, RoomPage } from "../../features/player/pages";
import WaitingRoom from "../../components/room/WaitingRoom";
import GameRoom from "../../components/room/GameRoom";
import { RoleBasedRoute } from "../guards";

const playerRoutes = [
  {
    path: "dashboard",
    element: (
      <RoleBasedRoute allowedRoles={["PLAYER"]}>
        <Dashboard />
      </RoleBasedRoute>
    ),
  },
  {
    path: "rooms",
    element: (
      <RoleBasedRoute allowedRoles={["PLAYER"]}>
        <RoomPage />
      </RoleBasedRoute>
    ),
  },
  {
    path: "waiting-room/:roomCode",
    element: (
      <RoleBasedRoute allowedRoles={["PLAYER"]}>
        <WaitingRoom />
      </RoleBasedRoute>
    ),
  },
  {
    path: "game/:roomCode",
    element: (
      <RoleBasedRoute allowedRoles={["PLAYER"]}>
        <GameRoom />
      </RoleBasedRoute>
    ),
  },
  {
    path: "leaderboard",
    element: (
      <RoleBasedRoute allowedRoles={["PLAYER"]}>
        <Leaderboard />
      </RoleBasedRoute>
    ),
  },
];

export default playerRoutes;
