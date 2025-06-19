import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Container,
  Badge,
} from "react-bootstrap";
import {
  FaPaperPlane,
  FaCircle,
  FaStop,
  FaPlay,
  FaImage,
  FaSearch,
  FaMicrophone,
  FaUser,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaHome,
  FaUserEdit,
  FaPlus,
  FaSignOutAlt,
  FaRegEdit,
  FaRegCopy,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import apiClient from "../api/apiClient";
import { useLocation, useNavigate } from "react-router-dom";

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserProfileVisible, setIsUserProfileVisible] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showOwnProfile, setShowOwnProfile] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRefs = useRef({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const profilePicInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessageContent, setEditedMessageContent] = useState("");

  const [reviewerProfiles, setReviewerProfiles] = useState({});

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    id: "",
    userName: "",
    email: "",
    age: 0,
    disabilityType: "",
    profilePictureUrl: "/images/profile.png",
  });

  // Conversations state
  const [conversations, setConversations] = useState([]);

  // Get navigation state
  const location = useLocation();
  const navigate = useNavigate();

  // Effect to handle conversation creation when navigated from Map
  useEffect(() => {
    const targetUserId = location.state?.targetUserId;
    if (targetUserId) {
      // Trigger conversation creation with this user ID
      handleNewConversation(null, targetUserId); // Pass null for event and the targetUserId
    }

    window.history.replaceState({}, document.title);
  }, [location.state?.targetUserId]); // Depend on targetUserId in location state

  // Add authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Auth Token:", token);
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);

  // Update fetchUserProfile to include token check
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await apiClient.get("/UserProfile");
        if (response && response.data) {
          setUserProfile({
            id: response.data.id || "",
            userName: response.data.userName || "",
            email: response.data.email || "",
            age: response.data.age || 0,
            disabilityType:
              response.data.disabilityTypes &&
              response.data.disabilityTypes.length > 0
                ? response.data.disabilityTypes[0].name ||
                  response.data.disabilityTypes[0] ||
                  ""
                : "",
            profilePictureUrl:
              response.data.profilePictureUrl || "/images/profile.png",
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        if (err.response?.status === 401 || err.response?.status === 400) {
          // Clear invalid token and redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else if (err.message && err.message.includes("Network Error")) {
          setError("CORS error: Cannot access the API from this domain.");
        } else if (err.response && err.response.status === 500) {
          setError("Server error: Something went wrong on the server.");
        } else if (err.response && err.response.status === 404) {
          setError("Endpoint not found. Check the API path with the provider.");
        } else {
          setError("An error occurred while loading your profile.");
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return []; // Return empty array if not authenticated
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get("/Conversation/user");
      const data = response.data;

      console.log("Raw conversation data:", data); // Debug log

      // Transform API data to match our UI structure
      const transformedConversations = await Promise.all(
        data.map(async (conv) => {
          // Determine the other participant (userId2)
          const participant =
            conv.user1?.id === userProfile?.id ? conv.user2 : conv.user1;

          // Fetch participant's profile
          let participantProfile = null;
          if (participant?.id) {
            try {
              const profileResponse = await apiClient.get(
                `/UserProfile/${participant.id}`
              );
              participantProfile = profileResponse.data;
              console.log("Fetched participant profile:", participantProfile); // Debug log
            } catch (err) {
              console.error(
                `Error fetching profile for user ${participant.id}:`,
                err
              );
            }
          }

          return {
            id: conv.id,
            // Store the user IDs for message sending
            user1Id: conv.user1?.id,
            user2Id: conv.user2?.id,
            // Use the userName from the participant object
            name: participant?.userName || "Unknown User",
            // Use the profile picture from the fetched profile
            profilePhoto:
              participantProfile?.profilePictureUrl || "/images/profile.png",
            // Add user profile information
            email: participantProfile?.email || null,
            age: participantProfile?.age || null,
            disabilityType: participantProfile?.disabilityType || null,
            messages: Array.isArray(conv.messages)
              ? conv.messages.map((msg) => ({
                  text: msg.content,
                  sender: msg.senderId === userProfile?.id ? "you" : "other",
                  timestamp: new Date(msg.timestamp).toLocaleDateString(),
                  time: new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  type: msg.messageType,
                  ...(msg.messageType === "image" && {
                    imageUrl: msg.mediaUrl,
                  }),
                  ...(msg.messageType === "voice" && {
                    audioUrl: msg.mediaUrl,
                    duration: msg.duration,
                  }),
                }))
              : [],
            lastMessage: conv.lastMessageContent || "No messages yet",
            lastMessageTime: conv.lastMessageAt
              ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            online: false,
            unreadCount: conv.unreadCount || 0,
            sharedMedia: Array.isArray(conv.sharedMedia)
              ? conv.sharedMedia
              : [],
          };
        })
      );

      console.log("Transformed conversations:", transformedConversations); // Debug log

      setConversations(transformedConversations);
      // Select the first conversation if available and no chat is currently selected
      if (transformedConversations.length > 0 && selectedChat === null) {
        setSelectedChat(0);
      }
      return transformedConversations;
    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (err.response?.status === 401 || err.response?.status === 400) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        setError("Conversations endpoint not found (404). Check API path.");
      } else if (err.response?.status === 405) {
        setError(
          "Conversations endpoint method not allowed (405). Check API documentation."
        );
      } else {
        setError("Failed to load conversations. Please try again.");
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch conversations only if userProfile.id is available
    if (userProfile?.id) {
      // Add null check for userProfile
      fetchConversations();
    }
  }, [userProfile?.id]); // Depend on userProfile.id only for initial fetch

  // Add a check for selected chat in the render
  const selectedConversation =
    selectedChat !== null ? conversations[selectedChat] : null;

  // Handle new conversation creation (used by modal and navigation)
  const handleNewConversation = async (
    e,
    targetUserIdFromNavigation = null
  ) => {
    if (e) e.preventDefault(); // Prevent default form submission if event is provided

    const targetUserId =
      targetUserIdFromNavigation || e?.target?.userId2?.value;

    if (!targetUserId) {
      console.error("No target user ID provided");
      setError("Please provide a user ID to start a conversation");
      return;
    }

    console.log("Creating conversation with user ID:", targetUserId);

    try {
      // Create the conversation without sending an initial message
      const conversationResponse = await apiClient.post("/Conversation", {
        User2Id: targetUserId,
      });

      console.log("Conversation creation response:", conversationResponse.data);

      if (!conversationResponse.data) {
        throw new Error("No conversation ID returned from API");
      }

      // Refresh the conversation list
      await fetchConversations();

      // Close the modal if it was open
      setShowNewConversation(false);
      setError(null);
    } catch (err) {
      console.error("Error in handleNewConversation:", err);
      // Remove error display to prevent showing 500 status code error
      // The error will still be logged to console for debugging
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        // Get the current conversation
        const currentConversation = conversations[selectedChat];
        if (!currentConversation) {
          throw new Error("No conversation selected");
        }

        // Get the other participant's ID from the conversation
        const otherParticipant =
          currentConversation.user1Id === userProfile?.id
            ? currentConversation.user2Id
            : currentConversation.user1Id;

        console.log("Sending message to user:", otherParticipant);

        if (!otherParticipant) {
          throw new Error(
            "Could not determine recipient - missing user ID in conversation"
          );
        }

        // Create the new message object first
        const newMsg = {
          text: newMessage,
          sender: "you",
          timestamp: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Update the UI immediately
        const updatedConversations = [...conversations];
        updatedConversations[selectedChat].messages.push(newMsg);
        updatedConversations[selectedChat].lastMessage = newMessage;
        updatedConversations[selectedChat].lastMessageTime = newMsg.time;
        updatedConversations[selectedChat].unreadCount = 0;
        setConversations(updatedConversations);
        setNewMessage("");

        // Send the message to the API and get the response
        const response = await apiClient.post("/Message", {
          content: newMessage,
          User2Id: otherParticipant,
        });

        // Check if the API response contains the sent message data
        if (response.data) {
          // Update the message object with data from the API response
          const sentMessage = response.data;
          const updatedNewMsg = {
            text: sentMessage.content,
            sender: sentMessage.senderId === userProfile?.id ? "you" : "other",
            // Use the timestamp from the API response
            timestamp: new Date(sentMessage.sentAt).toLocaleDateString(),
            time: new Date(sentMessage.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            // Include other relevant fields from the API response
            type: sentMessage.messageType || "text", // Assuming 'text' as default
            isRead: sentMessage.isRead,
            // Add any media URLs if present in the response
            ...(sentMessage.messageType === "image" && {
              imageUrl: sentMessage.mediaUrl,
            }),
            ...(sentMessage.messageType === "voice" && {
              audioUrl: sentMessage.mediaUrl,
              duration: sentMessage.duration,
            }),
          };

          // Find the index of the temporarily added message in the state
          const tempMessageIndex = updatedConversations[
            selectedChat
          ].messages.findIndex((msg) => msg === newMsg);

          // Replace the temporary message with the one from the API response
          if (tempMessageIndex !== -1) {
            updatedConversations[selectedChat].messages[tempMessageIndex] =
              updatedNewMsg;
          } else {
            // If somehow the temporary message wasn't found, just add the API response message
            updatedConversations[selectedChat].messages.push(updatedNewMsg);
          }

          // Update last message and time for sorting/display in sidebar
          updatedConversations[selectedChat].lastMessage = updatedNewMsg.text;
          updatedConversations[selectedChat].lastMessageTime =
            updatedNewMsg.time;

          setConversations(updatedConversations);
        } else {
          console.warn(
            "API did not return message data after sending.",
            response
          );
          // If API didn't return data, the UI will keep the locally created message
        }

        // Scroll to the bottom of the messages
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message: " + (err.message || "Unknown error"));
      }
    }
  };

  // Update the messages container to scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation?.messages]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await apiClient.put("/UserProfile", {
        userName: formData.get("name"),
        email: formData.get("email"),
        age: formData.get("age"),
        disabilityType: formData.get("disabilityType"),
      });

      setUserProfile((prev) => ({
        ...prev,
        userName: formData.get("name") || prev.userName,
        email: formData.get("email") || prev.email,
        age: formData.get("age") || prev.age,
        disabilityType: formData.get("disabilityType") || prev.disabilityType,
      }));
      setShowEditProfile(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError("Failed to update profile. Please try again.");
      }
    }
  };

  // Handle profile image upload
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserProfile((prev) => ({ ...prev, profilePictureUrl: imageUrl }));
      e.target.value = null;
    }
  };

  // Format recording time as MM:SS
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        const updatedConversations = [...conversations];
        const newVoiceMsg = {
          text: "Voice message",
          type: "voice",
          audioUrl: audioUrl,
          duration: recordingTime * 1000,
          sender: "you",
          timestamp: "Today",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        updatedConversations[selectedChat].messages.push(newVoiceMsg);
        updatedConversations[selectedChat].lastMessage = "Voice message";
        updatedConversations[selectedChat].lastMessageTime = newVoiceMsg.time;
        updatedConversations[selectedChat].unreadCount = 0;

        setConversations(updatedConversations);

        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        setRecordingTime(0);

        if (updatedConversations[selectedChat].online) {
          setTimeout(() => {
            const reply = {
              text: "I listened to your voice message. Thanks!",
              sender: "other",
              timestamp: "Today",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            const updatedAgain = [...updatedConversations];
            updatedAgain[selectedChat].messages.push(reply);
            updatedAgain[selectedChat].lastMessage = reply.text;
            updatedAgain[selectedChat].lastMessageTime = reply.time;
            updatedAgain[selectedChat].unreadCount += 1;
            setConversations(updatedAgain);
          }, 1000);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Unable to start recording. Please ensure microphone access is granted."
      );
      setIsRecording(false);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clean up recording timer when component unmounts
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Handle audio playback
  const handlePlayAudio = (messageId) => {
    const audio = audioRefs.current[messageId];

    if (audio) {
      if (playingAudio === messageId) {
        audio.pause();
        audio.currentTime = 0;
        setPlayingAudio(null);
      } else {
        if (playingAudio) {
          const prevAudio = audioRefs.current[playingAudio];
          prevAudio.pause();
          prevAudio.currentTime = 0;
        }

        setPlayingAudio(messageId);
        audio.play();

        audio.onended = () => {
          setPlayingAudio(null);
          audio.currentTime = 0;
        };
      }
    }
  };

  // Add logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Add this new function to fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await apiClient.get(
        `/Message/conversation/${conversationId}`
      );
      console.log("Fetched messages:", response.data);

      // Sort messages by timestamp (sentAt) in ascending order
      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
      );

      // Transform messages to match our UI structure
      const transformedMessages = sortedMessages.map((msg) => {
        // Debugging date and time handling
        console.log("Raw sentAt from API:", msg.sentAt);
        const messageDate = new Date(msg.sentAt);
        // Add 3 hours to the timestamp
        messageDate.setHours(messageDate.getHours() + 3);
        console.log("new Date(msg.sentAt) + 3 hours:", messageDate);
        const formattedDate = messageDate.toLocaleDateString();
        const formattedTime = messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        console.log("toLocaleDateString():", formattedDate);
        console.log("toLocaleTimeString():", formattedTime);

        return {
          id: msg.id,
          text: msg.content,
          sender: msg.senderId === userProfile?.id ? "you" : "other",
          timestamp: messageDate.toISOString(),
          time: formattedTime,
          type: msg.messageType || "text",
          isRead: msg.isRead,
          ...(msg.messageType === "image" && { imageUrl: msg.mediaUrl }),
          ...(msg.messageType === "voice" && {
            audioUrl: msg.mediaUrl,
            duration: msg.duration,
          }),
        };
      });

      // Update the conversation with the new messages
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (conv) => conv.id === conversationId
        );
        if (conversationIndex !== -1) {
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            messages: transformedMessages,
            lastMessage:
              transformedMessages.length > 0
                ? transformedMessages[transformedMessages.length - 1].text
                : "No messages yet",
            lastMessageTime:
              transformedMessages.length > 0
                ? transformedMessages[transformedMessages.length - 1].time
                : "",
          };
        }
        return updatedConversations;
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages: " + (err.message || "Unknown error"));
    }
  };

  // Update the conversation selection logic
  const handleConversationSelect = async (index) => {
    setSelectedChat(index);
    setShowOwnProfile(false);
    setIsUserProfileVisible(true);

    // Fetch messages for the selected conversation
    const selectedConversation = conversations[index];
    if (selectedConversation) {
      await fetchMessages(selectedConversation.id);
    }
  };

  // CSS styles
  const styles = {
    chatContainer: {
      height: "100vh",
      backgroundColor: "#f5f7fa",
      overflow: "hidden",
    },
    navSidebar: {
      borderRight: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
      boxShadow: "2px 0 15px rgba(0, 0, 0, 0.05)",
      height: "100%",
      overflowY: "auto",
      borderRadius: "0 15px 15px 0",
    },
    chatSidebar: {
      borderRight: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
      boxShadow: "2px 0 15px rgba(0, 0, 0, 0.05)",
      height: "100%",
      overflowY: "auto",
      borderRadius: "0 15px 15px 0",
    },
    chatWindow: {
      backgroundColor: "#fff",
      boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)",
      height: "100%",
      borderRadius: "15px",
      margin: "0 10px",
    },
    userProfileSidebar: {
      borderLeft: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
      boxShadow: "-2px 0 15px rgba(0, 0, 0, 0.05)",
      height: "100%",
      overflowY: "auto",
      borderRadius: "15px 0 0 15px",
    },
    chatHeader: {
      borderBottom: "1px solid #e0e0e0",
      background: "linear-gradient(90deg, #ffffff 0%, #f9f9f9 100%)",
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
      padding: "15px 20px",
      borderRadius: "15px 15px 0 0",
    },
    chatMessages: {
      backgroundImage: "linear-gradient(to right, #f9f9f9, #f5f7fa)",
      padding: "25px",
      overflowY: "auto",
      height: "calc(100% - 120px)",
      borderRadius: "0 0 15px 15px",
    },
    messageInputArea: {
      borderTop: "1px solid #e0e0e0",
      backgroundColor: "#fff",
      boxShadow: "0 -3px 10px rgba(0, 0, 0, 0.05)",
      padding: "15px 20px",
      borderRadius: "0 0 15px 15px",
    },
    sendButton: {
      backgroundColor: "#5FA8D3",
      color: "white",
      borderRadius: "50%",
      width: "45px",
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 3px 8px rgba(95, 168, 211, 0.3)",
      transition: "background-color 0.2s ease, transform 0.2s ease",
      "&:hover": {
        backgroundColor: "#4E92C0",
        transform: "scale(1.05)",
      },
    },
    recordingButton: {
      color: "#5FA8D3",
      borderRadius: "50%",
      width: "45px",
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    recordingActive: {
      backgroundColor: "#ff4d4f",
      color: "white",
      boxShadow: "0 2px 5px rgba(255, 77, 79, 0.3)",
    },
    messageInput: {
      borderRadius: "25px",
      border: "1px solid #e0e0e0",
      boxShadow:
        "inset 0 2px 5px rgba(0, 0, 0, 0.05), 0 2px 5px rgba(0, 0, 0, 0.05)",
      padding: "10px 15px",
      fontSize: "15px",
      transition: "border-color 0.2s ease",
      "&:focus": {
        borderColor: "#5FA8D3",
        boxShadow:
          "inset 0 2px 5px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(95, 168, 211, 0.1)",
      },
    },
    searchInput: {
      border: "1px solid #e0e0e0",
      boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.05)",
      borderRadius: "25px 0 0 25px",
      padding: "10px 15px",
      fontSize: "15px",
      transition: "border-color 0.2s ease",
      "&:focus": {
        borderColor: "#5FA8D3",
        boxShadow:
          "inset 0 2px 5px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(95, 168, 211, 0.1)",
      },
    },
    chatCard: {
      transition: "all 0.2s ease",
      borderRadius: "12px",
      margin: "5px 10px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)",
      "&:hover": {
        backgroundColor: "#f9f9f9",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
      },
    },
    chatCardActive: {
      backgroundColor: "#e8f1ff",
      borderLeft: "4px solid #5FA8D3",
      boxShadow: "0 4px 10px rgba(95, 168, 211, 0.1)",
    },
    messageBubble: {
      padding: "12px 18px",
      borderRadius: "20px",
      maxWidth: "70%",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      fontSize: "15px",
      lineHeight: "1.5",
      transition: "background-color 0.2s ease, transform 0.2s ease",
      "&:hover": {
        transform: "scale(1.01)",
        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.12)",
      },
    },
    messageBubbleYou: {
      backgroundColor: "#5FA8D3",
      color: "white",
      borderRadius: "20px 5px 20px 20px",
      boxShadow: "0 2px 5px rgba(95, 168, 211, 0.3)",
      "&:hover": {
        backgroundColor: "#4E92C0",
      },
    },
    messageBubbleOther: {
      backgroundColor: "#f0f2f5",
      color: "#333",
      borderRadius: "5px 20px 20px 20px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "#e8eaed",
      },
    },
    profilePic: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    profilePicPlaceholder: {
      backgroundColor: "#0a3d62",
      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: "50%",
    },
    profilePicContainer: {
      position: "relative",
      width: "80px",
      height: "80px",
    },
    voiceWaveform: {
      width: "80px",
      height: "20px",
      backgroundImage:
        "linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to right, #ccc 1px, transparent 1px)",
      backgroundSize: "3px 8px, 3px 12px",
      backgroundPosition: "0 center, 1.5px center",
      backgroundRepeat: "repeat-x",
    },
    voiceWaveformPlaying: {
      backgroundImage:
        "linear-gradient(to right, #5FA8D3 1px, transparent 1px), linear-gradient(to right, #5FA8D3 1px, transparent 1px)",
    },
    sharedMediaItem: {
      width: "60px",
      height: "60px",
      marginRight: "8px",
      marginBottom: "8px",
      borderRadius: "8px",
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15)",
      },
    },
    navButton: {
      width: "100%",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      borderRadius: "8px",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "#e8f1ff",
      },
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
    editProfileModal: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
      zIndex: 1001,
      width: "90%",
      maxWidth: "400px",
    },
  };

  // Add Delete Conversation and Message Functions
  const handleDeleteConversation = async (conversationId) => {
    try {
      await apiClient.delete(`/Conversation/${conversationId}`);
      // Remove the deleted conversation from the state
      setConversations((prevConversations) =>
        prevConversations.filter((conv) => conv.id !== conversationId)
      );
      // If the deleted conversation was the selected one, deselect it
      if (selectedConversation?.id === conversationId) {
        setSelectedChat(null);
      }
      console.log(`Conversation ${conversationId} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError(
        "Failed to delete conversation: " + (err.message || "Unknown error")
      );
    }
  };

  const handleDeleteMessage = async (conversationId, messageId) => {
    try {
      await apiClient.delete(`/Message/${messageId}`);
      // Remove the deleted message from the state
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (conv) => conv.id === conversationId
        );
        if (conversationIndex !== -1) {
          updatedConversations[conversationIndex].messages =
            updatedConversations[conversationIndex].messages.filter((msg) => {
              // Need to match message by a unique property, assuming 'id' will be available from API after sending
              // For now, if API doesn't return ID, this filter might not work correctly.
              // Using index as a fallback, but ID from API is preferred.
              return msg.id !== messageId;
            });
          // Update last message if the deleted message was the last one
          const lastMsg =
            updatedConversations[conversationIndex].messages[
              updatedConversations[conversationIndex].messages.length - 1
            ];
          updatedConversations[conversationIndex].lastMessage = lastMsg
            ? lastMsg.text
            : "No messages yet";
          updatedConversations[conversationIndex].lastMessageTime = lastMsg
            ? lastMsg.time
            : "";
        }
        return updatedConversations;
      });
      console.log(
        `Message ${messageId} in conversation ${conversationId} deleted successfully.`
      );
    } catch (err) {
      console.error("Error deleting message:", err);
      setError("Failed to delete message: " + (err.message || "Unknown error"));
    }
  };

  // Handle editing a message
  const handleEditMessage = async (messageId, newContent) => {
    if (newContent.trim() === "") {
      setError("Message content cannot be empty.");
      return; // Prevent saving empty message
    }

    try {
      // Send PUT request to update the message content
      const response = await apiClient.put(`/Message/${messageId}`, {
        content: newContent,
      });

      if (response.status === 200) {
        // Update the message in the state with the new content
        setConversations((prevConversations) => {
          const updatedConversations = [...prevConversations];
          const conversationIndex = updatedConversations.findIndex(
            (conv) => conv.id === selectedConversation.id
          );
          if (conversationIndex !== -1) {
            const messageIndex = updatedConversations[
              conversationIndex
            ].messages.findIndex((msg) => msg.id === messageId);
            if (messageIndex !== -1) {
              updatedConversations[conversationIndex].messages[
                messageIndex
              ].text = newContent;
              // Optionally update last message if the edited message was the last one
              const lastMsg =
                updatedConversations[conversationIndex].messages[
                  updatedConversations[conversationIndex].messages.length - 1
                ];
              if (lastMsg.id === messageId) {
                updatedConversations[conversationIndex].lastMessage =
                  newContent;
              }
            }
          }
          return updatedConversations;
        });

        setEditingMessageId(null); // Exit editing mode
        setEditedMessageContent(""); // Clear edited content
        console.log(`Message ${messageId} updated successfully.`);
      } else {
        setError(
          `Failed to update message: Server returned status ${response.status}`
        );
      }
    } catch (err) {
      console.error("Error editing message:", err);
      setError("Failed to update message: " + (err.message || "Unknown error"));
    }
  };

  // Update Edit Profile Button to Navigate
  const handleEditProfileClick = () => {
    navigate("/edit-profile");
  };

  return (
    <Container fluid style={styles.chatContainer} className="py-3">
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row className="h-100">
          {/* Navigation Sidebar */}
          <Col xs={12} md={1} style={styles.navSidebar}>
            <div className="p-3 text-center">
              <Button
                variant="link"
                style={styles.navButton}
                onClick={() => {
                  setShowOwnProfile(false);
                  setIsUserProfileVisible(false);
                }}
              >
                <FaHome size={20} color="#5FA8D3" />
              </Button>
              <Button
                variant="link"
                style={styles.navButton}
                onClick={() => {
                  setShowOwnProfile(true);
                  setIsUserProfileVisible(true);
                }}
              >
                <FaUser size={20} color={showOwnProfile ? "#5FA8D3" : "#888"} />
              </Button>
              <Button
                variant="link"
                style={styles.navButton}
                onClick={handleLogout}
              >
                <FaSignOutAlt size={20} color="#dc3545" />
              </Button>
            </div>
          </Col>

          {/* Chat Sidebar: Conversation List */}
          <Col xs={12} md={3} style={styles.chatSidebar}>
            <div className="p-3">
              <InputGroup className="mb-4">
                <InputGroup.Text
                  style={{
                    borderRadius: "25px 0 0 25px",
                    backgroundColor: "#f5f7fa",
                  }}
                >
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search Conversations"
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="link"
                  style={{
                    borderRadius: "0 25px 25px 0",
                    backgroundColor: "#5FA8D3",
                    color: "white",
                  }}
                  onClick={() => setShowNewConversation(true)}
                  aria-label="Add new conversation"
                >
                  <FaPlus />
                </Button>
              </InputGroup>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6
                  className="mb-0"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  Recent
                </h6>
              </div>
              {/* Filter conversations based on search term */}
              {conversations
                .filter((conversation) =>
                  conversation.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((conversation, index) => {
                  // Find the original index for selection
                  const originalIndex = conversations.findIndex(
                    (c) => c.id === conversation.id
                  );
                  return (
                    <Card
                      key={index}
                      className="border-0 mb-2"
                      style={{
                        ...styles.chatCard,
                        ...(selectedChat === originalIndex
                          ? styles.chatCardActive
                          : {}),
                      }}
                      onClick={() => handleConversationSelect(originalIndex)}
                    >
                      <Card.Body className="d-flex align-items-center p-3">
                        <div
                          className="rounded-circle me-3 position-relative"
                          style={{
                            ...styles.profilePicPlaceholder,
                            width: "45px",
                            height: "45px",
                          }}
                        >
                          <img
                            src={conversation.profilePhoto}
                            alt={`${conversation.name}'s profile`}
                            style={styles.profilePic}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/profile.png";
                            }}
                          />
                          {conversation.online && (
                            <div
                              className="position-absolute"
                              style={{
                                bottom: 0,
                                right: "0",
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#2ecc71",
                                borderRadius: "50%",
                                border: "2px solid white",
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6
                            className="mb-1"
                            style={{ fontSize: "16px", fontWeight: "500" }}
                          >
                            {conversation.name}
                          </h6>
                          <p
                            className="mb-0 small text-truncate"
                            style={{ maxWidth: "150px", color: "#666" }}
                          >
                            {conversation.lastMessage}
                          </p>
                        </div>
                        <div className="text-end">
                          <small style={{ color: "#888", fontSize: "12px" }}>
                            {conversation.lastMessageTime}
                          </small>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              bg="primary"
                              className="ms-2"
                              style={{ fontSize: "12px" }}
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          {/* Delete Conversation Button */}
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-2 text-secondary"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent selecting conversation when clicking delete
                              handleDeleteConversation(conversation.id);
                            }}
                            aria-label="Delete conversation"
                          >
                            <MdDelete size={14} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
            </div>
          </Col>

          {/* Chat Window: Main Chat Area */}
          <Col
            xs={12}
            md={5}
            className="d-flex flex-column"
            style={styles.chatWindow}
          >
            {selectedConversation ? (
              <>
                <div
                  className="d-flex align-items-center"
                  style={styles.chatHeader}
                >
                  <div
                    className="rounded-circle me-3 position-relative"
                    style={{
                      ...styles.profilePicPlaceholder,
                      width: "45px",
                      height: "45px",
                    }}
                  >
                    <img
                      src={selectedConversation.profilePhoto}
                      alt={`${selectedConversation.name}'s profile`}
                      style={styles.profilePic}
                    />
                    {selectedConversation.online && (
                      <div
                        className="position-absolute"
                        style={{
                          bottom: "0",
                          right: "0",
                          width: "12px",
                          height: "12px",
                          backgroundColor: "#2ecc71",
                          borderRadius: "50%",
                          border: "2px solid white",
                        }}
                      ></div>
                    )}
                  </div>
                  <div>
                    <h5
                      className="mb-0"
                      style={{ fontSize: "18px", fontWeight: "600" }}
                    >
                      {selectedConversation.name}
                    </h5>
                    <small
                      className={`d-flex align-items-center ${
                        selectedConversation.online
                          ? "text-success"
                          : "text-muted"
                      }`}
                    >
                      <FaCircle className="me-1" style={{ fontSize: "8px" }} />
                      {selectedConversation.online ? "Online" : "Offline"}
                    </small>
                  </div>
                  <div className="ms-auto d-flex align-items-center">
                    <Button
                      variant="link"
                      className="p-1"
                      onClick={() =>
                        setIsUserProfileVisible(!isUserProfileVisible)
                      }
                      aria-label={
                        isUserProfileVisible
                          ? "Hide user profile"
                          : "Show user profile"
                      }
                    >
                      <FaUser
                        style={{
                          color: isUserProfileVisible ? "#5FA8D3" : "#888",
                        }}
                      />
                    </Button>
                    <Button variant="link" className="p-1">
                      <i className="bi bi-telephone"></i>
                    </Button>
                    <Button variant="link" className="p-1">
                      <i className="bi bi-camera-video"></i>
                    </Button>
                    <Button variant="link" className="p-1">
                      <i className="bi bi-three-dots"></i>
                    </Button>
                  </div>
                </div>

                <div
                  className="flex-grow-1 overflow-auto"
                  style={styles.chatMessages}
                >
                  {selectedConversation.messages.length === 0 ? (
                    <div
                      className="text-center mt-5"
                      style={{ color: "#888", fontSize: "16px" }}
                    >
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    <>
                      {/* Group messages by date and render date headers */}
                      {selectedConversation.messages.reduce(
                        (acc, message, index) => {
                          const messageDate = new Date(message.timestamp);
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);

                          let dateHeader = null;
                          const currentMessageDateString =
                            messageDate.toLocaleDateString();
                          const previousMessage =
                            selectedConversation.messages[index - 1];
                          const previousMessageDateString = previousMessage
                            ? new Date(
                                previousMessage.timestamp
                              ).toLocaleDateString()
                            : null;

                          // Check if the date has changed from the previous message
                          if (
                            currentMessageDateString !==
                            previousMessageDateString
                          ) {
                            if (
                              currentMessageDateString ===
                              today.toLocaleDateString()
                            ) {
                              dateHeader = (
                                <div
                                  key={`date-today-${index}`}
                                  className="text-center text-muted my-2"
                                >
                                  Today
                                </div>
                              );
                            } else if (
                              currentMessageDateString ===
                              yesterday.toLocaleDateString()
                            ) {
                              dateHeader = (
                                <div
                                  key={`date-yesterday-${index}`}
                                  className="text-center text-muted my-2"
                                >
                                  Yesterday
                                </div>
                              );
                            } else {
                              dateHeader = (
                                <div
                                  key={`date-${index}`}
                                  className="text-center text-muted my-2"
                                >
                                  {messageDate.toLocaleDateString()}
                                </div>
                              );
                            }
                          }

                          // Render the message
                          const messageElement = (
                            <div key={`message-${index}`} className="mb-4">
                              {/* Container for the message block */}
                              <div
                                className={`d-flex ${
                                  message.sender === "you"
                                    ? "justify-content-end" // Align to the right for sender "you"
                                    : "justify-content-start" // Align to the left for sender "other"
                                } align-items-end`}
                              >
                                {/* Profile photo for other sender */}
                                {message.sender !== "you" && (
                                  <div
                                    className="rounded-circle me-2"
                                    style={{
                                      ...styles.profilePicPlaceholder,
                                      width: "30px",
                                      height: "30px",
                                    }}
                                  >
                                    <img
                                      src={selectedConversation.profilePhoto}
                                      alt={`${selectedConversation.name}'s profile`}
                                      style={styles.profilePic}
                                    />
                                  </div>
                                )}

                                {/* Message bubble */}
                                <div
                                  style={{
                                    ...styles.messageBubble,
                                    ...(message.sender === "you"
                                      ? styles.messageBubbleYou
                                      : styles.messageBubbleOther),
                                  }}
                                >
                                  {/* Message content based on type */}
                                  {message.type === "voice" ? (
                                    <div className="d-flex align-items-center">
                                      {message.audioUrl ? (
                                        <>
                                          <audio
                                            ref={(el) =>
                                              (audioRefs.current[message.id] =
                                                el)
                                            }
                                            src={message.audioUrl}
                                            className="d-none"
                                          />
                                          <Button
                                            variant="link"
                                            className="p-0 me-2"
                                            onClick={() =>
                                              handlePlayAudio(message.id)
                                            }
                                            aria-label={
                                              playingAudio === message.id
                                                ? "Pause voice message"
                                                : "Play voice message"
                                            }
                                            style={{
                                              color:
                                                message.sender === "you"
                                                  ? "white"
                                                  : "#5FA8D3",
                                            }}
                                          >
                                            {playingAudio === message.id ? (
                                              <FaStop />
                                            ) : (
                                              <FaPlay />
                                            )}
                                          </Button>
                                          <div
                                            style={{
                                              ...styles.voiceWaveform,
                                              ...(playingAudio === message.id
                                                ? styles.voiceWaveformPlaying
                                                : {}),
                                            }}
                                          ></div>
                                        </>
                                      ) : (
                                        <span>Voice message (unavailable)</span>
                                      )}
                                    </div>
                                  ) : message.type === "image" ? (
                                    <div>
                                      <img
                                        src={message.imageUrl}
                                        alt="Shared image"
                                        style={{
                                          maxWidth: "200px",
                                          borderRadius: "12px",
                                          boxShadow:
                                            "0 3px 8px rgba(0, 0, 0, 0.1)",
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      {message.text}
                                      {message.emoji && (
                                        <span className="ms-1">
                                          {message.emoji}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Time and Edit/Delete Actions Container for sent messages */}
                              {message.sender === "you" && (
                                <div className="d-flex flex-column ms-2 align-items-end">
                                  {/* Time */}
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    {message.time}
                                  </small>
                                  {/* Edit and Delete Buttons (only shown when not editing) */}
                                  {message.id && !editingMessageId && (
                                    <div
                                      className="d-flex justify-content-end"
                                      style={{ fontSize: "0.8rem" }}
                                    >
                                      {/* Edit Button */}
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 me-2 text-secondary"
                                        onClick={() => {
                                          setEditedMessageContent(message.text);
                                          setEditingMessageId(message.id);
                                        }}
                                        aria-label="Edit message"
                                        style={{ textDecoration: "none" }}
                                      >
                                        <FaRegEdit size={12} className="me-1" />
                                        Edit
                                      </Button>
                                      {/* Delete Button */}
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 text-secondary"
                                        onClick={() =>
                                          handleDeleteMessage(
                                            selectedConversation.id,
                                            message.id
                                          )
                                        }
                                        aria-label="Delete message"
                                        style={{ textDecoration: "none" }}
                                      >
                                        <MdDelete size={12} className="me-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  )}
                                  {/* Edit Input (shown when editing) */}
                                  {message.id &&
                                    editingMessageId === message.id && (
                                      <div className="d-flex align-items-center mt-1">
                                        <Form.Control
                                          type="text"
                                          value={editedMessageContent}
                                          onChange={(e) =>
                                            setEditedMessageContent(
                                              e.target.value
                                            )
                                          }
                                          size="sm"
                                          style={{ width: "200px" }}
                                        />
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="p-0 ms-2 text-success"
                                          onClick={() =>
                                            handleEditMessage(
                                              message.id,
                                              editedMessageContent
                                            )
                                          }
                                          aria-label="Save edit"
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="p-0 ms-2 text-secondary"
                                          onClick={() => {
                                            setEditingMessageId(null);
                                            setEditedMessageContent("");
                                          }}
                                          aria-label="Cancel edit"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              )}

                              {/* Time for other sender (aligned next to the bubble) */}
                              {message.sender !== "you" && (
                                <small
                                  className="ms-2 text-muted"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {message.time}
                                </small>
                              )}
                            </div>
                          );

                          if (dateHeader) {
                            acc.push(dateHeader);
                          }
                          acc.push(messageElement);

                          return acc;
                        },
                        []
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input Area */}
                <div style={styles.messageInputArea}>
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Type a message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={styles.messageInput}
                        disabled={isRecording}
                        aria-label="Type a message"
                      />
                      {isRecording ? (
                        <Button
                          className="ms-2"
                          style={{
                            ...styles.recordingButton,
                            ...styles.recordingActive,
                          }}
                          onClick={handleStopRecording}
                          aria-label="Stop voice recording"
                        >
                          <FaStop /> {formatRecordingTime(recordingTime)}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="link"
                            className="ms-2"
                            style={styles.recordingButton}
                            onClick={handleStartRecording}
                            aria-label="Start voice recording"
                          >
                            <FaMicrophone />
                          </Button>
                          <Button
                            type="submit"
                            className="ms-2"
                            style={styles.sendButton}
                            disabled={isRecording || !newMessage.trim()}
                            aria-label="Send message"
                          >
                            <FaPaperPlane />
                          </Button>
                        </>
                      )}
                    </InputGroup>
                  </Form>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <h5 style={{ color: "#888" }}>
                    Select a conversation to start chatting
                  </h5>
                </div>
              </div>
            )}
          </Col>

          {/* Right Sidebar: Selected User's Profile or Own Profile */}
          {isUserProfileVisible && selectedConversation && (
            <Col xs={12} md={2} style={styles.userProfileSidebar}>
              <div className="p-4">
                {showOwnProfile ? (
                  <>
                    <div className="text-center mb-4">
                      <div
                        className="rounded-circle mx-auto mb-3 position-relative"
                        style={styles.profilePicContainer}
                        onClick={() => profilePicInputRef.current.click()}
                      >
                        <div
                          style={{
                            ...styles.profilePicPlaceholder,
                            width: "80px",
                            height: "80px",
                          }}
                        >
                          {userProfile.profilePictureUrl ? (
                            <img
                              src={userProfile.profilePictureUrl}
                              alt="Your profile"
                              style={styles.profilePic}
                            />
                          ) : null}
                        </div>
                        <div
                          className="position-absolute"
                          style={{
                            bottom: "5px",
                            right: "5px",
                            width: "15px",
                            height: "15px",
                            backgroundColor: "#2ecc71",
                            borderRadius: "50%",
                            border: "2px solid white",
                          }}
                        ></div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={profilePicInputRef}
                        onChange={handleProfilePicUpload}
                        style={{ display: "none" }}
                      />
                      <h5 style={{ fontSize: "18px", fontWeight: "600" }}>
                        {userProfile.userName}
                      </h5>
                      <div className="d-flex justify-content-center gap-3 my-2">
                        <FaFacebook
                          style={{
                            color: "#3b5998",
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                        <FaTwitter
                          style={{
                            color: "#1da1f2",
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                        <FaInstagram
                          style={{
                            color: "#e1306c",
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        style={{ borderRadius: "20px", fontSize: "14px" }}
                        onClick={() => setShowEditProfile(true)}
                      >
                        Edit Profile
                      </Button>
                    </div>
                    <div
                      className="profile-details p-4"
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: "12px",
                        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      {userProfile.email && (
                        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                          <strong>Email:</strong> {userProfile.email}
                        </p>
                      )}
                      <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                        <strong>Age:</strong> {userProfile.age}
                      </p>
                      <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                        <strong>Disability Type:</strong>{" "}
                        {userProfile.disabilityType}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div
                        className="rounded-circle mx-auto mb-3 position-relative"
                        style={styles.profilePicContainer}
                      >
                        <div
                          style={{
                            ...styles.profilePicPlaceholder,
                            width: "80px",
                            height: "80px",
                          }}
                        >
                          <img
                            src={selectedConversation.profilePhoto}
                            alt={`${selectedConversation.name}'s profile`}
                            style={styles.profilePic}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/profile.png";
                            }}
                          />
                        </div>
                        {selectedConversation.online && (
                          <div
                            className="position-absolute"
                            style={{
                              bottom: "5px",
                              right: "5px",
                              width: "15px",
                              height: "15px",
                              backgroundColor: "#2ecc71",
                              borderRadius: "50%",
                              border: "2px solid white",
                            }}
                          ></div>
                        )}
                      </div>
                      <h5 style={{ fontSize: "18px", fontWeight: "600" }}>
                        {selectedConversation.name}
                      </h5>
                      <div className="d-flex justify-content-center gap-3 my-2">
                        <FaFacebook
                          style={{
                            color: "#3b5998",
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                        <FaTwitter
                          style={{
                            color: "#1da1f2",
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                        <FaInstagram
                          style={{
                            color: "#e1306c",
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="profile-details p-4"
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: "12px",
                        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      {selectedConversation.email && (
                        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                          <strong>Email:</strong> {selectedConversation.email}
                        </p>
                      )}
                      {selectedConversation.age && (
                        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                          <strong>Age:</strong> {selectedConversation.age}
                        </p>
                      )}
                      {selectedConversation.disabilityType && (
                        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                          <strong>Disability Type:</strong>{" "}
                          {selectedConversation.disabilityType}
                        </p>
                      )}
                    </div>
                    <div className="shared-media mt-4">
                      <h6 style={{ fontSize: "16px", fontWeight: "500" }}>
                        Shared Media
                      </h6>
                      {selectedConversation.sharedMedia.length === 0 ? (
                        <p className="text-muted" style={{ fontSize: "14px" }}>
                          No shared media yet.
                        </p>
                      ) : (
                        <>
                          <div className="d-flex flex-wrap">
                            {selectedConversation.sharedMedia
                              .slice(0, 3)
                              .map((media, index) => (
                                <div key={index} style={styles.sharedMediaItem}>
                                  <img
                                    src={media.url}
                                    alt="Shared media"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                          {selectedConversation.sharedMedia.length > 3 && (
                            <Button
                              variant="link"
                              className="p-0 mt-2"
                              style={{
                                color: "#5FA8D3",
                                textDecoration: "none",
                                fontSize: "14px",
                              }}
                              onClick={() =>
                                alert("Show all shared media (not implemented)")
                              }
                            >
                              See All ({selectedConversation.sharedMedia.length}
                              )
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* New Conversation Modal */}
      {showNewConversation && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setShowNewConversation(false)}
          ></div>
          <div style={styles.editProfileModal}>
            <h5>Add New Conversation (Enter Participant ID)</h5>
            <Form onSubmit={handleNewConversation}>
              <Form.Group className="mb-3">
                <Form.Label>Participant User ID</Form.Label>
                <Form.Control
                  type="text"
                  name="userId2"
                  placeholder="Enter participant User ID"
                  required
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                style={{ backgroundColor: "#5FA8D3", borderColor: "#5FA8D3" }}
              >
                Add
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => setShowNewConversation(false)}
              >
                Cancel
              </Button>
            </Form>
          </div>
        </>
      )}

      {/* Updated Edit Profile Modal */}
      {showEditProfile && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setShowEditProfile(false)}
          ></div>
          <div style={styles.editProfileModal}>
            <h5>Edit Profile</h5>
            <Form onSubmit={handleProfileUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  defaultValue={userProfile.userName}
                  placeholder="Enter your name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  defaultValue={userProfile.email}
                  placeholder="Enter your email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  defaultValue={userProfile.age}
                  placeholder="Enter your age"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Disability Type</Form.Label>
                <Form.Control
                  type="text"
                  name="disabilityType"
                  defaultValue={userProfile.disabilityType}
                  placeholder="Enter your disability type"
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                style={{ backgroundColor: "#5FA8D3", borderColor: "#5FA8D3" }}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </Button>
            </Form>
          </div>
        </>
      )}
    </Container>
  );
}

export default Chat;
