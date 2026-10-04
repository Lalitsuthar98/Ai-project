import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { sendMessageStream,
    getChatMessages
 } from "../../services/chatService";

import "./Chat.css";


function ChatWindow({
  selectedChatId,
  newChatKey,
  onChatCreated,
}) {

    const [messages, setMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);

    const chatContentRef = useRef(null);

    // Tells us whether user is currently near bottom
    const isAtBottomRef = useRef(true);

    // Stores scroll information before streamed content changes
    const previousScrollHeightRef = useRef(0);
    const previousScrollTopRef = useRef(0);

    // Streaming text batching
    const pendingAssistantTextRef = useRef("");
    const animationFrameRef = useRef(null);


    /* =========================================
       CHECK SCROLL POSITION
    ========================================= */

    const handleScroll = () => {

        const container = chatContentRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        // User is considered at bottom if within 100px
        isAtBottomRef.current = distanceFromBottom < 100;
    };


    /* =========================================
       SAVE CURRENT SCROLL POSITION
    ========================================= */

    const saveScrollPosition = () => {

        const container = chatContentRef.current;

        if (!container) {
            return;
        }

        previousScrollHeightRef.current =
            container.scrollHeight;

        previousScrollTopRef.current =
            container.scrollTop;
    };


    /* =========================================
       RESTORE SCROLL POSITION AFTER DOM UPDATE
    ========================================= */

    useEffect(() => {

        const container = chatContentRef.current;

        if (!container) {
            return;
        }

        /*
         * If user is at bottom,
         * continue following the AI response.
         */
        if (isAtBottomRef.current) {

            container.scrollTop =
                container.scrollHeight;

            return;
        }


        /*
         * User has manually scrolled upward.
         *
         * Content became taller because a new AI chunk
         * was added.
         *
         * Keep the same visible content in the viewport.
         */

        const oldScrollHeight =
            previousScrollHeightRef.current;

        const oldScrollTop =
            previousScrollTopRef.current;

        if (oldScrollHeight === 0) {
            return;
        }


        const heightDifference =
            container.scrollHeight -
            oldScrollHeight;


        container.scrollTop =
            oldScrollTop + heightDifference;


    }, [messages]);


    /* =========================================
       FLUSH STREAMED TEXT
    ========================================= */

    const flushAssistantText = (assistantMessageId) => {

        const text =
            pendingAssistantTextRef.current;

        if (!text) {
            return;
        }


        pendingAssistantTextRef.current = "";


        setMessages(previous =>
            previous.map(message =>
                message.id !== assistantMessageId
                    ? message
                    : {
                        ...message,
                        content:
                            message.content + text
                    }
            )
        );
    };


    /* =========================================
       SEND MESSAGE
    ========================================= */

    const handleSendMessage = async (content) => {

        if (isStreaming) {
            return;
        }


        const userMessage = {
            id: Date.now(),
            role: "user",
            content
        };


        const assistantMessageId =
            Date.now() + 1;


        const assistantMessage = {
            id: assistantMessageId,
            role: "assistant",
            content: ""
        };


        /*
         * Save current scroll state before
         * adding the new messages.
         */

        saveScrollPosition();


        setMessages(previous => [
            ...previous,
            userMessage,
            assistantMessage
        ]);


        setIsStreaming(true);


        /*
         * A newly sent message should always
         * start from the bottom.
         */

        isAtBottomRef.current = true;


        /*
         * Wait until React renders the new
         * user + assistant message.
         */

        setTimeout(() => {

            const container =
                chatContentRef.current;

            if (!container) {
                return;
            }

            container.scrollTop =
                container.scrollHeight;

        }, 0);


        await sendMessageStream({

            content,

            chatId,


            /* =================================
               STREAM CHUNK
            ================================= */

            onChunk: (chunk) => {

                /*
                 * IMPORTANT:
                 *
                 * Before changing React state,
                 * remember the current viewport.
                 */

                if (!isAtBottomRef.current) {
                    saveScrollPosition();
                }


                pendingAssistantTextRef.current += chunk;


                /*
                 * Batch chunks using
                 * requestAnimationFrame.
                 */

                if (!animationFrameRef.current) {

                    animationFrameRef.current =
                        requestAnimationFrame(() => {

                            flushAssistantText(
                                assistantMessageId
                            );

                            animationFrameRef.current =
                                null;

                        });
                }

            },


            /* =================================
               STREAM COMPLETE
            ================================= */

            onDone: (data) => {

                /*
                 * Flush any text that is still waiting.
                 */

                flushAssistantText(
                    assistantMessageId
                );


                if (data?.chatId) {

                    setChatId(data.chatId);

                }

                 if (!chatId && data?.chatId) {
                  onChatCreated?.();
                }



                setIsStreaming(false);

            },


            /* =================================
               STREAM ERROR
            ================================= */

            onError: (error) => {

                console.error(
                    "AI streaming error:",
                    error
                );


                pendingAssistantTextRef.current =
                    "";


                setMessages(previous =>
                    previous.map(message =>
                        message.id !== assistantMessageId
                            ? message
                            : {
                                ...message,
                                content:
                                    error?.message ||
                                    "Something went wrong while generating the response."
                            }
                    )
                );


                setIsStreaming(false);

            }

        });

    };

    const loadChat = async (selectedChatId) => {
    try {
        const data = await getChatMessages(selectedChatId);

        console.log("Loaded chat:", data);

        setMessages(data.messages || []);
        setChatId(selectedChatId);

    } catch (error) {
        console.error("Failed to load chat:", error);
    }
};

useEffect(() => {
    if (!selectedChatId) {
        setMessages([]);
        setChatId(null);
        return;
    }

    loadChat(selectedChatId);
}, [selectedChatId,newChatKey]);


    const showWelcome =
        messages.length === 0;


    return (

        <div className="chat-window">

            <ChatHeader />


            {/* =================================
                CHAT CONTENT
            ================================= */}

            <div
                className={`chat-content ${
        showWelcome ? "welcome-mode" : "messages-mode"
    }`}
                ref={chatContentRef}
                onScroll={handleScroll}
            >

                {showWelcome ? (

                    <div className="welcome-container">

                        <div className="welcome-icon">
                            <Sparkles size={32} />
                        </div>


                        <h1>
                            How can I help you today?
                        </h1>


                        <p>
                            Ask Nova AI anything.
                        </p>


                        <div className="suggestions">

                            <button
                                onClick={() =>
                                    handleSendMessage(
                                        "Explain JavaScript in simple words"
                                    )
                                }
                            >
                                Explain JavaScript
                            </button>


                            <button
                                onClick={() =>
                                    handleSendMessage(
                                        "Give me a React learning roadmap"
                                    )
                                }
                            >
                                React roadmap
                            </button>


                            <button
                                onClick={() =>
                                    handleSendMessage(
                                        "Explain REST API"
                                    )
                                }
                            >
                                Explain REST API
                            </button>

                        </div>

                    </div>

                ) : (

                    <div className="messages-container">

                        {messages.map(message => (

                            <div
                                key={message.id}
                                className={`message ${
                                    message.role === "user"
                                        ? "user-message"
                                        : "assistant-message"
                                }`}
                            >

                                <div className="message-content">

                                    {message.role === "assistant" ? (

                                        <ReactMarkdown
                                            remarkPlugins={[
                                                remarkGfm
                                            ]}
                                        >
                                            {message.content}
                                        </ReactMarkdown>

                                    ) : (

                                        message.content

                                    )}


                                    {message.role === "assistant" &&
                                        isStreaming &&
                                        message.id ===
                                        messages[messages.length - 1]?.id && (

                                            <span className="typing-cursor">
                                                ▌
                                            </span>

                                        )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* =================================
                MESSAGE INPUT
            ================================= */}

            <MessageInput
                onSend={handleSendMessage}
                disabled={isStreaming}
            />

        </div>

    );
}


export default ChatWindow;