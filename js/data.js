/* ==========================================================================
   Francis Mwalimu - Portfolio Data
   All content is centralized here for easy maintenance.
   Replace placeholder values with real data before deployment.
   ========================================================================== */

const PORTFOLIO_DATA = {
  /* ==================== PERSONAL INFO ==================== */
  personal: {
    name: "Francis Mwalimu",
    firstName: "Francis",
    lastName: "Mwalimu",
    title: "IT Professional | Networking & Cybersecurity Enthusiast | Software Developer",
    shortTitle: "IT Professional",
    tagline: "Building secure, reliable and innovative technology solutions",
    email: "your.email@example.com", // TODO: Replace with real email
    phone: "+254 700 000 000", // TODO: Replace with real phone/WhatsApp
    location: "Nairobi, Kenya",
    github: "https://github.com/Franco3291", // TODO: Replace with real GitHub URL
    linkedin: "https://www.linkedin.com/in/your-profile", // TODO: Replace with real LinkedIn URL
    twitter: "https://twitter.com/your-handle", // TODO: Replace or remove
    whatsapp: "https://wa.me/254700000000", // TODO: Replace with real WhatsApp number
    profileImage: "assets/images/profile.jpg", // TODO: Add real profile photo
    cvUrl: "assets/docs/Francis_Mwalimu_CV.pdf", // TODO: Add real CV file
    bio: "I am a passionate IT professional with hands-on experience in networking, cybersecurity, software development, web development, mobile development, databases, system administration and technical support. I enjoy solving real-world problems through technology and continuously expanding my skills across the IT landscape.",
    longBio: "I am an IT professional dedicated to building practical technology solutions that solve real problems. My journey spans networking, cybersecurity, software and web development, mobile applications, database design, system administration and technical support. I believe in continuous learning and applying knowledge to create secure, efficient and user-friendly systems. Whether configuring network infrastructure, developing applications, or securing systems, I approach every challenge with curiosity, discipline and a commitment to quality.",
    careerObjective: "To leverage my technical skills in networking, cybersecurity and software development to build secure, innovative and reliable IT solutions that add value to organizations and communities, while growing as a professional in a dynamic technology environment.",
    strengths: [
      "Problem-solving and analytical thinking",
      "Strong foundation in networking concepts and configurations",
      "Practical experience in software and web development",
      "Attention to security best practices",
      "Ability to learn new technologies quickly",
      "Good communication and teamwork skills",
      "Detail-oriented documentation and reporting",
      "Adaptability across multiple IT domains"
    ],
    interests: [
      "Network design and configuration",
      "Cybersecurity and ethical hacking",
      "Web and mobile application development",
      "Database design and management",
      "System administration and automation",
      "Cloud computing",
      "Technical writing and knowledge sharing",
      "Open source software"
    ],
    stats: {
      projects: 12,
      certifications: 8,
      yearsExperience: 3,
      technologies: 30
    }
  },

  /* ==================== SOCIAL LINKS ==================== */
  social: [
    { name: "GitHub", url: "https://github.com/Franco3291", icon: "github", label: "GitHub Profile" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/your-profile", icon: "linkedin", label: "LinkedIn Profile" },
    { name: "Twitter/X", url: "https://twitter.com/your-handle", icon: "twitter", label: "Twitter Profile" },
    { name: "WhatsApp", url: "https://wa.me/254700000000", icon: "whatsapp", label: "WhatsApp Contact" },
    { name: "Email", url: "mailto:your.email@example.com", icon: "email", label: "Email Me" }
  ],

  /* ==================== SKILLS ==================== */
  skills: [
    {
      category: "Programming Languages",
      icon: "💻",
      skills: [
        { name: "Python", level: "Intermediate", levelValue: 70 },
        { name: "PHP", level: "Intermediate", levelValue: 65 },
        { name: "JavaScript", level: "Intermediate", levelValue: 70 },
        { name: "Java", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "C", level: "Beginner", levelValue: 40 },
        { name: "SQL", level: "Intermediate", levelValue: 65 }
      ]
    },
    {
      category: "Web Technologies",
      icon: "🌐",
      skills: [
        { name: "HTML5", level: "Advanced", levelValue: 85 },
        { name: "CSS3", level: "Advanced", levelValue: 80 },
        { name: "Bootstrap", level: "Intermediate", levelValue: 70 },
        { name: "Tailwind CSS", level: "Intermediate", levelValue: 60 },
        { name: "React", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Node.js", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Laravel", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "WordPress", level: "Intermediate", levelValue: 65 }
      ]
    },
    {
      category: "Mobile Development",
      icon: "📱",
      skills: [
        { name: "Flutter", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Android (Java)", level: "Beginner", levelValue: 40 },
        { name: "React Native", level: "Beginner", levelValue: 35 }
      ]
    },
    {
      category: "Databases",
      icon: "🗄️",
      skills: [
        { name: "MySQL", level: "Intermediate", levelValue: 70 },
        { name: "SQLite", level: "Intermediate", levelValue: 65 },
        { name: "PostgreSQL", level: "Beginner", levelValue: 40 },
        { name: "MongoDB", level: "Beginner", levelValue: 35 }
      ]
    },
    {
      category: "Networking",
      icon: "🌐",
      skills: [
        { name: "Cisco Packet Tracer", level: "Intermediate", levelValue: 70 },
        { name: "VLAN Configuration", level: "Intermediate", levelValue: 65 },
        { name: "Routing & Switching", level: "Intermediate", levelValue: 65 },
        { name: "IP Addressing & Subnetting", level: "Intermediate", levelValue: 70 },
        { name: "Network Troubleshooting", level: "Intermediate", levelValue: 65 },
        { name: "TCP/IP & OSI Model", level: "Intermediate", levelValue: 70 },
        { name: "DNS & DHCP", level: "Intermediate", levelValue: 65 },
        { name: "Network Security Basics", level: "Beginner-Intermediate", levelValue: 55 }
      ]
    },
    {
      category: "Cybersecurity",
      icon: "🔒",
      skills: [
        { name: "Kali Linux", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Ethical Hacking Basics", level: "Beginner", levelValue: 40 },
        { name: "Vulnerability Analysis", level: "Beginner", levelValue: 40 },
        { name: "Network Security", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Security Awareness", level: "Intermediate", levelValue: 60 },
        { name: "Wireshark", level: "Beginner", levelValue: 40 }
      ]
    },
    {
      category: "Operating Systems",
      icon: "🖥️",
      skills: [
        { name: "Windows", level: "Advanced", levelValue: 85 },
        { name: "Linux (Ubuntu, Kali)", level: "Intermediate", levelValue: 65 },
        { name: "Android", level: "Intermediate", levelValue: 60 },
        { name: "macOS", level: "Beginner", levelValue: 40 }
      ]
    },
    {
      category: "System Administration",
      icon: "⚙️",
      skills: [
        { name: "Windows Server", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Linux Administration", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Active Directory", level: "Beginner", levelValue: 40 },
        { name: "User & Group Management", level: "Intermediate", levelValue: 60 },
        { name: "Backup & Recovery", level: "Intermediate", levelValue: 60 },
        { name: "File & Print Services", level: "Intermediate", levelValue: 60 }
      ]
    },
    {
      category: "Development Tools",
      icon: "🛠️",
      skills: [
        { name: "Git & GitHub", level: "Intermediate", levelValue: 65 },
        { name: "VS Code", level: "Advanced", levelValue: 80 },
        { name: "XAMPP", level: "Intermediate", levelValue: 70 },
        { name: "Postman", level: "Beginner-Intermediate", levelValue: 50 },
        { name: "Docker", level: "Beginner", levelValue: 30 },
        { name: "Figma", level: "Beginner", levelValue: 35 }
      ]
    },
    {
      category: "Other Technical Tools",
      icon: "🔧",
      skills: [
        { name: "Microsoft Office", level: "Advanced", levelValue: 85 },
        { name: "Google Workspace", level: "Advanced", levelValue: 80 },
        { name: "Cisco Packet Tracer", level: "Intermediate", levelValue: 70 },
        { name: "Wireshark", level: "Beginner", levelValue: 40 },
        { name: "VirtualBox", level: "Intermediate", levelValue: 60 },
        { name: "Canva", level: "Intermediate", levelValue: 60 }
      ]
    }
  ],

  /* ==================== PROJECTS ==================== */
  projects: [
    {
      id: "online-class-attendance-system",
      title: "Online Class Attendance System",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "Bootstrap"],
      status: "github-only",
      shortDescription: "A web-based system for managing and tracking student attendance in online classes with automated reporting.",
      description: "An online attendance management system designed to help educational institutions track student attendance in both physical and online classes. The system provides role-based access for administrators, lecturers and students, with automated attendance reports and analytics.",
      problem: "Manual attendance tracking is time-consuming, error-prone and difficult to monitor for online classes. Lecturers needed a reliable digital solution to record, track and report student attendance efficiently.",
      objectives: [
        "Provide a digital platform for recording student attendance",
        "Enable lecturers to mark attendance quickly and accurately",
        "Generate automated attendance reports for administrators",
        "Allow students to view their attendance records",
        "Provide role-based access control for different user types"
      ],
      role: "Full-stack Developer - Designed the database schema, implemented the backend logic in PHP, built the frontend interface and integrated the reporting module.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap", "XAMPP"],
      features: [
        "User authentication with role-based access (Admin, Lecturer, Student)",
        "Class and course management",
        "Attendance marking with date and time tracking",
        "Automated attendance reports and statistics",
        "Student attendance history and percentage calculation",
        "Responsive design for desktop and mobile use"
      ],
      screenshots: [],
      challenges: [
        "Handling concurrent attendance submissions without data conflicts",
        "Designing a database schema that supports multiple classes and courses",
        "Implementing secure session management and password hashing"
      ],
      solutions: [
        "Used database transactions and unique constraints to prevent duplicate entries",
        "Normalized the database to eliminate redundancy and ensure data integrity",
        "Implemented password hashing with PHP's password_hash() and secure session handling"
      ],
      results: "Successfully developed a functional attendance management system that streamlines the attendance tracking process, reduces manual errors and provides clear reporting for administrators.",
      githubUrl: "https://github.com/Franco3291/online-class-attendance-system", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: "assets/docs/attendance-system-docs.pdf", // TODO: Add documentation
      year: 2024,
      featured: true
    },
    {
      id: "campus-deals",
      title: "Campus Deals",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      status: "github-only",
      shortDescription: "An online marketplace platform for students to buy and sell items within campus communities.",
      description: "Campus Deals is an online marketplace designed specifically for university students to buy, sell and trade items within their campus community. It provides a safe, convenient platform for students to exchange goods.",
      problem: "Students lacked a dedicated platform to buy and sell items within their campus community, relying on informal channels that were inefficient and lacked structure.",
      objectives: [
        "Create a dedicated marketplace for campus communities",
        "Enable students to post items for sale",
        "Provide search and category filtering for easy discovery",
        "Facilitate communication between buyers and sellers"
      ],
      role: "Full-stack Developer - Built the complete platform from database design to frontend implementation.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap"],
      features: [
        "User registration and authentication",
        "Product listing with images and descriptions",
        "Category-based browsing and search",
        "Seller profiles and contact options",
        "Responsive mobile-friendly design"
      ],
      screenshots: [],
      challenges: [
        "Implementing image upload and validation",
        "Designing an intuitive user interface for non-technical users"
      ],
      solutions: [
        "Implemented file upload validation and image compression",
        "Conducted user testing and iterated on the UI design"
      ],
      results: "Delivered a functional campus marketplace platform that enables students to trade items efficiently within their community.",
      githubUrl: "https://github.com/Franco3291/campus-deals", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2024,
      featured: false
    },
    {
      id: "library-management-system",
      title: "Library Management System",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      status: "github-only",
      shortDescription: "A comprehensive system for managing library books, members, borrowing and returns.",
      description: "A library management system that automates the core operations of a library including book cataloging, member registration, borrowing and return tracking, and fine calculation.",
      problem: "Libraries often rely on manual bookkeeping which is slow, error-prone and difficult to scale. This system digitizes the entire library workflow.",
      objectives: [
        "Digitize book cataloging and management",
        "Automate member registration and management",
        "Track book borrowing and returns",
        "Calculate and manage late fines automatically"
      ],
      role: "Full-stack Developer - Designed and implemented the complete system.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap"],
      features: [
        "Book catalog with search and filtering",
        "Member registration and management",
        "Borrowing and return tracking",
        "Automatic fine calculation for late returns",
        "Dashboard with library statistics"
      ],
      screenshots: [],
      challenges: [
        "Managing complex relationships between books, members and transactions",
        "Implementing fine calculation logic"
      ],
      solutions: [
        "Designed a normalized database schema with proper foreign key relationships",
        "Implemented automated fine calculation based on return dates"
      ],
      results: "Created a reliable library management system that significantly reduces manual work and improves operational efficiency.",
      githubUrl: "https://github.com/Franco3291/library-management-system", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2023,
      featured: false
    },
    {
      id: "sun-rise-hotel",
      title: "SUN RISE Hotel",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      status: "github-only",
      shortDescription: "A hotel management system for room reservations, guest management and billing.",
      description: "SUN RISE Hotel is a hotel management system that handles room reservations, guest check-in/check-out, billing and room availability tracking.",
      problem: "The hotel needed a digital system to replace manual reservation books and streamline guest management and billing processes.",
      objectives: [
        "Manage room reservations and availability",
        "Track guest check-in and check-out",
        "Generate bills and invoices",
        "Provide room and rate management"
      ],
      role: "Full-stack Developer - Built the complete hotel management system.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap"],
      features: [
        "Room management with types and rates",
        "Reservation and booking system",
        "Guest check-in/check-out management",
        "Billing and invoice generation",
        "Room availability calendar"
      ],
      screenshots: [],
      challenges: [
        "Handling overlapping reservations and room availability conflicts",
        "Designing a billing system that supports multiple services"
      ],
      solutions: [
        "Implemented availability checking with date range validation",
        "Created a flexible billing module that supports room charges and additional services"
      ],
      results: "Delivered a complete hotel management solution that improves operational efficiency and guest experience.",
      githubUrl: "https://github.com/Franco3291/sun-rise-hotel", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2023,
      featured: false
    },
    {
      id: "hydrotrack",
      title: "HydroTrack",
      category: "Mobile Development",
      technologies: ["Flutter", "Dart", "SQLite"],
      status: "github-only",
      shortDescription: "A mobile application for tracking daily water intake and hydration goals.",
      description: "HydroTrack is a mobile application that helps users monitor their daily water consumption, set hydration goals and receive reminders to stay hydrated throughout the day.",
      problem: "Many people struggle to maintain proper hydration. HydroTrack provides a simple, intuitive way to track water intake and build healthy habits.",
      objectives: [
        "Track daily water consumption",
        "Allow users to set personalized hydration goals",
        "Provide reminders and notifications",
        "Display progress statistics and history"
      ],
      role: "Mobile Developer - Designed and developed the Flutter application.",
      technologiesUsed: ["Flutter", "Dart", "SQLite", "Android Studio"],
      features: [
        "Daily water intake tracking",
        "Customizable hydration goals",
        "Push notifications and reminders",
        "Progress charts and statistics",
        "History log"
      ],
      screenshots: [],
      challenges: [
        "Implementing local data persistence with SQLite",
        "Designing an intuitive and engaging UI"
      ],
      solutions: [
        "Used SQLite for reliable local data storage",
        "Applied Material Design principles for a clean, user-friendly interface"
      ],
      results: "Developed a functional mobile app that helps users build and maintain healthy hydration habits.",
      githubUrl: "https://github.com/Franco3291/hydrotrack", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2024,
      featured: false
    },
    {
      id: "online-bus-booking-system",
      title: "Online Bus Booking System",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      status: "github-only",
      shortDescription: "A web platform for booking bus tickets online with seat selection and payment integration.",
      description: "An online bus booking system that allows passengers to search for bus routes, select seats, book tickets and manage their reservations online.",
      problem: "Passengers had to physically visit bus terminals to book tickets, which was inconvenient and time-consuming. This system brings the booking process online.",
      objectives: [
        "Enable online ticket booking",
        "Provide route and schedule information",
        "Allow seat selection",
        "Manage bookings and cancellations"
      ],
      role: "Full-stack Developer - Built the complete booking system.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap"],
      features: [
        "Route and schedule search",
        "Interactive seat selection",
        "Online booking and confirmation",
        "Booking management and cancellation",
        "Admin dashboard for bus and route management"
      ],
      screenshots: [],
      challenges: [
        "Implementing real-time seat availability tracking",
        "Preventing double booking of seats"
      ],
      solutions: [
        "Used database locking and transaction management to ensure seat integrity",
        "Implemented seat status updates in real-time"
      ],
      results: "Created a user-friendly bus booking platform that simplifies the ticket purchasing process.",
      githubUrl: "https://github.com/Franco3291/online-bus-booking-system", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2023,
      featured: false
    },
    {
      id: "salon-management-system",
      title: "Salon Management System",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      status: "github-only",
      shortDescription: "A management system for salons covering appointments, clients, services and payments.",
      description: "A salon management system that handles appointment scheduling, client records, service management and payment tracking for beauty salons.",
      problem: "Salons needed a digital solution to manage appointments, client information and payments more efficiently than manual record-keeping.",
      objectives: [
        "Manage client appointments",
        "Track client records and preferences",
        "Manage services and pricing",
        "Process and track payments"
      ],
      role: "Full-stack Developer - Designed and implemented the complete system.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap"],
      features: [
        "Appointment scheduling and management",
        "Client database with history",
        "Service and pricing management",
        "Payment tracking",
        "Daily/weekly reports"
      ],
      screenshots: [],
      challenges: [
        "Designing a flexible appointment scheduling system",
        "Managing client-service relationships"
      ],
      solutions: [
        "Implemented a time-slot based scheduling system",
        "Created a relational database design that links clients, appointments and services"
      ],
      results: "Delivered a practical salon management solution that improves organization and customer service.",
      githubUrl: "https://github.com/Franco3291/salon-management-system", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2023,
      featured: false
    },
    {
      id: "barcode-attendance-system",
      title: "Barcode Attendance System",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
      status: "github-only",
      shortDescription: "An attendance system using barcode scanning for fast and accurate student tracking.",
      description: "A barcode-based attendance system that uses barcode scanning to record student attendance quickly and accurately, reducing manual entry errors.",
      problem: "Traditional attendance marking is slow and prone to errors. Barcode scanning provides a faster, more accurate alternative.",
      objectives: [
        "Use barcode scanning for attendance recording",
        "Reduce time spent on attendance marking",
        "Minimize errors in attendance records",
        "Provide instant attendance reports"
      ],
      role: "Full-stack Developer - Built the barcode integration and attendance management system.",
      technologiesUsed: ["PHP", "MySQL", "JavaScript", "HTML5", "CSS3", "Barcode Scanner API"],
      features: [
        "Barcode generation for students",
        "Barcode scanning for attendance",
        "Real-time attendance recording",
        "Automated report generation",
        "Integration with student database"
      ],
      screenshots: [],
      challenges: [
        "Integrating barcode scanning hardware/software",
        "Ensuring accurate barcode reading"
      ],
      solutions: [
        "Used a web-based barcode scanning library compatible with standard scanners",
        "Implemented validation checks to confirm successful scans"
      ],
      results: "Created an efficient attendance system that significantly speeds up the attendance process and improves accuracy.",
      githubUrl: "https://github.com/Franco3291/barcode-attendance-system", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2024,
      featured: false
    },
    {
      id: "online-rental-management-system",
      title: "Online Rental Management System",
      category: "Web Development",
      technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      status: "github-only",
      shortDescription: "A platform for managing rental properties, tenants, leases and payments.",
      description: "An online rental management system that helps property owners and managers track properties, tenants, lease agreements and rental payments.",
      problem: "Property managers needed a centralized system to manage multiple properties, tenants and payments without relying on spreadsheets and paper records.",
      objectives: [
        "Manage property listings and details",
        "Track tenant information and leases",
        "Process and record rental payments",
        "Generate rental reports"
      ],
      role: "Full-stack Developer - Designed and built the complete rental management platform.",
      technologiesUsed: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "Bootstrap"],
      features: [
        "Property and unit management",
        "Tenant registration and management",
        "Lease agreement tracking",
        "Rent payment recording",
        "Overdue payment alerts",
        "Financial reports"
      ],
      screenshots: [],
      challenges: [
        "Modeling complex property-tenant-lease relationships",
        "Implementing payment tracking with arrears calculation"
      ],
      solutions: [
        "Designed a comprehensive database schema for property management",
        "Implemented automated arrears and balance calculations"
      ],
      results: "Delivered a robust rental management system that streamlines property operations and financial tracking.",
      githubUrl: "https://github.com/Franco3291/online-rental-management-system", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2024,
      featured: false
    },
    {
      id: "ai-content-detection",
      title: "AI Content Detection Tool",
      category: "Python",
      technologies: ["Python", "Machine Learning", "NLP"],
      status: "github-only",
      shortDescription: "A tool for detecting AI-generated content using natural language processing techniques.",
      description: "An AI content detection tool that analyzes text to identify whether it was likely generated by artificial intelligence, using NLP and machine learning techniques.",
      problem: "With the rise of AI-generated content, there is a growing need to identify machine-written text for academic integrity, content authenticity and quality control purposes.",
      objectives: [
        "Detect AI-generated text with reasonable accuracy",
        "Provide a user-friendly interface for text analysis",
        "Support multiple text input methods",
        "Explain detection results clearly"
      ],
      role: "Developer - Implemented the detection algorithms and built the analysis interface.",
      technologiesUsed: ["Python", "NLTK", "scikit-learn", "Flask"],
      features: [
        "Text analysis and classification",
        "AI probability scoring",
        "Batch text processing",
        "Results visualization",
        "API endpoint for integration"
      ],
      screenshots: [],
      challenges: [
        "Building a model with meaningful detection accuracy",
        "Handling different text lengths and styles"
      ],
      solutions: [
        "Used a combination of statistical and ML-based features for detection",
        "Implemented text preprocessing to normalize input"
      ],
      results: "Developed a working prototype that provides AI content detection with reasonable accuracy, demonstrating practical ML application.",
      githubUrl: "https://github.com/Franco3291/ai-content-detection", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2025,
      featured: false
    },
    {
      id: "network-design-project",
      title: "Campus Network Design & Simulation",
      category: "Networking",
      technologies: ["Cisco Packet Tracer", "VLAN", "Routing", "Subnetting"],
      status: "github-only",
      shortDescription: "A complete campus network design with VLANs, inter-VLAN routing and DHCP implemented in Cisco Packet Tracer.",
      description: "A comprehensive campus network design project that demonstrates VLAN segmentation, inter-VLAN routing, DHCP configuration and network security best practices using Cisco Packet Tracer.",
      problem: "Designing a scalable and secure campus network that separates different departments while maintaining connectivity and efficient resource sharing.",
      objectives: [
        "Design a hierarchical campus network topology",
        "Implement VLAN segmentation for different departments",
        "Configure inter-VLAN routing",
        "Set up DHCP for automatic IP assignment",
        "Apply basic network security measures"
      ],
      role: "Network Designer - Designed the topology, planned IP addressing and configured all network devices.",
      technologiesUsed: ["Cisco Packet Tracer", "VLAN", "OSPF", "DHCP", "ACL", "Subnetting"],
      features: [
        "Hierarchical network design (Core, Distribution, Access)",
        "VLAN segmentation for departments",
        "Inter-VLAN routing with Router-on-a-Stick",
        "DHCP server configuration",
        "Access Control Lists for security",
        "Network documentation and diagrams"
      ],
      screenshots: [],
      challenges: [
        "Planning IP addressing to accommodate multiple VLANs",
        "Configuring inter-VLAN routing correctly",
        "Ensuring network security between departments"
      ],
      solutions: [
        "Used VLSM for efficient IP address allocation",
        "Implemented Router-on-a-Stick for inter-VLAN routing",
        "Applied ACLs to restrict unauthorized access"
      ],
      results: "Successfully designed and simulated a functional campus network that demonstrates practical networking skills and best practices.",
      githubUrl: "https://github.com/Franco3291/network-design-project", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: "assets/docs/network-design-docs.pdf", // TODO: Add documentation
      year: 2024,
      featured: true
    },
    {
      id: "cybersecurity-lab",
      title: "Cybersecurity Lab Exercises",
      category: "Cybersecurity",
      technologies: ["Kali Linux", "Wireshark", "Nmap", "Metasploit"],
      status: "github-only",
      shortDescription: "A collection of ethical hacking lab exercises covering reconnaissance, scanning and vulnerability analysis.",
      description: "A documented collection of cybersecurity lab exercises performed in a controlled environment, covering network reconnaissance, vulnerability scanning, password analysis and defensive security techniques.",
      problem: "Building practical cybersecurity skills requires hands-on experience in a safe, controlled lab environment.",
      objectives: [
        "Practice ethical hacking techniques in a lab environment",
        "Document findings and methodologies",
        "Learn defensive security measures",
        "Build a portfolio of security work"
      ],
      role: "Security Learner/Researcher - Performed all lab exercises in a controlled virtual environment and documented findings.",
      technologiesUsed: ["Kali Linux", "Nmap", "Wireshark", "Metasploit", "VirtualBox"],
      features: [
        "Network reconnaissance with Nmap",
        "Traffic analysis with Wireshark",
        "Vulnerability scanning exercises",
        "Password security analysis",
        "Defensive security recommendations",
        "Detailed lab write-ups"
      ],
      screenshots: [],
      challenges: [
        "Setting up a safe lab environment",
        "Understanding tool outputs and interpreting results"
      ],
      solutions: [
        "Used VirtualBox with isolated virtual networks",
        "Followed structured learning paths and documented each step"
      ],
      results: "Built a solid foundation in ethical hacking and security analysis with documented, reproducible lab exercises.",
      githubUrl: "https://github.com/Franco3291/cybersecurity-lab", // TODO: Replace with real repo URL
      liveUrl: null,
      documentationUrl: null,
      year: 2024,
      featured: true
    }
  ],

  /* ==================== LIVE PROJECTS ==================== */
  liveProjects: [
    {
      id: "live-portfolio",
      title: "Personal Portfolio Website",
      category: "Web Development",
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "live",
      shortDescription: "This portfolio website - a complete digital representation of my IT career and skills.",
      description: "A modern, responsive portfolio website showcasing my projects, certifications, skills and professional experience.",
      url: "https://francis-mwalimu-portfolio.example.com", // TODO: Replace with real live URL
      githubUrl: "https://github.com/Franco3291/francis-mwalimu-portfolio",
      year: 2025
    }
    // TODO: Add more live projects here as they are deployed
  ],

  /* ==================== CERTIFICATIONS ==================== */
  certifications: [
    {
      id: "ccna-intro",
      title: "Introduction to Networks (CCNA)",
      issuer: "Cisco Networking Academy",
      date: "2024",
      category: "Networking",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://www.credly.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/ccna-intro.pdf", // TODO: Add certificate file
      description: "Foundational networking course covering network concepts, IP addressing, Ethernet, and basic network configuration.",
      skills: ["Networking Basics", "IP Addressing", "Ethernet", "Network Configuration"]
    },
    {
      id: "cybersecurity-essentials",
      title: "Cybersecurity Essentials",
      issuer: "Cisco Networking Academy",
      date: "2024",
      category: "Cybersecurity",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://www.credly.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/cybersecurity-essentials.pdf", // TODO: Add certificate file
      description: "Introduction to cybersecurity concepts including threats, vulnerabilities, security principles and best practices.",
      skills: ["Security Fundamentals", "Threat Analysis", "Security Best Practices"]
    },
    {
      id: "python-basics",
      title: "Python for Beginners",
      issuer: "Cisco Networking Academy",
      date: "2023",
      category: "Programming",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://www.credly.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/python-basics.pdf", // TODO: Add certificate file
      description: "Introduction to Python programming covering syntax, data structures, functions and basic problem-solving.",
      skills: ["Python", "Programming Fundamentals", "Problem Solving"]
    },
    {
      id: "web-development",
      title: "Web Development Fundamentals",
      issuer: "Online Learning Platform", // TODO: Replace with real issuer
      date: "2023",
      category: "Web Development",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://example.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/web-development.pdf", // TODO: Add certificate file
      description: "Comprehensive introduction to HTML, CSS and JavaScript for building modern websites.",
      skills: ["HTML", "CSS", "JavaScript", "Responsive Design"]
    },
    {
      id: "linux-basics",
      title: "Linux Essentials",
      issuer: "Linux Professional Institute (LPI)", // TODO: Replace with real issuer
      date: "2024",
      category: "System Administration",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://example.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/linux-essentials.pdf", // TODO: Add certificate file
      description: "Foundational Linux skills covering command line, file systems, user management and system basics.",
      skills: ["Linux", "Command Line", "System Administration"]
    },
    {
      id: "database-design",
      title: "Database Design and SQL",
      issuer: "Online Learning Platform", // TODO: Replace with real issuer
      date: "2023",
      category: "Databases",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://example.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/database-design.pdf", // TODO: Add certificate file
      description: "Course covering relational database design, normalization and SQL query writing.",
      skills: ["SQL", "Database Design", "MySQL"]
    },
    {
      id: "ethical-hacking",
      title: "Ethical Hacking Essentials",
      issuer: "Online Learning Platform", // TODO: Replace with real issuer
      date: "2024",
      category: "Cybersecurity",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://example.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/ethical-hacking.pdf", // TODO: Add certificate file
      description: "Introduction to ethical hacking concepts, methodologies and tools used in penetration testing.",
      skills: ["Ethical Hacking", "Penetration Testing Basics", "Security Tools"]
    },
    {
      id: "mobile-development",
      title: "Mobile App Development with Flutter",
      issuer: "Online Learning Platform", // TODO: Replace with real issuer
      date: "2024",
      category: "Mobile Development",
      credentialId: "CERT-XXXX-XXXX", // TODO: Replace with real credential ID
      verificationUrl: "https://example.com/verify/XXXX", // TODO: Replace with real verification URL
      certificateUrl: "assets/docs/certificates/flutter-development.pdf", // TODO: Add certificate file
      description: "Introduction to cross-platform mobile development using Flutter and Dart.",
      skills: ["Flutter", "Dart", "Mobile UI Design"]
    }
  ],

  /* ==================== EXPERIENCE ==================== */
  experience: [
    {
      id: "exp-1",
      title: "ICT Intern",
      organization: "Your Organization Name", // TODO: Replace with real organization
      location: "Nairobi, Kenya",
      startDate: "2024",
      endDate: "Present",
      current: true,
      description: "Gaining hands-on experience in network administration, system support, hardware maintenance and IT service delivery.",
      responsibilities: [
        "Assisted with network setup, configuration and troubleshooting",
        "Provided technical support to staff and users",
        "Maintained computer systems and peripherals",
        "Assisted with software installation and updates",
        "Documented IT procedures and support tickets"
      ]
    },
    {
      id: "exp-2",
      title: "Freelance Web Developer",
      organization: "Self-Employed",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      current: true,
      description: "Developing websites and web applications for small businesses and individual clients.",
      responsibilities: [
        "Built responsive websites using HTML, CSS, JavaScript and PHP",
        "Designed and implemented MySQL databases",
        "Provided ongoing maintenance and support",
        "Communicated with clients to understand requirements"
      ]
    },
    {
      id: "exp-3",
      title: "Industrial Attachment - IT Support",
      organization: "Your Organization Name", // TODO: Replace with real organization
      location: "Nairobi, Kenya",
      startDate: "2023",
      endDate: "2023",
      current: false,
      description: "Completed an industrial attachment focused on IT support and system administration.",
      responsibilities: [
        "Provided first-line technical support",
        "Assisted with computer maintenance and repair",
        "Helped with network cabling and setup",
        "Supported the IT team with daily operations"
      ]
    },
    {
      id: "exp-4",
      title: "Volunteer IT Support",
      organization: "Community Organization", // TODO: Replace with real organization
      location: "Nairobi, Kenya",
      startDate: "2022",
      endDate: "2023",
      current: false,
      description: "Volunteered to provide IT support and digital literacy training to community members.",
      responsibilities: [
        "Trained community members on basic computer skills",
        "Assisted with setting up computer labs",
        "Provided ongoing technical support"
      ]
    }
  ],

  /* ==================== EDUCATION ==================== */
  education: [
    {
      id: "edu-1",
      institution: "Your University/College Name", // TODO: Replace with real institution
      qualification: "Diploma in Information Technology",
      field: "Information Technology",
      startDate: "2022",
      endDate: "2024",
      current: false,
      description: "Comprehensive IT diploma covering networking, programming, databases, web development, cybersecurity and system administration.",
      coursework: [
        "Computer Networks",
        "Programming (Python, Java, C)",
        "Web Development",
        "Database Systems",
        "Operating Systems",
        "Cybersecurity Fundamentals",
        "System Administration",
        "Software Engineering"
      ],
      achievements: [
        "Graduated with distinction", // TODO: Adjust as needed
        "Completed major projects in networking and web development"
      ]
    },
    {
      id: "edu-2",
      institution: "Your High School Name", // TODO: Replace with real institution
      qualification: "Kenya Certificate of Secondary Education (KCSE)",
      field: "Secondary Education",
      startDate: "2018",
      endDate: "2021",
      current: false,
      description: "Completed secondary education with a strong focus on mathematics and sciences.",
      coursework: ["Mathematics", "Physics", "Computer Studies", "English", "Kiswahili"],
      achievements: []
    }
  ],

  /* ==================== ACHIEVEMENTS ==================== */
  achievements: [
    {
      id: "ach-1",
      title: "Best Student Project - Web Development",
      description: "Awarded for the Online Class Attendance System project during my IT diploma studies.",
      icon: "🏆",
      year: "2024"
    },
    {
      id: "ach-2",
      title: "Cisco Networking Academy Completion",
      description: "Successfully completed the Introduction to Networks and Cybersecurity Essentials courses.",
      icon: "🎓",
      year: "2024"
    },
    {
      id: "ach-3",
      title: "Hackathon Participant",
      description: "Participated in a university hackathon, developing a solution within 48 hours.",
      icon: "💡",
      year: "2023"
    },
    {
      id: "ach-4",
      title: "Community Tech Volunteer",
      description: "Volunteered to set up a computer lab and train community members on digital skills.",
      icon: "🤝",
      year: "2023"
    },
    {
      id: "ach-5",
      title: "GitHub Open Source Contributions",
      description: "Actively contributing to open source projects and maintaining personal repositories.",
      icon: "⭐",
      year: "2024"
    },
    {
      id: "ach-6",
      title: "Continuous Learning Milestone",
      description: "Completed 8+ professional certifications across networking, cybersecurity and development.",
      icon: "📚",
      year: "2025"
    }
  ],

  /* ==================== SERVICES ==================== */
  services: [
    {
      id: "svc-1",
      title: "Website Development",
      icon: "🌐",
      description: "Professional, responsive websites built with modern technologies.",
      items: [
        "Business and personal websites",
        "E-commerce solutions",
        "Website redesign and maintenance",
        "SEO-friendly development"
      ]
    },
    {
      id: "svc-2",
      title: "Software & System Development",
      icon: "💻",
      description: "Custom software solutions tailored to your business needs.",
      items: [
        "Web-based management systems",
        "Desktop applications",
        "Database-driven solutions",
        "System integration"
      ]
    },
    {
      id: "svc-3",
      title: "Networking Services",
      icon: "🌐",
      description: "Network design, setup and optimization for homes and businesses.",
      items: [
        "Network design and planning",
        "Router and switch configuration",
        "VLAN setup and management",
        "Wireless network optimization"
      ]
    },
    {
      id: "svc-4",
      title: "Network Setup & Troubleshooting",
      icon: "🔧",
      description: "Reliable network installation and problem resolution.",
      items: [
        "Network installation and configuration",
        "Connectivity troubleshooting",
        "Performance optimization",
        "Network documentation"
      ]
    },
    {
      id: "svc-5",
      title: "CCTV & Structured Cabling",
      icon: "📹",
      description: "Security camera installation and professional cabling services.",
      items: [
        "CCTV installation and configuration",
        "Structured cabling (CAT6, fiber)",
        "Cable management and labeling",
        "System testing and documentation"
      ]
    },
    {
      id: "svc-6",
      title: "Database Systems",
      icon: "🗄️",
      description: "Database design, implementation and management.",
      items: [
        "Database design and modeling",
        "SQL query optimization",
        "Data migration and backup",
        "Database administration"
      ]
    },
    {
      id: "svc-7",
      title: "Computer Support & Maintenance",
      icon: "🖥️",
      description: "Comprehensive computer support for individuals and businesses.",
      items: [
        "Hardware installation and repair",
        "Software installation and updates",
        "Virus and malware removal",
        "System optimization"
      ]
    },
    {
      id: "svc-8",
      title: "Multimedia Services",
      icon: "🎨",
      description: "Creative multimedia solutions for your brand and content.",
      items: [
        "Graphic design (posters, logos)",
        "Video editing",
        "Presentation design",
        "Social media graphics"
      ]
    }
  ],

  /* ==================== TESTIMONIALS ==================== */
  testimonials: [
    {
      id: "test-1",
      name: "Client Name", // TODO: Replace with real testimonial
      role: "Business Owner",
      company: "Company Name",
      text: "Francis delivered a professional website that exceeded my expectations. He was responsive, professional and delivered on time. I highly recommend his services.",
      avatarInitials: "CN"
    },
    {
      id: "test-2",
      name: "Supervisor Name", // TODO: Replace with real testimonial
      role: "ICT Supervisor",
      company: "Organization Name",
      text: "During his attachment, Francis demonstrated strong technical skills and a great attitude. He was reliable, quick to learn and always willing to help.",
      avatarInitials: "SN"
    },
    {
      id: "test-3",
      name: "Lecturer Name", // TODO: Replace with real testimonial
      role: "Lecturer",
      company: "University Name",
      text: "Francis was one of the most dedicated students I have taught. His project work showed depth of understanding and practical application of IT concepts.",
      avatarInitials: "LN"
    }
  ],

  /* ==================== BLOG POSTS ==================== */
  blogPosts: [
    {
      id: "blog-1",
      title: "Getting Started with Cisco Packet Tracer: A Beginner's Guide",
      category: "Networking",
      date: "2025-01-15",
      readTime: "8 min read",
      excerpt: "Learn how to set up your first network simulation in Cisco Packet Tracer, from installing the software to building a simple LAN with two PCs and a switch.",
      content: "placeholder", // Full content would go here
      tags: ["Cisco", "Packet Tracer", "Networking", "Beginner"]
    },
    {
      id: "blog-2",
      title: "Understanding VLANs: Why Your Network Needs Them",
      category: "Networking",
      date: "2024-12-10",
      readTime: "10 min read",
      excerpt: "VLANs are essential for network segmentation and security. This article explains what VLANs are, how they work and how to configure them.",
      content: "placeholder",
      tags: ["VLAN", "Networking", "Security"]
    },
    {
      id: "blog-3",
      title: "My Journey Building an Online Class Attendance System",
      category: "Development",
      date: "2024-11-20",
      readTime: "12 min read",
      excerpt: "A behind-the-scenes look at how I designed and built a complete attendance management system using PHP and MySQL, including the challenges I faced.",
      content: "placeholder",
      tags: ["PHP", "MySQL", "Web Development", "Project Story"]
    },
    {
      id: "blog-4",
      title: "Cybersecurity Basics: Protecting Yourself Online",
      category: "Cybersecurity",
      date: "2024-10-05",
      readTime: "6 min read",
      excerpt: "Practical tips for staying safe online, from creating strong passwords to recognizing phishing attempts and securing your devices.",
      content: "placeholder",
      tags: ["Cybersecurity", "Security", "Tips"]
    },
    {
      id: "blog-5",
      title: "Introduction to Subnetting: A Practical Approach",
      category: "Networking",
      date: "2024-09-18",
      readTime: "9 min read",
      excerpt: "Subnetting doesn't have to be confusing. This guide breaks down IP addressing and subnetting with practical examples you can apply immediately.",
      content: "placeholder",
      tags: ["Subnetting", "IP Addressing", "Networking"]
    },
    {
      id: "blog-6",
      title: "Building My First Flutter App: HydroTrack",
      category: "Mobile Development",
      date: "2024-08-22",
      readTime: "7 min read",
      excerpt: "Lessons learned from building a water tracking mobile app with Flutter, from setting up the project to publishing a working prototype.",
      content: "placeholder",
      tags: ["Flutter", "Mobile", "Dart"]
    }
  ],

  /* ==================== NETWORKING PORTFOLIO ==================== */
  networkingProjects: [
    {
      id: "net-1",
      title: "Campus Network Design",
      type: "Network Design",
      description: "Complete campus network with VLAN segmentation, inter-VLAN routing and DHCP configuration.",
      tags: ["Cisco Packet Tracer", "VLAN", "OSPF", "DHCP"],
      fileUrl: "assets/docs/networking/campus-network.pkt", // TODO: Add Packet Tracer file
      documentationUrl: "assets/docs/networking/campus-network-docs.pdf", // TODO: Add documentation
      year: "2024"
    },
    {
      id: "net-2",
      title: "VLAN Configuration Lab",
      type: "VLAN Configuration",
      description: "Hands-on lab demonstrating VLAN creation, port assignment and trunk configuration on Cisco switches.",
      tags: ["VLAN", "Trunking", "Switching"],
      fileUrl: "assets/docs/networking/vlan-lab.pkt", // TODO: Add Packet Tracer file
      documentationUrl: "assets/docs/networking/vlan-lab-docs.pdf", // TODO: Add documentation
      year: "2024"
    },
    {
      id: "net-3",
      title: "Routing & Switching Lab",
      type: "Routing & Switching",
      description: "Lab covering static routing, OSPF configuration and inter-network communication.",
      tags: ["OSPF", "Static Routing", "Routing"],
      fileUrl: "assets/docs/networking/routing-lab.pkt", // TODO: Add Packet Tracer file
      documentationUrl: "assets/docs/networking/routing-lab-docs.pdf", // TODO: Add documentation
      year: "2024"
    },
    {
      id: "net-4",
      title: "IP Addressing & Subnetting Exercises",
      type: "IP Addressing",
      description: "Structured exercises covering VLSM, subnet calculation and IP address planning for various network sizes.",
      tags: ["Subnetting", "VLSM", "IP Planning"],
      fileUrl: "assets/docs/networking/subnetting-exercises.pdf", // TODO: Add file
      documentationUrl: null,
      year: "2023"
    },
    {
      id: "net-5",
      title: "Network Troubleshooting Case Study",
      type: "Troubleshooting",
      description: "Documented troubleshooting scenarios covering common connectivity issues and their resolutions.",
      tags: ["Troubleshooting", "Diagnostics", "Documentation"],
      fileUrl: "assets/docs/networking/troubleshooting-case.pdf", // TODO: Add file
      documentationUrl: null,
      year: "2024"
    },
    {
      id: "net-6",
      title: "Small Office Network Setup",
      type: "Network Setup",
      description: "Design and configuration of a small office network with internet sharing, file sharing and printing services.",
      tags: ["Small Office", "LAN", "File Sharing"],
      fileUrl: "assets/docs/networking/small-office.pkt", // TODO: Add Packet Tracer file
      documentationUrl: "assets/docs/networking/small-office-docs.pdf", // TODO: Add documentation
      year: "2024"
    }
  ],

  /* ==================== CYBERSECURITY PORTFOLIO ==================== */
  cybersecurityProjects: [
    {
      id: "sec-1",
      title: "Network Reconnaissance Lab",
      type: "Reconnaissance",
      description: "Performed network scanning and enumeration using Nmap in a controlled lab environment. Documented open ports, services and potential vulnerabilities.",
      tags: ["Nmap", "Reconnaissance", "Kali Linux"],
      writeupUrl: "assets/docs/security/recon-lab.pdf", // TODO: Add write-up
      year: "2024"
    },
    {
      id: "sec-2",
      title: "Traffic Analysis with Wireshark",
      type: "Traffic Analysis",
      description: "Captured and analyzed network traffic to understand protocols, identify anomalies and practice packet-level analysis.",
      tags: ["Wireshark", "Packet Analysis", "Protocols"],
      writeupUrl: "assets/docs/security/wireshark-lab.pdf", // TODO: Add write-up
      year: "2024"
    },
    {
      id: "sec-3",
      title: "Password Security Analysis",
      type: "Security Analysis",
      description: "Analyzed password strength and hashing techniques. Demonstrated the importance of strong passwords and proper hashing algorithms.",
      tags: ["Passwords", "Hashing", "Security"],
      writeupUrl: "assets/docs/security/password-analysis.pdf", // TODO: Add write-up
      year: "2024"
    },
    {
      id: "sec-4",
      title: "Vulnerability Scanning Exercise",
      type: "Vulnerability Analysis",
      description: "Used vulnerability scanning tools to identify weaknesses in a test environment and documented remediation recommendations.",
      tags: ["Vulnerability Scanning", "Remediation"],
      writeupUrl: "assets/docs/security/vuln-scan.pdf", // TODO: Add write-up
      year: "2024"
    },
    {
      id: "sec-5",
      title: "CTF Challenge Write-ups",
      type: "CTF",
      description: "Participated in Capture The Flag challenges and documented solutions for various categories including web exploitation and cryptography.",
      tags: ["CTF", "Web Exploitation", "Cryptography"],
      writeupUrl: "assets/docs/security/ctf-writeups.pdf", // TODO: Add write-up
      year: "2024"
    },
    {
      id: "sec-6",
      title: "Defensive Security: Hardening Guide",
      type: "Defensive Security",
      description: "Created a practical guide for hardening Linux systems and securing network services based on industry best practices.",
      tags: ["Hardening", "Linux", "Best Practices"],
      writeupUrl: "assets/docs/security/hardening-guide.pdf", // TODO: Add write-up
      year: "2025"
    }
  ],

  /* ==================== RESOURCES / DOWNLOADS ==================== */
  resources: [
    {
      id: "res-1",
      title: "Curriculum Vitae (CV)",
      description: "My professional CV in PDF format",
      icon: "📄",
      url: "assets/docs/Francis_Mwalimu_CV.pdf", // TODO: Add real CV file
      type: "CV"
    },
    {
      id: "res-2",
      title: "Online Class Attendance System - Documentation",
      description: "Project documentation and user guide",
      icon: "📘",
      url: "assets/docs/attendance-system-docs.pdf", // TODO: Add documentation
      type: "Project Documentation"
    },
    {
      id: "res-3",
      title: "Campus Network Design - Documentation",
      description: "Network design documentation and diagrams",
      icon: "📊",
      url: "assets/docs/network-design-docs.pdf", // TODO: Add documentation
      type: "Network Documentation"
    },
    {
      id: "res-4",
      title: "Cybersecurity Lab Write-ups",
      description: "Collection of security lab exercises and findings",
      icon: "🔒",
      url: "assets/docs/security-lab-writeups.pdf", // TODO: Add documentation
      type: "Security Documentation"
    },
    {
      id: "res-5",
      title: "Portfolio Presentation",
      description: "Overview presentation of my work and skills",
      icon: "📽️",
      url: "assets/docs/portfolio-presentation.pdf", // TODO: Add presentation
      type: "Presentation"
    }
  ],

  /* ==================== GITHUB REPOS ==================== */
  githubRepos: [
    {
      id: "repo-1",
      name: "francis-mwalimu-portfolio",
      description: "Personal IT portfolio website source code",
      language: "HTML/CSS/JavaScript",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/francis-mwalimu-portfolio"
    },
    {
      id: "repo-2",
      name: "online-class-attendance-system",
      description: "Web-based attendance management system built with PHP and MySQL",
      language: "PHP",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/online-class-attendance-system"
    },
    {
      id: "repo-3",
      name: "campus-deals",
      description: "Campus marketplace platform for students",
      language: "PHP",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/campus-deals"
    },
    {
      id: "repo-4",
      name: "library-management-system",
      description: "Library management system with book and member tracking",
      language: "PHP",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/library-management-system"
    },
    {
      id: "repo-5",
      name: "hydrotrack",
      description: "Flutter mobile app for water intake tracking",
      language: "Dart",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/hydrotrack"
    },
    {
      id: "repo-6",
      name: "network-design-project",
      description: "Campus network design and simulation with Cisco Packet Tracer",
      language: "Packet Tracer",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/network-design-project"
    },
    {
      id: "repo-7",
      name: "cybersecurity-lab",
      description: "Ethical hacking lab exercises and documentation",
      language: "Documentation",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/cybersecurity-lab"
    },
    {
      id: "repo-8",
      name: "ai-content-detection",
      description: "AI content detection tool using NLP and machine learning",
      language: "Python",
      stars: 0,
      forks: 0,
      url: "https://github.com/Franco3291/ai-content-detection"
    }
  ]
};