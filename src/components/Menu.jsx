import { useId } from "react";
import Dropdown from "./Dropdown";

const links = [
    { href: "/actividades", label: "Actividades" },
    { href: "/temporada", label: "Fechas y precios" },
    { href: "/contacto", label: "Contacto" },
    { href: "/galeria", label: "Fotos" },
    { href: "/blog", label: "Noticias" },
    { href: "/equipo", label: "Equipo" },
];

const homeSections = [
    { href: "/#actividades", label: "Actividades" },
    { href: "/#nuestros-pilares", label: "Nuestros Pilares" },
    { href: "/#edades", label: "Edades" },
    { href: "/#sobre-nosotros", label: "Sobre Nosotros" },
    { href: "/#preguntas-frecuentes", label: "Preguntas frecuentes" },
];

const itemClass = "flex min-h-11 items-center rounded-xl px-3 py-2 leading-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary lg:min-h-10 lg:px-2";
const inactiveClass = "text-white hover:bg-white/10 focus-visible:bg-white/10";
const activeClass = "bg-secondary font-semibold text-tertiary hover:bg-background2";

export default function Menu({ currentPath = "/", showTeam = false }) {
    const sectionsId = useId();
    const isActive = (path) => path === "/"
        ? currentPath === "/"
        : currentPath === path || currentPath.startsWith(`${path}/`);

    return (
        <>
            <li className="w-full lg:w-auto lg:shrink-0">
                <Dropdown
                    className="w-full rounded-2xl border border-white/10 bg-primary p-2 shadow-xl lg:w-72"
                    trigger={({ isOpen, toggleDropdown }) => (
                        <div className={`inline-flex min-h-11 items-stretch whitespace-nowrap overflow-hidden rounded-xl transition-colors duration-200 lg:min-h-10 ${isActive("/") ? activeClass : inactiveClass}`}>
                            <a
                                href="/"
                                aria-current={isActive("/") ? "page" : undefined}
                                className="flex items-center py-2 pl-3 pr-1 leading-tight focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary lg:pl-2"
                            >
                                Inicio
                            </a>
                            <button
                                type="button"
                                onClick={toggleDropdown}
                                aria-label="Mostrar secciones de Inicio"
                                aria-expanded={isOpen}
                                aria-controls={sectionsId}
                                className="flex min-w-8 items-center justify-center pr-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary"
                            >
                                <svg className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>
                        </div>
                    )}
                >
                    <ul id={sectionsId} className="space-y-0.5 text-base text-white lg:text-lg">
                        {homeSections.map(({ href, label }) => (
                            <li key={href}>
                                <a href={href} className="block rounded-xl px-3 py-2 leading-snug transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:outline-secondary">
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </Dropdown>
            </li>
            {links.filter(({ href }) => href !== "/equipo" || showTeam).map(({ href, label }) => (
                <li key={href} className="w-full lg:w-auto lg:shrink-0">
                    <a
                        href={href}
                        aria-current={isActive(href) ? "page" : undefined}
                        className={`${itemClass} whitespace-nowrap ${isActive(href) ? activeClass : inactiveClass}`}
                    >
                        {label}
                    </a>
                </li>
            ))}
        </>
    );
}
