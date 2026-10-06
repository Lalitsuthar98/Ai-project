import {
  MoreHorizontal,
  PanelLeft,
  Sparkles,
} from "lucide-react";

function ChatHeader() {
  return (
    <header className="chat-header">

      {/* LEFT */}
      <div className="chat-header-left">

        <button
          className="icon-btn mobile-menu"
          type="button"
        >
          <PanelLeft size={19} />
        </button>

        <div className="ai-status">

          <div className="ai-status-icon">
            <Sparkles size={15} />
          </div>

          <div>
            <strong>Nova AI</strong>

            <span>
              <i></i>
              Online
            </span>
          </div>

        </div>

      </div>


      {/* RIGHT */}
      <div className="chat-header-right">

        <button
          className="model-name"
          type="button"
        >
          Nova AI
        </button>

        <button
          className="icon-btn"
          type="button"
        >
          <MoreHorizontal size={20} />
        </button>

      </div>

    </header>
  );
}

export default ChatHeader;