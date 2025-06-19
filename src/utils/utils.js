// utils.js
export const getDayName = (dayOfWeek) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek] || "Unknown";
  };
  
  export const isOpenNow = (openingHour) => {
    if (!openingHour) return false;
    if (openingHour.isClosed) return false;
  
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
    if (openingHour.dayOfWeek !== currentDay) return false;
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
    let [openHour, openMinute] = openingHour.openingTime.split(":").map(Number);
    const openTimeInMinutes = openHour * 60 + openMinute;
  
    let [closeHour, closeMinute] = openingHour.closingTime.split(":").map(Number);
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
  
    if (closeTimeInMinutes < openTimeInMinutes) {
      return (
        currentTimeInMinutes >= openTimeInMinutes ||
        currentTimeInMinutes <= closeTimeInMinutes
      );
    } else {
      return (
        currentTimeInMinutes >= openTimeInMinutes &&
        currentTimeInMinutes <= closeTimeInMinutes
      );
    }
  };
  
  export const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
  
    const [hours, minutes] = timeString.split(":").map(Number);
  
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
  
    return `${displayHours}${minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""} ${period}`;
  };