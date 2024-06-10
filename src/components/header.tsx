"use client"
import Image from "next/image";
import ContainerGrid from "./container";
import svgLogo from "@/assets/logo.svg";
import userDefault from "@/assets/user-default.png";
import { useContext, useState } from "react";
import { AuthContext } from "@/hooks/useAuth";
import Link from "next/link";

type HeaderProps = {
    ContainsUser?: boolean;
    profile?: string;
    username?: string;
}

export function Header({ContainsUser = false, profile, username }:HeaderProps) {
    const { singOut } = useContext(AuthContext)
    const [stateOptionUser, setStateOptionUser] = useState<boolean>(false)

    function handleOptionUser() {
        if(stateOptionUser == false) {
            setStateOptionUser(true)
        } else {
            setStateOptionUser(false)
        }
    }

    return (
        <header className="bg-gray-700 h-52">
            <ContainerGrid className={ContainsUser ? "flex items-center justify-between h-full" : "flex items-center justify-center h-full"}>
                <div>
                    <Link href="/dashboard">
                        <Image
                            src={svgLogo}
                            alt="Logo ToDo Rocket"
                            className="w-24 md:w-full align-middle"
                        />
                    </Link>
                </div>
                {
                    ContainsUser &&
                    <div className="flex items-center gap-4 relative">
                        <p className="capitalize w-28 md:w-fit truncate">Olá {username}</p>
                        <button className="w-profile-user h-profile-user rounded-full overflow-hidden" onClick={handleOptionUser}>
                            <Image
                                src={profile != null ? profile : userDefault}
                                alt="Avatar do usuário"
                                width={100}
                                height={100}
                                className="w-full bg-white"
                            />
                        </button>
                        {
                            stateOptionUser &&
                            <ul className="absolute -bottom-2 left-0 bg-gray-400 w-full rounded-md translate-y-full transition z-50" onMouseLeave={() => setStateOptionUser(false)}>
                                <li className="py-2 px-4 hover:text-blue transition w-36 h-full text-left">
                                    <Link href="/dashboard/account" className="w-full h-full block">Conta</Link>
                                </li>
                                <li>
                                    <button
                                        className="py-2 px-4 hover:text-blue transition w-full h-full text-left"
                                        onClick={singOut}
                                    >Sair</button>
                                </li>
                            </ul>
                        }
                    </div>
                }
            </ContainerGrid>
        </header>
    );
}