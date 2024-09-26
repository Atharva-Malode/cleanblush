
import { Link } from "react-scroll";
export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto w-full max-w-7xl p-4 py-6 lg:py-8">
        <hr className="my-6 border-black sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-black sm:text-center">
            © {new Date().getFullYear()}
            {" Clean Blush - dental Care Platform."}
            <Link
              activeClass="active"
              to={"home"}
              spy={true}
              smooth={true}
              offset={-80}
              duration={500}
              className="font-bold"
            >
              . All Rights Reserved.
            </Link>
          </span>          
        </div>
      </div>
    </footer>
  );
}

export default Footer;