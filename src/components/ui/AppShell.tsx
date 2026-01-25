"use client";

import {
  ActionIcon,
  AppShell as AppShellMantine,
  Avatar,
  Burger,
  Button,
  Menu,
  NavLink,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useMenuData from "@/hooks/menuData";
import { TbSettings, TbUser } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";
import LogoSVG from "../Logo";
import { HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi2";
import NotificationBell from "./NotificationBell";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { BsBox } from "react-icons/bs";
import { signOut } from "@/lib/auth-client";
import { SessionData } from "@/lib/auth-server";
export default function AppShell({ children, session }: { children: React.ReactNode; session?: SessionData }) {
  const [activeMain, setActiveMain] = useState<number | string | null>(null);
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(true);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const pathname = usePathname();
  const menuData = useMenuData();
  const router = useRouter();


  return (
    <AppShellMantine
      padding="md"
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: "xl",
        collapsed: { mobile: mobileOpened, desktop: desktopOpened },
      }}
    >
      <AppShellMantine.Header className="flex items-center justify-between h-full print:hidden">
        <div className="flex items-center justify-between gap-2  py-2 px-4 xl:px-6 xl:py-3 xl:min-w-300px! h-80px! xl:border-r xl:border-neutral-300">
          <LogoSVG className={`h-full`} />
          <Burger
            opened={!desktopOpened}
            onClick={toggleDesktop}
            size="sm"
            className="hidden xl:block"
          />
        </div>

        <div className="flex items-center justify-end gap-2 h-full px-4 md:px-6 w-full">
          <Burger
            opened={!mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="xl"
            size="sm"
          />

          <Menu position="bottom-end">
            <Menu.Target>
              <Tooltip label={"Ações rápidas"} color="violet">
                <ActionIcon
                  size="42px"
                  radius="lg"
                  variant="light"
                  color="gray"
                >
                  <IoIosAddCircleOutline className="text-2xl" />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {/* <Menu.Item leftSection={<LuBrain />}>
                                {"Novo Lead"}
                            </Menu.Item> */}
              <Menu.Item leftSection={<FaRegUser />}>{"Novo Aluno"}</Menu.Item>
              <Menu.Item leftSection={<BsBox />}>{"Novo Produto"}</Menu.Item>
              {/* <Menu.Item leftSection={<MdGroups />}>
                                {"Nova Turma"}
                            </Menu.Item>
                            <Menu.Item leftSection={<PiMoneyWavy />}>
                                {"Nova Cobrança"}
                            </Menu.Item>
                            <Menu.Item leftSection={<TbCalendarEvent />}>
                                {"Novo Evento"}
                            </Menu.Item> */}
            </Menu.Dropdown>
          </Menu>
          <NotificationBell />
          <Menu>
            <Menu.Target>
              <Button
                className="flex items-center gap-2 h-full! p-0!"
                variant="transparent"
              >
                <Avatar
                  src={session?.user?.image ?? null}
                  radius="lg"
                  size="42px"
                  color="violet"
                  name={
                    session?.user?.image
                      ? undefined
                      : `${session?.user?.firstName} ${session?.user?.lastName}`
                  }
                />
                <HiOutlineChevronDown />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {/* <Menu.Item leftSection={<FaRegUser />}>
                                {"Meu Perfil"}
                            </Menu.Item> */}
              <Menu.Item
                leftSection={<LuLogOut />}
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/auth/signin");
                      },
                    },
                  })
                }
              >
                {"Sair"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </AppShellMantine.Header>

      {session?.user.role !== "TEACHER" && (
        <AppShellMantine.Navbar className="py-4 md:py-6 px-4 md:px-6 flex flex-col gap-4 justify-between print:hidden">
          <div className="flex flex-col gap-4 relative">
            <div className="flex flex-col gap-2">
              {menuData.map((item, index) => (
                <div key={index} className="flex flex-col gap-1">
                  {item.subitems?.length ? (
                    <NavLink
                      color="violet"
                      leftSection={item.icon}
                      label={item.label}
                      active={activeMain === index}
                      onClick={() => {
                        setActiveMain(activeMain === index ? null : index);
                      }}
                      opened={activeMain === index}
                      rightSection={
                        item.subitems && (
                          <HiOutlineChevronRight
                            size={12}
                            className="mantine-rotate-rtl"
                          />
                        )
                      }
                      classNames={{ section: "text-xl m-auto" }}
                      className={`rounded-full py-3! transition-all duration-300 ease-in px-5 justify-start!`}
                    >
                      {activeMain === index ? (
                        <div className="transition-all duration-300 ease-in">
                          {item.subitems.map((subitem, subindex) =>
                            subitem.href ? (
                              <NavLink
                                color="violet"
                                variant="subtle"
                                key={subindex}
                                leftSection={subitem.icon}
                                label={subitem.label}
                                component={Link}
                                href={subitem.href}
                                className="rounded-full px-5! py-3! transition-all duration-300 ease-in"
                                classNames={{ section: "text-xl" }}
                                active={pathname === subitem.href}
                              />
                            ) : null
                          )}
                        </div>
                      ) : null}
                    </NavLink>
                  ) : item.href ? (
                    <NavLink
                      color="violet"
                      leftSection={item.icon}
                      label={item.label}
                      component={Link}
                      href={item.href}
                      classNames={{ section: "text-xl m-auto" }}
                      className={`rounded-full py-3! transition-all duration-300 ease-in px-5 justify-start!`}
                      active={pathname === item.href}
                    />
                  ) : (
                    <NavLink
                      color="violet"
                      leftSection={item.icon}
                      label={item.label}
                      classNames={{ section: "text-xl m-auto" }}
                      className={`rounded-full py-3! transition-all duration-300 ease-in px-5 justify-start!`}
                    />
                  )}
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
              onClick={() =>
                setActiveMain(activeMain === "/settings" ? null : "/settings")
              }
              opened={activeMain === "/settings"}
              className={`rounded-full py-3! transition-all duration-300 ease-in px-5 justify-start!`}
              rightSection={
                <HiOutlineChevronRight
                  size={12}
                  className="mantine-rotate-rtl"
                />
              }
            >
              <NavLink
                color="violet"
                variant="subtle"
                leftSection={<TbUser />}
                label={"Usuários"}
                component={Link}
                href={"/system/settings/users"}
                className="rounded-full px-5! py-3! transition-all duration-300 ease-in"
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
              className={`rounded-full py-3! transition-all duration-300 ease-in px-5 justify-start!`}
            />
          </div>
        </AppShellMantine.Navbar>
      )}

      <AppShellMantine.Main>{children}</AppShellMantine.Main>
    </AppShellMantine>
  );
}
