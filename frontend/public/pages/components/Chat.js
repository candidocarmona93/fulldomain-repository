import { BaseWidget } from "../../../src/core/BaseWidget";
import { Container } from "../../../src/widgets/layouts/Container";
import { Column } from "../../../src/widgets/layouts/Column";
import { Row } from "../../../src/widgets/layouts/Row";
import { Icon } from "../../../src/widgets/elements/Icon";
import { IconButton } from "../../../src/widgets/buttons/IconButton";
import { Text } from "../../../src/widgets/elements/Text";
import { TextAreaInput } from "../../../src/widgets/forms/TextAreaInput";
import { Builder } from "../../../src/widgets/builders/Builder";
import { Position } from "../../../src/themes/Position";
import { VirtualAssistantService } from "../../services/VirtualAssistantService";

import "../../assets/styles/chat.css";

export class Chat extends BaseWidget {
    constructor() {
        super({
            className: ["d-chat-widget"]
        });

        this.isOpen = false;
        this.conversationHistory = [];

        this.initState({
            isTyping: false,
            messages: [
                {
                    id: 1,
                    text: "Olá! Sou assistente virtual da casa coimbra maputo. Como posso ajudá-lo hoje?",
                    isBot: true,
                    timestamp: this.getCurrentTime()
                },
            ],
            isMinimized: true,
        });
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async toggleChat() {
        this.setState(prev => {
            return {
                isMinimized: !prev.isMinimized
            }
        })
    }

    async sendMessage(text) {
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: text,
            isBot: false,
            timestamp: this.getCurrentTime()
        };

        this.setState(prev => {
            return {
                messages: [...prev.messages, userMsg],
                isTyping: true
            }
        });


        try {
            const result = await VirtualAssistantService.chat({
                message: text,
                conversationHistory: this.conversationHistory
            });

            if (result.conversationHistory) {
                this.conversationHistory = result.conversationHistory;
            }

            const botMsg = {
                id: Date.now() + 1,
                text: result.response,
                isBot: true,
                timestamp: this.getCurrentTime()
            };

            this.setState(prev => {
                return {
                    messages: [...prev.messages, botMsg],
                    isTyping: false
                }
            });

        } catch (error) {
            console.error("Chat Error:", error);

            const errorMsg = {
                id: Date.now() + 1,
                text: "Desculpe, ocorreu um erro. Tente novamente mais tarde.",
                isBot: true,
                timestamp: this.getCurrentTime()
            };

            this.setState(prev => {
                return {
                    messages: [...prev.messages, errorMsg],
                    isTyping: false
                }
            });
        }
    }

    createChatHeader() {
        return new Container({
            className: ["d-chat-header"],
            children: [
                new Container({
                    className: ["d-chat-header-dept"],
                    children: [
                        new Icon({
                            icon: "fa fa-user-circle",
                            style: {
                                fontSize: "1.5rem",
                                opacity: "0.9"
                            }
                        }),
                        new Column({
                            gap: 0,
                            children: [
                                new Text({
                                    text: "Assistente virtual",
                                    style: {
                                        fontSize: "0.9375rem",
                                        fontWeight: "600",
                                        letterSpacing: "-0.2px",
                                        color: "#fff"
                                    }
                                }),
                                new Text({
                                    text: "Online agora",
                                    className: ["d-chat-status"],
                                    style: {
                                        fontSize: "0.75rem",
                                        fontWeight: "500",
                                        opacity: "0.9",
                                        color: "#fff"
                                    }
                                })
                            ]
                        })
                    ]
                }),

                new IconButton({
                    icon: new Icon({
                        icon: "fa fa-times",
                        style: {
                            fontSize: "1rem",
                            opacity: "0.9"
                        }
                    }),
                    onPressed: () => this.toggleChat(),
                    style: {
                        background: "rgba(255, 255, 255, 0.1)",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        transition: "all 0.2s ease"
                    },
                    hoverStyle: {
                        background: "rgba(255, 255, 255, 0.2)"
                    }
                })
            ]
        });
    }

