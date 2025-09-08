"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Group, Menu, UnstyledButton } from "@mantine/core";
import classes from "./LanguagePicker.module.css";
import { HiChevronDown } from "react-icons/hi2";
import { US, BR, ES } from "country-flag-icons/react/3x2";

const data = [
    { label: "English", image: US, value: "en" },
    { label: "Português Brasil", image: BR, value: "pt-BR" },
    { label: "Español", image: ES, value: "es" },
];

export function LanguagePicker() {
    const router = useRouter();
    const pathname = usePathname();
    const [opened, setOpened] = useState(false);

    const currentLocale = pathname.split("/")[1];
    const defaultSelected = data.find(item => item.value === currentLocale) || data[0];

    const [selected, setSelected] = useState(defaultSelected);

    const handleChange = (item: (typeof data)[0]) => {
        setSelected(item);
        const segments = pathname.split("/");
        segments[1] = item.value;
        router.push(segments.join("/"));
    };

    const items = data.map((item) => (
        <Menu.Item
            leftSection={<item.image width={18} height={18} />}
            onClick={() => handleChange(item)}
            key={item.label}
        >
            {item.label}
        </Menu.Item>
    ));

    return (
        <div className="flex w-full">
            <Menu
                onOpen={() => setOpened(true)}
                onClose={() => setOpened(false)}
                radius="md"
                width="target"
                withinPortal
            >
                <Menu.Target>
                    <UnstyledButton
                        className={classes.control}
                        data-expanded={opened || undefined}
                    >
                        <Group gap="xs">
                            <selected.image width={22} height={22} />
                            <span className={classes.label}>{selected.label}</span>
                        </Group>
                        <HiChevronDown size={16} className={classes.icon} />
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>{items}</Menu.Dropdown>
            </Menu>
        </div>
    );
}
