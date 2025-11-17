import { useEffect,useState } from "react";
import Menu from "@/components/Menu";
export default function Header({ currentPath }) {

    const [ scrolled, setScrolled ] = useState(false);
    const [ isMobile, setIsMobile ] = useState(false);
    const [ showNavMobile, setShowNavMobile ] = useState(false);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleScroll = () => {
            setScrolled(window.scrollY > 209);
        };

        const handleMediaChange = (e) => {
            setIsMobile(!e.matches);
        };

        // Initial setup
        if (mediaQuery.matches) {
            setIsMobile(false);
        } else {
            setIsMobile(true);
        }
        handleScroll()

        // Attach listeners
        window.addEventListener("scroll", handleScroll);
        mediaQuery.addEventListener("change", handleMediaChange);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    }, []);
    
    const imgClass = () => {
        if (scrolled){
            return "max-lg:!w-16 lg:!w-20 xl:!w-24 lg:absolute lg:top-0 drop-shadow-[0px_3px_6px_rgba(0,0,0,0.5)]";
        }else{
            return "";
        }
    }
    const divImgClass = () => {
        
        if (scrolled){
            return "max-lg:!mt-4 lg:!mb-0";
        }else{
            return "";
        }
    }

    return(
        <>
            <header className={`fixed w-full top-0 z-50 transition-[margin] duration-300`}>
                <div className={`${scrolled ? "" : "gap-8"} py-4 container mx-auto flex justify-left items-center transition-[margin] duration-300`}>
                    {/* Logo a la izquierda */}
                    <div className={`${divImgClass()} lg:-mb-12 max-lg:mt-4 max-lg:bg-header max-lg:py-10 max-lg:px-3 max-lg:w-full max-lg:h-20 max-lg:rounded-3xl max-lg:relative max-lg:flex max-lg:flex-row max-lg:items-center max-lg:justify-between transition-[margin] duration-300 z-60`}>
                        <div className={`${scrolled ? "hidden" : ""} max-lg:w-10 max-lg:px-1 lg:hidden`}></div>
                        <a href="/" >
                            <img
                                src="/images/logo/club-leonardo-murialdo.svg"
                                alt="logo Club Murialdo"
                                className={`${imgClass()} relative z-60 max-lg:w-32 lg:w-36 xl:w-38 hover:scale-105 hover:drop-shadow-[0px_3px_6px_rgba(255,255,255,0.5)] transition-all duration-300`}
                            />
                        </a>
                        <button onClick={() => setShowNavMobile(!showNavMobile)} className="lg:hidden text-white hover:text-primary hover:bg-light rounded-xl px-1 py-1 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10" viewBox="0 0 20 20"><path fill="currentColor" fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75m7 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75M2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10" clipRule="evenodd"/></svg>
                        </button>
                        {/* Menú móvil */}
                        <div className={`${showNavMobile ? "" : "hidden"} lg:hidden z-50 bg-header py-6 w-full rounded-3xl absolute left-0 top-24`}>
                            <ul className="flex flex-col items-start justify-center gap-8 text-white text-2xl px-4">
                                <Menu currentPath={currentPath} />
                            </ul>
                        </div>
                    </div>
                    
                    {/* Menú completo a la derecha */}
                    <nav className={`${scrolled ? "pl-20" : ""} max-lg:hidden bg-header py-4 lg:py-2 xl:py-4 rounded-3xl transition-[padding-left] duration-300`}>
                        <ul className="flex items-center justify-center gap-2 lg:gap-4 2xl:gap-8 text-white text-xl lg:text-xl 2xl:text-3xl px-6">
                            <Menu currentPath={currentPath} />
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    )
}
