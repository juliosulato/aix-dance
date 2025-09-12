"use client";
import { Burger, Menu } from "@mantine/core";
import { useTranslations } from "next-intl";
import { HiOutlineChevronLeft } from "react-icons/hi2";

type Props = {
    menu: {
        label: string;
        href: string;
    }[];
    items: string[];
};
export default function Breadcrumps({ menu, items }: Props) {
    const t = useTranslations("general");

    if (!menu.every(item => item.label && item.href)) {
        throw new Error("Each item must have a label, href, and icon");
    }


    return (
        <nav className="flex flex-wrap justify-center md:justify-start items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <button onClick={() => window.history.back()} className="px-2 py-1 text-neutral-800 border border-neutral-200 hover:bg-primary transition cursor-pointer hover:text-white flex flex-row gap-1 items-center justify-center rounded-full">
                <div className="flex items-center justify-center w-4 h-4 bg-primary text-white rounded-full">
                    <HiOutlineChevronLeft />
                </div>
                <span>{t("actions.back")}</span>
            </button>
            <Menu position="bottom-end" shadow="md" withArrow>
                <Menu.Target>
                    <div className="w-6 h-6 flex items-center justify-center bg-neutral-200 hover:bg-violet-300 hover:text-white transition rounded-full ">
                        <Burger size="xs" color="#525252" />
                    </div>
                </Menu.Target>
                <Menu.Dropdown>
                    {menu.map((item, index) => (
                        <Menu.Item key={index} >
                            <a href={item.href}>{item.label}</a>
                        </Menu.Item>)
                    )}
                </Menu.Dropdown>
            </Menu>
            {items.map((item, index) => (
                <span key={index} className="flex flex-wrap w-fit justify-center md:justify-start items-center text-neutral-800 text-wrap">
                    {item}
                    {index < items.length - 1 && <span className="mx-2 text-primary">/</span>}
                </span>
            ))}

        </nav>
    );
}