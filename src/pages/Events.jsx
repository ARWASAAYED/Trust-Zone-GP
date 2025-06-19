import React, { useState, useEffect } from 'react';
   import { Link } from "react-router-dom";
   import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
   import { Row, Container, InputGroup, Form } from 'react-bootstrap';
   import EventCard from '../components/EventCard';

   function Events() {
     const [events, setEvents] = useState([]);
     const [eventSearch, setEventSearch] = useState('');
     const [visibleEvents, setVisibleEvents] = useState(2);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
       const fetchEvents = async () => {
         try {
           const response = await fetch('https://trustzone.azurewebsites.net/api/Event');
           if (!response.ok) throw new Error('Failed to fetch events');
           const data = await response.json();
           console.log('Fetched events:', data);
           setEvents(data);
           setLoading(false);
         } catch (err) {
           setError(err.message);
           setLoading(false);
         }
       };
       fetchEvents();
     }, []);

     const filteredEvents = events.filter(event => {
       if (!event) return false; // Skip if event is undefined or null
       const searchTerm = eventSearch.toLowerCase();
       const title = (event.eventName || '').toLowerCase();
       const description = (event.description || '').toLowerCase();
       const location = (event.location || '').toLowerCase();
       return (
         title.includes(searchTerm) ||
         description.includes(searchTerm) ||
         location.includes(searchTerm)
       );
     });

     const displayedEvents = filteredEvents.slice(0, visibleEvents);

     const handleViewMore = () => {
       setVisibleEvents(prev => prev + 2);
     };

     if (loading) {
       return (
         <Container className="py-5 text-center">
           <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
             Loading...
           </h2>
         </Container>
       );
     }

     if (error) {
       return (
         <Container className="py-5 text-center">
           <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
             Error
           </h2>
           <p className="text-muted">{error}</p>
         </Container>
       );
     }

     return (
       <>
         {/* Header Section */}
         <div 
           className="header-bg text-center" 
           style={{ 
             margin: '0%', 
             backgroundColor: '#1B4965', 
             color: 'white', 
             padding: '120px 0', 
             borderRadius: '0px 0px 25px 25px' 
           }}
         >
           <p 
             className="welcome-text" 
             style={{ 
               fontSize: '1rem', 
               fontWeight: 'bold', 
               textAlign: 'start', 
               marginLeft: '160px', 
               marginBottom: '-3px' 
             }}
           >
             UPCOMING
           </p>
           <h1 
             className="display-4" 
             style={{ 
               fontSize: '3rem', 
               fontWeight: 'bolder', 
               textAlign: 'start', 
               marginLeft: '160px' 
             }}
           >
             Events
           </h1>
         </div>

         <div className="py-5" style={{ marginBottom: '8%' }}>
           <Container>
             <div className="text-center mb-5">
               <h2 className="display-5 fw-bold" style={{ color: '#0A3D62' }}>
                 Upcoming Events
               </h2>
               <p className="text-muted" style={{ fontSize: '1.25rem' }}>
                 Explore and join events that promote accessibility and inclusion worldwide.
               </p>
               <InputGroup className="mb-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
                 <InputGroup.Text></InputGroup.Text>
                 <Form.Control
                   type="text"
                   placeholder="Search events by name, description, or location..."
                   value={eventSearch}
                   onChange={(e) => setEventSearch(e.target.value)}
                 />
               </InputGroup>
             </div>

             <Row className="g-4">
               {displayedEvents.length === 0 ? (
                 <div className="text-center">
                   <p className="text-muted">No events found matching your search.</p>
                 </div>
               ) : (
                 displayedEvents.map((event, index) => (
                   <EventCard key={index} event={event} index={index} />
                 ))
               )}
             </Row>

             {visibleEvents < filteredEvents.length && (
               <div className="text-center mt-5">
                 <button 
                   onClick={handleViewMore} 
                   className="small-b-l"
                   style={{ 
                     color: '#0A3D62', 
                     textDecoration: 'none', 
                     fontWeight: 'bold', 
                     background: 'none', 
                     border: 'none', 
                     cursor: 'pointer' 
                   }}
                   onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                   onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                 >
                   View more →
                 </button>
               </div>
             )}
           </Container>
         </div>
       </>
     );
   }

   export default Events;