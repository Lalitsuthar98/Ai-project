import { cloneElement, useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import { getRecentChats } from "../../services/chatService";
import "./AppLayout.css";

function AppLayout({ children }) {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // This changes every time user clicks New Chat
  const [newChatKey, setNewChatKey] = useState(0);

  // Load recent chats from backend
  const loadRecentChats = async () => {
    try {
      const data = await getRecentChats();

      setChats(data.chats || []);
    } catch (error) {
      console.error("Failed to load recent chats:", error);
    }
  };

  // Load chats when page opens
  useEffect(() => {
    loadRecentChats();
  }, []);

  // User clicks an existing chat
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  // User clicks New Chat
  const handleNewChat = () => {
    setSelectedChatId(null);

    // Important:
    // Even if selectedChatId is already null,
    // this value changes every time.
    setNewChatKey((previous) => previous + 1);
  };

  const handleChatDeleted = (chatId) => {
  setChats((previousChats) =>
    previousChats.filter((chat) => chat._id !== chatId)
  );

  if (selectedChatId === chatId) {
    setSelectedChatId(null);
  }
};

  return (
    <div className="app-layout">

      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onChatDeleted={handleChatDeleted}
      />

      <main className="main-content">
        {cloneElement(children, {
          selectedChatId,
          newChatKey,
          onChatCreated: loadRecentChats,
        })}
      </main>

    </div>
  );
}

export default AppLayout;