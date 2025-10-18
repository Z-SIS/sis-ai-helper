'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Building, Truck, Users, Globe, Award, ArrowRight, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Color scheme based on CMYK values provided
  // SIS text color: C24 • M96 • Y91 • K0 ≈ #B91C1C (red-700)
  // Other colors: C0 • M0• Y0• K80 ≈ #333333 (gray-800)
  // C0 • M0 • Y0 • K100 ≈ #000000 (black)
  // Background: White

  const services = [
    {
      icon: Shield,
      title: "Security Services",
      description: "Comprehensive security solutions including manned guarding, electronic surveillance, and emergency response systems",
      features: ["Manned Guarding", "CCTV Surveillance", "Access Control", "Emergency Response"]
    },
    {
      icon: Building,
      title: "Facility Management",
      description: "End-to-end facility management services ensuring optimal operational efficiency and maintenance",
      features: ["Housekeeping", "Maintenance", "Pest Control", "Waste Management"]
    },
    {
      icon: Truck,
      title: "Cash Logistics",
      description: "Secure cash management solutions for banks, retailers, and financial institutions",
      features: ["Cash-in-Transit", "ATM Management", "Vault Services", "Cash Processing"]
    }
  ];

  const companyStats = [
    { number: "500+", label: "Corporate Clients" },
    { number: "2,00,000+", label: "Employees" },
    { number: "700+", label: "Branch Offices" },
    { number: "20+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-700 font-bold text-xl">SIS</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">SIS Group Enterprises</h1>
                  <p className="text-xs opacity-90">A Market Leader in Security, Cash Logistics & Facility Management</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="#home" className="hover:text-red-200 transition-colors">Home</Link>
              <Link href="#about" className="hover:text-red-200 transition-colors">About</Link>
              <Link href="#services" className="hover:text-red-200 transition-colors">Services</Link>
              <Link href="#leadership" className="hover:text-red-200 transition-colors">Leadership</Link>
              <Link href="#contact" className="hover:text-red-200 transition-colors">Contact</Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-red-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-red-600">
              <nav className="flex flex-col space-y-2">
                <Link href="#home" className="block py-2 hover:text-red-200 transition-colors">Home</Link>
                <Link href="#about" className="block py-2 hover:text-red-200 transition-colors">About</Link>
                <Link href="#services" className="block py-2 hover:text-red-200 transition-colors">Services</Link>
                <Link href="#leadership" className="block py-2 hover:text-red-200 transition-colors">Leadership</Link>
                <Link href="#contact" className="block py-2 hover:text-red-200 transition-colors">Contact</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-red-700 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              SIS Group Enterprises
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              A Market Leader in Security, Cash Logistics & Facility Management
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto opacity-90">
              An Indian multinational conglomerate providing world-class security, facility management, 
              and cash logistics services across multiple countries with a workforce of over 2,00,000 employees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-red-700 hover:bg-gray-100 px-8 py-3"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Our Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-red-700 px-8 py-3"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {companyStats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                About SIS Group
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  SIS Group Enterprises is an Indian multinational conglomerate headquartered in Delhi, 
                  specializing in security services, facility management, and cash logistics solutions.
                </p>
                <p>
                  With over two decades of experience, we have established ourselves as a trusted partner 
                  for businesses requiring comprehensive security and facility management solutions. Our 
                  services span across multiple countries, serving thousands of corporate clients.
                </p>
                <p>
                  Our commitment to excellence, innovation, and customer satisfaction has made us one 
                  of the largest security services providers in India, with a workforce exceeding 2,00,000 professionals.
                </p>
              </div>
              <div className="mt-8">
                <Button 
                  className="bg-red-700 hover:bg-red-800 text-white px-6 py-3"
                  onClick={() => document.getElementById('leadership')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn About Our Leadership
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-red-700 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800">Global Presence</h3>
                  <p className="text-sm text-gray-600 mt-1">Operations in 20+ countries</p>
                </div>
                <div className="text-center">
                  <Award className="h-12 w-12 text-red-700 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800">Industry Leader</h3>
                  <p className="text-sm text-gray-600 mt-1">Award-winning services</p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-red-700 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800">Expert Team</h3>
                  <p className="text-sm text-gray-600 mt-1">2,00,000+ professionals</p>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 text-red-700 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800">Trusted Security</h3>
                  <p className="text-sm text-gray-600 mt-1">500+ corporate clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive security, facility management, and cash logistics solutions 
              tailored to meet the unique needs of our clients across various industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 mb-6">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-red-700 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-gray-600">
              Led by visionary founders with decades of industry experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Founder & Chairman</h3>
                <p className="text-gray-600">Visionary leader with over 30 years of experience in security and facility management</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Managing Director</h3>
                <p className="text-gray-600">Strategic thinker driving operational excellence across all business verticals</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">CEO</h3>
                <p className="text-gray-600">Results-oriented leader focused on innovation and customer satisfaction</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In Touch
            </h2>
            <p className="text-lg opacity-90">
              Contact us to learn more about our services and how we can help secure your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <Phone className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="opacity-80">+91 11 1234 5678</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="opacity-80">info@sisgroup.in</p>
            </div>
            <div className="text-center">
              <MapPin className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Headquarters</h3>
              <p className="opacity-80">Delhi, India</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-red-700 hover:bg-red-600 text-white px-8 py-3"
            >
              Contact Us Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">ABOUT SIS GROUP</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                SIS Group Enterprises is an Indian multinational conglomerate headquartered in Delhi. 
                The company is engaged in providing security, facility management, and cash logistics services 
                across multiple countries with a workforce exceeding 2,00,000 employees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">USEFUL LINKS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link href="#home" className="hover:text-red-400 transition-colors">Home</Link></li>
                <li><Link href="#about" className="hover:text-red-400 transition-colors">About Us</Link></li>
                <li><Link href="#leadership" className="hover:text-red-400 transition-colors">Our Leadership</Link></li>
                <li><Link href="#contact" className="hover:text-red-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">OUR SOLUTIONS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Security Services</li>
                <li>Facility Management</li>
                <li>Cash Logistics</li>
                <li>Integrated Solutions</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm opacity-60">
            © 2024 SIS Group Enterprises. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}