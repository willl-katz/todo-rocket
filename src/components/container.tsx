import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ContainerGridProps {
    children: ReactNode;
    className?: string;
}

export default function ContainerGrid({ children, className }:ContainerGridProps) {
    const defaultClass = 'w-full max-w-grid mx-auto px-3';
    const combinedClass = twMerge(defaultClass, className)
    return (
        <div className={combinedClass}>
            {children}
        </div>
    );
}