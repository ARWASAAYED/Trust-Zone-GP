const events = [
    { 
      id: 1,
      title: "MapMission: Accessibility Workshop", 
      description: "An educational event to learn about accessibility mapping and review places in real-time.", 
      date: "25 Apr", 
      location: "Toronto, ON", 
      category: "Mapping",
      organizer: "AccessNow Team",
      agenda: [
        "9:00 AM - Welcome and Introduction",
        "10:00 AM - Accessibility Mapping 101",
        "11:00 AM - Hands-on Mapping Session",
        "12:00 PM - Lunch and Networking",
        "1:00 PM - Wrap-up and Q&A"
      ]
    },
    { 
      id: 2,
      title: "AccessStudio: Inclusive Design Seminar", 
      description: "A seminar on designing inclusive spaces, powered by hands-on learning experiences.", 
      date: "30 Apr", 
      location: "Vancouver, BC", 
      category: "Education",
      organizer: "Inclusive Design Network",
      agenda: [
        "10:00 AM - Keynote Speech",
        "11:00 AM - Workshop: Designing for Accessibility",
        "12:30 PM - Lunch Break",
        "1:30 PM - Panel Discussion",
        "3:00 PM - Closing Remarks"
      ]
    },
    { 
      id: 3,
      title: "Community Accessibility Forum", 
      description: "A forum to discuss accessibility challenges and solutions with community leaders.", 
      date: "5 May", 
      location: "Montreal, QC", 
      category: "Engagement",
      organizer: "Community Leaders Group",
      agenda: [
        "1:00 PM - Opening Remarks",
        "1:30 PM - Accessibility Challenges Discussion",
        "2:30 PM - Break",
        "3:00 PM - Solutions Brainstorming",
        "4:00 PM - Closing"
      ]
    },
    { 
      id: 4,
      title: "Accessibility Tech Expo", 
      description: "Explore the latest in accessibility technology and network with innovators.", 
      date: "10 May", 
      location: "Calgary, AB", 
      category: "Technology",
      organizer: "Tech Innovators Hub",
      agenda: [
        "10:00 AM - Expo Opens",
        "11:00 AM - Tech Demos",
        "1:00 PM - Networking Lunch",
        "2:00 PM - Innovation Talks",
        "4:00 PM - Expo Closes"
      ]
    },
    { 
      id: 5,
      title: "MapMission: Urban Accessibility Day", 
      description: "Join us to map urban areas and improve accessibility data for city dwellers.", 
      date: "15 May", 
      location: "Ottawa, ON", 
      category: "Mapping",
      organizer: "Urban Accessibility Team",
      agenda: [
        "8:00 AM - Meet and Greet",
        "9:00 AM - Mapping Session 1",
        "11:00 AM - Break",
        "11:30 AM - Mapping Session 2",
        "1:00 PM - Wrap-up"
      ]
    },
  ];
  
  // Simulate an API call to fetch an event by ID
  export const fetchEventById = async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const event = events.find(event => event.id === parseInt(id));
        if (event) {
          resolve(event);
        } else {
          reject(new Error('Event not found'));
        }
      }, 500); // Simulate network delay
    });
  };
  
  // Export the events array for use in Events.jsx
  export default events;