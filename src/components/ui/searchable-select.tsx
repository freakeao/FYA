"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar...", icon, required }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* hidden input for native html validation if required */}
            <input
                type="text"
                value={value}
                required={required}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                readOnly
                tabIndex={-1}
            />

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-left flex items-center justify-between",
                    !selectedOption && "text-muted-foreground font-normal text-[0.85rem]"
                )}
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none flex items-center justify-center">
                    {icon}
                </div>
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-border/40 relative bg-accent/10">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar en la lista..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-background border border-border/40 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <li className="py-6 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">No se encontraron resultados</li>
                        ) : (
                            filteredOptions.map(opt => (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-all",
                                            value === opt.value
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "hover:bg-accent text-foreground hover:pl-5"
                                        )}
                                    >
                                        {opt.label}
                                        {value === opt.value && <Check className="w-4 h-4" />}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
