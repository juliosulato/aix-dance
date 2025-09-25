"use client";

import { ActionIcon, AppShell as AppShellMantine, Avatar, Burger, Button, Menu, NavLink, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import useMenuData from "@/utils/menuData";
import { TbCalendarEvent, TbSettings, TbUser } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";
import LogoSVG from "../Logo";
import { HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi2";
import { signOut, useSession } from "next-auth/react";
import NotificationBell from "./NotificationBell";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { LuBrain, LuLogOut } from "react-icons/lu";
import { MdGroups } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [activeMain, setActiveMain] = useState<number | string | null>(null);
    // mobileOpened represents whether the navbar is collapsed on mobile.
    // Start as true so the mobile navbar is closed by default.
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(true);
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
    const pathname = usePathname();
    const menuData = useMenuData();

    const session = useSession();


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
            <AppShellMantine.Header className="flex items-center justify-between h-full print:hidden">
                <div className="flex items-center justify-between gap-2  py-2 px-4 xl:px-6 xl:py-3 xl:!min-w-[300px] h-[80px] xl:border-r xl:border-neutral-300">
                    <LogoSVG className={`h-full`} />
                    <Burger opened={!desktopOpened} onClick={toggleDesktop} size="sm" className="hidden xl:block" />
                </div>

                <div className="flex items-center justify-end gap-2 h-full px-4 md:px-6 w-full">
                    {/* Burger shows opened when the menu is visible, so invert here to match collapsed state */}
                    <Burger opened={!mobileOpened} onClick={toggleMobile} hiddenFrom="xl" size="sm" />



                    <Menu position="bottom-end">
                        <Menu.Target>
                            <Tooltip label={"Ações rápidas"} color="violet">
                                <ActionIcon size="42px" radius="lg" variant="light" color="gray" >
                                    <IoIosAddCircleOutline className="text-2xl" />
                                </ActionIcon>
                            </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown >
                            <Menu.Item leftSection={<LuBrain />}>
                                {"Novo Lead"}
                            </Menu.Item>
                            <Menu.Item leftSection={<FaRegUser />}>
                                {"Novo Aluno"}
                            </Menu.Item>
                            <Menu.Item leftSection={<MdGroups />}>
                                {"Nova Turma"}
                            </Menu.Item>
                            <Menu.Item leftSection={<PiMoneyWavy />}>
                                {"Nova Cobrança"}
                            </Menu.Item>
                            <Menu.Item leftSection={<TbCalendarEvent />}>
                                {"Novo Evento"}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>

                    <NotificationBell />
                    <Menu>
                        <Menu.Target>
                            <Button className="flex items-center gap-2 !h-full !p-0" variant="transparent">
                                <Avatar src={session.data?.user?.image ?? null} radius="lg" size="42px" color="violet" name={session.data?.user?.image ? undefined : `${session.data?.user?.name}`} />
                                <HiOutlineChevronDown />
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {/* <Menu.Item leftSection={<FaRegUser />}>
                                {"Meu Perfil"}
                            </Menu.Item> */}
                            <Menu.Item leftSection={<LuLogOut />} onClick={() => signOut({ redirect: true, redirectTo: "/auth/signin" })}>
                                {"Sair"}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </AppShellMantine.Header>

            {session.data?.user.role !== "TEACHER" && (

                <AppShellMantine.Navbar className="py-4 md:py-6 px-4 md:px-6 flex flex-col gap-4 justify-between print:hidden">
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
                                            setActiveMain(activeMain === index ? null : index);
                                        }}
                                        href={item.href}
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
                        <NavLink
                            color="violet"
                            leftSection={<TbSettings />}
                            label={"Configurações"}
                            active={pathname === "/settings"}
                            onClick={() => setActiveMain(activeMain === "/settings" ? null : "/settings")}
                            opened={activeMain === "/settings"}
                            className={`rounded-full !py-3 transition-all duration-300 ease-in !px-5 !justify-start `}
                            rightSection={<HiOutlineChevronRight size={12} className="mantine-rotate-rtl" />}
                        >
                            {/* <NavLink
                                color="violet"
                                variant="subtle"
                                leftSection={<LuBrain />}
                                label={"Minha Academia"}
                                href={"/system/settings/company"}
                                className="rounded-full !px-5 !py-3 transition-all duration-300 ease-in"
                                classNames={{ section: "text-xl" }}
                                active={pathname === "/system/settings/company"}
                            /> */}
                            <NavLink
                                color="violet"
                                variant="subtle"
                                leftSection={<TbUser />}
                                label={"Usuários"}
                                href={"/system/settings/users"}
                                className="rounded-full !px-5 !py-3 transition-all duration-300 ease-in"
                                classNames={{ section: "text-xl" }}
                                active={pathname === "/system/settings/users"}
                            />

                            {/* <LanguagePicker /> */}
                        </NavLink>
                        <NavLink
                            color="violet"
                            leftSection={<BiSupport />}
                            label={"Suporte"}
                            href="https://wa.me/5514981834361?text=Ol%C3%A1!%20Gostaria%20de%20ajuda%20com%20o%20AIX%20Dance."
                            target="_blank"
                            active={pathname === "/support"}
                            className={`rounded-full !py-3 transition-all duration-300 ease-in !px-5 !justify-start `}
                        />

                    </div>
                </AppShellMantine.Navbar>
            )}

            <AppShellMantine.Main>{children}</AppShellMantine.Main>
        </AppShellMantine>
    );
}