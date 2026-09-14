import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BsSendFill } from "react-icons/bs";
import "../Styling/chatBot.css";

function ChatBot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const clearChat = () => {
        setInput('');
        setMessages([])
    }

    const sendMessage = async () => {
        if (!input) return; // ✅ fixed

        const userText = input;

        // show user message
        setMessages(prev => [...prev, { role: "user", text: userText }]);
        setInput("");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText })
            });

            const data = await res.json();

            // show bot reply
            setMessages(prev => [...prev, { role: "bot", text: data.reply }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "bot", text: "Error getting response" }]);
        }
    };

    return (
        <div className="chatbot-wrapper chatbot-float">

            {/* HEADER */}
            <div className="chatbot-header d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center">

                    <div className="bot-avatar">
                        🤖
                    </div>

                    <div className="ms-3">
                        <h5 className="mb-0 fw-bold">
                            AI Security Assistant
                        </h5>

                        <small className="text-light opacity-75">
                            Online
                        </small>
                    </div>
                </div>

                <button
                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                    onClick={clearChat}
                >
                    Clear Chat
                </button>
            </div>

            {/* CHAT AREA */}
            <div className="chat-area">

                {messages.length === 0 && (

                    <div className="empty-chat">

                        <div className="empty-icon">
                            🛡️
                        </div>

                        <h4>
                            Welcome to PhishAware AI
                        </h4>

                        <p>
                            Ask anything about cybersecurity,
                            phishing awareness, or email safety.
                        </p>
                    </div>
                )}

                {messages.map((m, i) => (

                    <div
                        key={i}
                        className={`message-row ${m.role === "user"
                            ? "user-row"
                            : "bot-row"
                            }`}
                    >

                        <div
                            className={`message-bubble ${m.role === "user"
                                ? "user-bubble"
                                : "bot-bubble"
                                }`}
                        >

                            <div className="message-role">
                                {m.role === "user"
                                    ? "You"
                                    : "AI Assistant"}
                            </div>

                            <div>
                                <div className="markdown-output">

                                    <ReactMarkdown>
                                        {m.text}
                                    </ReactMarkdown>

                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* INPUT AREA */}
            <div className="chat-input-area">

                <input
                    className="form-control chat-input"
                    placeholder="Ask something about cybersecurity..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />

                <button
                    className="btn btn-send"
                    onClick={sendMessage}
                >
                    <BsSendFill aria-hidden />
                </button>
            </div>
        </div>
    );
}
export default ChatBot;