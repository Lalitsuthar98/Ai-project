import {
  ArrowUp,
  Paperclip,
} from "lucide-react";

import { useState } from "react";


function MessageInput({
  onSend,
  isStreaming,
  onStopGeneration,
  disabled = false
}) {

  const [content, setContent] = useState("");


  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const handleSubmit = async () => {

    const cleanContent = content.trim();

    if (!cleanContent) {
      return;
    }

    if (disabled) {
      return;
    }

    // Clear input
    setContent("");

    // Send to ChatWindow
    await onSend(cleanContent);
  };


  // ==================================================
  // ENTER KEY
  // ==================================================

  const handleKeyDown = (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit();
    }
  };


  return (
    <div className="message-input-wrapper">

      <div className="message-input">

        {/* ==========================================
            ATTACHMENT BUTTON
        ========================================== */}

        <button
          className="input-icon"
          type="button"
          disabled={disabled}
        >
          <Paperclip size={19} />
        </button>


        {/* ==========================================
            MESSAGE TEXTAREA
        ========================================== */}

        <textarea
          placeholder={
            disabled
              ? "Nova AI is thinking..."
              : "Message Nova AI..."
          }

          rows="1"

          value={content}

          onChange={(event) =>
            setContent(event.target.value)
          }

          onKeyDown={handleKeyDown}

          disabled={disabled}
        />


        {/* ==========================================
            SEND / STOP BUTTON
        ========================================== */}

        {isStreaming ? (

          <button
            className="stop-button"
            type="button"
            onClick={onStopGeneration}
            title="Stop generating"
          >
            ■
          </button>

        ) : (

          <button
            className="send-btn"
            type="button"
            onClick={handleSubmit}
            disabled={
              disabled ||
              !content.trim()
            }
            title="Send message"
          >
            <ArrowUp size={18} />
          </button>

        )}

      </div>


      {/* ==========================================
          INPUT HINT
      ========================================== */}

      <p className="input-hint">
        Nova AI can make mistakes. Check important information.
      </p>

    </div>
  );
}


export default MessageInput;