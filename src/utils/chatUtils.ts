
// Utility functions for the chatbot

export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
};

export const isGreeting = (text: string): boolean => {
  const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
  return greetings.some(greeting => text.toLowerCase().includes(greeting));
};

export const checkForThankYou = (text: string): boolean => {
  return text.toLowerCase().includes('thank you') || text.toLowerCase().includes('thanks');
};

export const checkForSecurityThreats = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('hack') || lowerText.includes('exploit') || lowerText.includes('inject')) {
    return "I've detected potentially harmful content in your message. Please ensure your queries are related to healthcare services.";
  }
  return null;
};

export const recognizeAppointmentType = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('doctor') || lowerText.includes('appointment')) return 'Doctor Appointment';
  if (lowerText.includes('x-ray') || lowerText.includes('xray')) return 'X-ray';
  if (lowerText.includes('ecg')) return 'ECG';
  if (lowerText.includes('mri')) return 'MRI Scan';
  return null;
};
