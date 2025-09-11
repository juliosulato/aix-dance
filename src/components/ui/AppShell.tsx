"use client";

import { ActionIcon, AppShell as AppShellMantine, Avatar, Burger, Button, Menu, MenuItem, NavLink, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useMenuData from "@/utils/menuData";
import { TbCalendarEvent, TbSettings } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";
import LogoSVG from "../Logo";
import { HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi2";
import { signOut, useSession } from "next-auth/react";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { LuBrain, LuLogOut } from "react-icons/lu";
import { MdGroups } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";
import { useTranslations } from "next-intl";
import { LanguagePicker } from "./LanguagePicker";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [activeMain, setActiveMain] = useState<number | string | null>(null);
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
    const pathname = usePathname();
    const menuData = useMenuData();

    const session = useSession();

    const t = useTranslations("appShell");

    return (
        <AppShellMantine
            padding="md"
            header={{ height: 80, }}
            navbar={{
                width: 300,
                breakpoint: 'xl',
                collapsed: { mobile: mobileOpened, desktop: desktopOpened }
            }}

        >
            <AppShellMantine.Header className="flex items-center justify-between h-full">
                <div className="flex items-center justify-between gap-2  py-2 px-4 xl:px-6 xl:py-3 xl:!min-w-[300px] h-[80px] xl:border-r xl:border-neutral-300">
                    <LogoSVG className={`h-full`} />
                    <Burger opened={!desktopOpened} onClick={toggleDesktop} size="sm" className="hidden xl:block" />
                </div>

                <div className="flex items-center justify-end gap-2 h-full px-4 md:px-6 w-full">
                    <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="xl" size="sm" />



                    <Menu position="bottom-end">
                        <Menu.Target>
                            <Tooltip label={t('header.quickAccess.label')} color="violet">
                                <ActionIcon size="42px" radius="lg" variant="light" color="gray" >
                                    <IoIosAddCircleOutline className="text-2xl" />
                                </ActionIcon>
                            </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown >
                            <Menu.Item leftSection={<LuBrain />}>
                                {t('header.quickAccess.newLead')}
                            </Menu.Item>
                            <Menu.Item leftSection={<FaRegUser />}>
                                {t('header.quickAccess.newStudent')}
                            </Menu.Item>
                            <Menu.Item leftSection={<MdGroups />}>
                                {t('header.quickAccess.newClass')}
                            </Menu.Item>
                            <Menu.Item leftSection={<PiMoneyWavy />}>
                                {t('header.quickAccess.newPayBill')}
                            </Menu.Item>
                            <Menu.Item leftSection={<TbCalendarEvent />}>
                                {t('header.quickAccess.newEvent')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>

                    <Tooltip label={t("header.notifications.label")} color="violet">
                        <ActionIcon size="42px" radius="lg" variant="light" color="gray">
                            <IoNotificationsOutline className="text-2xl" />
                        </ActionIcon>
                    </Tooltip>
                    <Menu>
                        <Menu.Target>
                            <Button className="flex items-center gap-2 !h-full !p-0" variant="transparent">
                                <Avatar src={session.data?.user?.image ?? null} radius="lg" size="42px" color="violet" name={session.data?.user?.image ? undefined : `${session.data?.user?.name}`} />
                                <HiOutlineChevronDown />
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<FaRegUser />}>
                                {t("header.user_menu.profile")}
                            </Menu.Item>
                            <Menu.Item leftSection={<LuLogOut />} onClick={() => signOut({ redirect: true, redirectTo: "/auth/signin" })}>
                                {t("header.user_menu.logout")}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </AppShellMantine.Header>

            <AppShellMantine.Navbar className="py-4 md:py-6 px-4 md:px-6 flex flex-col gap-4 justify-between">
                <div className="flex flex-col gap-4 relative">

                    <div className="flex flex-col gap-2">
                        {menuData.map((item, index) => (
                            <div key={index} className="flex flex-col gap-1">
                                <NavLink
                                    color="violet"
                                    leftSection={item.icon}
                                    label={item.label}
                                    active={activeMain === index}
                                    onClick={() => {
                                        setActiveMain(activeMain === index ? null : index)
                                    }}
                                    opened={activeMain === index}
                                    rightSection={item.subitems && <HiOutlineChevronRight size={12} className="mantine-rotate-rtl" />}
                                    classNames={{ section: "text-xl m-auto" }}
                                    className={`rounded-full !py-3 transition-all duration-300 ease-in px-5 !justify-start`}
                                >
                                    {item?.subitems && activeMain === index ? (
                                        <div className="transition-all duration-300 ease-in">
                                            {item.subitems.map((subitem, subindex) => (
                                                <NavLink
                                                    color="violet"
                                                    variant="subtle"
                                                    key={subindex}
                                                    leftSection={subitem.icon}
                                                    label={subitem.label}
                                                    href={subitem.href}
                                                    className="rounded-full !px-5 !py-3 transition-all duration-300 ease-in"
                                                    classNames={{ section: "text-xl" }}

                                                    active={pathname === subitem.href}
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </NavLink>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {/* <NavLink
                        color="violet"
                        leftSection={<TbSettings />}
                        label={t("navbar.settings")}
                        active={pathname === "/settings"}
                        onClick={() => setActiveMain(activeMain === "/settings" ? null : "/settings")}
                        opened={activeMain === "/settings"}
                        className={`rounded-full !py-3 transition-all duration-300 ease-in !px-5 !justify-start `}
                        rightSection={<HiOutlineChevronRight size={12} className="mantine-rotate-rtl" />}
                    >
                        <LanguagePicker />
                    </NavLink> */}
                    <NavLink
                        color="violet"
                        leftSection={<BiSupport />}
                        label={t("navbar.support")}
                        href="https://wa.me/5514981834361?text=Olá!%20Gostaria%20de%20ajuda%20com%20o%20AIX Dance."
                        target="_blank"
                        active={pathname === "/support"}
                        className={`rounded-full !py-3 transition-all duration-300 ease-in !px-5 !justify-start `}
                    />

                </div>
            </AppShellMantine.Navbar>

            <AppShellMantine.Main>{children}</AppShellMantine.Main>
        </AppShellMantine>
    );
}