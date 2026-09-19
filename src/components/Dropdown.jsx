import { useState, useEffect, useRef } from "react";

export default function Dropdown({ trigger, children, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                dropdownRef.current?.querySelector("button")?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative inline-block w-full lg:w-auto">
            {trigger({ isOpen, toggleDropdown: () => setIsOpen((open) => !open) })}
            {isOpen && (
                <div className={`relative z-50 mt-2 lg:absolute lg:left-0 lg:top-full ${className}`}>
                    {children}
                </div>
            )}
        </div>
    );
}
