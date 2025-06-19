const blogs = [
  {
    id: 1,
    title: "Accessible Hotels in Fort Lauderdale, Florida",
    image: "https://via.placeholder.com/300x200?text=Places+Blog+1",
    date: "Oct 15, 2023",
    category: "Places",
    author: "Jane Doe",
    excerpt: "Discover accessible hotels in Fort Lauderdale for a comfortable stay.",
    content: "Fort Lauderdale offers a range of accessible hotels that cater to various needs. From wheelchair-friendly rooms to accessible pools, here’s a guide to the best options."
  },
  {
    id: 2,
    title: "New Festival Champions Accessibility and Inclusion",
    image: "https://via.placeholder.com/300x200?text=News+Blog+1",
    date: "Nov 1, 2023",
    category: "News",
    author: "John Smith",
    excerpt: "A new festival is making waves by prioritizing accessibility.",
    content: "This year’s festival introduced groundbreaking accessibility features, including sign language interpreters and sensory-friendly zones."
  },
  {
    id: 3,
    title: "Inspiring Stories of Accessibility Advocates",
    image: "https://via.placeholder.com/300x200?text=People+Blog+1",
    date: "Dec 5, 2023",
    category: "People",
    author: "Emily Johnson",
    excerpt: "Meet the advocates making a difference in accessibility.",
    content: "These individuals have dedicated their lives to improving accessibility, from lobbying for better laws to creating inclusive communities."
  },
  {
    id: 4,
    title: "The Latest in Accessible Technology",
    image: "https://via.placeholder.com/300x200?text=Tech+Blog+1",
    date: "Jan 10, 2024",
    category: "Tech",
    author: "Michael Brown",
    excerpt: "Explore the newest tech innovations for accessibility.",
    content: "From AI-powered assistants to smart home devices, technology is transforming accessibility in incredible ways."
  },
  {
    id: 5,
    title: "Living an Accessible Lifestyle",
    image: "https://via.placeholder.com/300x200?text=Lifestyle+Blog+1",
    date: "Feb 15, 2024",
    category: "Lifestyle",
    author: "Sarah Davis",
    excerpt: "Tips for living a more accessible lifestyle.",
    content: "Learn how to adapt your daily routine to be more accessible, with tips on travel, home design, and more."
  },
  {
    id: 6,
    title: "Accessibility in Education: What’s New",
    image: "https://via.placeholder.com/300x200?text=Education+Blog+1",
    date: "Mar 20, 2024",
    category: "Education",
    author: "David Wilson",
    excerpt: "The latest updates in accessible education.",
    content: "New programs and technologies are making education more accessible than ever. Here’s what’s new in the field."
  },
  {
    id: 7,
    title: "How Businesses Can Improve Accessibility",
    image: "/images/blog-3.avif",
    date: "Apr 25, 2024",
    category: "Business",
    author: "Laura Martinez",
    excerpt: "A guide for businesses to enhance accessibility.",
    content: "Businesses can attract more customers by improving accessibility. This guide covers practical steps to get started."
  },
  {
    id: 8,
    title: "Advances in Accessible Medical Care",
    image: "/images/blog-4.avif",
    date: "May 30, 2024",
    category: "Medical",
    author: "Robert Taylor",
    excerpt: "The latest in accessible medical care.",
    content: "From telemedicine to accessible medical equipment, here’s how the medical field is becoming more inclusive."
  }
];

// Function to fetch a blog by ID (simulated async operation)
export const fetchBlogById = async (id) => {
  return new Promise((resolve, reject) => {
    const blogId = parseInt(id, 10); // Convert id to integer
    const blog = blogs.find(b => b.id === blogId);
    if (blog) {
      resolve(blog);
    } else {
      reject(new Error('Blog not found'));
    }
  });
};

export default blogs;