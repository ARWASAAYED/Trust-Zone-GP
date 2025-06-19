import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { FaMicrophoneAlt } from "react-icons/fa";
import { FaMicrophoneLinesSlash } from "react-icons/fa6";
import { LuCopy } from "react-icons/lu";
import { MdOutlineRefresh } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { BiCross } from "react-icons/bi";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'hello im fine how can i help you' },
    { sender: 'user', text: 'what is the best programming language' },
    { sender: 'bot', text: 'there are many programming languages in the market that are used in designing and building websites various applications and other tasks all these languages are popular in their place and in the way they are used and many programmers learn and use them' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'what is the best programming language', messages: [
      { sender: 'bot', text: 'hello im fine how can i help you' },
      { sender: 'user', text: 'what is the best programming language' },
      { sender: 'bot', text: 'there are many programming languages in the market that are used in designing and building websites various applications and other tasks all these languages are popular in their place and in the way they are used and many programmers learn and use them' },
    ]},
  ]);
  const [currentConversationId, setCurrentConversationId] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);
  const [editConversationTitle, setEditConversationTitle] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);

  const prompts = [
    'find an accessible park near me',
    'what events are happening this weekend',
    'book a spot for a workshop',
    'can you suggest a community for people with disabilities',
  ];

  const sanitizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim();
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = sanitizeText(event.results[0][0].transcript);
        setNewMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        alert('Speech recognition error: ' + event.error);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        setIsListening(true);
        recognition.start();
      }
    } else {
      alert('Speech Recognition is not supported in this browser.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const sanitizedMessage = sanitizeText(newMessage);
      const newUserMessage = { sender: 'user', text: sanitizedMessage };
      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);
      
      // Check if this is the first user message in a new conversation
      const isFirstMessage = messages.length === 0;
      
      setChatHistory((prev) => {
        return prev.map((conv) => {
          if (conv.id === currentConversationId) {
            // If this is the first message, use it as the conversation title
            if (isFirstMessage) {
              return { 
                ...conv, 
                title: sanitizedMessage.length > 25 ? sanitizedMessage.substring(0, 25) + '...' : sanitizedMessage,
                messages: updatedMessages 
              };
            }
            return { ...conv, messages: updatedMessages };
          }
          return conv;
        });
      });
      
      setNewMessage('');
      setTimeout(() => {
        const botResponse = { sender: 'bot', text: 'im searching for accessible options based on your request please wait a moment' };
        setMessages((prev) => {
          const newMessages = [...prev, botResponse];
          setChatHistory((prevHistory) =>
            prevHistory.map((conv) =>
              conv.id === currentConversationId
                ? { ...conv, messages: newMessages }
                : conv
            )
          );
          return newMessages;
        });
      }, 1000);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setChatHistory((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: [] }
          : conv
      )
    );
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Text copied to clipboard!');
    });
  };

  const handleRegenerateResponse = (messageIndex) => {
    setIsRegenerating(true);
    let botResponseIndex = -1;
    for (let i = messageIndex + 1; i < messages.length; i++) {
      if (messages[i].sender === 'bot') {
        botResponseIndex = i;
        break;
      }
    }
    let updatedMessages = [...messages];
    if (botResponseIndex !== -1) {
      updatedMessages = messages.filter((_, index) => index !== botResponseIndex);
    }
    setMessages(updatedMessages);
    setChatHistory((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: updatedMessages }
          : conv
      )
    );
    setTimeout(() => {
      const botResponse = { sender: 'bot', text: 'heres a regenerated response for your request' };
      setMessages((prev) => {
        const newMessages = [...prev, botResponse];
        setChatHistory((prevHistory) =>
          prevHistory.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, messages: newMessages }
              : conv
          )
        );
        return newMessages;
      });
      setIsRegenerating(false);
    }, 1000);
  };

  const handleSelectConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setActiveConversation(null);
  };

  const handleNewChat = () => {
    const newConversationId = chatHistory.length + 1;
    const newConversation = {
      id: newConversationId,
      title: `New Conversation`,
      messages: [],
    };
    setChatHistory([...chatHistory, newConversation]);
    setMessages([]);
    setCurrentConversationId(newConversationId);
  };

  const handleDeleteConversation = (conversationId) => {
    const updatedChatHistory = chatHistory.filter((conv) => conv.id !== conversationId);
    setChatHistory(updatedChatHistory);
    if (currentConversationId === conversationId) {
      if (updatedChatHistory.length > 0) {
        setMessages(updatedChatHistory[0].messages);
        setCurrentConversationId(updatedChatHistory[0].id);
      } else {
        const newConversationId = 1;
        const newConversation = {
          id: newConversationId,
          title: `New Conversation`,
          messages: [],
        };
        setChatHistory([newConversation]);
        setMessages([]);
        setCurrentConversationId(newConversationId);
      }
    }
    setActiveConversation(null);
  };

  const handleEditConversationTitle = (conversation) => {
    setEditingConversation(conversation.id);
    setEditConversationTitle(conversation.title);
  };

  const handleSaveConversationTitle = () => {
    if (editConversationTitle.trim()) {
      setChatHistory((prev) =>
        prev.map((conv) =>
          conv.id === editingConversation
            ? { ...conv, title: editConversationTitle }
            : conv
        )
      );
    }
    setEditingConversation(null);
    setEditConversationTitle('');
    setActiveConversation(null);
  };

  const handleToggleConversationActions = (conversationId) => {
    if (activeConversation === conversationId) {
      setActiveConversation(null);
    } else {
      setActiveConversation(conversationId);
    }
  };

  const handleEditMessage = (index, text) => {
    setEditingMessageIndex(index);
    setEditText(text);
  };

  const handleSaveEdit = (index) => {
    const sanitizedEditText = sanitizeText(editText);
    const updatedMessages = messages.map((msg, i) =>
      i === index ? { ...msg, text: sanitizedEditText } : msg
    );
    setMessages(updatedMessages);
    setChatHistory((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: updatedMessages }
          : conv
      )
    );
    setEditingMessageIndex(null);
    setEditText('');
  };

  const handleBrowsePrompts = () => {
    setShowPrompts(!showPrompts);
  };

  const handleSelectPrompt = (prompt) => {
    setNewMessage(prompt);
    setShowPrompts(false);
  };

  return (
    <div className="py-5" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={6} md={6} sm={12} className="mb-4">
          <div className="d-flex align-items-center mb-4">
            <div
            className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center me-3"
            style={{
            width: '70px',
            height: '70px',
            }}>
                <img src="/images/bot.png" alt="Bot" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
            </div>
            <h2 className="fw-bold m-0" style={{ color: '#0A3D62' }}>
                Chat Bot AI
            </h2>
        </div>


            {/* Redesigned Card to match the screenshot */}
            <Card className="border-0 shadow-lg" style={{ height: '70vh', overflowY: 'auto', borderRadius: '20px' }}>
              <Card.Header className="bg-white border-0">
                <Button variant="light" className="border-0 p-0 mb-2">
                <BiCross width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" ></path>
                  </BiCross>
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="mb-3"
                    style={{ 
                      backgroundColor: message.sender === 'user' ? 'transparent' : 'transparent',
                      padding: '12px 16px',
                    }}
                  >
                   {message.sender === 'bot' && (
                        <div className="d-flex align-items-start">
                            <div
                            className="rounded-circle d-flex justify-content-center align-items-center me-3"
                            style={{ 
                            width: '32px', 
                            height: '32px', 
                            overflow: 'hidden',
                            }}
                            >
                            <img src="/images/bot.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <div style={{ flexGrow: 1 }}>
                            {editingMessageIndex === index ? (
                                <div>
                                <Form.Control
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="mb-2"
                                />
                                <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveEdit(index)}
                                >
                                Save
                                </Button>
                                <Button
                                variant="secondary"
                                size="sm"
                                className="ms-2"
                                onClick={() => setEditingMessageIndex(null)}
                                >
                                Cancel
                                </Button>
                                </div>
                                ) : (
                                <>
                                <p 
                                    className="mb-1 p-3" 
                                    style={{ 
                                    color: '#333', 
                                    fontSize: '15px',
                                    backgroundColor: '#f0f0f0', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                                    borderRadius:'0px 25px 25px 25px',
                                    display: 'inline-block', 
                                    maxWidth: '80%',         
                                    wordBreak: 'break-word'
                                    }}
                                >
                                {message.text}
                                </p>
                                <div className="d-flex mt-2">
            <Button
              variant="link"
              size="sm"
              className="p-0 me-3 text-decoration-none"
              style={{ color: '#6c757d', fontSize: '13px' }}
              onClick={() => handleCopyText(message.text)}
            >
              <LuCopy className="me-2" />
              Copy
            </Button>
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              style={{ color: '#6c757d', fontSize: '13px' }}
              onClick={() => handleRegenerateResponse(index)}
              disabled={isRegenerating}
            >
              <MdOutlineRefresh className="me-2" style={{fontSize:'18px'}}/>
              {isRegenerating ? (
                <Spinner animation="border" size="sm"/>
              ) : (
                'Regenerate'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  </div>
)}
                    
                    {message.sender === 'user' && (
                      <div className="d-flex flex-column align-items-end">
                        <div 
                          className="p-3 text-white" 
                          style={{ 
                            backgroundColor: '#0A3D62', 
                            maxWidth: '85%',
                            borderRadius:'25px 1px 25px 25px'
                          }}
                        >
                          {editingMessageIndex === index ? (
                            <div>
                              <Form.Control
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="mb-2"
                              />
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleSaveEdit(index)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="ms-2"
                                onClick={() => setEditingMessageIndex(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <p className="m-0">{message.text}</p>
                          )}
                        </div>
                        <div className="mt-1">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 me-2 text-decoration-none"
                            style={{ color: '#6c757d', fontSize: '13px' }}
                            onClick={() => handleEditMessage(index, message.text)}
                          >
                            <FaRegEdit className="me-2" />
                            Edit
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            style={{ color: '#6c757d', fontSize: '13px' }}
                            onClick={() => handleCopyText(message.text)}
                          >
                             <LuCopy className="me-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Form onSubmit={handleSendMessage} className="mt-4">
              <Row className="align-items-center">
                <Col xs={12} md={8}>
                  <Form.Control
                    type="text"
                    placeholder="Write your message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="rounded-pill shadow-sm border-0"
                    style={{ padding: '12px 20px' }}
                  />
                </Col>
                <Col xs={12} md={4} className="mt-3 mt-md-0 d-flex justify-content-end">
                  <Button
                    variant={isListening ? 'danger' : 'secondary'}
                    className="rounded-circle me-2"
                    onClick={handleVoiceInput}
                    style={{ width: '50px', height: '50px' }}
                    title={isListening ? 'Stop Listening' : 'Start Voice Input'}
                  >
                    {isListening ? <FaMicrophoneLinesSlash style={{fontSize:'20px'}} /> : <FaMicrophoneAlt />}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-circle text-white"
                    style={{ backgroundColor: '#0A3D62', borderColor: '#0A3D62', width: '50px', height: '50px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </Button>
                </Col>
              </Row>
              <div className="d-flex mt-3">
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="me-2 rounded-pill"
                  onClick={handleClearChat}
                >
                  Clear Chat
                </Button>
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="rounded-pill"
                  onClick={handleBrowsePrompts}
                >
                  Browse Prompts
                </Button>
              </div>
              {showPrompts && (
                <Card className="mt-2 shadow-sm">
                  <Card.Body>
                    <ListGroup variant="flush">
                      {prompts.map((prompt, index) => (
                        <ListGroup.Item
                          key={index}
                          className="border-0 p-2"
                          style={{ cursor: 'pointer', color: '#0A3D62' }}
                          onClick={() => handleSelectPrompt(prompt)}
                        >
                          {prompt}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}
            </Form>
          </Col>

          <Col lg={3} md={3} sm={12} className="mb-4" style={{ marginTop: '5.5%' }}>
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#0A3D62' }}>Chat History</h5>
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none d-flex align-items-center"
                    style={{ color: '#0A3D62' }}
                    onClick={handleNewChat}
                    title="New Chat"
                  >
                    + New Chat
                  </Button>
                </div>
                <ListGroup variant="flush">
                  {chatHistory.map((conversation) => (
                    <ListGroup.Item
                      key={conversation.id}
                      className="border-0 p-2"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        {editingConversation === conversation.id ? (
                          <div className="d-flex w-100">
                            <Form.Control
                              type="text"
                              value={editConversationTitle}
                              onChange={(e) => setEditConversationTitle(e.target.value)}
                              size="sm"
                              className="me-2"
                              autoFocus
                            />
                            <Button
                              variant="success"
                              size="sm"
                              onClick={handleSaveConversationTitle}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span 
                              onClick={() => handleSelectConversation(conversation)}
                              style={{ 
                                color: currentConversationId === conversation.id ? '#0A3D62' : '#6c757d',
                                fontWeight: currentConversationId === conversation.id ? 'bold' : 'normal',
                                flexGrow: 1
                              }}
                            >
                              {conversation.title}
                            </span>
                            <Button
                              variant="light"
                              size="sm"
                              className="p-0 px-2"
                              onClick={() => handleToggleConversationActions(conversation.id)}
                            >
                              ⋮
                            </Button>
                          </>
                        )}
                      </div>
                      {activeConversation === conversation.id && (
                        <div className="mt-2 d-flex">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditConversationTitle(conversation)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteConversation(conversation.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            <Card
              className="border-0 shadow-sm text-center"
              style={{ background: 'linear-gradient(180deg, #A3E4D7 0%, rgb(123, 199, 198))', borderRadius: '20px' }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3 text-white">Pro Plan</h5>
                <h3 className="text-white mb-3">$126.54/month</h3>
                <p className="text-white mb-4">
                  Get priority access to events, community features, and personalized accessibility recommendations.
                </p>
                <Button
                  className="rounded-pill text-white"
                  style={{ backgroundColor: '#0A3D62', borderColor: '#0A3D62' }}
                >
                  Get Pro Plan Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Chatbot;