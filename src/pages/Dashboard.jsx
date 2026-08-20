import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/rooms";

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const [rooms, setRooms] = useState([]);

  const [roomName, setRoomName] = useState("");

  const [joinRoomId, setJoinRoomId] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      return alert("Enter room name");
    }

    try {
      await axios.post(
        API,
        {
          name: roomName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRoomName("");

      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to create room");
    }
  };

  const joinRoom = async () => {
    if (!joinRoomId.trim()) {
      return alert("Enter Room ID");
    }

    try {
      await axios.post(
        `${API}/join`,
        {
          roomId: joinRoomId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchRooms();

      navigate(`/room/${joinRoomId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to join room");
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await axios.post(
        `${API}/${roomId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(`${API}/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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

        <section className="dashboard-card">
          <h3>Create Room</h3>

          <div className="room-form">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <button onClick={createRoom}>Create</button>
          </div>
        </section>

        <section className="dashboard-card">
          <h3>Join Room</h3>

          <div className="room-form">
            <input
              type="text"
              placeholder="MongoDB Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />

            <button onClick={joinRoom}>Join</button>
          </div>
        </section>

        <section className="rooms-section">
          <h3>Your Rooms</h3>

          {rooms.length === 0 ? (
            <p>No rooms yet.</p>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div className="room-card" key={room._id}>
                  <h3>{room.name}</h3>

                  <p>
                    <strong>ID:</strong>
                    <br />
                    {room._id}
                  </p>

                  <p>Owner: {room.owner.name}</p>

                  <p>Members: {room.members.length}</p>

                  <button onClick={() => navigate(`/room/${room._id}`)}>
                    Enter Room
                  </button>

                  {room.owner._id === user._id ? (
                    <button
                      className="danger-button"
                      onClick={() => deleteRoom(room._id)}
                    >
                      Delete Room
                    </button>
                  ) : (
                    <button
                      className="danger-button"
                      onClick={() => leaveRoom(room._id)}
                    >
                      Leave Room
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