    createTypingIndicator() {
        return new Container({
            className: ["d-chat-message", "d-chat-message-bot"],
            children: [
                new Container({
                    className: ["d-chat-message-bubble"],
                    style: {
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        minHeight: "40px"
                    },
                    children: [
                        new Container({ className: ["typing-dot"] }),
                        new Container({ className: ["typing-dot"] }),
                        new Container({ className: ["typing-dot"] })
                    ]
                })
            ]
        });
    }

    createChatBody() {
        return new Container({
            className: ["d-chat-body"],
            style: {
                flex: 1,
                minHeight: 0,
                background: "var(--neutral-50)"
            },
            children: [
                new Builder({
                    className: ["d-chat-messages"],
                    style: {
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "1rem"
                    },
                    watch: () => {
                        const messages = this.state.messages;
                        const isTyping = this.state.isTyping;

                        console.log(messages)

                        const messageElements = messages.map(msg =>
                            new Container({
                                className: ["d-chat-message", msg.isBot ? "d-chat-message-bot" : "d-chat-message-user"],
                                style: {
                                    marginBottom: "1rem"
                                },
                                children: [
                                    new Container({
                                        className: ["d-chat-message-bubble"],
                                        children: [
                                            new Text({
                                                text: msg.text,
                                                className: [!msg.isBot ? "d-chat-message-text" : null].filter(Boolean),
                                                style: {
                                                    lineHeight: "1.5",
                                                }
                                            })
                                        ]
                                    }),
                                    new Text({
                                        text: msg.timestamp,
                                        className: ["d-chat-message-timestamp"],
                                        style: {
                                            alignSelf: msg.isBot ? "flex-start" : "flex-end"
                                        }
                                    })
                                ]
                            })
                        );

                        if (isTyping) {
                            messageElements.push(this.createTypingIndicator());
                        }

                        return new Container({
                            children: messageElements
                        });
                    }
                })
            ]
        });
    }

    createChatInput() {
        return new Row({
            className: ["d-chat-input-container"],
            style: {
                gap: "0.75rem",
                alignItems: "flex-end"
            },
            children: [
                new TextAreaInput({
                    className: ["d-chat-textarea"],
                    placeholder: "Como podemos ajudar?",
                    style: {
                        flex: 1,
                        minHeight: "44px",
                        maxHeight: "120px"
                    },
                    events: {
                        keydown: (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const inputVal = this.inputValElement.value.trim();

                                if (inputVal) {
                                    this.sendMessage(inputVal);
                                    this.inputValElement.value = "";
                                    this.inputValElement.style.height = 'auto';
                                }
                            }
                        },
                        input: (e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }
                    },
                    onAttached: (_, refs) => {
                        this.inputValElement = refs.inputElement;
                    }
                }),
            ]
        });
    }

    createPage() {
        return new Builder({
            watch: () => {
                const isMinimized = this.state.isMinimized;

                if (isMinimized) return new Container({
                    position: Position.fixed.bottomRight,
                    style: {
                        zIndex: 999,
                        bottom: "60px",
                        right: "10px"
                    },
                    children: [
                        new IconButton({
                            className: ["d-chat-button-pulse"],
                            icon: new Icon({
                                icon: "fa fa-comments",
                                style: { fontSize: "1.25rem" }
                            }),
                            onPressed: () => this.toggleChat()
                        })
                    ]
                });

                return new Container({
                    className: ["d-chat-widget-container"],
                    position: Position.fixed.bottomRight,
                    children: [
                        new Column({
                            gap: 0,
                            style: {
                                minHeight: 0
                            },
                            children: [
                                this.createChatHeader(),
                                this.createChatBody(),
                                this.createChatInput()
                            ]
                        })
                    ]
                });
            }
        })
    }

    render() {
        this.children = [this.createPage()];
        return super.render();
    }
}