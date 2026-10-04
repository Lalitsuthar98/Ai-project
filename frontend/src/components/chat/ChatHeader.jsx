import {
  MoreHorizontal,
  PanelLeft,
  Sparkles,
} from "lucide-react";

function ChatHeader() {
  return (
    <header className="chat-header">

      <div className="chat-header-left">

        <button className="icon-btn mobile-menu">
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


      <div className="chat-header-right">

        <span className="model-name">
          OpenRouter
        </span>

        <button className="icon-btn">
          <MoreHorizontal size={20} />
        </button>

      </div>

    </header>
  );
}

export default ChatHeader;