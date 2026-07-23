import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [rooms, setRooms] = useState(
    JSON.parse(localStorage.getItem("rooms")) || [],
  );

  const [roomName, setRoomName] = useState("");

  const [joinRoomId, setJoinRoomId] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);

  // CREATE ROOM
  const createRoom = () => {
    if (!roomName.trim()) {
      alert("Enter a room name");
      return;
    }

    const newRoom = {
      id: Date.now().toString(),

      name: roomName,

      owner: user.email,

      members: [user.email],

      invitedMembers: [],

      createdAt: new Date().toLocaleString(),
    };

    const updatedRooms = [...rooms, newRoom];

    setRooms(updatedRooms);

    localStorage.setItem("rooms", JSON.stringify(updatedRooms));

    setRoomName("");

    alert("Room created successfully!");
  };

  // JOIN ROOM
  const joinRoom = () => {
    const room = rooms.find((room) => room.id === joinRoomId);

    if (!room) {
      alert("Room not found");
      return;
    }

    if (!room.members.includes(user.email)) {
      const updatedRoom = {
        ...room,

        members: [...room.members, user.email],
      };

      const updatedRooms = rooms.map((r) =>
        r.id === room.id ? updatedRoom : r,
      );

      setRooms(updatedRooms);

      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    }

    alert("Joined room successfully!");

    setJoinRoomId("");
  };

  // INVITE MEMBER
  const inviteMember = () => {
    if (!selectedRoom) {
      alert("Select a room first");
      return;
    }

    if (!inviteEmail.trim()) {
      alert("Enter an email");
      return;
    }

    const updatedRoom = {
      ...selectedRoom,

      invitedMembers: [...selectedRoom.invitedMembers, inviteEmail],
    };

    const updatedRooms = rooms.map((room) =>
      room.id === selectedRoom.id ? updatedRoom : room,
    );

    setRooms(updatedRooms);

    setSelectedRoom(updatedRoom);

    localStorage.setItem("rooms", JSON.stringify(updatedRooms));

    setInviteEmail("");

    alert(`Invitation sent to ${inviteEmail}`);
  };

  // LEAVE ROOM
  const leaveRoom = (roomId) => {
    const updatedRooms = rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,

          members: room.members.filter((member) => member !== user.email),
        };
      }

      return room;
    });

    setRooms(updatedRooms);

    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
  };

  // DELETE ROOM
  const deleteRoom = (roomId) => {
    const room = rooms.find((room) => room.id === roomId);

    if (room.owner !== user.email) {
      alert("Only the room owner can delete this room");

      return;
    }

    const updatedRooms = rooms.filter((room) => room.id !== roomId);

    setRooms(updatedRooms);

    localStorage.setItem("rooms", JSON.stringify(updatedRooms));

    setSelectedRoom(null);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("isLoggedIn");

    navigate("/");
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>SyncSpace</h1>

        <div>
          <span>Welcome, {user?.name}</span>

          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <h2>Workspace Dashboard</h2>

        {/* CREATE ROOM */}

        <section className="dashboard-card">
          <h3>Create a Room</h3>

          <div className="room-form">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <button onClick={createRoom}>Create Room</button>
          </div>
        </section>

        {/* JOIN ROOM */}

        <section className="dashboard-card">
          <h3>Join a Room</h3>

          <div className="room-form">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />

            <button onClick={joinRoom}>Join Room</button>
          </div>
        </section>

        {/* ROOMS */}

        <section className="rooms-section">
          <h3>Your Rooms</h3>

          {rooms.length === 0 ? (
            <p>You haven't created or joined any rooms yet.</p>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div className="room-card" key={room.id}>
                  <h3>{room.name}</h3>

                  <p>
                    Room ID:
                    <strong>{room.id}</strong>
                  </p>

                  <p>
                    Members:
                    {room.members.length}
                  </p>

                  <p>
                    Owner:
                    {room.owner}
                  </p>

                  <button onClick={() => navigate(`/room/${room.id}`)}>
                    Enter Room
                  </button>

                  <button onClick={() => setSelectedRoom(room)}>
                    Invite Member
                  </button>

                  {room.owner === user.email ? (
                    <button
                      className="danger-button"
                      onClick={() => deleteRoom(room.id)}
                    >
                      Delete Room
                    </button>
                  ) : (
                    <button
                      className="danger-button"
                      onClick={() => leaveRoom(room.id)}
                    >
                      Leave Room
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* INVITE MEMBER */}

        {selectedRoom && (
          <section className="dashboard-card">
            <h3>
              Invite Members to:
              {selectedRoom.name}
            </h3>

            <div className="room-form">
              <input
                type="email"
                placeholder="Member email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />

              <button onClick={inviteMember}>Send Invitation</button>
            </div>

            <p>Invited Members:</p>

            <ul>
              {selectedRoom.invitedMembers.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
