
import { cn } from "@/lib/utils";

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    color?: string;
    subLabel?: string;
}

export function NumberInput({ label, value, onChange, color, subLabel }: NumberInputProps) {
    return (
        <div className="flex flex-col gap-3 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    className={cn(
                        "h-20 w-full bg-accent/30 border-2 rounded-3xl px-8 text-3xl font-black outline-none transition-all placeholder:text-muted-foreground/30",
                        color
                    )}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pointer-events-none group-hover:text-primary/40 transition-colors">
                    {subLabel}
                </span>
            </div>
        </div>
    );
}
