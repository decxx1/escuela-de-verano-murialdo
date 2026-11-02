import { useId } from "react";
import Dropdown from "./Dropdown";

const beforeSeason = [
    { href: "/actividades", label: "Actividades" },
];

const afterSeason = [
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
const sectionClass = "block rounded-xl px-3 py-2 leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-secondary";

function NavLink({ href, label, current }) {
    return (
        <li className="w-full lg:w-auto lg:shrink-0">
            <a
                href={href}
                aria-current={current ? "page" : undefined}
                className={`${itemClass} whitespace-nowrap ${current ? activeClass : inactiveClass}`}
            >
                {label}
            </a>
        </li>
    );
}

function NavDropdown({ href, label, sections, menuLabel, current, isSectionActive = () => false }) {
    const sectionsId = useId();

    return (
        <li className="w-full lg:w-auto lg:shrink-0">
            <Dropdown
                className="w-full rounded-2xl border border-white/10 bg-primary p-2 shadow-xl lg:w-72"
                trigger={({ isOpen, toggleDropdown }) => (
                    <div className={`inline-flex min-h-11 items-stretch whitespace-nowrap overflow-hidden rounded-xl transition-colors duration-200 lg:min-h-10 ${current ? activeClass : inactiveClass}`}>
                        <a
                            href={href}
                            aria-current={current ? "page" : undefined}
                            className="flex items-center py-2 pl-3 pr-1 leading-tight focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary lg:pl-2"
                        >
                            {label}
                        </a>
                        <button
                            type="button"
                            onClick={toggleDropdown}
                            aria-label={menuLabel}
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
                    {sections.map((section) => {
                        const sectionCurrent = isSectionActive(section.href);
                        return (
                            <li key={section.href}>
                                <a
                                    href={section.href}
                                    aria-current={sectionCurrent ? "page" : undefined}
                                    className={`${sectionClass} ${sectionCurrent ? activeClass : "hover:bg-white/10 focus-visible:bg-white/10"}`}
                                >
                                    {section.label}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </Dropdown>
        </li>
    );
}

export default function Menu({ currentPath = "/", showTeam = false, seasonSections = [] }) {
    const isActive = (path) => path === "/"
        ? currentPath === "/"
        : currentPath === path || currentPath.startsWith(`${path}/`);
    const visibleAfterSeason = afterSeason.filter(({ href }) => href !== "/equipo" || showTeam);

    return (
        <>
            <NavDropdown
                href="/"
                label="Inicio"
                sections={homeSections}
                menuLabel="Mostrar secciones de Inicio"
                current={isActive("/")}
            />
            {beforeSeason.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} current={isActive(href)} />
            ))}
            {seasonSections.length > 0 ? (
                <NavDropdown
                    href="/temporada"
                    label="Temporada"
                    sections={seasonSections}
                    menuLabel="Mostrar secciones de Temporada"
                    current={isActive("/temporada")}
                    isSectionActive={isActive}
                />
            ) : (
                <NavLink href="/temporada" label="Temporada" current={isActive("/temporada")} />
            )}
            {visibleAfterSeason.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} current={isActive(href)} />
            ))}
        </>
    );
}
