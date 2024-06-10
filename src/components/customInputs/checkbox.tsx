import Image from "next/image"
import iconChecked from "@/assets/checked.svg"

type CheckboxProps = {
    target: boolean
}

export default function Checkbox({target}:CheckboxProps) {
    return (
        <div
            className={target ? "rounded-full w-[1.40rem] h-5 overflow-hidden bg-purple-dark flex items-center justify-center transition":"rounded-full w-[1.35rem] h-5 overflow-hidden border-2 border-blue transition"}
        >
            {
                target &&
                <Image
                    src={iconChecked}
                    alt="Icone de checkado"
                />
            }
        </div>
    )
}