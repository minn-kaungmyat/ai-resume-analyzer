import { Link } from "react-router";
import { FileText, Upload } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="flex items-center gap-2">
        <FileText className="w-7 h-7" />
        <p className="brand-logo">Resumind</p>
      </Link>
      <Link to="/upload">
        <button className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span className="upload-text">Upload Resume</span>
        </button>
      </Link>
    </nav>
  );
};

export default Navbar;
