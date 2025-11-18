import Dropdown from "./Dropdown";

export default function Menu1({ currentPath = '/' }) {
    // Función para verificar si la ruta está activa
    const isActive = (path) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(path);
    };

    // Clases para enlaces activos
    const getActiveClass = (path) => {
        return isActive(path) ? 'bg-secondary text-tertiary font-semibold' : '';
    };
    // Clases para enlaces activos en grupo
    const getActiveGroupClass = (path) => {
        return isActive(path) ? 'bg-secondary text-tertiary font-semibold' : '';
    };

    return (
        <>
        <li>
            <Dropdown
                placement="bottom"
                offsetDistance={10}
                className="bg-primary divide-y divide-light rounded-xl shadow w-52 lg:w-72 xl:w-96"
                trigger={
                    <div className={`inline-flex items-center max-sm:w-full rounded-xl`}>
                        <a 
                            href="/" 
                            className={`cursor-pointer max-sm:hover:text-primary sm:hover:bg-primary/70 sm:hover:text-white pl-2 pr-1 py-2 rounded-l-xl ${getActiveGroupClass('/')}`}
                        >
                            Inicio
                        </a>
                        <button
                            className={`inline-flex items-center cursor-pointer sm:hover:bg-primary/70 sm:hover:text-white pl-1 pr-2 py-4 rounded-r-xl ${getActiveGroupClass('/')}`}
                            type="button"
                        >
                            <svg className="size-3 2xl:size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                            </svg>
                        </button>
                    </div>
                }
            >
                <ul className="py-2 text-lg lg:text-xl xl:text-2xl text-white" >
                    <li>
                        <a href="/#actividades" className="block px-4 py-2 lg:py-4 hover:bg-light hover:rounded-2xl hover:text-primary">Actividades</a>
                    </li>
                    <li>
                        <a href="/#nuestros-pilares" className="block px-4 py-2 lg:py-4 hover:bg-light hover:rounded-2xl hover:text-primary">Nuestros Pilares</a>
                    </li>
                    <li>
                        <a href="/#edades" className="block px-4 py-2 lg:py-4 hover:bg-light hover:rounded-2xl hover:text-primary">Edades</a>
                    </li>
                    <li>
                        <a href="/#sobre-nosotros" className="block px-4 py-2 lg:py-4 hover:bg-light hover:rounded-2xl hover:text-primary">Sobre Nosotros</a>
                    </li>
                    <li>
                        <a href="/#preguntas-frecuentes" className="block px-4 py-2 lg:py-4 hover:bg-light hover:rounded-2xl hover:text-primary">Preguntas frecuentes</a>
                    </li>
                </ul>
            </Dropdown>
        </li>
        <li>
            <a href="/actividades" className={`max-sm:hover:bg-light max-sm:hover:text-primary max-sm:w-full px-2 py-2 rounded-xl sm:hover:bg-primary/70 sm:hover:text-white ${getActiveClass('/actividades')}`}>Actividades</a>
        </li>
        <li>
            <a href="/temporada" className={`max-sm:hover:bg-light max-sm:hover:text-primary max-sm:w-full px-2 py-2 rounded-xl sm:hover:bg-primary/70 sm:hover:text-white ${getActiveClass('/temporada')}`}>Fechas y precios</a>
        </li>
        <li>
            <a href="/contacto" className={`max-sm:hover:bg-light max-sm:hover:text-primary max-sm:w-full px-2 py-2 rounded-xl sm:hover:bg-primary/70 sm:hover:text-white ${getActiveClass('/contacto')}`}>Contacto</a>
        </li>
        <li>
            <a href="/galeria" className={`max-sm:hover:bg-light max-sm:hover:text-primary max-sm:w-full px-2 py-2 rounded-xl sm:hover:bg-primary/70 sm:hover:text-white ${getActiveClass('/galeria')}`}>Fotos</a>
        </li>
        <li>
            <a href="/blog" className={`max-sm:hover:bg-light max-sm:hover:text-primary max-sm:w-full px-2 py-2 rounded-xl sm:hover:bg-primary/70 sm:hover:text-white ${getActiveClass('/blog')}`}>Noticias</a>
        </li>
        <li>
            <a href="/equipo" className={`max-sm:hover:bg-light max-sm:hover:text-primary max-sm:w-full px-2 py-2 rounded-xl sm:hover:bg-primary/70 sm:hover:text-white ${getActiveClass('/equipo')}`}>Equipo</a>
        </li>
        </>
    )
}