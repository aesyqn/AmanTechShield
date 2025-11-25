import React from 'react';
import { Hero } from '../components/Hero';
import { ServiceCard } from '../components/ServiceCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { Footer } from '../components/Footer';
import { services, testimonials, teamMembers } from '../utils/mockData';
interface LandingPageProps {
  onStartScanning: () => void;
}
export function LandingPage({
  onStartScanning
}: LandingPageProps) {
  return <div className="min-h-screen w-full">
      {/* Hero Section */}
      <Hero onStartScanning={onStartScanning} />

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            About <span className="text-cyan-400">AmanTech Shield</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We are a cybersecurity firm specializing in comprehensive security
            audits for financial institutions. Our unique approach combines
            cutting-edge technology with Islamic ethical principles, ensuring
            your security measures align with both technical excellence and
            moral responsibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">
              Our Mission
            </h3>
            <p className="text-gray-300">
              To provide world-class cybersecurity solutions that protect
              digital assets while upholding the highest ethical standards
              rooted in Islamic values.
            </p>
          </div>
          <div className="glass p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">👁️</div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Our Vision</h3>
            <p className="text-gray-300">
              To become the leading cybersecurity partner for Islamic financial
              institutions worldwide, setting the standard for ethical security
              practices.
            </p>
          </div>
          <div className="glass p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Our Values</h3>
            <p className="text-gray-300">
              Amanah (Trust), Maslahah (Public Benefit), Ihsan (Excellence), and
              Adl (Justice) guide every security decision we make.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Meet Our <span className="text-cyan-400">Expert Team</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our team of cybersecurity professionals brings decades of combined
            experience in protecting financial institutions and upholding
            ethical security practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map(member => <TeamMemberCard key={member.id} name={member.name} role={member.role} email={member.email} image={member.image} />)}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Services <span className="text-cyan-400">We Offer</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive cybersecurity solutions tailored for banking and
            financial institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => <ServiceCard key={service.id} title={service.title} description={service.description} icon={service.icon} onStartNow={onStartScanning} />)}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Customer <span className="text-cyan-400">Testimonials</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Hear from our satisfied clients about their experience with
            AmanTech Shield
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => <TestimonialCard key={testimonial.id} name={testimonial.name} position={testimonial.position} content={testimonial.content} rating={testimonial.rating} />)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Secure Your{' '}
            <span className="text-cyan-400">Banking System?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your comprehensive security audit today and protect what
            matters most
          </p>
          <button onClick={onStartScanning} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all">
            Start Free Scan
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>;
}