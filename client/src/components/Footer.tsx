import React from 'react';
import { Link } from 'react-router-dom';
import { env } from '../config/env';
import { TrendingUp, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">Saham Trading</span>
            </div>
            <p className="text-sm text-gray-300">
              Professional stock market investment platform with MLM opportunities.
              Join thousands of successful investors building wealth through our platform.
            </p>
            <div className="flex space-x-4">
              <a
                href={env.TELEGRAM_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                <Send className="w-4 h-4 text-white" />

              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 transition-colors hover:text-white">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 transition-colors hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Investment Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Investment Packages</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Full Stock Package - 70,000 ETB </li>
              <li>Half Stock Package - 35,000 ETB</li>
              <li>Quarter Stock Package - 17,500 ETB </li>
              <li>Minimum Stock Package - 7,000 ETB </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <a
                  href={`mailto:${env.SUPPORT_EMAIL}`}
                  className="text-gray-300 underline hover:text-blue-600"
                >
                  {env.SUPPORT_EMAIL}
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <a
                  href={`tel:${env.COMPANY_PHONE}`}
                  className="text-gray-300 underline hover:text-blue-600"
                >
                  {env.COMPANY_PHONE}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <a
                  href="tel:+971582519576"
                  className="text-gray-300 underline hover:text-blue-600"
                >
                  +971582519576
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(env.COMPANY_ADDRESS)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 underline hover:text-blue-600"
                >
                  {env.COMPANY_ADDRESS}
                </a>
              </div>
      
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 text-center border-t border-gray-800">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-400">
              © 2024 Saham Trading. All rights reserved.
            </p>
            <div className="flex mt-4 space-x-6 md:mt-0">
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
