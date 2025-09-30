/* Custom styles for School 105 */
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #3b82f6;
  --secondary: #dc2626;
}

/* Base styles */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  background-color: white;
  color: #1f2937;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in { animation: fadeIn 0.8s ease-out; }
.animate-slide-down { animation: slideDown 0.6s ease-out; }
.animate-slide-up { animation: slideUp 0.6s ease-out; }
.animate-scale-in { animation: scaleIn 0.5s ease-out; }

/* Header */
.header-glow {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

/* Navigation */
.nav-item {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease !important;
}

.nav-item:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.3) !important;
}

/* Cards */
.enhanced-card {
  background: white !important;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  color: #1f2937;
}

.enhanced-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
}

/* Facts section */
.facts-container {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
}

/* Fact dots */
#china-facts .fact-dot {
  background: rgba(255, 255, 255, 0.5);
}

#china-facts .fact-dot.active {
  background: white;
  transform: scale(1.2);
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
}

/* Theme toggle */
.theme-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

/* Teacher cards */
.teacher-card {
  transition: all 0.4s ease;
}

.teacher-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Class cards */
.class-card {
  transition: all 0.3s ease;
}

.class-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.2);
}

/* Night theme */
body[data-theme="night"] {
  background-color: #111827 !important;
  color: #f3f4f6;
}

body[data-theme="night"] .bg-white { 
  background-color: #1f2937 !important; 
  color: #f3f4f6; 
}
body[data-theme="night"] .enhanced-card { 
  background: #374151 !important; 
  color: #f3f4f6; 
  border-color: #4b5563; 
}
body[data-theme="night"] .text-gray-700 { color: #e5e7eb; }
body[data-theme="night"] .text-gray-600 { color: #d1d5db; }
body[data-theme="night"] .text-gray-800 { color: #f9fafb; }
body[data-theme="night"] .text-gray-500 { color: #9ca3af; }
body[data-theme="night"] .bg-blue-50 { background-color: #1e3a8a !important; color: #f9fafb; }
body[data-theme="night"] .bg-red-50 { background-color: #7f1d1d !important; color: #f9fafb; }
body[data-theme="night"] .bg-green-50 { background-color: #14532d !important; color: #f9fafb; }
body[data-theme="night"] .bg-purple-50 { background-color: #4c1d95 !important; color: #f9fafb; }
body[data-theme="night"] .bg-blue-100 { background-color: #1e40af !important; color: #f9fafb; }
body[data-theme="night"] .bg-red-100 { background-color: #991b1b !important; color: #f9fafb; }
body[data-theme="night"] .bg-green-100 { background-color: #166534 !important; color: #f9fafb; }
body[data-theme="night"] .bg-purple-100 { background-color: #5b21b6 !important; color: #f9fafb; }
body[data-theme="night"] .border-gray-100 { border-color: #374151; }
body[data-theme="night"] .border-gray-300 { border-color: #4b5563; }

/* Facts section night theme */
body[data-theme="night"] .facts-container {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
}

/* Theme classes */
.theme-bg { background-color: white; }
.theme-text { color: #1f2937; }
.theme-card { background: white; color: #1f2937; }

body[data-theme="night"] .theme-bg { background-color: #111827; }
body[data-theme="night"] .theme-text { color: #f3f4f6; }
body[data-theme="night"] .theme-card { background: #1f2937; color: #f3f4f6; }

/* Modal styles */
.modal-content {
  animation: scaleIn 0.3s ease-out;
}

/* Notification styles */
#notification.show {
  animation: slideDown 0.5s ease-out forwards;
}

/* Q&A styles */
.question-item {
  border-left: 4px solid #3b82f6;
}

.answer-item {
  border-left: 4px solid #10b981;
  margin-left: 2rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .enhanced-card {
    margin-bottom: 1rem;
  }
  
  .grid {
    gap: 1rem;
  }
}

/* Loading animation */
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

body[data-theme="night"] ::-webkit-scrollbar-track {
  background: #374151;
}

body[data-theme="night"] ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

body[data-theme="night"] ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
