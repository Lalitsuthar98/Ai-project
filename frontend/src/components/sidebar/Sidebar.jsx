import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  MessageSquarePlus,
  Search,
  Settings,
  User,
  Sparkles,
  LogOut,
  Trash2
} from "lucide-react";

import { deleteChat } from "../../services/chatService";

import "./Sidebar.css";

function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onChatDeleted,
}) {
     const navigate = useNavigate();
     const { user, logout } = useAuth();


 const handleDeleteChat = async (event, chatId) => {
  event.stopPropagation();

  try {
    await deleteChat(chatId);

    onChatDeleted?.(chatId);

  } catch (error) {
    console.error("Failed to delete chat:", error);
  }
};

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Sparkles size={18} />
        </div>

        <span>Nova AI</span>
      </div>


      {/* New Chat */}
      <button
       className="new-chat-btn"
       onClick={onNewChat}
      >
        <MessageSquarePlus size={18} />
        <span>New chat</span>
      </button>


      {/* Search */}
      <button className="search-chat-btn">
        <Search size={17} />
        <span>Search chats</span>

        <kbd>⌘ K</kbd>
      </button>


      {/* Recent Chats */}
      <div className="recent-section">

        <div className="section-title">
          Recent
        </div>

        <div className="chat-list">

         {chats.map((chat) => (
  <button
    className={`chat-item ${
  selectedChatId === chat._id ? "active" : ""
}`}
    key={chat._id}
    onClick={() => onSelectChat(chat._id)}
  >
    <MessageSquarePlus size={16} />

    <span>
      {chat.topic || "New conversation"}
    </span>

    <span
      className="delete-chat-btn"
      onClick={(event) =>
        handleDeleteChat(event, chat._id)
      }
    >
      <Trash2 size={15} />
    </span>
  </button>
))}

        </div>

      </div>


      {/* Bottom */}
        <div className="sidebar-bottom">

  <button className="sidebar-item">
    <Settings size={18} />
    <span>Settings</span>
  </button>

  <button className="profile-card">

    <div className="profile-avatar">
      <User size={17} />
    </div>

    <div className="profile-info">
      <strong>{user?.name || "User"}</strong>
      <span>Free plan</span>
    </div>

  </button>

  <button
    className="sidebar-item logout-item"
    onClick={async () => {
      await logout();
      navigate("/login");
    }}
  >
    <LogOut size={18} />
    <span>Logout</span>
  </button>

</div>

    </aside>
  );
}

export default Sidebar;