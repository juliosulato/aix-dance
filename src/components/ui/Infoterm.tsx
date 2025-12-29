import Link from "next/link";
import React from "react";

type Props = {
    children?: React.ReactNode;
    label: string;
    icon?: React.ReactNode;
    href?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function InfoTerm({ children, label, icon, href, ...props }: React.PropsWithChildren<Props>) {
    
    const content = (
        <div className="flex flex-col gap-2" {...props}>
            <div className="flex items-center gap-2">
                {icon && <span className="text-gray-400">{icon}</span>}
                <h3 className="text-black text-base font-medium">{label}</h3>
            </div>
            <div className="text-base text-neutral-500 font-normal">
                {children ?? "-"}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="hover:opacity-75 transition-opacity">{content}</Link>;
    }

    return content;
}
