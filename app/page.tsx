"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Github,
  Linkedin,
  Mail,
  FileText,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendContactEmail } from "./actions";

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "projects", "resume", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bubble animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bubbles: Bubble[] = [];
    const bubbleCount = Math.floor(window.innerWidth / 30); // Responsive bubble count

    class Bubble {
      x: number;
      y: number;
      size: number;
      speedY: number;
      color: string;
      alpha: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 5 + 1;
        this.speedY = Math.random() * 0.5 + 0.1;
        this.color = "#0f0";
        this.alpha = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.y -= this.speedY;
        if (this.y < -this.size * 2) {
          this.y = canvas.height + this.size * 2;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Initialize bubbles
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push(new Bubble());
    }

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((bubble) => {
        bubble.update();
        bubble.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendContactEmail(formData);

      if (result.success) {
        setFormStatus({
          type: "success",
          message: result.message,
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        setFormStatus({
          type: "error",
          message: result.message,
        });
      }
    } catch (error) {
      setFormStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);

      // Clear status message after 5 seconds
      setTimeout(() => {
        setFormStatus({
          type: "idle",
          message: "",
        });
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 relative overflow-hidden">
      {/* Background canvas for bubbles */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-green-500">
            <span className="text-white">Pratap</span>Portfolio
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["home", "projects", "resume", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize text-sm font-medium transition-colors hover:text-green-400 ${
                  activeSection === item ? "text-green-500" : "text-gray-400"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-b border-[#1a1a1a]">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {["home", "projects", "resume", "contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize text-sm font-medium transition-colors hover:text-green-400 ${
                    activeSection === item ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center relative z-10 pt-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-white">Full-Stack</span>
              <span className="text-green-500"> Developer</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Building modern web applications with passion and precision.
            </p>
            <p className="text-gray-400 mb-8 text-lg">
              With 1.5 years of experience in developing full-stack
              applications, I specialize in creating responsive, user-friendly
              interfaces backed by robust server-side architecture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => scrollToSection("projects")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                View Projects
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                variant="outline"
                className="border-green-600 text-green-500 hover:bg-green-900/20"
              >
                Contact Me
              </Button>
            </div>

            <div className="flex mt-12 space-x-6">
              <a
                href="https://github.com/pratapxgupta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github size={24} />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/pratapxkumar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin size={24} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:kpratap580@gmail.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail size={24} />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="text-white">Featured</span>
            <span className="text-green-500"> Projects</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden hover:border-green-500/50 transition-all duration-300 group">
              <div className="h-64 bg-[#0c0c0c] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-800 bg-gray-900">
                  <img
                    src="/sav1.png"
                    alt="Project 1 Screenshot"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-green-400">
                    usedcarsenignes
                  </h3>
                  <div className="flex space-x-2">
                    <a
                      href="https://www.usedcarsengines.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink size={20} />
                      <span className="sr-only">Live Demo</span>
                    </a>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Developed a full-stack web application using Next.js for both
                  frontend and backend, ensuring seamless user experience.
                  Implemented advanced search and filter functionality to help
                  users locate specific car engines efficiently. Integrated a
                  secure backend with MongoDB and optimized performance with
                  server-side rendering (SSR). Added user authentication and
                  session management for personalized and secure interactions.
                  Successfully deployed and maintained the application for
                  scalability and future enhancements.{" "}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Next js
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Node.js
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    MongoDB
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Express
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    TypeScript
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Vercel
                  </span>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden hover:border-green-500/50 transition-all duration-300 group">
              <div className="h-64 bg-[#0c0c0c] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-800 bg-gray-900">
                  <img
                    src="/sav2.png"
                    alt="Project 2 Screenshot"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-green-400">
                    Creative Tura
                  </h3>
                  <div className="flex space-x-2">
                    <a
                      href="https://creativetura.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink size={20} />
                      <span className="sr-only">Live Demo</span>
                    </a>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Built a visually appealing and responsive website using
                  Next.js, enhancing brand visibility and user engagement.
                  Integrated Nodemailer for efficient form submissions and added
                  interactive design elements to improve user
                  experience.Deployed the website successfully, maintaining
                  scalability and ease of future enhancements.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Next.js
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    TypeScript
                  </span>

                

                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Nodemailer
                  </span>
                  <span className="px-2 py-1 bg-[#1a1a1a] text-green-400 text-xs rounded">
                    Vercel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-20 relative z-10 bg-[#0c0c0c]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="text-white">My</span>
            <span className="text-green-500"> Resume</span>
          </h2>

          <div className="max-w-3xl mx-auto bg-[#111111] border border-[#222222] rounded-lg p-8">
            {/* Experience */}
            <div className="mb-10">
              <h3 className="text-xl font-bold mb-6 text-green-400">
                Work Experience
              </h3>

              <div className="mb-6 border-l-2 border-green-500/30 pl-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-semibold">
                    Creative Tura{" "}
                    <span className="text-green-400 mb-2">
                      | Full-Stack Developer
                    </span>
                  </h4>
                  <span className="text-gray-400 text-sm">
                    April 2024 - Present
                  </span>
                </div>
                <div className="text-green-400 mb-2">
                  Creative Tura |{" "}
                  <a
                    href="https://creativetura.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-500"
                  >
                    Live Demo
                  </a>
                </div>
                <ul className="text-gray-400 text-sm list-disc pl-4">
                  <li>
                    Developed and deployed a responsive, visually appealing
                    website using <strong>Next.js</strong> to enhance brand
                    visibility and engagement.
                  </li>
                  <li>
                    Integrated <strong>Nodemailer</strong> for seamless form
                    submission, ensuring efficient user communication.
                  </li>
                  <li>
                    Optimized frontend performance with server-side rendering
                    (SSR) and implemented interactive design elements for an
                    enhanced user experience.
                  </li>
                  <li>
                    Ensured cross-browser compatibility and mobile
                    responsiveness to deliver a consistent experience across
                    devices.
                  </li>
                </ul>
              </div>
              <div className="mb-6 border-l-2 border-green-500/30 pl-4">
                <div className="flex justify-between mb-1"></div>
                <div className="text-green-400 mb-2">
                  usedcarsengines |{" "}
                  <a
                    href="https://www.usedcarsengines.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-500"
                  >
                    Live Demo
                  </a>
                </div>
                <p className="text-gray-400 text-sm">
                  <ul className="list-disc pl-5">
                    <li>
                      Developed and deployed a full-stack web application,{" "}
                      <strong>Used Cars Engines</strong>, using{" "}
                      <strong>Next.js</strong> for both the frontend and backend
                      to ensure a seamless and dynamic user experience.
                    </li>
                    <li>
                      Leveraged <strong>Server Actions</strong> to handle
                      server-side functionality efficiently, eliminating the
                      need for traditional API routes.
                    </li>
                    <li>
                      Integrated <strong>MongoDB</strong> to securely store and
                      manage vehicle and user data.
                    </li>
                    <li>
                      Developed dynamic search, filter, and pagination
                      functionalities to help users efficiently locate specific
                      car engines.
                    </li>
                    <li>
                      Implemented user authentication and session management to
                      provide a secure and personalized experience for users.
                    </li>
                  </ul>
                </p>
              </div>

              <div className="border-l-2 border-green-500/30 pl-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-semibold">
                    Aarvy Technologies{" "}
                    <span className="text-green-400 mb-2">
                      | Frontend Developer Trainee
                    </span>
                  </h4>
                  <span className="text-gray-400 text-sm">
                    Dec 2023 - March 2024
                  </span>
                </div>

                <ul className="text-gray-400 text-sm list-disc pl-4">
                  <li>
                    Developed responsive web interfaces using HTML, CSS,
                    JavaScript, and React.js.
                  </li>
                  <li>
                    Integrated REST APIs and ensured smooth data fetching and
                    display.
                  </li>
                  <li>
                    Collaborated with senior developers to enhance UI/UX
                    consistency.
                  </li>
                  <li>
                    Debugged and optimized front-end performance for a seamless
                    user experience.
                  </li>
                  <li>
                    Gained hands-on experience in version control (
                    <strong>Git & GitHub</strong>) and collaborative development
                    workflows.
                  </li>
                </ul>
              </div>
            </div>

            {/* Education */}
            <div className="mb-10">
              <h3 className="text-xl font-bold mb-6 text-green-400">
                Education
              </h3>

              <div className="border-l-2 border-green-500/30 pl-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-semibold">
                    Master of Computer Applications (MCA) | CGPA: 8.2
                  </h4>
                  <span className="text-gray-400 text-sm">2022 - 2024</span>
                </div>
                <div className="text-green-400 mb-2">
                  GD Goenka University, Gurugram, Haryana (India)
                </div>
                <p className="text-gray-400 text-sm"></p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-green-400">Skills</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>HTML5, CSS3, JavaScript (ES6+)</li>
                    <li>React.js, Next.js</li>
                    <li>Tailwind CSS, Bootstrap</li>
                    <li>TypeScript</li>
                    <li>ReduxToolKit, Context API</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>Node.js, Express</li>
                    <li>MongoDB, MySQL</li>
                    <li>RESTful APIs</li>
                    <li>Firebase</li>
                    <li>Authentication & Authorization</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Tools & Others</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>Git, GitHub</li>
                    <li>VS Code, Postman</li>
                    <li>WebSockets (Socket.IO)</li>
                    <li>Responsive Design</li>
                    <li>Nodemailer</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Soft Skills</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>Problem Solving</li>
                    <li>Team Collaboration</li>
                    <li>Communication</li>
                    <li>Time Management</li>
                    <li>Adaptability</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                <FileText size={16} />
                Download Full Resume
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="text-white">Get In</span>
            <span className="text-green-500"> Touch</span>
          </h2>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-green-500" size={20} />
                  <a
                    href="mailto:kpratap580@gmail.com"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    kpratap580@gmail.com
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Linkedin className="text-green-500" size={20} />
                  <a
                    href="https://www.linkedin.com/in/pratapxkumar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Pratap Kumar
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Github className="text-green-500" size={20} />
                  <a
                    href="https://github.com/pratapxgupta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    pratapxgupta
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  Location
                </h3>
                <p className="text-gray-300">Gurugram, Haryana</p>
                <p className="text-gray-400 mt-2">
                  Available for remote work worldwide, open to collaborating on
                  innovative and challenging projects.
                </p>
              </div>
            </div>

            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">
                Send a Message
              </h3>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#222222] rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#222222] rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-white"
                    placeholder="Your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#222222] rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-white"
                    placeholder="Your message"
                  ></textarea>
                </div>

                {/* Form status message */}
                {formStatus.message && (
                  <div
                    className={`p-3 rounded-md ${
                      formStatus.type === "success"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {formStatus.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#1a1a1a] relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Pratap. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Styled JSX for additional styling */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background-color: #0a0a0a;
          color: #f3f4f6;
        }

        ::selection {
          background-color: rgba(16, 185, 129, 0.2);
          color: #fff;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
      `}</style>
    </div>
  );
}
