import * as React from "react"
import { Clock } from "lucide-react"

export interface CustomTimeSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { label: string; value: string }[]
}

const CustomTimeSelect = React.forwardRef<HTMLSelectElement, CustomTimeSelectProps>(
    ({ className, options, ...props }, ref) => {
        return (
            <div className="relative group w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                    <Clock className="w-full h-full" />
                </div>
                <select
                    className={`w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer ${className}`}
                    ref={ref}
                    {...props}
                >
                    <option value="" disabled hidden>
                        --:--
                    </option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        )
    }
)
CustomTimeSelect.displayName = "CustomTimeSelect"

export { CustomTimeSelect }
