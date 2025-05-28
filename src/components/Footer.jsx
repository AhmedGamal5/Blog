const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto"> {/* mt-auto pushes footer to the bottom */}
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-300 text-sm">
          &copy; {currentYear} My Blog. All rights reserved.
        </p>
        {/* You can add more links or information here if needed */}
        {/*
        <div className="flex justify-center space-x-4 mt-2">
          <a href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</a>
          <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;