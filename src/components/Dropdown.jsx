import { useState, useEffect, useRef } from "react";

export default function Dropdown({ 
    trigger, 
    children, 
    placement = 'bottom',
    offsetDistance = 10,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block">
            <div ref={triggerRef} onClick={toggleDropdown}>
                {trigger}
            </div>
            
            {isOpen && (
                <div 
                    ref={dropdownRef}
                    className={`absolute z-50 ${placement === 'bottom' ? 'top-full' : 'bottom-full'} left-0 ${className}`}
                    style={{ marginTop: placement === 'bottom' ? `${offsetDistance}px` : '0', marginBottom: placement === 'top' ? `${offsetDistance}px` : '0' }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
