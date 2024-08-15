import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="flex p-3 space-x-4 justify-between border items-center">
      <a href="/">Burak Şen</a>
      <div className="flex space-x-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
        Personal Blog
      </div>
      <div className="flex space-x-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
        <a href="https://github.com/burakssen" target="_blank" rel="noreferrer">
          <FaGithub />
        </a>
        <a
          href="https://www.instagram.com/burak.ssen/"
          target="_blank"
          rel="noreferrer"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.linkedin.com/in/burak-ssen/"
          target="_blank"
          rel="noreferrer"
        >
          <FaLinkedin />
        </a>
      </div>
    </div>
  );
};

export default Navbar;
